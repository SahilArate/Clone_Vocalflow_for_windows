export interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface AccountBalance {
  deepgram: {
    balance: number;
    currency: string;
  };
  groq: {
    balance: number;
    currency: string;
  };
}

export interface AppState {
  isRecording: boolean;
  isProcessing: boolean;
  lastTranscription: string;
  status: 'idle' | 'recording' | 'processing' | 'error';
  error?: string;
}

export interface IPCMessage {
  channel: string;
  data?: unknown;
}

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'error';