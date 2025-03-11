import express from 'express';
import moodController from '../controllers/moodController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authMiddleware);

// Routes pour les humeurs
router.post('/', moodController.createMood);
router.get('/', moodController.getUserMoods);
router.get('/stats', moodController.getMoodStats);

export default router; 