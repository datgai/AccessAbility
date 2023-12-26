import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserProfile } from '../../../shared/src/types/user';
import { profilesRef } from '../database';
import { auth } from '../firebase';

export const isAuthenticated = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const idToken = request.headers.authorization?.split('Bearer ')[1] || '';

  await auth
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      const profile = await profilesRef.doc(decodedToken.uid).get();
      const profileData = (profile.data() ?? {}) as UserProfile;

      request.user = { ...decodedToken, profile: profileData };
      next();
    })
    .catch(() => {
      return response.status(StatusCodes.UNAUTHORIZED).json({
        message: 'You are not authorized to access this endpoint.'
      });
    });
};
