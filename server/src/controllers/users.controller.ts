import { Request, Response } from 'express';
import { firestore } from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';
import {
  UserGender,
  UserProfile,
  UserRole
} from '../../../shared/src/types/user';
import { profilesRef } from '../database';
import { auth } from '../firebase';
import { getError, saveImage, upload } from '../services/uploader.service';
import { getMissingParameters } from '../utils/param.util';
import { getProfileById } from '../utils/user.util';

export const getProfile = async (request: Request, response: Response) => {
  const user = request.user;

  if (Object.keys(user.profile).length === 0) {
    return response.status(StatusCodes.NOT_FOUND).json({
      message: 'User has no profile.'
    });
  }

  return response.status(StatusCodes.OK).json({ profile: user.profile });
};

export const getUsers = async (request: Request, response: Response) => {
  const token = request.params.token;

  auth.listUsers(10, token).then(async (list) => {
    const users = await Promise.all(
      list.users.map(async (user) => {
        return { ...user, profile: await getProfileById(user.uid) };
      })
    );

    return response.status(StatusCodes.OK).json({
      users,
      nextPageToken: list.pageToken
    });
  });
};

export const getUserById = async (request: Request, response: Response) => {
  const userId = request.params.id ?? '';

  await auth
    .getUser(userId)
    .then(async (user) => {
      return response.status(StatusCodes.OK).json({
        ...user,
        profile: await getProfileById(user.uid)
      });
    })
    .catch(() => {
      return response.status(StatusCodes.NOT_FOUND).json({
        message: 'User you are looking for cannot be found.'
      });
    });
};

export const editOrCreateProfile = async (
  request: Request,
  response: Response
) => {
  const user = request.user;

  upload.single('avatar')(request, response, async (err) => {
    type ProfileParam = Record<
      | keyof Omit<UserProfile, 'profilePictureUrl' | 'offers'>
      | 'email'
      | 'password',
      string
    >;
    type Parameter = keyof ProfileParam;

    const params = getMissingParameters<Parameter>(request, [
      'firstName',
      'role'
    ]);

    if (params.length > 0) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing parameters.',
        missing: params
      });
    }

    const { email, password, ...body } = request.body as ProfileParam;

    if (!Object.values(UserRole).includes(body.role as UserRole)) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: 'Unknown role provided. Role must be one of UserRole.'
      });
    }

    if (!Object.values(UserGender).includes(body.gender as UserGender)) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: 'Unknown gender provided. Role must be one of UserGender.'
      });
    }

    if (body.dateOfBirth) {
      const dateOfBirth = new Date(body.dateOfBirth);
      if (isNaN(dateOfBirth.getTime())) {
        return response.status(StatusCodes.BAD_REQUEST).json({
          message:
            'Unknown date of birth provided. Date must follow the format YYYY-MM-DD.'
        });
      }
    }

    const error = getError(err);
    if (error !== null) {
      return response.status(error.status).json({ message: error.message });
    }

    let profilePictureUrl = user.profile?.profilePictureUrl ?? '';
    if (request.file) {
      const baseUrl = `${request.protocol}://${request.get('host')}`;
      const avatar = request.file;
      const buffer = avatar.buffer;
      const originalName = avatar.originalname;

      try {
        profilePictureUrl = await saveImage(
          baseUrl,
          'avatars',
          buffer,
          originalName
        );
      } catch (error: any) {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: `Something went wrong processing the file: ${error.message}`
        });
      }
    }

    const profileData: UserProfile = {
      firstName: body.firstName,
      lastName: body.lastName ?? user.profile?.lastName ?? '',
      gender: (body.gender as UserGender) ?? user.profile?.gender ?? '',
      dateOfBirth: new Date(body.dateOfBirth),
      phoneNumber: body.phoneNumber ?? user.profile?.phoneNumber ?? '',
      impairments:
        (body.impairments as unknown as string[]) ??
        user.profile?.impairments ??
        [],
      skills:
        (body.skills as unknown as string[]).map((skill) =>
          skill.toLowerCase()
        ) ??
        user.profile?.skills ??
        [],
      offers: user.profile?.offers ?? [],
      city: body.city ?? user.profile?.city ?? '',
      state: body.state ?? user.profile?.state ?? '',
      bio: body.bio ?? user.profile?.bio ?? '',
      address: body.address ?? user.profile?.address ?? '',
      profilePictureUrl,
      role: user.profile?.role ?? (body.role as UserRole),
      premium: body.premium
        ? body.premium === 'true'
        : user.profile?.premium ?? false
    };

    profilesRef.doc(user.uid).set({
      ...profileData,
      dateOfBirth: firestore.Timestamp.fromDate(profileData.dateOfBirth)
    });

    return response.status(StatusCodes.CREATED).json({
      message: 'Profile updated successfully.',
      user: { ...user, profile: profileData }
    });
  });
};

export const addOffer = async (request: Request, response: Response) => {
  const userId = (request.params.id as string) ?? '';
  const offerId = request.body.offerId as string;

  if (!userId) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      message: 'Missing offer ID'
    });
  }

  if (!offerId) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      message: 'Missing offer ID'
    });
  }

  const profile = await profilesRef.doc(userId).get();
  if (!profile.exists) {
    return response.status(StatusCodes.NOT_FOUND).json({
      message: 'Profile from id does not exist.'
    });
  }

  const profileData = profile.data() as UserProfile;
  profile.ref.set({
    ...profileData,
    offers: Array.from(new Set([...profileData.offers, offerId]))
  });

  return response.status(StatusCodes.OK).json({
    message: 'Successfully gave user an offer.'
  });
};
