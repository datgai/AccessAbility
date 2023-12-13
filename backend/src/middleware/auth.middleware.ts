import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const hasRequiredBody = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const requiredBody = ['email', 'password'];

  const keys = Object.keys(request.body).filter((key) =>
    requiredBody.includes(key)
  );

  if (keys.length < requiredBody.length) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      message: 'Missing data in body.',
      missing: requiredBody.filter((key) => !keys.includes(key))
    });
  }

  next();
};
