import prisma from '../config/database.js';

// Liste des mots/expressions à modérer (français + anglais)
const FLAGGED_WORDS = [
    // Mots dangereux - Français
    'suicide', 'se tuer', 'mourir', 'overdose', 'automutilation',
    // Mots dangereux - Anglais
    'kill myself', 'suicide', 'kill me', 'end my life', 'want to die', 'self harm', 'cut myself', 'overdose', 'jump off', 'hang myself',
    
    // Insultes/harcèlement - Français
    'connard', 'salope', 'enculé', 'pute', 'fdp',
    // Insultes/harcèlement - Anglais
    'fuck you', 'bitch', 'asshole', 'bastard', 'damn you', 'go to hell', 'hate you', 'idiot', 'stupid',
    
    // Contenu inapproprié - Français
    'drogue', 'dealer', 'cannabis', 'cocaine', 'héroïne',
    // Contenu inapproprié - Anglais
    'drugs', 'dealer', 'cannabis', 'cocaine', 'heroin', 'weed', 'marijuana', 'meth',
    
    // Informations personnelles - Français
    'téléphone', 'adresse', 'email', '@', 'whatsapp',
    // Informations personnelles - Anglais
    'phone number', 'address', 'email', '@', 'whatsapp', 'contact me', 'call me',
    
    // Contenu commercial/spam - Français
    'vendre', 'acheter', 'promo', 'gratuit', 'cliquez ici',
    // Contenu commercial/spam - Anglais
    'buy now', 'click here', 'free offer', 'promotion', 'discount', 'sale'
];

const SEVERITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium', 
    HIGH: 'high',
    CRITICAL: 'critical'
};

class ModerationService {
    /**
     * Analyse automatique du contenu pour détecter les problèmes
     */
    async analyzeContent(content) {
        const analysis = {
            flagged: false,
            severity: SEVERITY_LEVELS.LOW,
            reasons: [],
            flaggedWords: [],
            riskScore: 0
        };

        const normalizedContent = content.toLowerCase();
        let riskScore = 0;

        // Détection des mots flaggés
        for (const word of FLAGGED_WORDS) {
            if (normalizedContent.includes(word.toLowerCase())) {
                analysis.flagged = true;
                analysis.flaggedWords.push(word);
                
                // Score de risque selon le type de mot
                if (['suicide', 'se tuer', 'mourir', 'kill myself', 'kill me', 'end my life', 'want to die', 'self harm', 'cut myself', 'jump off', 'hang myself'].includes(word)) {
                    riskScore += 10;
                    analysis.reasons.push('Contenu à risque suicidaire');
                } else if (['connard', 'salope', 'enculé', 'fuck you', 'bitch', 'asshole', 'bastard', 'damn you', 'go to hell', 'hate you'].includes(word)) {
                    riskScore += 5;
                    analysis.reasons.push('Langage inapproprié');
                } else if (['téléphone', 'email', '@', 'phone number', 'address', 'contact me', 'call me'].includes(word)) {
                    riskScore += 3;
                    analysis.reasons.push('Informations personnelles');
                } else {
                    riskScore += 2;
                    analysis.reasons.push('Contenu potentiellement problématique');
                }
            }
        }

        // Détection de patterns spécifiques
        if (normalizedContent.match(/\b\d{10}\b/)) { // Numéro de téléphone
            analysis.flagged = true;
            riskScore += 5;
            analysis.reasons.push('Numéro de téléphone détecté');
        }

        if (normalizedContent.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)) { // Email
            analysis.flagged = true;
            riskScore += 5;
            analysis.reasons.push('Adresse email détectée');
        }

        // Détermination du niveau de sévérité
        analysis.riskScore = riskScore;
        if (riskScore >= 10) {
            analysis.severity = SEVERITY_LEVELS.CRITICAL;
        } else if (riskScore >= 7) {
            analysis.severity = SEVERITY_LEVELS.HIGH;
        } else if (riskScore >= 4) {
            analysis.severity = SEVERITY_LEVELS.MEDIUM;
        }

        return analysis;
    }

    /**
     * Modère une expérience lors de sa création (SYSTÈME SIMPLE)
     */
    async moderateExperience(experienceData) {
        const analysis = await this.analyzeContent(experienceData.content);
        
        if (analysis.flagged) {
            // SYSTÈME SIMPLE : BLOCAGE DIRECT
            
            // Log de l'action automatique
            await this.logModerationAction({
                action: `BLOCKED: ${analysis.reasons.join(', ')}`,
                experienceId: null,
                moderatorId: 1, // ID système
                severity: analysis.severity,
                details: JSON.stringify(analysis)
            });

            // Log utilisateur
            await this.logUserAction(
                experienceData.userId,
                'POST_BLOCKED',
                `Contenu bloqué: ${analysis.reasons.join(', ')}`
            );

            // RETOURNER ERREUR AVEC DÉTAILS POUR L'UI
            return {
                blocked: true,
                reasons: analysis.reasons,
                severity: analysis.severity,
                riskScore: analysis.riskScore,
                warningMessage: this.generateWarningMessage(analysis)
            };
        }

        // Contenu clean, publication directe
        return {
            ...experienceData,
            blocked: false,
            approved: true
        };
    }

    /**
     * Génère un message de warning personnalisé
     */
    generateWarningMessage(analysis) {
        const { reasons, severity } = analysis;
        
        // Messages according to problem type
        if (reasons.includes('Contenu à risque suicidaire')) {
            return {
                title: "⚠️ Sensitive Content Detected",
                message: "Your message contains content that could worry other users. SafeHaven is a space of support and kindness.",
                suggestion: "Please rephrase your message in a more positive way, or contact our support resources if you're going through a difficult time.",
                helpResources: [
                    "National Suicide Prevention Lifeline: 988",
                    "Crisis Text Line: Text HOME to 741741",
                    "International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/"
                ]
            };
        }
        
        if (reasons.includes('Langage inapproprié')) {
            return {
                title: "🚫 Inappropriate Language",
                message: "Your message contains words that don't respect our kindness policy.",
                suggestion: "Please rephrase your message with respectful language to create a healthy environment for everyone.",
                helpResources: []
            };
        }
        
        if (reasons.includes('Numéro de téléphone détecté') || reasons.includes('Adresse email détectée')) {
            return {
                title: "🔒 Personal Information",
                message: "For your safety, we don't allow sharing personal information publicly.",
                suggestion: "Please remove your personal information. You can exchange privately if needed.",
                helpResources: []
            };
        }
        
        // Generic message
        return {
            title: "⚠️ Content Not Allowed",
            message: "Your message doesn't respect our community guidelines.",
            suggestion: "Please modify your message to be kind and respectful.",
            helpResources: []
        };
    }





    /**
     * Log une action de modération
     */
    async logModerationAction({ action, experienceId = null, moderatorId, severity = 'medium', details = '' }) {
        try {
            // TEMPORAIRE : Créer le modérateur système s'il n'existe pas
            if (moderatorId === 1) {
                const systemModerator = await prisma.moderateurs.upsert({
                    where: { id_moderateur: 1 },
                    update: {},
                    create: { id_moderateur: 1 }
                });
            }

            return await prisma.moderationLogs.create({
                data: {
                    action: action,
                    experienceId: experienceId,
                    moderatorId: moderatorId,
                    // Ajouter des champs supplémentaires si nécessaire
                    // severity: severity,
                    // details: details
                }
            });
        } catch (error) {
            // Ne pas faire planter l'app si le logging échoue
            return null;
        }
    }

    /**
     * Log une action utilisateur
     */
    async logUserAction(userId, action, details = '') {
        try {
            return await prisma.userLogs.create({
                data: {
                    userId: userId,
                    action: `${action}: ${details}`
                }
            });
        } catch (error) {
            throw error;
        }
    }


}

export default new ModerationService();
