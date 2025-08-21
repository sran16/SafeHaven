import express from 'express';
import experienceController from '../controllers/experienceController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateBody, schemas } from '../middlewares/validation.js';

const router = express.Router();

// Appliquer l'authentification à toutes les routes
router.use(authMiddleware);

// Routes principales 
router.post('/', validateBody(schemas.experience.create), experienceController.createExperience);
router.get('/', experienceController.getExperiences);
router.get('/:id', experienceController.getExperienceById);

// Routes pour les likes et commentaires
router.put('/:id/likes', experienceController.likeExperience); // like (idempotent)
router.delete('/:id/likes', experienceController.likeExperience); // unlike (idempotent)
router.post('/:id/comments', experienceController.addComment);

export default router; 