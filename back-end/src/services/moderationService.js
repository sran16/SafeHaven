import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Liste des mots/expressions à modérer
const FLAGGED_WORDS = [
    // Mots dangereux
    'suicide', 'se tuer', 'mourir', 'overdose', 'automutilation',
    // Insultes/harcèlement
    'connard', 'salope', 'enculé', 'pute', 'fdp',
    // Contenu inapproprié
    'drogue', 'dealer', 'cannabis', 'cocaine', 'héroïne',
    // Informations personnelles
    'téléphone', 'adresse', 'email', '@', 'whatsapp',
    // Contenu commercial/spam
    'vendre', 'acheter', 'promo', 'gratuit', 'cliquez ici'
];

const SEVERITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium', 
    HIGH: 'high',
    CRITICAL: 'critical'
};

class ModerationService {
    /**
     * Analyse automatique du contenu pour détecter les problèmes
     */
    async analyzeContent(content) {
        const analysis = {
            flagged: false,
            severity: SEVERITY_LEVELS.LOW,
            reasons: [],
            flaggedWords: [],
            riskScore: 0
        };

        const normalizedContent = content.toLowerCase();
        let riskScore = 0;

        // Détection des mots flaggés
        for (const word of FLAGGED_WORDS) {
            if (normalizedContent.includes(word.toLowerCase())) {
                analysis.flagged = true;
                analysis.flaggedWords.push(word);
                
                // Score de risque selon le type de mot
                if (['suicide', 'se tuer', 'mourir'].includes(word)) {
                    riskScore += 10;
                    analysis.reasons.push('Contenu à risque suicidaire');
                } else if (['connard', 'salope', 'enculé'].includes(word)) {
                    riskScore += 5;
                    analysis.reasons.push('Langage inapproprié');
                } else if (['téléphone', 'email', '@'].includes(word)) {
                    riskScore += 3;
                    analysis.reasons.push('Informations personnelles');
                } else {
                    riskScore += 2;
                    analysis.reasons.push('Contenu potentiellement problématique');
                }
            }
        }

        // Détection de patterns spécifiques
        if (normalizedContent.match(/\b\d{10}\b/)) { // Numéro de téléphone
            analysis.flagged = true;
            riskScore += 5;
            analysis.reasons.push('Numéro de téléphone détecté');
        }

        if (normalizedContent.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)) { // Email
            analysis.flagged = true;
            riskScore += 5;
            analysis.reasons.push('Adresse email détectée');
        }

        // Détermination du niveau de sévérité
        analysis.riskScore = riskScore;
        if (riskScore >= 10) {
            analysis.severity = SEVERITY_LEVELS.CRITICAL;
        } else if (riskScore >= 7) {
            analysis.severity = SEVERITY_LEVELS.HIGH;
        } else if (riskScore >= 4) {
            analysis.severity = SEVERITY_LEVELS.MEDIUM;
        }

        return analysis;
    }

    /**
     * Modère une expérience lors de sa création
     */
    async moderateExperience(experienceData) {
        const analysis = await this.analyzeContent(experienceData.content);
        
        // Si contenu problématique, on met en attente de modération
        if (analysis.flagged) {
            // Log de l'action automatique
            await this.logModerationAction({
                action: `AUTO_FLAGGED: ${analysis.reasons.join(', ')}`,
                experienceId: null, // Pas encore créé
                moderatorId: 1, // ID système pour auto-modération
                severity: analysis.severity,
                details: JSON.stringify(analysis)
            });

            // Retourner l'expérience avec statut "en attente"
            return {
                ...experienceData,
                status: 'pending_moderation',
                moderationAnalysis: analysis,
                autoFlagged: true
            };
        }

        // Contenu clean, publication directe
        return {
            ...experienceData,
            status: 'approved',
            autoFlagged: false
        };
    }

    /**
     * Modère un commentaire
     */
    async moderateComment(commentData) {
        const analysis = await this.analyzeContent(commentData.content);
        
        if (analysis.flagged) {
            await this.logModerationAction({
                action: `COMMENT_AUTO_FLAGGED: ${analysis.reasons.join(', ')}`,
                experienceId: commentData.experienceId,
                moderatorId: 1,
                severity: analysis.severity,
                details: JSON.stringify(analysis)
            });

            return {
                ...commentData,
                status: 'pending_moderation',
                moderationAnalysis: analysis,
                autoFlagged: true
            };
        }

        return {
            ...commentData,
            status: 'approved',
            autoFlagged: false
        };
    }

    /**
     * Récupère les contenus en attente de modération
     */
    async getPendingModeration() {
        try {
            // Expériences en attente
            const pendingExperiences = await prisma.experiences.findMany({
                where: {
                    // Ajouter un champ status dans le schéma
                    // status: 'pending_moderation'
                },
                include: {
                    user: {
                        select: { id_user: true, name: true, email: true }
                    },
                    moderationLogs: {
                        orderBy: { timestamp: 'desc' },
                        take: 5
                    }
                },
                orderBy: { publication_date: 'desc' }
            });

            // Commentaires en attente
            const pendingComments = await prisma.answers.findMany({
                where: {
                    // status: 'pending_moderation'
                },
                include: {
                    user: {
                        select: { id_user: true, name: true, email: true }
                    },
                    experience: {
                        select: { id_experience: true, content: true }
                    }
                },
                orderBy: { publicationDate: 'desc' }
            });

            return {
                experiences: pendingExperiences,
                comments: pendingComments,
                total: pendingExperiences.length + pendingComments.length
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des contenus en attente:', error);
            throw error;
        }
    }

    /**
     * Action de modération par un modérateur
     */
    async moderatorAction(moderatorId, action, targetType, targetId, reason = '') {
        try {
            let result;
            
            if (targetType === 'experience') {
                if (action === 'approve') {
                    result = await prisma.experiences.update({
                        where: { id_experience: targetId },
                        data: { 
                            // status: 'approved',
                            moderateurId: moderatorId
                        }
                    });
                } else if (action === 'reject') {
                    result = await prisma.experiences.delete({
                        where: { id_experience: targetId }
                    });
                } else if (action === 'edit') {
                    // Permettre au modérateur d'éditer le contenu
                    result = await prisma.experiences.update({
                        where: { id_experience: targetId },
                        data: {
                            // status: 'approved',
                            moderateurId: moderatorId
                            // content: editedContent (à passer en paramètre)
                        }
                    });
                }

                // Log de l'action
                await this.logModerationAction({
                    action: `${action.toUpperCase()}_EXPERIENCE: ${reason}`,
                    experienceId: targetId,
                    moderatorId: moderatorId
                });

            } else if (targetType === 'comment') {
                if (action === 'approve') {
                    result = await prisma.answers.update({
                        where: { id_response: targetId },
                        data: { 
                            // status: 'approved'
                        }
                    });
                } else if (action === 'reject') {
                    result = await prisma.answers.delete({
                        where: { id_response: targetId }
                    });
                }

                await this.logModerationAction({
                    action: `${action.toUpperCase()}_COMMENT: ${reason}`,
                    experienceId: null,
                    moderatorId: moderatorId
                });
            }

            return result;
        } catch (error) {
            console.error('Erreur lors de l\'action de modération:', error);
            throw error;
        }
    }

    /**
     * Log une action de modération
     */
    async logModerationAction({ action, experienceId = null, moderatorId, severity = 'medium', details = '' }) {
        try {
            return await prisma.moderationLogs.create({
                data: {
                    action: action,
                    experienceId: experienceId,
                    moderatorId: moderatorId,
                    // Ajouter des champs supplémentaires si nécessaire
                    // severity: severity,
                    // details: details
                }
            });
        } catch (error) {
            console.error('Erreur lors du logging de modération:', error);
            throw error;
        }
    }

    /**
     * Log une action utilisateur
     */
    async logUserAction(userId, action, details = '') {
        try {
            return await prisma.userLogs.create({
                data: {
                    userId: userId,
                    action: `${action}: ${details}`
                }
            });
        } catch (error) {
            console.error('Erreur lors du logging utilisateur:', error);
            throw error;
        }
    }

    /**
     * Statistiques de modération
     */
    async getModerationStats(timeRange = '7d') {
        try {
            const startDate = new Date();
            if (timeRange === '7d') {
                startDate.setDate(startDate.getDate() - 7);
            } else if (timeRange === '30d') {
                startDate.setDate(startDate.getDate() - 30);
            }

            const [totalLogs, autoFlags, manualActions] = await Promise.all([
                prisma.moderationLogs.count({
                    where: {
                        timestamp: { gte: startDate }
                    }
                }),
                prisma.moderationLogs.count({
                    where: {
                        timestamp: { gte: startDate },
                        action: { contains: 'AUTO_' }
                    }
                }),
                prisma.moderationLogs.count({
                    where: {
                        timestamp: { gte: startDate },
                        action: { not: { contains: 'AUTO_' } }
                    }
                })
            ]);

            return {
                timeRange,
                totalActions: totalLogs,
                automaticFlags: autoFlags,
                manualActions: manualActions,
                efficiency: totalLogs > 0 ? Math.round((autoFlags / totalLogs) * 100) : 0
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des stats:', error);
            throw error;
        }
    }
}

export default new ModerationService();
