import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserProfile, UserRole } from '../../../shared/src/types/user';
import { profilesRef } from '../database';

export const getProfile = async (request: Request, response: Response) => {
  const user = request.user;
  return response.status(StatusCodes.OK).json({ profile: user.profile });
};

export const createProfile = async (request: Request, response: Response) => {
  const user = request.user;
  const userRole: UserRole = request.body.role;

  const profileData: UserProfile = {
    role: userRole,
    premium: false
  };

  profilesRef.doc(user.uid).set(profileData);

  return response.status(StatusCodes.CREATED).json({
    message: 'Profile added successfully.',
    user: { ...user, profile: profileData }
  });
};
