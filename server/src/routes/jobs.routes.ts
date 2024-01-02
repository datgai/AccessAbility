import { Router } from 'express';
import {
  createJob,
  getJobById,
  getJobList
} from '../controllers/jobs.controller';
import { isAuthenticated, isBusiness } from '../middleware/auth.middleware';

const router = Router();

router.post('/job', isAuthenticated, isBusiness, createJob);
router.get('/job/:id', getJobById);
router.get('/jobs/:token?', getJobList);

export default router;
