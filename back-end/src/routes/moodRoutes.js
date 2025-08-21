import express from 'express';
import moodController from '../controllers/moodController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateBody, schemas } from '../middlewares/validation.js';

const router = express.Router();

router.use(authMiddleware);

// Routes pour les humeurs
router.post('/', validateBody(schemas.mood.create), moodController.createMood);
router.get('/', moodController.getUserMoods);
router.get('/stats', moodController.getMoodStats);

export default router; 