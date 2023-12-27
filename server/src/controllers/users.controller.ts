import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserProfile, UserRole } from '../../../shared/src/types/user';
import { getProfileById } from '../database';
import { auth } from '../firebase';

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
