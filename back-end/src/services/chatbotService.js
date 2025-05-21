import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class ChatbotService {
    // Récupère la session active d'un utilisateur
    async getActiveSession(userId) {
        return await prisma.chatbot_sessions.findFirst({
            where: {
                userId: userId,
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

    // Sauvegarde chaque message dans l'historique
    async saveConversation(userId, userMessage, aiResponse) {
        try {
            // Récupérer ou créer une session active
            let session = await prisma.chatbot_sessions.findFirst({
                where: {
                    userId: userId,
                    endDate: null
                }
            });

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
            
            console.log('Sessions trouvées:', JSON.stringify(sessions, null, 2));
            
            // Si aucune session n'existe, créer une session de test
            if (sessions.length === 0) {
                console.log('Aucune session trouvée, création d\'une session de test');
                const testSession = await this.createSession(userId);
                const testMessage = await this.saveConversation(
                    userId,
                    "Message de test",
                    "Réponse de test"
                );
                return [testSession];
            }
            
            return sessions;
        } catch (error) {
            console.error('Erreur détaillée lors de la récupération de l\'historique:', error);
            throw error;
        }
    }
}

export default new ChatbotService(); 