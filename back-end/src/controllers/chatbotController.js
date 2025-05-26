import chatbotService from '../services/chatbotService.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import axios from 'axios';

class ChatbotController {
    constructor() {
        this.MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
        this.MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

        // Numéros d'urgence et ressources
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

        // Techniques de respiration et méditation
        this.wellnessExercises = {
            breathing: [
                "Respirez en 4-7-8 : Inspirez sur 4 temps, retenez sur 7, expirez sur 8",
                "Respiration carrée : Inspirez 4s, retenez 4s, expirez 4s, attendez 4s",
                "Cohérence cardiaque : Respirez 6 fois par minute pendant 5 minutes"
            ],
            meditation: [
                "Scan corporel : Portez attention à chaque partie de votre corps",
                "Méditation de pleine conscience : Observez vos pensées sans jugement",
                "Ancrage dans le présent : Notez 5 choses que vous voyez, 4 que vous touchez..."
            ],
            grounding: [
                "Technique 5-4-3-2-1 : Observez 5 choses visibles, 4 tactiles...",
                "Marche consciente : Concentrez-vous sur chaque pas",
                "Contact avec la nature : Touchez un arbre, marchez pieds nus..."
            ]
        };

        this.systemPrompt = {
            role: "system",
            content: `Tu es Haven, un assistant IA très concis spécialisé en bien-être mental.

RÈGLES STRICTES (à suivre pour CHAQUE réponse):
- Limite-toi à 1-2 phrases maximum, jamais plus
- Utilise un ton conversationnel, comme dans un chat entre amis
- Formule principalement des questions courtes et directes
- Ne donne JAMAIS d'explications longues ou théoriques
- Ne développe JAMAIS plusieurs points dans une même réponse
- Évite les formulations complexes ou trop professionnelles

Exemples parfaits:
- "Comment vous sentez-vous aujourd'hui exactement?"
- "Qu'est-ce qui vous préoccupe le plus en ce moment?"
- "Avez-vous essayé la respiration profonde? Ça aide souvent."
- "Je comprends. Qu'est-ce qui pourrait vous faire du bien maintenant?"

Ton objectif unique: maintenir une conversation brève et naturelle, comme par message texte.`
        };

        // Bind des méthodes pour préserver le contexte
        this.detectDistressAndEmergency = this.detectDistressAndEmergency.bind(this);
        this.getWellnessExercise = this.getWellnessExercise.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.startSession = this.startSession.bind(this);
        this.processMessage = this.processMessage.bind(this);
        this.getHistory = this.getHistory.bind(this);
        this.endSession = this.endSession.bind(this);
        this.getConversationHistory = this.getConversationHistory.bind(this);
        this.getSentimentAnalysis = this.getSentimentAnalysis.bind(this);
        this.getRecommendations = this.getRecommendations.bind(this);
        this.generateReport = this.generateReport.bind(this);
    }

    // Détection d'urgence simplifiée sans appel API
    detectDistressAndEmergency(message) {
        const lowercaseMessage = message.toLowerCase();
        
        // Mots-clés d'urgence
        const emergencyWords = ['suicide', 'mourir', 'tuer', 'urgent', 'panique'];
        const distressWords = ['triste', 'déprimé', 'anxieux', 'stress', 'mal'];
        
        const hasEmergency = emergencyWords.some(word => lowercaseMessage.includes(word));
        const hasDistress = distressWords.some(word => lowercaseMessage.includes(word));
        
        return {
            emergency: hasEmergency,
            distressLevel: hasEmergency ? 5 : (hasDistress ? 4 : 3)
        };
    }

    // Sélectionne un exercice de bien-être aléatoire
    getWellnessExercise(type) {
        const exercises = this.wellnessExercises[type];
        return exercises[Math.floor(Math.random() * exercises.length)];
    }

    async sendMessage(req, res) {
        try {
            const { message, userId } = req.body;
            console.log('Message reçu:', message);
            console.log('ID utilisateur:', userId);
            console.log('MISTRAL_API_KEY:', process.env.MISTRAL_API_KEY);

            if (!this.MISTRAL_API_KEY) {
                console.log('Clé API Mistral non configurée, utilisation du mode fallback');
                return successResponse(res, 200, 'Fallback response', {
                    response: "Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?"
                });
            }

            const conversationHistory = await chatbotService.getConversationHistory(userId);

            try {
                console.log('Tentative d\'appel à l\'API Mistral 2', [
                    this.systemPrompt,
                    { role: "user", content: message }
                ]);
                const response = await fetch(this.MISTRAL_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.MISTRAL_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "mistral-tiny",
                        messages: [
                            this.systemPrompt,
                            { role: "user", content: message }
                        ],
                        temperature: 0.7,
                        max_tokens: 300
                    })
                });

                if (!response.ok) {
                    console.error('Erreur API Mistral:', response.status);
                    throw new Error(`Mistral API error: ${response.status}`);
                }

                const data = await response.json();
                const aiResponse = data.choices[0].message.content;

                // Sauvegarder la conversation
                try {
                    await chatbotService.saveConversation(userId, message, aiResponse);
                } catch (saveError) {
                    console.error('Erreur lors de la sauvegarde de la conversation:', saveError);
                    // Continue même si la sauvegarde échoue
                }

                return successResponse(res, 200, 'Message processed successfully', {
                    response: aiResponse
                });

            } catch (mistralError) {
                console.error('Erreur détaillée de l\'API Mistral:', mistralError);

                // Mode fallback avec message plus informatif
                return successResponse(res, 200, 'Fallback response', {
                    response: "Je suis désolé, j'ai du mal à traiter votre message pour le moment. Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?"
                });
            }
        } catch (error) {
            console.error('Erreur générale dans sendMessage:', error);
            return errorResponse(res, 500, 'Une erreur est survenue lors du traitement de votre message');
        }
    }

    async startSession(req, res) {
        try {
            const session = await chatbotService.createSession(req.body.userId);
            return successResponse(res, 201, 'Session started successfully', session);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getHistory(req, res) {
        try {
            const { userId } = req.params;
            
            // Récupérer la session et son historique
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
            const session = await chatbotService.endSession(req.user.id);
            return successResponse(res, 200, 'Session ended successfully', session);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async processMessage(req, res) {
        try {
            const { message } = req.body;
            // Utiliser l'ID utilisateur à partir du token d'authentification
            const userId = req.user.id_user;
            console.log('Process message - Message reçu:', message);
            console.log('Process message - ID utilisateur:', userId);

            // Vérifier si une session active existe
            try {
                const activeSession = await chatbotService.getActiveSession(userId);
                if (!activeSession) {
                    console.log('Aucune session active trouvée, création automatique');
                    await chatbotService.createSession(userId);
                }
            } catch (sessionError) {
                console.error('Erreur de session:', sessionError);
                // Continue même si la session pose problème
            }

            // Analyser le message pour détecter la détresse
            const analysis = this.detectDistressAndEmergency(message);
            console.log('Analyse du message:', analysis);

            if (!this.MISTRAL_API_KEY) {
                console.log('Clé API Mistral non configurée, utilisation du mode fallback');
                const response = {
                    response: "Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?"
                };

                if (analysis.emergency) {
                    response.emergencyResources = this.emergencyResources;
                }

                return successResponse(res, 200, 'Message processed successfully', response);
            }

            const conversationHistory = await chatbotService.getConversationHistory(userId);
            const historyString = Array.isArray(conversationHistory)
                ? conversationHistory.map(msg => msg.content).join('\n')
                : (typeof conversationHistory === 'string' ? conversationHistory : '');
            try {
                console.log('Tentative d\'appel à l\'API Mistral 2', [
                    this.systemPrompt,
                    { role: "user", content: historyString },
                    { role: "user", content: message }
                ]);
                const mistralResponse = await axios.post(
                    this.MISTRAL_API_URL,
                    {
                        model: "mistral-tiny",
                        messages: [
                            this.systemPrompt,
                            { role: "user", content: historyString },
                            { role: "user", content: message }
                        ],
                        temperature: 0.7,
                        max_tokens: 300
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.MISTRAL_API_KEY}`
                        }
                    }
                );

                const aiResponse = mistralResponse.data.choices[0].message.content;

                // Sauvegarder la conversation
                try {
                    await chatbotService.saveConversation(userId, message, aiResponse);
                } catch (saveError) {
                    console.error('Erreur lors de la sauvegarde de la conversation:', saveError);
                }

                const response = {
                    response: aiResponse
                };

                if (analysis.emergency) {
                    response.emergencyResources = this.emergencyResources;
                }

                return successResponse(res, 200, 'Message processed successfully', response);

            } catch (mistralError) {
                console.error('Erreur détaillée de l\'API Mistral:', mistralError.response?.data || mistralError);

                const response = {
                    response: "Je suis désolé, j'ai du mal à traiter votre message pour le moment. Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?"
                };

                if (analysis.emergency) {
                    response.emergencyResources = this.emergencyResources;
                }

                return successResponse(res, 200, 'Fallback response', response);
            }
        } catch (error) {
            console.error('Erreur générale dans processMessage:', error);
            return errorResponse(res, 500, 'Une erreur est survenue lors du traitement de votre message');
        }
    }

    async getConversationHistory(req, res) {
        try {
            const userId = req.user.id_user;
            console.log('Récupération de l\'historique pour l\'utilisateur:', userId);
            
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
            const analysis = await chatbotService.getSentimentAnalysis(req.user.id);
            return successResponse(res, 200, 'Sentiment analysis retrieved successfully', analysis);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getRecommendations(req, res) {
        try {
            const recommendations = await chatbotService.getRecommendations(req.user.id);
            return successResponse(res, 200, 'Recommendations retrieved successfully', recommendations);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async generateReport(req, res) {
        try {
            const report = await chatbotService.generateReport(req.user.id);
            return successResponse(res, 200, 'Report generated successfully', report);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }
}

const chatbotController = new ChatbotController();
export default chatbotController; 