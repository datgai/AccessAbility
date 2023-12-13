import { Router } from 'express';
import { register } from '../controllers/auth.controller';
import { hasRequiredBody } from '../middleware/auth.middleware';

const router = Router();

router.post('/auth', hasRequiredBody, register);

export default router;
