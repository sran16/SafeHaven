import express from 'express';
import chatbotController from '../controllers/chatbotController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes protégées par l'authentification
router.use(authMiddleware);

// Gestion des sessions
router.post('/session/start', chatbotController.startSession);
router.post('/session/end', chatbotController.endSession);

// Gestion des messages
router.post('/message', chatbotController.processMessage);
router.get('/history', chatbotController.getConversationHistory);

// Analyse et rapports
router.get('/analysis', chatbotController.getSentimentAnalysis);
router.get('/recommendations', chatbotController.getRecommendations);
router.get('/report', chatbotController.generateReport);

// Rapports de session
router.get('/session-reports', chatbotController.getSessionReports);
router.get('/session-reports/:reportId', chatbotController.getSessionReportById);

export default router; 