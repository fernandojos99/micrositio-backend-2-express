import { Router } from 'express';
import ChatController from '../controllers/chatController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const chatController = new ChatController();

router.get('/ping', chatController.ping.bind(chatController));
router.post('/stream', authMiddleware, chatController.stream.bind(chatController));

export default router;
