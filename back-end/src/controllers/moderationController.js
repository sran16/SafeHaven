import moderationService from '../services/moderationService.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ModerationController {
    /**
     * Dashboard de modération - Vue d'ensemble
     */
    async getDashboard(req, res) {
        try {
            const [pendingContent, stats] = await Promise.all([
                moderationService.getPendingModeration(),
                moderationService.getModerationStats('7d')
            ]);

            const dashboard = {
                pending: pendingContent,
                stats: stats,
                summary: {
                    totalPending: pendingContent.total,
                    experiencesPending: pendingContent.experiences.length,
                    commentsPending: pendingContent.comments.length
                }
            };

            return successResponse(res, 200, 'Dashboard data retrieved successfully', dashboard);
        } catch (error) {
            console.error('Error getting moderation dashboard:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Récupère tous les contenus en attente de modération
     */
    async getPendingContent(req, res) {
        try {
            const pendingContent = await moderationService.getPendingModeration();
            return successResponse(res, 200, 'Pending content retrieved successfully', pendingContent);
        } catch (error) {
            console.error('Error getting pending content:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Approuve une expérience
     */
    async approveExperience(req, res) {
        try {
            const { id } = req.params;
            const { reason = '' } = req.body;
            const moderatorId = req.user.id_moderateur; // Assumant un middleware d'auth modérateur

            const result = await moderationService.moderatorAction(
                moderatorId, 
                'approve', 
                'experience', 
                parseInt(id), 
                reason
            );

            return successResponse(res, 200, 'Experience approved successfully', result);
        } catch (error) {
            console.error('Error approving experience:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Rejette une expérience
     */
    async rejectExperience(req, res) {
        try {
            const { id } = req.params;
            const { reason = '' } = req.body;
            const moderatorId = req.user.id_moderateur;

            const result = await moderationService.moderatorAction(
                moderatorId, 
                'reject', 
                'experience', 
                parseInt(id), 
                reason
            );

            return successResponse(res, 200, 'Experience rejected successfully', { deleted: true });
        } catch (error) {
            console.error('Error rejecting experience:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Édite une expérience (modérateur peut corriger le contenu)
     */
    async editExperience(req, res) {
        try {
            const { id } = req.params;
            const { content, reason = '' } = req.body;
            const moderatorId = req.user.id_moderateur;

            // Update experience content
            const updatedExperience = await prisma.experiences.update({
                where: { id_experience: parseInt(id) },
                data: {
                    content: content,
                    moderateurId: moderatorId
                }
            });

            // Log the action
            await moderationService.logModerationAction({
                action: `EDIT_EXPERIENCE: ${reason}`,
                experienceId: parseInt(id),
                moderatorId: moderatorId
            });

            return successResponse(res, 200, 'Experience edited successfully', updatedExperience);
        } catch (error) {
            console.error('Error editing experience:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Approuve un commentaire
     */
    async approveComment(req, res) {
        try {
            const { id } = req.params;
            const { reason = '' } = req.body;
            const moderatorId = req.user.id_moderateur;

            const result = await moderationService.moderatorAction(
                moderatorId, 
                'approve', 
                'comment', 
                parseInt(id), 
                reason
            );

            return successResponse(res, 200, 'Comment approved successfully', result);
        } catch (error) {
            console.error('Error approving comment:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Rejette un commentaire
     */
    async rejectComment(req, res) {
        try {
            const { id } = req.params;
            const { reason = '' } = req.body;
            const moderatorId = req.user.id_moderateur;

            const result = await moderationService.moderatorAction(
                moderatorId, 
                'reject', 
                'comment', 
                parseInt(id), 
                reason
            );

            return successResponse(res, 200, 'Comment rejected successfully', { deleted: true });
        } catch (error) {
            console.error('Error rejecting comment:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Analyse le contenu en temps réel (pour prévisualisation)
     */
    async analyzeContent(req, res) {
        try {
            const { content } = req.body;
            
            if (!content) {
                return errorResponse(res, 400, 'Content is required');
            }

            const analysis = await moderationService.analyzeContent(content);
            return successResponse(res, 200, 'Content analyzed successfully', analysis);
        } catch (error) {
            console.error('Error analyzing content:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Historique des actions de modération
     */
    async getModerationHistory(req, res) {
        try {
            const { page = 1, limit = 20, moderatorId } = req.query;
            const offset = (page - 1) * limit;

            const whereClause = moderatorId ? { moderatorId: parseInt(moderatorId) } : {};

            const [logs, total] = await Promise.all([
                prisma.moderationLogs.findMany({
                    where: whereClause,
                    include: {
                        moderator: true,
                        experience: {
                            select: {
                                id_experience: true,
                                content: true,
                                user: {
                                    select: { name: true, email: true }
                                }
                            }
                        }
                    },
                    orderBy: { timestamp: 'desc' },
                    skip: offset,
                    take: parseInt(limit)
                }),
                prisma.moderationLogs.count({ where: whereClause })
            ]);

            return successResponse(res, 200, 'Moderation history retrieved successfully', {
                logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting moderation history:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Statistiques de modération
     */
    async getStats(req, res) {
        try {
            const { timeRange = '7d' } = req.query;
            const stats = await moderationService.getModerationStats(timeRange);
            return successResponse(res, 200, 'Moderation stats retrieved successfully', stats);
        } catch (error) {
            console.error('Error getting moderation stats:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Bannir un utilisateur (action drastique)
     */
    async banUser(req, res) {
        try {
            const { userId } = req.params;
            const { reason, duration = 'permanent' } = req.body;
            const moderatorId = req.user.id_moderateur;

            // Ici tu peux ajouter une table "Bans" ou un champ "banned" sur Users
            // Pour l'instant, on log juste l'action
            await moderationService.logModerationAction({
                action: `BAN_USER: ${reason} (Duration: ${duration})`,
                experienceId: null,
                moderatorId: moderatorId
            });

            // Log côté utilisateur aussi
            await moderationService.logUserAction(
                parseInt(userId),
                'BANNED',
                `Banned by moderator ${moderatorId}. Reason: ${reason}`
            );

            return successResponse(res, 200, 'User banned successfully', {
                userId: parseInt(userId),
                reason,
                duration,
                moderatorId
            });
        } catch (error) {
            console.error('Error banning user:', error);
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Créer un compte modérateur
     */
    async createModerator(req, res) {
        try {
            // Seuls les super-admins peuvent créer des modérateurs
            if (!req.user.isSuperAdmin) {
                return errorResponse(res, 403, 'Insufficient permissions');
            }

            const moderator = await prisma.moderateurs.create({
                data: {
                    // Ajouter des champs comme name, email, permissions, etc.
                }
            });

            return successResponse(res, 201, 'Moderator created successfully', moderator);
        } catch (error) {
            console.error('Error creating moderator:', error);
            return errorResponse(res, 500, error.message);
        }
    }
}

export default new ModerationController();
