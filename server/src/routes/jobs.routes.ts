import { Router } from 'express';
import { createJob } from '../controllers/jobs.controller';
import { isAuthenticated, isBusiness } from '../middleware/auth.middleware';

const router = Router();

router.post('/job', isAuthenticated, isBusiness, createJob);

export default router;
