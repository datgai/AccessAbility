import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { hasRequiredBody } from '../middleware/auth.middleware';

const router = Router();

router.post('/auth/register', hasRequiredBody, register);
router.post('/auth/login', hasRequiredBody, login);

export default router;
