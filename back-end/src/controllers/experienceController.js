import experienceService from '../services/experienceService.js';
import answerService from '../services/answerService.js';
import moderationService from '../services/moderationService.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import prisma from '../config/database.js';

class ExperienceController {
    async createExperience(req, res) {
        try {
            const experienceData = {
                ...req.body,
                userId: req.user.id_user
            };

            //  ANALYSE DE MODÉRATION AVEC BLOCAGE
            let experience;
            try {
                const moderationResult = await moderationService.moderateExperience(experienceData);
                
                            // SI CONTENU BLOQUÉ
            if (moderationResult.blocked) {
                // RETOURNER L'ERREUR AVEC LE MESSAGE DE WARNING
                    return res.status(400).json({
                        success: false,
                        message: 'Contenu non autorisé',
                        data: {
                            blocked: true,
                            warning: moderationResult.warningMessage
                        }
                    });
                }

                            // CONTENU APPROUVÉ - Publication normale
                experience = await experienceService.createExperience(experienceData);
                
            } catch (moderationError) {
                // En cas d'erreur de modération, on publie quand même (mode dégradé)
                experience = await experienceService.createExperience(experienceData);
            }
            
            return successResponse(res, 201, 'Experience created successfully', experience);
        } catch (error) {
            console.error('Error creating experience:', error);
            return errorResponse(res, 400, error.message);
        }
    }

    async getExperiences(req, res) {
        try {
            
            const experiences = await experienceService.getAllExperiences();
            
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
            
            const userId = req.user.id_user;
            const experiences = await experienceService.getExperiencesByUserId(userId);
            
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
            const isDelete = req.method === 'DELETE';
            const result = isDelete
                ? await experienceService.unlike(experienceId, userId)
                : await experienceService.like(experienceId, userId);
            const message = isDelete ? 'Experience unliked successfully' : 'Experience liked successfully';
            return successResponse(res, 200, message, result);
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