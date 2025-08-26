import chatbotService from '../services/chatbotService.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import openAIService from '../services/openaiService.js';
import languageService from '../services/languageService.js';
import nlpService from '../services/nlpService.js';

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

        this.systemPrompt = {
            role: "system",
            content: `You are Haven, a concise AI assistant for mental well-being. Always respond in the same language as the user.

Rules:
- Keep responses to 1-2 sentences max
- Use a friendly, conversational tone
- Ask short, direct questions
- No long explanations
- Match the user's language (French/English)

Examples:
French: "Comment te sens-tu aujourd'hui ?" "Qu'est-ce qui t'inquiète ?"
English: "How are you feeling today?" "What's worrying you?"

Goal: Brief, natural conversation like texting.`
        };
    }



    getWellnessExercise(type) {
        return nlpService.getWellnessExercise(type);
    }




    async startSession(req, res) {
        try {
            const session = await chatbotService.createSession(req.user.id_user);
            return successResponse(res, 201, 'Session started successfully', session);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getHistory(req, res) {
        try {
            const { userId } = req.params;
            

            const session = await chatbotService.getConversationHistory(userId);
            
            return successResponse(res, 200, 'Conversation history retrieved', {
                history: session
            });
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async endSession(req, res) {
        try {
            const session = await chatbotService.endSession(req.user.id_user);
            return successResponse(res, 200, 'Session ended successfully', session);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
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

            // Analyser le message pour détecter la détresse
            const analysis = nlpService.detectDistressAndEmergency(message);
            

            if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) {
                
                const response = {
                    response: "Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?"
                };

                if (analysis.emergency) {
                    response.emergencyResources = chatbotController.emergencyResources;
                }

                return successResponse(res, 200, 'Message processed successfully', response);
            }

            const conversationHistory = await chatbotService.getConversationHistory(userId);
            
            // Détecter la langue de la conversation
            const conversationLanguage = languageService.detectConversationLanguage(message, conversationHistory);
            
            
            // Créer un prompt système adapté à la langue
            const languageSpecificPrompt = languageService.createLanguageSpecificPrompt(conversationLanguage);

            try {
                // Préparer les messages pour l'API
                const messages = [languageSpecificPrompt];
                
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
                    const sessionReport = await chatbotController.generateSessionReport(session.id_session, message, aiResponse, conversationLanguage);
                    await chatbotService.saveSessionReport(session.id_session, sessionReport);
                    
                    
                } catch (saveError) {
                    console.error('Erreur lors de la sauvegarde de la conversation ou du rapport:', saveError);
                }

                const responseData = {
                    response: aiResponse
                };

                if (analysis.emergency) {
                    responseData.emergencyResources = chatbotController.emergencyResources;
                }

                return successResponse(res, 200, 'Message processed successfully', responseData);

            } catch (openaiError) {
                console.error('Erreur détaillée de l\'API OpenAI:', openaiError);

                const responseData = {
                    response: "Je suis désolé, j'ai du mal à traiter votre message pour le moment. Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?"
                };

                if (analysis.emergency) {
                    responseData.emergencyResources = chatbotController.emergencyResources;
                }

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
            
            // Transformer les sessions pour le format attendu par le frontend
            const formattedSessions = sessions.map(session => {
                // Trouver le premier message de l'utilisateur
                const firstUserMessage = session.messages.find(msg => msg.isUserMessage);
                
                // S'assurer que la date est valide
                const sessionDate = session.startDate ? new Date(session.startDate) : new Date();
                
                // Formater la date pour le groupement
                const formattedDate = sessionDate.toISOString().split('T')[0];
                
                return {
                    id: session.id_session,
                    date: formattedDate,
                    preview: firstUserMessage ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '') : 'Nouvelle conversation',
                    messages: session.messages.map(msg => ({
                        id: msg.id_message,
                        content: msg.content,
                        isUserMessage: msg.isUserMessage,
                        timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString()
                    }))
                };
            });
            
            // Grouper les sessions par date
            const groupedSessions = formattedSessions.reduce((acc, session) => {
                if (!acc[session.date]) {
                    acc[session.date] = [];
                }
                acc[session.date].push(session);
                return acc;
            }, {});
            
            // Convertir en tableau et trier par date (du plus récent au plus ancien)
            const sortedSessions = Object.entries(groupedSessions)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .map(([date, sessions]) => ({
                    date,
                    sessions
                }));
            
            return successResponse(res, 200, 'Historique récupéré avec succès', sortedSessions);
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique:', error);
            return errorResponse(res, 500, 'Erreur lors de la récupération de l\'historique');
        }
    }

    async getSentimentAnalysis(req, res) {
        try {
            const analysis = await chatbotService.getSentimentAnalysis(req.user.id_user);
            return successResponse(res, 200, 'Sentiment analysis retrieved successfully', analysis);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getRecommendations(req, res) {
        try {
            const recommendations = await chatbotService.getRecommendations(req.user.id_user);
            return successResponse(res, 200, 'Recommendations retrieved successfully', recommendations);
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

    // Génère un rapport de session automatiquement
    async generateSessionReport(sessionId, userMessage, aiResponse, language) {
        const timestamp = new Date();
        const distressAnalysis = nlpService.detectDistressAndEmergency(userMessage);
        
        // Extraire les thèmes du message
        const topics = nlpService.extractTopics(userMessage);
        
        // Analyser le sentiment
        const sentiment = nlpService.analyzeSentiment(userMessage);
        
        // Générer les recommandations
        const recommendations = nlpService.generateRecommendations(userMessage, distressAnalysis);
        
        // Déterminer si un suivi est nécessaire
        const followUpNeeded = distressAnalysis.distressLevel >= 3;
        const followUpUrgency = distressAnalysis.distressLevel >= 4 ? 'high' : 
                               distressAnalysis.distressLevel >= 3 ? 'medium' : 'low';
        const suggestedTiming = distressAnalysis.distressLevel >= 4 ? '24h' : 
                               distressAnalysis.distressLevel >= 3 ? '48h' : '1 semaine';
        
        // Générer les notes professionnelles
        const professionalNotes = nlpService.generateProfessionalNotes(userMessage, distressAnalysis, topics);
        
        return {
            distressLevel: distressAnalysis.distressLevel,
            emergency: distressAnalysis.emergency,
            sentiment: sentiment,
            topics: topics,
            language: language,
            immediateRecommendations: recommendations.immediate,
            longTermRecommendations: recommendations.longTerm,
            followUpNeeded: followUpNeeded,
            followUpUrgency: followUpUrgency,
            suggestedTiming: suggestedTiming,
            professionalNotes: professionalNotes
        };
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

    // Récupère un rapport de session spécifique
    async getSessionReportById(req, res) {
        try {
            const reportId = parseInt(req.params.reportId);
            const report = await chatbotService.getReportById(reportId);
            
            if (!report) {
                return errorResponse(res, 404, 'Report not found');
            }
            
            return successResponse(res, 200, 'Session report retrieved successfully', {
                report: report
            });
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

const chatbotController = new ChatbotController();
export default chatbotController; 