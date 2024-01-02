import { Request } from 'express';

export const getMissingParameters = <T>(
  request: Request,
  requiredParams: T[]
): T[] => {
  const requestKeys = Object.keys(request.body) as T[];
  const keys = requestKeys.filter((key) => requiredParams.includes(key));

  if (keys.length < requiredParams.length) {
    return requiredParams.filter((key) => !keys.includes(key));
  }

  return [];
};
