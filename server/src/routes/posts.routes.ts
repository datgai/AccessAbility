import { Router } from 'express';
import {
  addComment,
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
router.patch('/post/:id', isAuthenticated, addComment);
router.delete('/post/:id', isAuthenticated, deletePostById);

export default router;
