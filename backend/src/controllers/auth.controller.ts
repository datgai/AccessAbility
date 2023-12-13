import { Request, Response } from 'express';
import {
  AuthError,
  AuthErrorCodes,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import { StatusCodes } from 'http-status-codes';
import { auth } from '../firebase';

export const register = async (request: Request, response: Response) => {
  createUserWithEmailAndPassword(
    auth,
    request.body.email,
    request.body.password
  )
    .then(async (document) => {
      await sendEmailVerification(document.user);

      return response.status(StatusCodes.OK).json({
        message: 'Successfully registered user.',
        document
      });
    })
    .catch((error: AuthError) => {
      const status =
        error.code === AuthErrorCodes.EMAIL_EXISTS
          ? StatusCodes.CONFLICT
          : StatusCodes.BAD_REQUEST;

      return response.status(status).json({
        message: error.message
      });
    });
};
