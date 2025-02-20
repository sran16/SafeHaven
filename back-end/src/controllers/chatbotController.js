import chatbotService from '../services/chatbotService.js';
import { successResponse, errorResponse } from '../utils/responses.js';

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
            content: `Tu es SafeHaven, un assistant bienveillant spécialisé en bien-être mental.
            - Sois empathique et sans jugement
            - Propose des exercices de respiration si nécessaire
            - Oriente vers les urgences (3114) si situation critique
            - Rappelle que tu n'es pas un professionnel de santé`
        };

        this.sendMessage = this.sendMessage.bind(this);
        this.startSession = this.startSession.bind(this);
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

            try {
                const response = await fetch(this.MISTRAL_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.MISTRAL_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "mistral-tiny",  // ou "mistral-small" ou "mistral-medium"
                        messages: [
                            this.systemPrompt,
                            { role: "user", content: message }
                        ],
                        temperature: 0.7,
                        max_tokens: 300
                    })
                });

                if (!response.ok) {
                    throw new Error(`Mistral API error: ${response.status}`);
                }

                const data = await response.json();
                const aiResponse = data.choices[0].message.content;

                // Sauvegarder la conversation
                await chatbotService.saveConversation(userId, message, aiResponse);

                return successResponse(res, 200, 'Message processed successfully', {
                    response: aiResponse
                });

            } catch (mistralError) {
                console.error('Mistral API error:', mistralError);

                // Mode fallback
                const fallbackResponse = "Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?";
                
                return successResponse(res, 200, 'Fallback response', {
                    response: fallbackResponse
                });
            }
        } catch (error) {
            return errorResponse(res, 500, error.message);
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
}

const chatbotController = new ChatbotController();
export default chatbotController; 