import { Router } from 'express';
import {
  addOffer,
  editOrCreateProfile,
  getProfile,
  getUserById,
  getUserOffers,
  getUsers
} from '../controllers/users.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/user/profile', isAuthenticated, getProfile);
router.post('/user/profile', isAuthenticated, editOrCreateProfile);
router.get('/users/:token?', getUsers);
router.get('/user/:id', getUserById);
router.patch('/user/:id', addOffer);
router.get('/user/:id/offers', isAuthenticated, getUserOffers);

export default router;
