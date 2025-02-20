import express from 'express';
import chatbotController from '../controllers/chatbotController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/session', chatbotController.startSession);
router.post('/message', chatbotController.sendMessage);
router.get('/history/:userId', chatbotController.getHistory);

export default router; 