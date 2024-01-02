import { Router } from 'express';
import { createJob, getJobList } from '../controllers/jobs.controller';
import { isAuthenticated, isBusiness } from '../middleware/auth.middleware';

const router = Router();

router.post('/job', isAuthenticated, isBusiness, createJob);
router.get('/jobs/:token?', getJobList);

export default router;
