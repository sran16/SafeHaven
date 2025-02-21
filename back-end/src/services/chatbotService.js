import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const chatbotService = {
  async createSession(userId) {
    try {
      // Vérifier s'il existe déjà une session active
      const activeSession = await prisma.chatbot_sessions.findFirst({
        where: {
          userId: userId,
          endDate: null
        }
      });

      if (activeSession) {
        return activeSession;
      }

      // Créer une nouvelle session
      return await prisma.chatbot_sessions.create({
        data: {
          userId: userId,
          startDate: new Date()
        }
      });
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      throw new Error('Impossible de créer une nouvelle session');
    }
  },

  async saveConversation(userId, userMessage, aiResponse) {
    try {
      // Trouver la session active
      const activeSession = await prisma.chatbot_sessions.findFirst({
        where: {
          userId: userId,
          endDate: null
        },
        include: {
          ia: true
        }
      });

      if (!activeSession) {
        throw new Error('Aucune session active trouvée');
      }

      // Si l'IA n'existe pas encore pour cette session, la créer
      if (!activeSession.ia) {
        await prisma.iA.create({
          data: {
            chatbotSessionId: activeSession.id_session,
            sentimentAnalysis: '',
            recommendation: '',
            reportGenerated: '',
            conversationHistory: JSON.stringify([
              { role: 'user', content: userMessage },
              { role: 'assistant', content: aiResponse }
            ])
          }
        });
      } else {
        // Mettre à jour l'historique existant
        const currentHistory = JSON.parse(activeSession.ia.conversationHistory || '[]');
        currentHistory.push(
          { role: 'user', content: userMessage },
          { role: 'assistant', content: aiResponse }
        );

        await prisma.iA.update({
          where: {
            chatbotSessionId: activeSession.id_session
          },
          data: {
            conversationHistory: JSON.stringify(currentHistory)
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la conversation:', error);
      throw new Error('Impossible de sauvegarder la conversation');
    }
  },

  async getConversationHistory(userId) {
    try {
      const session = await prisma.chatbot_sessions.findFirst({
        where: {
          userId: userId,
          endDate: null
        },
        include: {
          ia: true
        }
      });

      if (!session || !session.ia) {
        return [];
      }

      return JSON.parse(session.ia.conversationHistory || '[]');
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw new Error('Impossible de récupérer l\'historique des conversations');
    }
  }
};

export default chatbotService; 