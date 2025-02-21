import express from 'express';
import chatbotController from '../controllers/chatbotController.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();

// Route de test
router.get('/test', (req, res) => {
  res.json({ message: 'Chatbot route is working' });
});

// Routes du chatbot
router.post('/message', auth, async (req, res) => {
  console.log('Route /message appelée');
  return chatbotController.sendMessage(req, res);
});

router.post('/session', auth, chatbotController.startSession);
router.get('/history/:userId', auth, chatbotController.getHistory);

export default router; 