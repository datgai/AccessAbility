import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { auth } from '../firebase';

export const isAuthenticated = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const idToken = request.headers.authorization?.split('Bearer ')[1] || '';

  await auth
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      request.user = decodedToken;
      next();
    })
    .catch(() => {
      return response.status(StatusCodes.UNAUTHORIZED).json({
        message: 'You are not authorized to access this endpoint.'
      });
    });
};
