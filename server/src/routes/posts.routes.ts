import { Router } from 'express';
import {
  createPost,
  deletePostById,
  getPostById,
  getPosts
} from '../controllers/posts.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/posts', getPosts);
router.get('/post/:id', getPostById);
router.post('/post', isAuthenticated, createPost);
router.delete('/post/:id', isAuthenticated, deletePostById);

export default router;
