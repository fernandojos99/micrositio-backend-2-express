import { Router } from 'express';
import ChatController from '../controllers/chatController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const chatController = new ChatController();

router.post('/stream', authMiddleware, chatController.stream.bind(chatController));

export default router;
