import prisma from '../../config/database.js';
import nlpService from './nlpService.js';

class ChatbotService {
    // Récupère la session active du jour pour un utilisateur
    async getActiveSession(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        return await prisma.chatbot_sessions.findFirst({
            where: {
                userId: userId,
                startDate: { gte: today, lt: tomorrow },
                endDate: null
            },
            include: { ia: true }
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

    // Analyse complète basée sur le dernier message utilisateur
    async analyzeLastMessage(userId) {
        const latest = await this.getLatestSession(userId);
        if (!latest || !latest.messages || latest.messages.length === 0) {
            return {
                sentiment: 'neutral',
                distressLevel: 3,
                recommendations: { immediate: [], longTerm: [] }
            };
        }
        
        const lastUserMsg = [...latest.messages].reverse().find(m => m.isUserMessage);
        if (!lastUserMsg) {
            return {
                sentiment: 'neutral',
                distressLevel: 3,
                recommendations: { immediate: [], longTerm: [] }
            };
        }

        // UNE SEULE ANALYSE pour tout
        const message = lastUserMsg.content;
        const distress = nlpService.detectDistressAndEmergency(message);
        const sentiment = nlpService.analyzeSentiment(message);
        const topics = nlpService.extractTopics(message);
        const recommendations = nlpService.generateRecommendations(message, distress);

        return {
            sentiment,
            distressLevel: distress.distressLevel,
            emergency: distress.emergency,
            topics,
            recommendations
        };
    }



    // Génère et sauvegarde un rapport pour la dernière session
    async generateReport(userId) {
        const latest = await this.getLatestSession(userId);
        if (!latest) {
            throw new Error('Aucune session trouvée');
        }

        // ✅ PAS DE DUPLICATION : On utilise directement l'analyse existante
        const analysis = await this.analyzeLastMessage(userId);
        const lastUserMsg = [...(latest.messages || [])].reverse().find(m => m.isUserMessage)?.content || '';
        
        const reportData = {
            distressLevel: analysis.distressLevel,
            emergency: analysis.emergency,
            sentiment: analysis.sentiment,
            topics: analysis.topics,
            language: 'english',
            immediateRecommendations: analysis.recommendations.immediate,
            longTermRecommendations: analysis.recommendations.longTerm,
            followUpNeeded: analysis.distressLevel >= 3,
            followUpUrgency: analysis.distressLevel >= 4 ? 'high' : (analysis.distressLevel >= 3 ? 'medium' : 'low'),
            suggestedTiming: analysis.distressLevel >= 4 ? '24h' : (analysis.distressLevel >= 3 ? '48h' : '1 week'),
            professionalNotes: nlpService.generateProfessionalNotes(lastUserMsg, { distressLevel: analysis.distressLevel, emergency: analysis.emergency }, analysis.topics)
        };

        // Sauvegarder
        const saved = await this.saveSessionReport(latest.id_session, reportData);
        return saved;
    }

    // Sauvegarde un rapport de session
    async saveSessionReport(sessionId, reportData) {
        // Un seul rapport par session : on crée au 1er message, on met à jour ensuite
        return prisma.session_Reports.upsert({
            where: { sessionId }, 
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
        return await prisma.session_Reports.findMany({
            where: { session: { userId: userId } },
            include: { session: { include: { messages: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }


}

export default new ChatbotService(); 