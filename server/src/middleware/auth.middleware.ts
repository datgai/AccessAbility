import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getProfileById } from '../database';
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
      const user = await auth.getUser(decodedToken.uid);
      request.user = { ...user, profile: await getProfileById(user.uid) };
      next();
    })
    .catch(() => {
      return response.status(StatusCodes.UNAUTHORIZED).json({
        message: 'You are not authorized to access this endpoint.'
      });
    });
};
