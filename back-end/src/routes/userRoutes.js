import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.post('/register', userController.register);
router.post('/login', userController.login);

// Routes protégées
router.use(authMiddleware);
router.post('/logout', userController.logout);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/verify-token', userController.verifyToken);
router.put('/change-password', userController.changePassword);

export default router;
