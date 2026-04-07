import Groq from 'groq-sdk';
import config from '../config/config';
import { AccountBalance } from '../types';

class GroqService {
  private client: Groq;

  constructor() {
    this.client = new Groq({
      apiKey: config.groq.apiKey,
    });
  }

  async enhanceTranscription(text: string): Promise<string> {
    try {
      if (!text || text.trim().length === 0) return text;

      const completion = await this.client.chat.completions.create({
        model: config.groq.model,
        messages: [
          {
            role: 'system',
            content: `You are a transcription enhancer. Your job is to:
1. Fix grammar and spelling errors
2. Add proper punctuation
3. Keep the meaning exactly the same
4. Return ONLY the corrected text, nothing else
5. Do not add any explanation or extra words`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      });

      const enhanced = completion.choices?.[0]?.message?.content?.trim();
      return enhanced || text;

    } catch (error) {
      console.error('[Groq] Failed to enhance transcription:', error);
      return text;
    }
  }

  async getBalance(): Promise<AccountBalance['groq']> {
    try {
      // Groq does not have a public balance API yet
      // We return a placeholder but show it gracefully in UI
      return {
        balance: -1, // -1 means "not available"
        currency: 'USD',
      };
    } catch (error) {
      console.error('[Groq] Failed to fetch balance:', error);
      return { balance: -1, currency: 'USD' };
    }
  }
}

export const groqService = new GroqService();