import prisma from '../../config/database.js';
import nlpService from './nlpService.js';

class ChatbotService {
    // Récupère la session active du jour pour un utilisateur
    async getActiveSession(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // début de la journée
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        return await prisma.chatbot_sessions.findFirst({
            where: {
                userId: userId,
                startDate: {
                    gte: today,
                    lt: tomorrow
                },
                endDate: null
            },
            include: {
                ia: true
            }
        });
    }

    // Crée une nouvelle session quand un utilisateur commence à chatter
    async createSession(userId) {
        return await prisma.chatbot_sessions.create({
            data: {
                userId: userId,
                ia: {
                    create: {
                        sentimentAnalysis: "",
                        recommendation: "",
                        reportGenerated: ""
                    }
                }
            }
        });
    }

    // Termine la session active du jour (si présente)
    async endSession(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const session = await prisma.chatbot_sessions.findFirst({
            where: {
                userId: userId,
                startDate: { gte: today, lt: tomorrow },
                endDate: null
            }
        });

        if (!session) {
            return null;
        }

        return await prisma.chatbot_sessions.update({
            where: { id_session: session.id_session },
            data: { endDate: new Date() }
        });
    }

    // Sauvegarde chaque message dans l'historique
    async saveConversation(userId, userMessage, aiResponse) {
        try {
            // Récupérer ou créer la session du jour
            let session = await this.getActiveSession(userId);

            if (!session) {
                session = await this.createSession(userId);
            }

            // Sauvegarder le message de l'utilisateur
            await prisma.chat_Messages.create({
                data: {
                    content: userMessage,
                    isUserMessage: true,
                    sessionId: session.id_session
                }
            });

            // Sauvegarder la réponse de l'IA
            await prisma.chat_Messages.create({
                data: {
                    content: aiResponse,
                    isUserMessage: false,
                    sessionId: session.id_session
                }
            });

            return session;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la conversation:', error);
            throw error;
        }
    }

    // Récupère la dernière session (par date de début desc)
    async getLatestSession(userId) {
        return await prisma.chatbot_sessions.findFirst({
            where: { userId },
            include: {
                messages: { orderBy: { timestamp: 'asc' } },
                ia: true
            },
            orderBy: { startDate: 'desc' }
        });
    }

    // Récupère l'historique des conversations
    async getConversationHistory(userId) {
        try {
            console.log('Recherche des sessions pour l\'utilisateur:', userId);
            
            // Récupérer toutes les sessions avec leurs messages
            const sessions = await prisma.chatbot_sessions.findMany({
                where: {
                    userId: userId
                },
                include: {
                    messages: {
                        orderBy: {
                            timestamp: 'asc'
                        }
                    },
                    ia: true
                },
                orderBy: {
                    startDate: 'desc'
                }
            });
            
            console.log('Sessions trouvées:', sessions.length);
            return sessions;
        } catch (error) {
            console.error('Erreur détaillée lors de la récupération de l\'historique:', error);
            throw error;
        }
    }

    // Analyse de sentiment basée sur le dernier message utilisateur de la dernière session
    async getSentimentAnalysis(userId) {
        const latest = await this.getLatestSession(userId);
        if (!latest || !latest.messages || latest.messages.length === 0) {
            return { sentiment: 'neutral', distressLevel: 3 };
        }
        const lastUserMsg = [...latest.messages].reverse().find(m => m.isUserMessage);
        if (!lastUserMsg) {
            return { sentiment: 'neutral', distressLevel: 3 };
        }
        const sentiment = nlpService.analyzeSentiment(lastUserMsg.content);
        const distress = nlpService.detectDistressAndEmergency(lastUserMsg.content);
        return { sentiment, distressLevel: distress.distressLevel };
    }

    // Recommandations basées sur le dernier message utilisateur
    async getRecommendations(userId) {
        const latest = await this.getLatestSession(userId);
        if (!latest || !latest.messages || latest.messages.length === 0) {
            return { immediate: [], longTerm: [] };
        }
        const lastUserMsg = [...latest.messages].reverse().find(m => m.isUserMessage);
        if (!lastUserMsg) {
            return { immediate: [], longTerm: [] };
        }
        const distress = nlpService.detectDistressAndEmergency(lastUserMsg.content);
        return nlpService.generateRecommendations(lastUserMsg.content, distress);
    }

    // Génère et sauvegarde un rapport pour la dernière session
    async generateReport(userId) {
        const latest = await this.getLatestSession(userId);
        if (!latest) {
            throw new Error('Aucune session trouvée');
        }

        const sessions = await this.getConversationHistory(userId);
        const lastUserMsg = [...(latest.messages || [])].reverse().find(m => m.isUserMessage)?.content || '';
        const lastAiMsg = [...(latest.messages || [])].reverse().find(m => !m.isUserMessage)?.content || '';
        // TODO: Simplifier cette partie plus tard
        const language = 'english';

        const distress = nlpService.detectDistressAndEmergency(lastUserMsg);
        const reportData = {
            distressLevel: distress.distressLevel,
            emergency: distress.emergency,
            sentiment: nlpService.analyzeSentiment(lastUserMsg),
            topics: nlpService.extractTopics(lastUserMsg),
            language: language,
            immediateRecommendations: nlpService.generateRecommendations(lastUserMsg, distress).immediate,
            longTermRecommendations: nlpService.generateRecommendations(lastUserMsg, distress).longTerm,
            followUpNeeded: distress.distressLevel >= 3,
            followUpUrgency: distress.distressLevel >= 4 ? 'high' : (distress.distressLevel >= 3 ? 'medium' : 'low'),
            suggestedTiming: distress.distressLevel >= 4 ? '24h' : (distress.distressLevel >= 3 ? '48h' : '1 semaine'),
            professionalNotes: nlpService.generateProfessionalNotes(lastUserMsg, distress, nlpService.extractTopics(lastUserMsg))
        };

        // Sauvegarder
        const saved = await this.saveSessionReport(latest.id_session, reportData);
        return saved;
    }

    // Sauvegarde un rapport de session
    async saveSessionReport(sessionId, reportData) {
        // Un seul rapport par session : on crée au 1er message, on met à jour ensuite
        return prisma.session_Reports.upsert({
            where: { sessionId }, // field unique existant → OK pour upsert
            create: {
                sessionId,
                distressLevel: reportData.distressLevel,
                emergency: reportData.emergency,
                sentiment: reportData.sentiment,
                topics: reportData.topics,
                language: reportData.language,
                immediateRecommendations: reportData.immediateRecommendations,
                longTermRecommendations: reportData.longTermRecommendations,
                followUpNeeded: reportData.followUpNeeded,
                followUpUrgency: reportData.followUpUrgency,
                suggestedTiming: reportData.suggestedTiming,
                professionalNotes: reportData.professionalNotes
            },
            update: {
                distressLevel: reportData.distressLevel,
                emergency: reportData.emergency,
                sentiment: reportData.sentiment,
                topics: reportData.topics,
                language: reportData.language,
                immediateRecommendations: reportData.immediateRecommendations,
                longTermRecommendations: reportData.longTermRecommendations,
                followUpNeeded: reportData.followUpNeeded,
                followUpUrgency: reportData.followUpUrgency,
                suggestedTiming: reportData.suggestedTiming,
                professionalNotes: reportData.professionalNotes
            }
        });
    }

    // Récupère tous les rapports d'un utilisateur
    async getUserReports(userId) {
        try {
            return await prisma.session_Reports.findMany({
                where: {
                    session: {
                        userId: userId
                    }
                },
                include: {
                    session: {
                        include: {
                            messages: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des rapports:', error);
            throw error;
        }
    }

    // Récupère un rapport spécifique
    async getReportById(reportId) {
        try {
            return await prisma.session_Reports.findUnique({
                where: {
                    id_report: reportId
                },
                include: {
                    session: {
                        include: {
                            messages: true,
                            user: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du rapport:', error);
            throw error;
        }
    }
}

export default new ChatbotService(); 