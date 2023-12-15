import { Router } from 'express';
import { getTest } from '../controllers/auth.contoller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/auth/test', isAuthenticated, getTest);

export default router;
