// Importation des services et utilitaires nécessaires
import moodService from '../services/moodService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

/*
 Contrôleur pour gérer les humeurs des utilisateurs
  Ce contrôleur gère la création et la récupération des états d'humeur
 */

class MoodController {
   
    async createMood(req, res) {
        try {
            // Logs de débogage pour suivre les opérations
            console.log('Création d\'humeur pour l\'utilisateur:', req.user.id_user);
            console.log('Données reçues:', req.body);

            // Création de l'objet humeur avec les données de la requête
            const mood = await moodService.createMood({
                moodType: req.body.moodType,                    
                description: req.body.description || '',        
                userId: req.user.id_user                        
            });
            
            // Retourne une réponse de succès avec l'humeur créée (code 201 = Created)
            return successResponse(res, 201, 'Mood created successfully', mood);
        } catch (error) {
            console.error('Erreur lors de la création de l\'humeur:', error);
            // Retourne une erreur client (code 400 = Bad Request)
            return errorResponse(res, 400, error.message);
        }
    }

    async getUserMoods(req, res) {
        try {
            // Récupération de l'ID utilisateur depuis le token d'authentification
            const userId = req.user.id_user;
            console.log('Récupération des humeurs pour l\'utilisateur:', userId);
            
            // Appel au service pour récupérer toutes les humeurs de cet utilisateur
            const moods = await moodService.getMoodsByUserId(userId);
            
            // Retourne une réponse de succès avec la liste des humeurs (code 200 = OK)
            return successResponse(res, 200, 'Moods retrieved successfully', moods);
        } catch (error) {
            console.error('Erreur lors de la récupération des humeurs:', error);
            return errorResponse(res, 500, error.message);
        }
    }

}

export default new MoodController();
