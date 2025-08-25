import OpenAI from 'openai';

class OpenAIService {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        this.model = process.env.OPENAI_MODEL;
        this.client = new OpenAI({ apiKey: this.apiKey });
    }

    isConfigured() {
        return Boolean(this.apiKey && this.model);
    }

    async chat(messages, options = {}) {
        if (!this.isConfigured()) {
            throw new Error('OpenAI is not configured: missing OPENAI_API_KEY or OPENAI_MODEL');
        }

        const temperature = options.temperature ?? 0.7;
        const max_tokens = options.max_tokens ?? 300;

        const chatMessages = messages || [];
        const responsesInput = chatMessages.map(m => ({
            role: m.role,
            content: [{ type: 'text', text: m.content }]
        }));

        // Utiliser Responses si disponible (SDK récent), sinon fallback Chat Completions
        if (this.client.responses && typeof this.client.responses.create === 'function') {
            const response = await this.client.responses.create({
                model: this.model,
                input: responsesInput,
                temperature,
                max_output_tokens: max_tokens
            });
            return (response.output_text || '').trim();
        } else {
            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: chatMessages,
                temperature,
                max_tokens
            });
            return completion.choices?.[0]?.message?.content?.trim() || '';
        }
    }
}

export default new OpenAIService();

