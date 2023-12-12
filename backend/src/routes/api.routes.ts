import { Router } from 'express';
import { register } from '../controllers/auth.controller';

const router = Router();

router.post('/auth', register);

export default router;
