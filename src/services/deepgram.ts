import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { EventEmitter } from 'events';
import config from '../config/config';
import { TranscriptionResult, AccountBalance } from '../types';

class DeepgramService extends EventEmitter {
  private client;
  private connection: any = null;
  private isConnected: boolean = false;

  constructor() {
    super();
    this.client = createClient(config.deepgram.apiKey);
  }

  async startStreaming(): Promise<void> {
    try {
      this.connection = this.client.listen.live({
        model: config.deepgram.model,
        language: config.deepgram.language,
        smart_format: true,
        interim_results: true,
        utterance_end_ms: 1000,
        vad_events: true,
      });

      this.connection.on(LiveTranscriptionEvents.Open, () => {
        this.isConnected = true;
        this.emit('connected');
        console.log('[Deepgram] Connection opened');
      });

      this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        const confidence = data.channel?.alternatives?.[0]?.confidence;
        const isFinal = data.is_final;

        if (transcript && transcript.trim().length > 0) {
          const result: TranscriptionResult = {
            text: transcript,
            confidence: confidence || 0,
            isFinal: isFinal || false,
          };
          this.emit('transcript', result);
        }
      });

      this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('[Deepgram] Error:', error);
        this.emit('error', error);
      });

      this.connection.on(LiveTranscriptionEvents.Close, () => {
        this.isConnected = false;
        this.emit('disconnected');
        console.log('[Deepgram] Connection closed');
      });

    } catch (error) {
      console.error('[Deepgram] Failed to start streaming:', error);
      throw error;
    }
  }

  sendAudio(audioData: Buffer): void {
    if (this.connection && this.isConnected) {
      this.connection.send(audioData);
    }
  }

  stopStreaming(): void {
    if (this.connection) {
      this.connection.finish();
      this.connection = null;
      this.isConnected = false;
      console.log('[Deepgram] Streaming stopped');
    }
  }

  async getBalance(): Promise<AccountBalance['deepgram']> {
    try {
      const response = await fetch('https://api.deepgram.com/v1/projects', {
        headers: {
          Authorization: `Token ${config.deepgram.apiKey}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch Deepgram balance');

      const data = await response.json();
      const projectId = data?.projects?.[0]?.project_id;

      if (!projectId) throw new Error('No project found');

      const balanceResponse = await fetch(
        `https://api.deepgram.com/v1/projects/${projectId}/balances`,
        {
          headers: {
            Authorization: `Token ${config.deepgram.apiKey}`,
          },
        }
      );

      const balanceData = await balanceResponse.json();
      const balance = balanceData?.balances?.[0]?.amount || 0;

      return {
        balance: parseFloat(balance.toFixed(2)),
        currency: 'USD',
      };
    } catch (error) {
      console.error('[Deepgram] Failed to fetch balance:', error);
      return { balance: 0, currency: 'USD' };
    }
  }
}

export const deepgramService = new DeepgramService();