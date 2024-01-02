import { NextFunction, Request, Response } from 'express';
import { UPLOADS_FOLDER } from '../services/uploader.service';

interface CacheControlConfig {
  cacheDays: number;
}

export const cacheControl = ({ cacheDays }: CacheControlConfig) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    if (request.method !== 'GET') {
      response.set('Cache-control', `no-store`);
      return next();
    }

    if (!request.path.startsWith(`/${UPLOADS_FOLDER}`)) {
      response.set('Cache-control', `no-store`);
      return next();
    }

    // Set cache duration
    response.set(
      'Cache-control',
      `public, max-age=${cacheDays * 1000 * 24 * 3600}`
    );

    next();
  };
};
