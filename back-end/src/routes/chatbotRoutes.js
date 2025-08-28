import express from 'express';
import chatbotController from '../controllers/chatbotController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes protégées par l'authentification
router.use(authMiddleware);

// Sessions de chat - Gestion automatique dans processMessage
router.get('/sessions', chatbotController.getConversationHistory); // list sessions/history
// Messages 
router.post('/sessions/current/messages', chatbotController.processMessage); // send message in current session

// Analyse et rapports 
router.get('/sessions/current/analysis', chatbotController.getSentimentAnalysis);
router.get('/sessions/current/recommendations', chatbotController.getRecommendations);
router.get('/sessions/current/report', chatbotController.generateReport);

// Rapports de session 
router.get('/sessions/reports', chatbotController.getSessionReports);

export default router; 