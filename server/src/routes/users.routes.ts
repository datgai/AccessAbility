import { Router } from 'express';
import { createProfile } from '../controllers/users.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.post('/users/profile', isAuthenticated, createProfile);

export default router;
