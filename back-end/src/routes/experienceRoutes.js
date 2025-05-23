import express from 'express';
import experienceController from '../controllers/experienceController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authMiddleware);

// Routes principales
router.post('/', experienceController.createExperience);
router.get('/', experienceController.getExperiences);
router.get('/user', experienceController.getUserExperiences);
router.get('/:id', experienceController.getExperienceById);

// Routes pour les likes et commentaires
router.post('/:id/like', experienceController.likeExperience);
router.post('/:id/comments', experienceController.addComment);

export default router; 