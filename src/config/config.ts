import dotenv from 'dotenv';
dotenv.config();

const config = {
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY || '',
    model: 'nova-2',
    language: 'en-US',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: 'llama3-8b-8192',
  },
  hotkey: {
    key: 'AltRight', // Hold Right Alt to record
  },
  app: {
    name: 'VocalFlow',
    version: '1.0.0',
  },
} as const;

export default config;