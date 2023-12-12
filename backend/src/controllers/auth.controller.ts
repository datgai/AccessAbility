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
  const requiredParams = ['email', 'password'];

  /**
   * =================================================================
   * Start check if email and password are in the request body
   * =================================================================
   */
  const keys = Object.keys(request.body).filter((key) =>
    requiredParams.includes(key)
  );

  if (keys.length < requiredParams.length) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      message: 'Missing parameters.',
      missing: requiredParams.filter((key) => !keys.includes(key))
    });
  }
  /**
   * =================================================================
   * End check if email and password are in the request body
   * =================================================================
   */

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
