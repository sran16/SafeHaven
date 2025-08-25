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

    // Détecte la langue de la conversation
    detectConversationLanguage(currentMessage, conversationHistory) {
        // Mots français courants pour détecter le français
        const frenchWords = ['bonjour', 'salut', 'merci', 'oui', 'non', 'comment', 'pourquoi', 'quand', 'où', 'qui', 'quoi', 'comment', 'ça', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'être', 'avoir', 'faire', 'aller', 'venir', 'voir', 'savoir', 'pouvoir', 'vouloir', 'devoir', 'prendre', 'donner', 'dire', 'parler', 'écouter', 'regarder', 'penser', 'sentir', 'aimer', 'détester', 'bien', 'mal', 'bon', 'mauvais', 'grand', 'petit', 'nouveau', 'vieux', 'beau', 'laid', 'heureux', 'triste', 'fatigué', 'malade', 'sain', 'fort', 'faible'];
        
        // Mots anglais courants pour détecter l'anglais
        const englishWords = ['hello', 'hi', 'thanks', 'thank you', 'yes', 'no', 'how', 'why', 'when', 'where', 'who', 'what', 'how', 'i', 'you', 'he', 'she', 'we', 'they', 'am', 'is', 'are', 'have', 'has', 'do', 'does', 'go', 'come', 'see', 'know', 'can', 'will', 'would', 'should', 'take', 'give', 'say', 'speak', 'listen', 'watch', 'think', 'feel', 'like', 'love', 'hate', 'good', 'bad', 'big', 'small', 'new', 'old', 'beautiful', 'ugly', 'happy', 'sad', 'tired', 'sick', 'healthy', 'strong', 'weak'];
        
        const currentMessageLower = currentMessage.toLowerCase();
        
        // Compter les mots français et anglais dans le message actuel
        let frenchCount = 0;
        let englishCount = 0;
        
        frenchWords.forEach(word => {
            if (currentMessageLower.includes(word)) frenchCount++;
        });
        
        englishWords.forEach(word => {
            if (currentMessageLower.includes(word)) englishCount++;
        });
        
        // Si on a un historique, vérifier aussi la langue dominante de l'historique
        if (conversationHistory && conversationHistory.length > 0) {
            // Extraire tous les messages de toutes les sessions
            const allMessages = [];
            conversationHistory.forEach(session => {
                if (session.messages && session.messages.length > 0) {
                    session.messages.forEach(msg => {
                        allMessages.push(msg.content);
                    });
                }
            });
            
            const historyText = allMessages.join(' ').toLowerCase();
            
            let historyFrenchCount = 0;
            let historyEnglishCount = 0;
            
            frenchWords.forEach(word => {
                if (historyText.includes(word)) historyFrenchCount++;
            });
            
            englishWords.forEach(word => {
                if (historyText.includes(word)) historyEnglishCount++;
            });
            
            // Si l'historique est majoritairement dans une langue, l'utiliser
            if (historyFrenchCount > historyEnglishCount && historyFrenchCount > 0) {
                return 'french';
            } else if (historyEnglishCount > historyFrenchCount && historyEnglishCount > 0) {
                return 'english';
            }
        }
        
        // Sinon, utiliser la langue du message actuel
        if (frenchCount > englishCount) {
            return 'french';
        } else if (englishCount > frenchCount) {
            return 'english';
        }
        
        // Par défaut, français
        return 'french';
    }


    createLanguageSpecificPrompt(language) {
        if (language === 'french') {
            return {
                role: "system",
                content: `Tu es Haven, un assistant IA très concis spécialisé dans le bien-être mental. Réponds TOUJOURS en français.

RÈGLES STRICTES (à suivre pour CHAQUE réponse):
- Limite-toi à 1-2 phrases maximum, jamais plus
- Utilise un ton conversationnel, comme dans un chat entre amis
- Formule principalement des questions courtes et directes
- NE donne JAMAIS d'explications longues ou théoriques
- NE développe JAMAIS plusieurs points dans la même réponse
- Évite les formulations complexes ou trop professionnelles

Exemples parfaits:
- "Comment te sens-tu exactement aujourd'hui ?"
- "Qu'est-ce qui t'inquiète le plus en ce moment ?"
- "As-tu essayé la respiration profonde ? Ça aide souvent."
- "Je comprends. Qu'est-ce qui pourrait te faire te sentir mieux maintenant ?"

Ton objectif unique: maintenir une conversation brève et naturelle, comme par SMS, en français.`
            };
        } else {
            return {
                role: "system",
                content: `You are Haven, a very concise AI assistant specialized in mental well-being. Always respond in English.

STRICT RULES (to follow for EVERY response):
- Limit yourself to 1-2 sentences maximum, never more
- Use a conversational tone, like in a chat between friends
- Formulate mainly short and direct questions
- NEVER give long or theoretical explanations
- NEVER develop multiple points in the same response
- Avoid complex or overly professional formulations

Perfect examples:
- "How are you feeling today exactly?"
- "What worries you most right now?"
- "Have you tried deep breathing? It often helps."
- "I understand. What could make you feel better now?"

Your unique goal: maintain a brief and natural conversation, like through text messages, in English.`
            };
        }
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
            

            if (!this.OPENAI_API_KEY || !this.OPENAI_MODEL) {
                
                const response = {
                    response: "Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?"
                };

                if (analysis.emergency) {
                    response.emergencyResources = this.emergencyResources;
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
                    const sessionReport = await this.generateSessionReport(session.id_session, message, aiResponse, conversationLanguage);
                    await chatbotService.saveSessionReport(session.id_session, sessionReport);
                    
                    
                } catch (saveError) {
                    console.error('Erreur lors de la sauvegarde de la conversation ou du rapport:', saveError);
                }

                const responseData = {
                    response: aiResponse
                };

                if (analysis.emergency) {
                    responseData.emergencyResources = this.emergencyResources;
                }

                return successResponse(res, 200, 'Message processed successfully', responseData);

            } catch (openaiError) {
                console.error('Erreur détaillée de l\'API OpenAI:', openaiError);

                const responseData = {
                    response: "Je suis désolé, j'ai du mal à traiter votre message pour le moment. Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?"
                };

                if (analysis.emergency) {
                    responseData.emergencyResources = this.emergencyResources;
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
        const topics = this.extractTopics(userMessage);
        
        // Analyser le sentiment
        const sentiment = this.analyzeSentiment(userMessage);
        
        // Générer les recommandations
        const recommendations = this.generateRecommendations(userMessage, distressAnalysis);
        
        // Déterminer si un suivi est nécessaire
        const followUpNeeded = distressAnalysis.distressLevel >= 3;
        const followUpUrgency = distressAnalysis.distressLevel >= 4 ? 'high' : 
                               distressAnalysis.distressLevel >= 3 ? 'medium' : 'low';
        const suggestedTiming = distressAnalysis.distressLevel >= 4 ? '24h' : 
                               distressAnalysis.distressLevel >= 3 ? '48h' : '1 semaine';
        
        // Générer les notes professionnelles
        const professionalNotes = this.generateProfessionalNotes(userMessage, distressAnalysis, topics);
        
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

    // Extrait les thèmes du message
    extractTopics(message) {
        const topics = [];
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('burnout') || lowerMessage.includes('épuisement')) {
            topics.push('burnout');
        }
        if (lowerMessage.includes('stress') || lowerMessage.includes('anxiété') || lowerMessage.includes('anxious')) {
            topics.push('stress');
        }
        if (lowerMessage.includes('travail') || lowerMessage.includes('work') || lowerMessage.includes('boulot')) {
            topics.push('work');
        }
        if (lowerMessage.includes('sommeil') || lowerMessage.includes('sleep') || lowerMessage.includes('dormir')) {
            topics.push('sleep');
        }
        if (lowerMessage.includes('déprimé') || lowerMessage.includes('depressed') || lowerMessage.includes('triste')) {
            topics.push('depression');
        }
        if (lowerMessage.includes('suicide') || lowerMessage.includes('mourir') || lowerMessage.includes('tuer')) {
            topics.push('suicide');
        }
        
        return topics.length > 0 ? topics : ['general'];
    }

    // Analyse le sentiment du message
    analyzeSentiment(message) {
        const lowerMessage = message.toLowerCase();
        const negativeWords = ['burnout', 'stress', 'anxiété', 'déprimé', 'triste', 'fatigué', 'mal', 'difficile', 'problème'];
        const positiveWords = ['bien', 'mieux', 'content', 'heureux', 'satisfait', 'bon', 'positif'];
        
        let negativeCount = 0;
        let positiveCount = 0;
        
        negativeWords.forEach(word => {
            if (lowerMessage.includes(word)) negativeCount++;
        });
        
        positiveWords.forEach(word => {
            if (lowerMessage.includes(word)) positiveCount++;
        });
        
        if (negativeCount > positiveCount) return 'negative';
        if (positiveCount > negativeCount) return 'positive';
        return 'neutral';
    }

    // Génère les recommandations
    generateRecommendations(message, distressAnalysis) {
        const immediate = [];
        const longTerm = [];
        
        if (distressAnalysis.distressLevel >= 4) {
            immediate.push('Exercices de respiration 4-7-8');
            immediate.push('Prendre une pause immédiate');
            longTerm.push('Consulter un psychologue (URGENT)');
        } else if (distressAnalysis.distressLevel >= 3) {
            immediate.push('Pauses régulières');
            immediate.push('Techniques de relaxation');
            longTerm.push('Consulter un psychologue');
        } else {
            immediate.push('Maintenir les bonnes habitudes');
            longTerm.push('Continuer le suivi');
        }
        
        if (message.toLowerCase().includes('burnout')) {
            immediate.push('Limiter les heures de travail');
            longTerm.push('Discuter avec son employeur');
        }
        
        return { immediate, longTerm };
    }

    // Génère les notes professionnelles
    generateProfessionalNotes(message, distressAnalysis, topics) {
        let notes = `Patient présente un niveau de détresse de ${distressAnalysis.distressLevel}/5. `;
        
        if (topics.includes('burnout')) {
            notes += 'Signes de burnout confirmés. ';
        }
        if (distressAnalysis.emergency) {
            notes += 'URGENCE - Intervention immédiate requise. ';
        }
        if (distressAnalysis.distressLevel >= 4) {
            notes += 'Niveau de détresse élevé nécessitant un suivi rapproché. ';
        }
        
        notes += `Thèmes abordés: ${topics.join(', ')}. `;
        notes += `Langue utilisée: ${distressAnalysis.language || 'non détectée'}.`;
        
        return notes;
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