import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserProfile, UserRole } from '../../../shared/src/types/user';
import { profilesRef } from '../database';
import { auth } from '../firebase';

export const getProfile = async (request: Request, response: Response) => {
  const user = request.user;
  return response.status(StatusCodes.OK).json({ profile: user.profile });
};

export const getUserById = async (request: Request, response: Response) => {
  const userId = request.params.id ?? '';

  await auth
    .getUser(userId)
    .then(async (user) => {
      const profile = await profilesRef.doc(user.uid).get();

      return response.status(StatusCodes.OK).json({
        message: 'User found.',
        user: {
          ...user,
          profile: profile.exists ? profile.data() ?? {} : {}
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
  const userRole: UserRole = request.body.role;

  const profileData: UserProfile = {
    role: userRole,
    premium: false
  };

  return response.status(StatusCodes.CREATED).json({
    message: 'Profile added successfully.',
    user: { ...user, profile: profileData }
  });
};
