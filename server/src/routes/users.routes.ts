import { Router } from 'express';
import {
  createProfile,
  getProfile,
  getUserById,
  getUsers
} from '../controllers/users.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/user/profile', isAuthenticated, getProfile);
router.post('/user/profile', isAuthenticated, createProfile);
router.get('/users/:token?', getUsers);
router.get('/user/:id', getUserById);

export default router;
