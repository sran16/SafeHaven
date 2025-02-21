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
            content: `Tu es SafeHaven, un assistant empathique spécialisé dans le soutien psychologique.

Instructions principales :
- Pratique l'écoute active : pose des questions ouvertes pour mieux comprendre la situation
- Reformule les émotions exprimées pour montrer que tu comprends
- Aide la personne à explorer ses sentiments plutôt que de donner des solutions immédiates
- Utilise des questions comme "Que ressentez-vous exactement ?", "Depuis quand vous sentez-vous ainsi ?", "Qu'est-ce qui a déclenché ces émotions ?"
- Ne propose des exercices de respiration que si la personne est en état d'anxiété aiguë
- Garde un ton bienveillant et professionnel, sans être trop familier
- Pour les cas graves (suicide, violence), oriente doucement vers le 3114 tout en maintenant le dialogue

Style de réponse :
- Commence par reconnaître l'émotion exprimée
- Pose une question pour approfondir
- Maximum 3-4 phrases par réponse
- Évite les conseils directs sauf si explicitement demandés

Rappel : Tu n'es pas un thérapeute professionnel, mais tu peux offrir une écoute attentive et empathique.`
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
            console.log('Contrôleur chatbot - sendMessage appelé');
            const { message, userId } = req.body;
            console.log('Message reçu:', message);
            console.log('User ID:', userId);

            // Créer une nouvelle session avant tout
            if (userId) {
                try {
                    await chatbotService.createSession(userId);
                } catch (sessionError) {
                    console.log('Session déjà existante ou erreur:', sessionError);
                }
            }

            try {
                console.log('Tentative d\'appel à l\'API Mistral...');
                const response = await axios.post(this.MISTRAL_API_URL, {
                    model: "mistral-tiny",
                    messages: [
                        this.systemPrompt,
                        { role: "user", content: message }
                    ],
                    temperature: 0.85,
                    max_tokens: 200
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.MISTRAL_API_KEY}`
                    }
                });

                console.log('Réponse Mistral reçue');
                const aiResponse = response.data.choices[0].message.content;
                console.log('Réponse AI:', aiResponse);

                // Sauvegarder la conversation si nécessaire
                if (userId) {
                    try {
                        // Sauvegarder la conversation
                        await chatbotService.saveConversation(userId, message, aiResponse);
                    } catch (saveError) {
                        console.error('Erreur lors de la sauvegarde de la conversation:', saveError);
                        // Continue même si la sauvegarde échoue
                    }
                }

                return res.json({
                    success: true,
                    data: {
                        response: aiResponse
                    }
                });

            } catch (mistralError) {
                console.error('Erreur API Mistral:', mistralError);
                const fallbackResponse = "Je suis là pour vous écouter et vous soutenir. Comment puis-je vous aider aujourd'hui ?";
                return res.json({
                    success: true,
                    data: {
                        response: fallbackResponse
                    }
                });
            }
        } catch (error) {
            console.error('Erreur générale:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors du traitement du message',
                error: error.message
            });
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