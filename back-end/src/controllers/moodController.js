import moodService from '../services/moodService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

class MoodController {
    async createMood(req, res) {
        try {
            console.log('Création d\'humeur pour l\'utilisateur:', req.user.id_user);
            console.log('Données reçues:', req.body);

            const mood = await moodService.createMood({
                moodType: req.body.moodType,
                description: req.body.description || '',
                userId: req.user.id_user
            });
            
            return successResponse(res, 201, 'Mood created successfully', mood);
        } catch (error) {
            console.error('Erreur lors de la création de l\'humeur:', error);
            return errorResponse(res, 400, error.message);
        }
    }

    async getUserMoods(req, res) {
        try {
            const userId = req.user.id_user;
            console.log('Récupération des humeurs pour l\'utilisateur:', userId);
            
            const moods = await moodService.getMoodsByUserId(userId);
            return successResponse(res, 200, 'Moods retrieved successfully', moods);
        } catch (error) {
            console.error('Erreur lors de la récupération des humeurs:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    async getMoodStats(req, res) {
        try {
            const userId = req.user.id_user;
            const { startDate, endDate } = req.query;
            
            console.log('Récupération des statistiques pour l\'utilisateur:', userId);
            console.log('Période:', { startDate, endDate });
            
            const stats = await moodService.getMoodStats(userId, startDate, endDate);
            return successResponse(res, 200, 'Mood statistics retrieved successfully', stats);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            return errorResponse(res, 500, error.message);
        }
    }
}

export default new MoodController();
