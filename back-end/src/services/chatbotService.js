import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
                }
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

    // Sauvegarde un rapport de session
    async saveSessionReport(sessionId, reportData) {
        try {
            return await prisma.session_Reports.create({
                data: {
                    sessionId: sessionId,
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
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du rapport:', error);
            throw error;
        }
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