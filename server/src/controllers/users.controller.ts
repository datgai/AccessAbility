import { Request, Response } from 'express';
import { firestore } from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';
import {
  UserGender,
  UserProfile,
  UserRole
} from '../../../shared/src/types/user';
import { getProfileById, profilesRef } from '../database';
import { auth } from '../firebase';
import { getError, saveImage, upload } from '../services/uploader.service';
import { getMissingParameters } from '../utils/param.util';

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
        message: 'User found.',
        user: {
          ...user,
          profile: await getProfileById(user.uid)
        }
      });
    })
    .catch(() => {
      return response.status(StatusCodes.NOT_FOUND).json({
        message: 'User you are looking for cannot be found.'
      });
    });
};

export const createProfile = async (request: Request, response: Response) => {
  const user = request.user;

  upload.single('avatar')(request, response, (err) => {
    type ProfileParam = Record<
      keyof Omit<UserProfile, 'profilePictureUrl'> | 'email' | 'password',
      string
    >;
    type Parameter = keyof ProfileParam;

    const requiredParams: Parameter[] = [
      'firstName',
      'lastName',
      'gender',
      'dateOfBirth',
      'phoneNumber',
      'impairments',
      'city',
      'state',
      'address',
      'bio',
      'role',
      'premium'
    ];

    const params = getMissingParameters<Parameter>(request, requiredParams);
    if (params.length > 0) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: 'Missing parameters.',
        missing:
          typeof request.file === 'undefined' ? [...params, 'avatar'] : params
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

    const dateOfBirth = new Date(body.dateOfBirth);
    if (isNaN(dateOfBirth.getTime())) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message:
          'Unknown date of birth provided. Date must follow the format YYYY-MM-DD.'
      });
    }

    const error = getError(err);
    if (error !== null) {
      return response.status(error.status).json({ message: error.message });
    }

    const baseUrl = `${request.protocol}://${request.get('host')}`;
    const avatar = request.file!;
    const buffer = avatar.buffer;
    const originalName = avatar.originalname;

    saveImage(
      baseUrl,
      'avatars',
      buffer,
      originalName,
      (error, profilePictureUrl) => {
        if (error) {
          return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: `Something went wrong processing the file: ${error.message}`
          });
        }

        const profileData: UserProfile = {
          ...body,
          gender: body.gender as UserGender,
          dateOfBirth: new Date(body.dateOfBirth),
          impairments: body.impairments as unknown as string[],
          profilePictureUrl,
          role: body.role as UserRole,
          premium: body.premium === 'true'
        };

        profilesRef.doc(user.uid).set({
          ...profileData,
          dateOfBirth: firestore.Timestamp.fromDate(profileData.dateOfBirth)
        });

        return response.status(StatusCodes.CREATED).json({
          message: 'Profile added successfully.',
          user: { ...user, profile: profileData }
        });
      }
    );
  });
};
