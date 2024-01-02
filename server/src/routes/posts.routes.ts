import { Router } from 'express';
import { createPost, deletePostById } from '../controllers/posts.contrller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/posts');
router.post('/post', isAuthenticated, createPost);
router.delete('/post/:id', isAuthenticated, deletePostById);

export default router;
