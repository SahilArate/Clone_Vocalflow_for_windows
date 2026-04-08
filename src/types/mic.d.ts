declare module 'mic' {
  interface MicOptions {
    rate?: string;
    channels?: string;
    debug?: boolean;
    device?: string;
    fileType?: string;
  }

  interface MicInstance {
    start(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    getAudioStream(): NodeJS.ReadableStream;
  }

  function mic(options?: MicOptions): MicInstance;
  export = mic;
}