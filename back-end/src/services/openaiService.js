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

        const input = (messages || []).map(m => ({
            role: m.role,
            content: [{ type: 'text', text: m.content }]
        }));

        const response = await this.client.responses.create({
            model: this.model,
            input,
            temperature,
            max_output_tokens: max_tokens
        });

        return (response.output_text || '').trim();
    }
}

export default new OpenAIService();

