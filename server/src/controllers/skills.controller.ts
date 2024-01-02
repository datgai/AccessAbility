import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { skillsRef } from '../database';

export const getSkills = async (request: Request, response: Response) => {
  const skills = await skillsRef.get();

  return response
    .status(StatusCodes.OK)
    .json(skills.docs.map((skill) => ({ id: skill.id, ...skill.data() })));
};
