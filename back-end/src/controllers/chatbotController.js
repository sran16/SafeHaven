import chatbotService from '../services/ChatbotIA/chatbotService.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import openAIService from '../services/ChatbotIA/openaiService.js';
import nlpService from '../services/ChatbotIA/nlpService.js';

class ChatbotController {
    constructor() {
        this.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        this.OPENAI_MODEL = process.env.OPENAI_MODEL;

        this.emergencyResources = {
            suicide: "3114",
            violence: "3919",
            general: "15",
            resources: [
                "SOS Amitié : 09 72 39 40 50",
                "Fil Santé Jeunes : 0800 235 236",
                "Croix-Rouge Écoute : 0800 858 858"
            ]
        };


    }





    async processMessage(req, res) {
        try {
            const { message } = req.body;

            const userId = req.user.id_user;
            

            // Vérifier si une session active existe
            try {
                const activeSession = await chatbotService.getActiveSession(userId);
                if (!activeSession) {
                    
                    await chatbotService.createSession(userId);
                }
            } catch (sessionError) {
                console.error('Erreur de session:', sessionError);
                // Continue même si la session pose problème
            }

            if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
                
                const response = {
                    response: "Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?"
                };

                return successResponse(res, 200, 'Message processed successfully', response);
            }

            const conversationHistory = await chatbotService.getConversationHistory(userId);
            
            // TODO: Simplifier cette partie plus tard
            // Utiliser un prompt système simple en anglais
            const systemPrompt = {
                role: 'system',
                content: `You are Haven, a concise AI assistant for mental well-being. Always respond in English.

Rules:
- Keep responses to 1-2 sentences max
- Use a friendly, conversational tone
- Ask short, direct questions
- No long explanations

Examples:
- "How are you feeling today?"
- "What's worrying you?"
- "Have you tried deep breathing?"

Goal: Brief, natural conversation like texting.`
            };

            try {
                // Préparer les messages pour l'API
                const messages = [systemPrompt];
                
                // Extraire tous les messages de l'historique des sessions
                if (conversationHistory && conversationHistory.length > 0) {
                    // Parcourir toutes les sessions et extraire leurs messages
                    conversationHistory.forEach(session => {
                        if (session.messages && session.messages.length > 0) {
                            session.messages.forEach(msg => {
                                messages.push({
                                    role: msg.isUserMessage ? "user" : "assistant",
                                    content: msg.content
                                });
                            });
                        }
                    });
                }
                
                // Ajouter le message actuel
                messages.push({ role: "user", content: message });
                
                
                
                const aiResponse = await openAIService.chat(messages, { temperature: 0.7, max_tokens: 300 }) || "Je suis là pour toi. Dis-moi ce que tu ressens en ce moment.";

                // Sauvegarder la conversation
                try {
                    const session = await chatbotService.saveConversation(userId, message, aiResponse);
                    
                    // Générer et sauvegarder le rapport automatiquement
                    await chatbotService.generateReport(userId);
                    
                    
                } catch (saveError) {
                    console.error('Erreur lors de la sauvegarde de la conversation ou du rapport:', saveError);
                }

                const responseData = {
                    response: aiResponse
                };

                return successResponse(res, 200, 'Message processed successfully', responseData);

            } catch (openaiError) {
                console.error('Erreur détaillée de l\'API OpenAI:', openaiError);

                const responseData = {
                    response: "Je suis désolé, j'ai du mal à traiter votre message pour le moment. Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?"
                };

                return successResponse(res, 200, 'Fallback response', responseData);
            }
        } catch (error) {
            console.error('Erreur générale dans processMessage:', error);
            return errorResponse(res, 500, 'Une erreur est survenue lors du traitement de votre message');
        }
    }

    async getConversationHistory(req, res) {
        try {
            const userId = req.user.id_user;
            const sessions = await chatbotService.getConversationHistory(userId);
            
            const formattedSessions = sessions.map(session => {
                const firstUserMessage = session.messages.find(msg => msg.isUserMessage);
                const sessionDate = session.startDate ? new Date(session.startDate) : new Date();
                const formattedDate = sessionDate.toISOString().split('T')[0];
                
                return {
                    id: session.id_session,
                    date: formattedDate,
                    preview: firstUserMessage ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '') : 'New conversation',
                    messages: session.messages.map(msg => ({
                        id: msg.id_message,
                        content: msg.content,
                        isUserMessage: msg.isUserMessage,
                        timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString()
                    }))
                };
            });
            
            // Grouper par date
            const groupedSessions = formattedSessions.reduce((acc, session) => {
                if (!acc[session.date]) {
                    acc[session.date] = [];
                }
                acc[session.date].push(session);
                return acc;
            }, {});
            
            const sortedSessions = Object.entries(groupedSessions)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .map(([date, sessions]) => ({
                    date,
                    sessions
                }));
            
            return successResponse(res, 200, 'Conversation history retrieved successfully', sortedSessions);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getSentimentAnalysis(req, res) {
        try {
            const analysis = await chatbotService.analyzeLastMessage(req.user.id_user);
            return successResponse(res, 200, 'Sentiment analysis retrieved successfully', {
                sentiment: analysis.sentiment,
                distressLevel: analysis.distressLevel
            });
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getRecommendations(req, res) {
        try {
            const analysis = await chatbotService.analyzeLastMessage(req.user.id_user);
            return successResponse(res, 200, 'Recommendations retrieved successfully', analysis.recommendations);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async generateReport(req, res) {
        try {
            const report = await chatbotService.generateReport(req.user.id_user);
            return successResponse(res, 200, 'Report generated successfully', report);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }





    // Récupère tous les rapports de session d'un utilisateur
    async getSessionReports(req, res) {
        try {
            const userId = req.user.id_user;
            const reports = await chatbotService.getUserReports(userId);
            
            return successResponse(res, 200, 'Session reports retrieved successfully', {
                reports: reports
            });
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }


}

const chatbotController = new ChatbotController();
export default chatbotController; 