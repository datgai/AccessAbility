import { Router } from 'express';
import {
    createChat,
    getChatById,
    sendMessage
} from '../controllers/chats.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/chat/:id',getChatById); //get chat based on chat id
router.post('/chat', isAuthenticated,createChat);
router.post('/message/:id',isAuthenticated,sendMessage); //send message based on chat id


export default router;
