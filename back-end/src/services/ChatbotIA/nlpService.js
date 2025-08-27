class NLPService {
    detectDistressAndEmergency(message) {
        const lowercaseMessage = message.toLowerCase();
        
        // Mots d'urgence (niveau 5)
        const emergencyWords = ['suicide', 'mourir', 'tuer', 'urgent', 'panique', 'mort', 'finir', 'disparaître'];
        
        // Mots de détresse élevée (niveau 4)
        const highDistressWords = ['triste', 'déprimé', 'depression', 'anxieux', 'stress', 'mal', 'désespéré', 'perdu', 'seul', 'abandonné'];
        
        // Mots de détresse modérée (niveau 3)
        const moderateDistressWords = ['fatigué', 'épuisé', 'inquiet', 'nerveux', 'tendu', 'souci', 'problème'];
        
        // Mots de bien-être (niveau 1-2)
        const wellnessWords = ['bien', 'mieux', 'content', 'heureux', 'satisfait', 'bon', 'positif', 'calme', 'serein'];
        
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
        
        console.log('🔍 ANALYSE DÉTRESSE:', {
            message: message,
            hasEmergency,
            hasHighDistress,
            hasModerateDistress,
            hasWellness,
            distressLevel
        });
        
        return { emergency: hasEmergency, distressLevel };
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
        
        // Thèmes étendus avec plus de mots-clés
        const topicKeywords = {
            'burnout': ['burnout', 'épuisement', 'épuisé', 'surmené', 'surchargé'],
            'stress': ['stress', 'anxiété', 'anxious', 'tendu', 'nerveux', 'inquiet'],
            'work': ['travail', 'work', 'boulot', 'bureau', 'collègue', 'patron', 'salaire'],
            'sleep': ['sommeil', 'sleep', 'dormir', 'insomnie', 'réveil', 'nuit'],
            'depression': ['déprimé', 'depressed', 'triste', 'mélancolie', 'désespoir', 'vide'],
            'suicide': ['suicide', 'mourir', 'tuer', 'mort', 'finir', 'disparaître'],
            'relationships': ['relation', 'couple', 'mari', 'femme', 'ami', 'famille', 'parent'],
            'health': ['santé', 'maladie', 'douleur', 'fatigue', 'migraine', 'dos'],
            'money': ['argent', 'money', 'finances', 'dette', 'facture', 'pauvre'],
            'social': ['social', 'amis', 'sortir', 'fête', 'solitude', 'isolement']
        };
        
        // Vérifier chaque thème
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                topics.push(topic);
                console.log(`  🏷️ Thème détecté: "${topic}"`);
            }
        });
        
        console.log('🏷️ THÈMES DÉTECTÉS:', {
            message: message,
            topics: topics.length > 0 ? topics : ['general']
        });
        
        return topics.length > 0 ? topics : ['general'];
    }

    analyzeSentiment(message) {
        const lowerMessage = message.toLowerCase();
        
        // Mots négatifs étendus
        const negativeWords = [
            'burnout', 'stress', 'anxiété', 'déprimé', 'depression', 'triste', 'fatigué', 'mal', 'difficile', 'problème',
            'inquiet', 'nerveux', 'tendu', 'souci', 'peur', 'angoisse', 'désespoir', 'solitude', 'abandon',
            'échec', 'raté', 'nul', 'horrible', 'terrible', 'insupportable', 'impossible'
        ];
        
        // Mots positifs étendus
        const positiveWords = [
            'bien', 'mieux', 'content', 'heureux', 'satisfait', 'bon', 'positif', 'calme', 'serein',
            'joie', 'plaisir', 'réussi', 'fier', 'confiant', 'optimiste', 'énergique', 'motivé',
            'reposé', 'détendu', 'apaisé', 'reconnaissant', 'chanceux', 'béni'
        ];
        
        let negativeCount = 0;
        let positiveCount = 0;
        
        negativeWords.forEach(word => { 
            if (lowerMessage.includes(word)) {
                negativeCount++;
                console.log(`  - Mot négatif détecté: "${word}"`);
            }
        });
        
        positiveWords.forEach(word => { 
            if (lowerMessage.includes(word)) {
                positiveCount++;
                console.log(`  + Mot positif détecté: "${word}"`);
            }
        });
        
        const sentiment = negativeCount > positiveCount ? 'negative' : (positiveCount > negativeCount ? 'positive' : 'neutral');
        
        console.log('😊 ANALYSE SENTIMENT:', {
            message: message,
            negativeCount,
            positiveCount,
            sentiment
        });
        
        return sentiment;
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

