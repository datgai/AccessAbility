import { Request, Response } from 'express';
import { firestore } from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';
import { skillsRef } from '../database';

export const getSkills = async (request: Request, response: Response) => {
  const filter = request.query.filter;

  const skills = await skillsRef
    .orderBy(firestore.FieldPath.documentId())
    .startAt(filter)
    .endAt(`${filter}\uf8ff`)
    .get();

  return response
    .status(StatusCodes.OK)
    .json(skills.docs.map((skill) => ({ id: skill.id, ...skill.data() })));
};
