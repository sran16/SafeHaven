class NLPService {
    detectDistressAndEmergency(message) {
        const lowercaseMessage = message.toLowerCase();
        const emergencyWords = ['suicide', 'mourir', 'tuer', 'urgent', 'panique'];
        const distressWords = ['triste', 'déprimé', 'anxieux', 'stress', 'mal'];
        const hasEmergency = emergencyWords.some(word => lowercaseMessage.includes(word));
        const hasDistress = distressWords.some(word => lowercaseMessage.includes(word));
        return { emergency: hasEmergency, distressLevel: hasEmergency ? 5 : (hasDistress ? 4 : 3) };
    }

    getWellnessExercise(type) {
        const wellnessExercises = {
            breathing: [
                'Respirez en 4-7-8 : Inspirez sur 4 temps, retenez sur 7, expirez sur 8',
                'Respiration carrée : Inspirez 4s, retenez 4s, expirez 4s, attendez 4s',
                'Cohérence cardiaque : Respirez 6 fois par minute pendant 5 minutes'
            ],
            meditation: [
                'Scan corporel : Portez attention à chaque partie de votre corps',
                'Méditation de pleine conscience : Observez vos pensées sans jugement',
                "Ancrage dans le présent : Notez 5 choses que vous voyez, 4 que vous touchez..."
            ],
            grounding: [
                'Technique 5-4-3-2-1 : Observez 5 choses visibles, 4 tactiles...',
                'Marche consciente : Concentrez-vous sur chaque pas',
                'Contact avec la nature : Touchez un arbre, marchez pieds nus...'
            ]
        };
        const exercises = wellnessExercises[type] || [];
        return exercises[Math.floor(Math.random() * exercises.length)] || '';
    }

    extractTopics(message) {
        const topics = [];
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('burnout') || lowerMessage.includes('épuisement')) topics.push('burnout');
        if (lowerMessage.includes('stress') || lowerMessage.includes('anxiété') || lowerMessage.includes('anxious')) topics.push('stress');
        if (lowerMessage.includes('travail') || lowerMessage.includes('work') || lowerMessage.includes('boulot')) topics.push('work');
        if (lowerMessage.includes('sommeil') || lowerMessage.includes('sleep') || lowerMessage.includes('dormir')) topics.push('sleep');
        if (lowerMessage.includes('déprimé') || lowerMessage.includes('depressed') || lowerMessage.includes('triste')) topics.push('depression');
        if (lowerMessage.includes('suicide') || lowerMessage.includes('mourir') || lowerMessage.includes('tuer')) topics.push('suicide');
        return topics.length > 0 ? topics : ['general'];
    }

    analyzeSentiment(message) {
        const lowerMessage = message.toLowerCase();
        const negativeWords = ['burnout', 'stress', 'anxiété', 'déprimé', 'triste', 'fatigué', 'mal', 'difficile', 'problème'];
        const positiveWords = ['bien', 'mieux', 'content', 'heureux', 'satisfait', 'bon', 'positif'];
        let negativeCount = 0;
        let positiveCount = 0;
        negativeWords.forEach(word => { if (lowerMessage.includes(word)) negativeCount++; });
        positiveWords.forEach(word => { if (lowerMessage.includes(word)) positiveCount++; });
        if (negativeCount > positiveCount) return 'negative';
        if (positiveCount > negativeCount) return 'positive';
        return 'neutral';
    }

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

    generateProfessionalNotes(message, distressAnalysis, topics) {
        let notes = `Patient présente un niveau de détresse de ${distressAnalysis.distressLevel}/5. `;
        if (topics.includes('burnout')) notes += 'Signes de burnout confirmés. ';
        if (distressAnalysis.emergency) notes += 'URGENCE - Intervention immédiate requise. ';
        if (distressAnalysis.distressLevel >= 4) notes += 'Niveau de détresse élevé nécessitant un suivi rapproché. ';
        notes += `Thèmes abordés: ${topics.join(', ')}. `;
        notes += `Langue utilisée: ${distressAnalysis.language || 'non détectée'}.`;
        return notes;
    }
}

export default new NLPService();

