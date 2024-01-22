import { Skill } from '../../../shared/src/types/job';
import { skillsRef } from '../database';

export const formatSkills = async (skillIds: string[]) => {
  return await Promise.all(
    skillIds.map(async (skillId) => {
      const skill = (await skillsRef
        .doc(skillId)
        .get()) as GenericDocument<Skill>;
      return skill.data().name;
    })
  );
};
