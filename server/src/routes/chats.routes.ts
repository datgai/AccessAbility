import { Router } from 'express';
import {
    createChat,
    getChatById,
    getChats,
    getMessages,
    sendMessage
} from '../controllers/chats.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/chats/:id',getChats); //get chats based on user id
router.get('/chat/:id',getChatById); //get chat based on chat id
router.post('/chat', isAuthenticated,createChat);
router.get('/message/:id', getMessages); //get messages based on chat id
router.post('/message/:id',isAuthenticated,sendMessage); //send message based on chat id


export default router;
