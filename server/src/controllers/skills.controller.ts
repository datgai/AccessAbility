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

export const getSkillById = async (request: Request, response: Response) => {
  const id = request.params.id ?? '';

  return await skillsRef
    .doc(id)
    .get()
    .then(async (skill) => {
      if (!skill.exists) {
        return response.status(StatusCodes.NOT_FOUND).json({
          message: 'Skill you are looking for cannot be found.'
        });
      }

      return response.status(StatusCodes.OK).json({
        id: skill.id,
        ...skill.data()
      });
    })
    .catch((err) => {
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong while trying to find the skill.',
        error: err
      });
    });
};
