class NLPService {
    //  DICTIONNAIRE 
    constructor() {
        this.wordCategories = {
            emergency: ['suicide', 'kill myself', 'want to die', 'end my life', 'disappear forever', 'urgent help', 'panic attack'],
            highDistress: ['sad', 'depressed', 'depression', 'anxious', 'stress', 'bad', 'sick', 'desperate', 'lost', 'alone', 'abandoned', 'hopeless'],
            moderateDistress: ['tired', 'exhausted', 'worried', 'nervous', 'tense', 'concerned', 'problem', 'difficult'],
            wellness: ['good', 'better', 'happy', 'satisfied', 'positive', 'calm', 'peaceful', 'relaxed'],
            negative: ['burnout', 'stress', 'anxiety', 'depressed', 'depression', 'sad', 'tired', 'bad', 'difficult', 'problem', 'worried', 'nervous', 'tense', 'concerned', 'fear', 'panic', 'hopeless', 'lonely', 'abandoned', 'failure', 'failed', 'terrible', 'horrible', 'awful', 'unbearable', 'impossible'],
            positive: ['good', 'better', 'happy', 'satisfied', 'positive', 'calm', 'peaceful', 'joy', 'pleasure', 'successful', 'proud', 'confident', 'optimistic', 'energetic', 'motivated', 'rested', 'relaxed', 'peaceful', 'grateful', 'lucky', 'blessed']
        };
    }

    detectDistressAndEmergency(message) {
        const lowercaseMessage = message.toLowerCase();
        
        // Utilise le dictionnaire
        const emergencyWords = this.wordCategories.emergency;
        const highDistressWords = this.wordCategories.highDistress;
        const moderateDistressWords = this.wordCategories.moderateDistress;
        const wellnessWords = this.wordCategories.wellness;
        
        const hasEmergency = emergencyWords.some(word => lowercaseMessage.includes(word));
        const hasHighDistress = highDistressWords.some(word => lowercaseMessage.includes(word));
        const hasModerateDistress = moderateDistressWords.some(word => lowercaseMessage.includes(word));
        const hasWellness = wellnessWords.some(word => lowercaseMessage.includes(word));
        
        let distressLevel = 3; // Par défaut
        
        if (hasEmergency) distressLevel = 5;
        else if (hasHighDistress) distressLevel = 4;
        else if (hasModerateDistress) distressLevel = 3;
        else if (hasWellness) distressLevel = 2;
        else distressLevel = 1; // Si aucun mot détecté, considérer comme neutre
        
        // console.log(' ANALYSE DÉTRESSE:', {
        //     message: message,
        //     hasEmergency,
        //     hasHighDistress,
        //     hasModerateDistress,
        //     hasWellness,
        //     distressLevel
        // });
        
        return { emergency: hasEmergency, distressLevel };
    }

    extractTopics(message) {
        const topics = [];
        const lowerMessage = message.toLowerCase();
        
        //  Utilise le dictionnaire + mots spécifiques aux thèmes
        const topicKeywords = {
            'burnout': ['burnout', 'exhausted', 'overwhelmed', 'overworked'],
            'stress': this.wordCategories.highDistress.filter(word => ['stress', 'anxiety', 'anxious', 'tense', 'nervous', 'worried'].includes(word)),
            'work': ['work', 'job', 'office', 'colleague', 'boss', 'salary', 'career'],
            'sleep': ['sleep', 'insomnia', 'tired', 'rest', 'night', 'bed'],
            'depression': this.wordCategories.highDistress.filter(word => ['depressed', 'sad', 'melancholy', 'hopeless', 'empty', 'down'].includes(word)),
            'suicide': this.wordCategories.emergency.filter(word => ['suicide', 'kill', 'die', 'death', 'end', 'disappear'].includes(word)),
            'relationships': ['relationship', 'couple', 'husband', 'wife', 'friend', 'family', 'parent'],
            'health': ['health', 'sick', 'pain', 'fatigue', 'migraine', 'back', 'illness'],
            'money': ['money', 'finance', 'debt', 'bill', 'poor', 'financial'],
            'social': ['social', 'friends', 'party', 'lonely', 'isolated', 'alone']
        };
        
        // Vérifier chaque thème
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                topics.push(topic);
                // console.log(`Thème détecté: "${topic}"`);
            }
        });
        
        // console.log('THÈMES DÉTECTÉS:', {
        //     message: message,
        //     topics: topics.length > 0 ? topics : ['general']
        // });
        
        return topics.length > 0 ? topics : ['general'];
    }

    analyzeSentiment(message) {
        const lowerMessage = message.toLowerCase();
        // Utilise le dictionnaire 
        const negativeWords = this.wordCategories.negative;
        const positiveWords = this.wordCategories.positive;
        
        let negativeCount = 0;
        let positiveCount = 0;
        
        negativeWords.forEach(word => { 
            if (lowerMessage.includes(word)) {
                negativeCount++;
                // console.log(`Mot négatif détecté: "${word}"`);
            }
        });
        
        positiveWords.forEach(word => { 
            if (lowerMessage.includes(word)) {
                positiveCount++;
                // console.log(`Positive word detected: "${word}"`);
            }
        });
        
        const sentiment = negativeCount > positiveCount ? 'negative' : (positiveCount > negativeCount ? 'positive' : 'neutral');
        
        // console.log(' ANALYSE SENTIMENT:', {
        //     message: message,
        //     negativeCount,
        //     positiveCount,
        //     sentiment
        // });
        
        return sentiment;
    }

    generateRecommendations(message, distressAnalysis) {
        const immediate = [];
        const longTerm = [];
        if (distressAnalysis.distressLevel >= 4) {
            immediate.push('4-7-8 breathing exercises');
            immediate.push('Take an immediate break');
            longTerm.push('Consult a psychologist (URGENT)');
        } else if (distressAnalysis.distressLevel >= 3) {
            immediate.push('Regular breaks');
            immediate.push('Relaxation techniques');
            longTerm.push('Consult a psychologist');
        } else {
            immediate.push('Maintain good habits');
            longTerm.push('Continue monitoring');
        }
        if (message.toLowerCase().includes('burnout')) {
            immediate.push('Limit working hours');
            longTerm.push('Discuss with employer');
        }
        return { immediate, longTerm };
    }

    generateProfessionalNotes(message, distressAnalysis, topics) {
        let notes = `Patient shows distress level of ${distressAnalysis.distressLevel}/5. `;
        if (topics.includes('burnout')) notes += 'Burnout signs confirmed. ';
        if (distressAnalysis.emergency) notes += 'EMERGENCY - Immediate intervention required. ';
        if (distressAnalysis.distressLevel >= 4) notes += 'High distress level requiring close monitoring. ';
        notes += `Topics discussed: ${topics.join(', ')}. `;
        notes += `Language used: ${distressAnalysis.language || 'not detected'}.`;
        return notes;
    }
}

export default new NLPService();

