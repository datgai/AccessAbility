import { Router } from 'express';
import {
  addOffer,
  editOrCreateProfile,
  getProfile,
  getUserApplications,
  getUserById,
  getUserOffers,
  getUsers
} from '../controllers/users.controller';
import { isAuthenticated, isBusiness } from '../middleware/auth.middleware';

const router = Router();

router.get('/user/profile', isAuthenticated, getProfile);
router.post('/user/profile', isAuthenticated, editOrCreateProfile);
router.get('/users/:token?', getUsers);
router.get('/user/:id', getUserById);
router.patch('/user/:id', addOffer);
router.get('/user/:id/offers', isAuthenticated, getUserOffers);
router.get(
  '/user/:id/applications',
  isAuthenticated,
  isBusiness,
  getUserApplications
);

export default router;
