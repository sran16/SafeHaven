import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
// Accès aux expériences de l'utilisateur courant
import experienceController from '../controllers/experienceController.js';
import { validateBody, schemas } from '../middlewares/validation.js';

const router = express.Router();

// Routes publiques 
router.post('/', validateBody(schemas.auth.register), userController.register);
router.post('/sessions', validateBody(schemas.auth.login), userController.login);

// Routes protégées 
router.use(authMiddleware);
router.delete('/sessions/current', userController.logout); 
router.get('/me', userController.getProfile); 
router.put('/me', validateBody(schemas.user.updateProfile), userController.updateProfile);
router.put('/me/password', userController.changePassword);
router.get('/me/experiences', experienceController.getUserExperiences); 

export default router;
