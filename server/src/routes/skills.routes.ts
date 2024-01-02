import { Router } from 'express';
import { getSkills } from '../controllers/skills.controller';

const router = Router();

router.get('/skills', getSkills);

export default router;
