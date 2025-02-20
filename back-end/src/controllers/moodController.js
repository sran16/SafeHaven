import moodService from '../services/moodService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

class MoodController {
    async createMood(req, res) {
        try {
            const mood = await moodService.createMood(req.body);
            return successResponse(res, 201, 'Mood created successfully', mood);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getUserMoods(req, res) {
        try {
            const moods = await moodService.getMoodsByUserId(req.params.userId);
            return successResponse(res, 200, 'Moods retrieved successfully', moods);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

export default new MoodController();
