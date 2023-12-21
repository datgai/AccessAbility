import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const getTest = async (request: Request, response: Response) => {
  response
    .status(StatusCodes.OK)
    .json({ message: 'You are authenticated!', user: request.user });
};
