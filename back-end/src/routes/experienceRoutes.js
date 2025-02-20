import express from 'express';
import experienceController from '../controllers/experienceController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', experienceController.createExperience);
router.get('/', experienceController.getExperiences);

export default router; 