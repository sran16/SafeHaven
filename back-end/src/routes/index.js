import express from 'express';
import userRoutes from './userRoutes.js';
import moodRoutes from './moodRoutes.js';
import experienceRoutes from './experienceRoutes.js';
import chatbotRoutes from './chatbotRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/moods', moodRoutes);
router.use('/experiences', experienceRoutes);
router.use('/chatbot', chatbotRoutes);

export default router;
