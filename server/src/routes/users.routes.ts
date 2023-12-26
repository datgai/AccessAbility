import { Router } from 'express';
import {
  createProfile,
  getProfile,
  getProfileById
} from '../controllers/users.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/users/profile', isAuthenticated, getProfile);
router.get('/users/profile/:id', getProfileById);
router.post('/users/profile', isAuthenticated, createProfile);

export default router;
