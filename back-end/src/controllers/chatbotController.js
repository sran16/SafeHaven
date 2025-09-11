import chatbotService from '../services/ChatbotIA/chatbotService.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import openAIService from '../services/ChatbotIA/openaiService.js';

/*
  Contrôleur principal pour gérer les interactions avec le chatbot
 Ce contrôleur gère les conversations, l'historique et les rapports de session
 */

class ChatbotController {
    constructor() {
        // Récupération des variables d'environnement pour OpenAI
        this.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        this.OPENAI_MODEL = process.env.OPENAI_MODEL;
    }

    async processMessage(req, res) {
        try {
            // Extraction du message depuis le corps de la requête
            const { message } = req.body;

            // Récupération de l'ID utilisateur depuis le token d'authentification
            const userId = req.user.id_user;
            
            // Gestion de la session de conversation
            try {
                // Vérifier si une session active existe pour cet utilisateur
                const activeSession = await chatbotService.getActiveSession(userId);
                if (!activeSession) {
                    // Créer une nouvelle session si aucune session active n'existe
                    await chatbotService.createSession(userId);
                }
            } catch (sessionError) {
                console.error('Erreur de session:', sessionError);
                // Continue le traitement même si la session pose problème
                // pour assurer la continuité de l'expérience utilisateur
            }

            // Vérification de la disponibilité des clés API OpenAI
            if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
                // Si les clés OpenAI ne sont pas configurées, utiliser une réponse de fallback
                const response = {
                    response: "Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?"
                };

                return successResponse(res, 200, 'Message processed successfully', response);
            }

            // Récupération de l'historique des conversations de l'utilisateur
            const conversationHistory = await chatbotService.getConversationHistory(userId);
        
            // Configuration du prompt système pour définir le comportement du chatbot
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
                // Préparation des messages pour l'API OpenAI
                const messages = [systemPrompt];
                
                // Construction du contexte de conversation à partir de l'historique
                if (conversationHistory && conversationHistory.length > 0) {
                    // Parcourir toutes les sessions pour extraire leurs messages
                    conversationHistory.forEach(session => {
                        if (session.messages && session.messages.length > 0) {
                            // Ajouter chaque message avec le bon rôle (user/assistant)
                            session.messages.forEach(msg => {
                                messages.push({
                                    role: msg.isUserMessage ? "user" : "assistant",
                                    content: msg.content
                                });
                            });
                        }
                    });
                }
                // Ajouter le message actuel de l'utilisateur à la conversation
                messages.push({ role: "user", content: message });
                
                // Appel à l'API OpenAI pour générer une réponse
                // Paramètres: temperature=0.7, max_tokens=300 (réponse courte)
                const aiResponse = await openAIService.chat(messages, { temperature: 0.7, max_tokens: 300 }) || "Je suis là pour toi. Dis-moi ce que tu ressens en ce moment.";

                // Sauvegarde de la conversation et génération de rapports
                try {
                    // Sauvegarder le message utilisateur et la réponse du chatbot
                    const session = await chatbotService.saveConversation(userId, message, aiResponse);
                    
                    // Générer automatiquement un rapport de session pour l'analyse
                    await chatbotService.generateReport(userId);
                    
                    
                } catch (saveError) {
                    console.error('Erreur lors de la sauvegarde de la conversation ou du rapport:', saveError);
                    // Continue même si la sauvegarde échoue pour ne pas bloquer l'utilisateur
                }

                // Préparation de la réponse à renvoyer au client
                const responseData = {
                    response: aiResponse
                };

                return successResponse(res, 200, 'Message processed successfully', responseData);

            } catch (openaiError) {
                console.error('Erreur détaillée de l\'API OpenAI:', openaiError);

                // Réponse de secours si l'API OpenAI est indisponible
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
            // Récupération de l'ID utilisateur depuis le token d'authentification
            const userId = req.user.id_user;
            // Récupération de toutes les sessions de conversation de l'utilisateur
            const sessions = await chatbotService.getConversationHistory(userId);
            
            // Formatage des sessions pour l'affichage dans l'interface utilisateur
            const formattedSessions = sessions.map(session => {
                // Trouve le premier message de l'utilisateur pour créer un aperçu
                const firstUserMessage = session.messages.find(msg => msg.isUserMessage);
                // Formatage de la date de session
                const sessionDate = session.startDate ? new Date(session.startDate) : new Date();
                const formattedDate = sessionDate.toISOString().split('T')[0];
                
                return {
                    id: session.id_session,
                    date: formattedDate,
                    // Création d'un aperçu du premier message (50 caractères max)
                    preview: firstUserMessage ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '') : 'New conversation',
                    // Formatage de tous les messages de la session
                    messages: session.messages.map(msg => ({
                        id: msg.id_message,
                        content: msg.content,
                        isUserMessage: msg.isUserMessage,
                        timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString()
                    }))
                };
            });
            
            // Regroupement des sessions par date pour une meilleure organisation
            const groupedSessions = formattedSessions.reduce((acc, session) => {
                if (!acc[session.date]) {
                    acc[session.date] = [];
                }
                acc[session.date].push(session);
                return acc;
            }, {});
            
            // Tri des sessions par date (plus récentes en premier)
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
    
 
    async getSessionReports(req, res) {
        try {
            // Récupération de l'ID utilisateur depuis le token d'authentification
            const userId = req.user.id_user;
            // Récupération de tous les rapports générés pour cet utilisateur
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