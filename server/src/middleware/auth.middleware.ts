import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../../../shared/src/types/user';
import { auth } from '../firebase';
import { getProfileById } from '../utils/user.util';

export const isAuthenticated = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const idToken = request.headers.authorization?.split('Bearer ')[1] || '';

  await auth
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      const user = await auth.getUser(decodedToken.uid);
      request.user = {
        uid: user.uid,
        email: user.email!,
        emailVerified: user.emailVerified,
        profile: await getProfileById(user.uid)
      };
      next();
    })
    .catch((e) => {
      return response.status(StatusCodes.UNAUTHORIZED).json({
        message: 'You are not authorized to access this endpoint.'
      });
    });
};

export const isBusiness = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const user = request.user;

  if (user.profile.role === UserRole.BUSINESS) return next();

  return response.status(StatusCodes.FORBIDDEN).json({
    message: 'You are not a business and therefore cannot access this endpoint.'
  });
};
