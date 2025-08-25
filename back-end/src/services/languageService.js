class LanguageService {
    detectConversationLanguage(currentMessage, conversationHistory) {
        const frenchWords = ['bonjour', 'salut', 'merci', 'oui', 'non', 'comment', 'pourquoi', 'quand', 'où', 'qui', 'quoi', 'comment', 'ça', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'être', 'avoir', 'faire', 'aller', 'venir', 'voir', 'savoir', 'pouvoir', 'vouloir', 'devoir', 'prendre', 'donner', 'dire', 'parler', 'écouter', 'regarder', 'penser', 'sentir', 'aimer', 'détester', 'bien', 'mal', 'bon', 'mauvais', 'grand', 'petit', 'nouveau', 'vieux', 'beau', 'laid', 'heureux', 'triste', 'fatigué', 'malade', 'sain', 'fort', 'faible'];
        const englishWords = ['hello', 'hi', 'thanks', 'thank you', 'yes', 'no', 'how', 'why', 'when', 'where', 'who', 'what', 'how', 'i', 'you', 'he', 'she', 'we', 'they', 'am', 'is', 'are', 'have', 'has', 'do', 'does', 'go', 'come', 'see', 'know', 'can', 'will', 'would', 'should', 'take', 'give', 'say', 'speak', 'listen', 'watch', 'think', 'feel', 'like', 'love', 'hate', 'good', 'bad', 'big', 'small', 'new', 'old', 'beautiful', 'ugly', 'happy', 'sad', 'tired', 'sick', 'healthy', 'strong', 'weak'];

        const currentMessageLower = currentMessage.toLowerCase();
        let frenchCount = 0;
        let englishCount = 0;

        frenchWords.forEach(word => { if (currentMessageLower.includes(word)) frenchCount++; });
        englishWords.forEach(word => { if (currentMessageLower.includes(word)) englishCount++; });

        if (conversationHistory && conversationHistory.length > 0) {
            const allMessages = [];
            conversationHistory.forEach(session => {
                if (session.messages && session.messages.length > 0) {
                    session.messages.forEach(msg => { allMessages.push(msg.content); });
                }
            });
            const historyText = allMessages.join(' ').toLowerCase();

            let historyFrenchCount = 0;
            let historyEnglishCount = 0;
            frenchWords.forEach(word => { if (historyText.includes(word)) historyFrenchCount++; });
            englishWords.forEach(word => { if (historyText.includes(word)) historyEnglishCount++; });

            if (historyFrenchCount > historyEnglishCount && historyFrenchCount > 0) return 'french';
            if (historyEnglishCount > historyFrenchCount && historyEnglishCount > 0) return 'english';
        }

        if (frenchCount > englishCount) return 'french';
        if (englishCount > frenchCount) return 'english';
        return 'french';
    }

    createLanguageSpecificPrompt(language) {
        if (language === 'french') {
            return {
                role: 'system',
                content: `Tu es Haven, un assistant concis pour le bien-être mental. Réponds en français.

Règles:
- 1-2 phrases maximum
- Ton amical et conversationnel
- Questions courtes et directes
- Pas d'explications longues

Exemples:
- "Comment te sens-tu aujourd'hui ?"
- "Qu'est-ce qui t'inquiète ?"
- "As-tu essayé la respiration profonde ?"

Objectif: conversation naturelle comme par SMS.`
            };
        }

        return {
            role: 'system',
            content: `You are Haven, a concise assistant for mental well-being. Respond in English.

Rules:
- 1-2 sentences max
- Friendly, conversational tone
- Short, direct questions
- No long explanations

Examples:
- "How are you feeling today?"
- "What's worrying you?"
- "Have you tried deep breathing?"

Goal: natural conversation like texting.`
        };
    }
}

export default new LanguageService();

