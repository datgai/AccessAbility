import { Router } from 'express';
import { getSkillById, getSkills } from '../controllers/skills.controller';

const router = Router();

router.get('/skills', getSkills);
router.get('/skill/:id', getSkillById);

export default router;
