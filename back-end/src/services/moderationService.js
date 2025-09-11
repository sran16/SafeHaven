import prisma from '../config/database.js';
// Amelioreate liste to do 
const BAD_WORDS = [
    'suicide', 'kill', 'die', 'death',
    'fuck', 'bitch', 'asshole', 'stupid',
    'drugs', 'heroin', 'weed',
    'phone', 'email', '@', 'address'
];

class ModerationService {
    // Analyse de contenu avec catégories
    async analyzeContent(content) {
        const lowerContent = content.toLowerCase();
        const foundWords = [];
        const reasons = [];
        
        // Categories of forbidden words
        const suicideWords = ['suicide', 'kill', 'die', 'death'];
        const badWords = ['fuck', 'bitch', 'asshole', 'stupid'];
        const drugWords = ['drugs', 'heroin', 'weed'];
        const personalWords = ['phone', 'email', '@', 'address'];
        
        // Check each category
        for (const word of suicideWords) {
            if (lowerContent.includes(word)) {
                foundWords.push(word);
                reasons.push('Suicidal content detected');
            }
        }
        
        for (const word of badWords) {
            if (lowerContent.includes(word)) {
                foundWords.push(word);
                reasons.push('Inappropriate language');
            }
        }
        
        for (const word of drugWords) {
            if (lowerContent.includes(word)) {
                foundWords.push(word);
                reasons.push('Drug-related content');
            }
        }
        
        for (const word of personalWords) {
            if (lowerContent.includes(word)) {
                foundWords.push(word);
                reasons.push('Personal information');
            }
        }
        
        const hasBadWords = foundWords.length > 0;
        
        return {
            flagged: hasBadWords,
            badWords: foundWords,
            reasons: [...new Set(reasons)], // Remove duplicates
            message: hasBadWords ? 'Inappropriate content detected' : 'OK'
        };
    }
    // Modération avec explications
    async moderateExperience(experienceData) {
        const analysis = await this.analyzeContent(experienceData.content);
        
        if (analysis.flagged) {
            console.log('Content blocked:', analysis.badWords);
            
            // Generate explanation message
            const warningMessage = this.generateWarningMessage(analysis.reasons);
            
            return {
                blocked: true,
                reasons: analysis.reasons,
                badWords: analysis.badWords,
                warningMessage: warningMessage
            };
        }

        return {
            ...experienceData,
            blocked: false
        };
    }

    // Generate simple warning message
    generateWarningMessage(reasons) {
        if (reasons.includes('Suicidal content detected')) {
            return {
                title: "⚠️ Sensitive Content Detected",
                message: "Your message contains content that could worry other users.",
                suggestion: "SafeHaven is a supportive space. If you're going through a difficult time, please contact our help resources.",
                helpResources: [
                    "National Suicide Prevention Lifeline: 988",
                    "Crisis Text Line: Text HOME to 741741"
                ]
            };
        }
        
        if (reasons.includes('Inappropriate language')) {
            return {
                title: "🚫 Inappropriate Language",
                message: "Your message contains words that don't respect our kindness policy.",
                suggestion: "Please rephrase your message with respectful language.",
                helpResources: []
            };
        }
        
        if (reasons.includes('Personal information')) {
            return {
                title: "🔒 Personal Information",
                message: "For your safety, we don't allow sharing personal information publicly.",
                suggestion: "Please remove your personal information from the message.",
                helpResources: []
            };
        }
        
        if (reasons.includes('Drug-related content')) {
            return {
                title: "🚫 Unauthorized Content",
                message: "Drug-related content is not allowed on SafeHaven.",
                suggestion: "Please modify your message to respect our community guidelines.",
                helpResources: []
            };
        }
        
        // Generic message
        return {
            title: "⚠️ Unauthorized Content",
            message: "Your message doesn't respect our community guidelines.",
            suggestion: "Please modify your message to be kind and respectful.",
            helpResources: []
        };
    }

    // TODO: Improve logging later
    async logModerationAction(data) {
        console.log('Moderation:', data);
        return true;
    }

    async logUserAction(userId, action, details = '') {
        console.log('User action:', userId, action, details);
        return true;
    }


}

export default new ModerationService();
