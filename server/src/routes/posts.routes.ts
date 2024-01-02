import { Router } from 'express';
import { createPost } from '../controllers/posts.contrller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/posts');
router.post('/post', isAuthenticated, createPost);

export default router;
