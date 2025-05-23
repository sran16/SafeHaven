import experienceService from '../services/experienceService.js';
import answerService from '../services/answerService.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ExperienceController {
    async createExperience(req, res) {
        try {
            console.log('Creating experience with user:', req.user);
            const experienceData = {
                ...req.body,
                userId: req.user.id_user
            };
            const experience = await experienceService.createExperience(experienceData);
            return successResponse(res, 201, 'Experience created successfully', experience);
        } catch (error) {
            console.error('Error creating experience:', error);
            return errorResponse(res, 400, error.message);
        }
    }

    async getExperiences(req, res) {
        try {
            console.log('Début de la récupération des expériences');
            const experiences = await experienceService.getAllExperiences();
            console.log('Expériences récupérées avec succès:', experiences.length);
            return successResponse(res, 200, 'Experiences retrieved successfully', experiences);
        } catch (error) {
            console.error('Erreur détaillée dans getExperiences:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            return errorResponse(res, 500, `Erreur serveur: ${error.message}`);
        }
    }

    async getUserExperiences(req, res) {
        try {
            console.log('Début de la récupération des expériences de l\'utilisateur');
            const userId = req.user.id_user;
            const experiences = await experienceService.getExperiencesByUserId(userId);
            console.log('Expériences de l\'utilisateur récupérées avec succès:', experiences.length);
            return successResponse(res, 200, 'User experiences retrieved successfully', experiences);
        } catch (error) {
            console.error('Erreur détaillée dans getUserExperiences:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            return errorResponse(res, 500, `Erreur serveur: ${error.message}`);
        }
    }

    async getExperienceById(req, res) {
        try {
            const experienceId = parseInt(req.params.id);
            if (isNaN(experienceId)) {
                return errorResponse(res, 400, 'ID d\'expérience invalide');
            }
            const experience = await experienceService.getExperienceById(experienceId);
            if (!experience) {
                return errorResponse(res, 404, 'Experience not found');
            }
            return successResponse(res, 200, 'Experience retrieved successfully', experience);
        } catch (error) {
            console.error('Error in getExperienceById:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    async likeExperience(req, res) {
        try {
            const experienceId = parseInt(req.params.id);
            const userId = req.user.id_user;
            
            console.log(`User ${userId} toggling like for experience ${experienceId}`);
            
            const result = await experienceService.toggleLike(experienceId, userId);
            return successResponse(res, 200, 'Experience like toggled successfully', result);
        } catch (error) {
            console.error('Error toggling experience like:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    async addComment(req, res) {
        try {
            const experienceId = parseInt(req.params.id);
            const { content } = req.body;
            const userId = req.user.id_user;
            
            console.log(`User ${userId} commenting on experience ${experienceId}:`, content);
            
            const comment = await answerService.createAnswer({
                content,
                experienceId,
                userId
            });

            return successResponse(res, 201, 'Comment added successfully', comment);
        } catch (error) {
            console.error('Erreur détaillée lors de l\'ajout du commentaire:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            return errorResponse(res, 500, error.message);
        }
    }
}

export default new ExperienceController(); 