import { Router } from 'express';
import {
    createChat,
    getChats,
} from '../controllers/chats.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/chats', getChats);
router.post('/chat', isAuthenticated,createChat);
// router.get('/chat/:id', getChat);



export default router;
