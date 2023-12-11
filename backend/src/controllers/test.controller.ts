import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const getTest = async (_: Request, res: Response) => {
  return res.status(StatusCodes.OK).json({
    message: 'test route is working'
  });
};
