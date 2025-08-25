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
        }

        return {
            role: 'system',
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

export default new LanguageService();

