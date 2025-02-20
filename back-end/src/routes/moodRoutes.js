import express from 'express';
import moodController from '../controllers/moodController.js';
import { validateMood } from '../middlewares/validation.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', [auth, validateMood], moodController.createMood);
router.get('/user/:userId', auth, moodController.getUserMoods);

export default router; 