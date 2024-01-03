import { Router } from 'express';
import {
  createJob,
  deleteJobById,
  editJobById,
  getJobById,
  getJobList
} from '../controllers/jobs.controller';
import { isAuthenticated, isBusiness } from '../middleware/auth.middleware';

const router = Router();

router.post('/job', isAuthenticated, isBusiness, createJob);
router.get('/job/:id', getJobById);
router.delete('/job/:id', deleteJobById);
router.patch('/job/:id', editJobById);
router.get('/jobs/:token?', getJobList);

export default router;
