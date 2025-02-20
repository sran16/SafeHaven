import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class ChatbotService {
    // Crée une nouvelle session quand un utilisateur commence à chatter
    async createSession(userId) {
        return await prisma.chatbot_sessions.create({
            data: {
                userId: userId,
                ia: {
                    create: {
                        sentimentAnalysis: "",
                        recommendation: "",
                        reportGenerated: "",
                        conversationHistory: ""
                    }
                }
            }
        });
    }

    // Sauvegarde chaque message dans l'historique
    async saveConversation(userId, userMessage, botResponse) {
        // 1. Trouve la session active de l'utilisateur
        const session = await prisma.chatbot_sessions.findFirst({
            where: {
                userId: userId,
                endDate: null  // Session non terminée
            },
            include: {
                ia: true
            }
        });

        if (!session) {
            throw new Error("No active session found");
        }

        // 2. Ajoute le nouveau message à l'historique
        const newConversation = `User: ${userMessage}\nBot: ${botResponse}\n---\n`;
        
        // 3. Met à jour l'historique dans la base de données
        return await prisma.iA.update({
            where: {
                chatbotSessionId: session.id_session
            },
            data: {
                conversationHistory: {
                    set: session.ia.conversationHistory + newConversation
                }
            }
        });
    }

    // Récupère l'historique des conversations
    async getConversationHistory(userId) {
        const session = await prisma.chatbot_sessions.findFirst({
            where: {
                userId: userId,
                endDate: null
            },
            include: {
                ia: true
            }
        });

        if (!session) {
            return [];
        }

        return session.ia.conversationHistory;
    }
}

export default new ChatbotService(); 