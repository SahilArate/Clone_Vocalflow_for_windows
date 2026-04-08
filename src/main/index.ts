import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import { deepgramService } from '../services/deepgram';
import { groqService } from '../services/groq';
import { hotkeyService } from './hotkey';
import { injectorService } from './injector';
import { trayService } from './tray';
import mic from 'mic';

let mainWindow: BrowserWindow | null = null;
let micInstance: any = null;
let finalTranscript: string = '';

// ─── Create Main Window ───────────────────────────────────────────────────────
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 680,
    resizable: false,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../../electron.js'),
    },
    icon: path.join(__dirname, '../../assets/icon.ico'),
    skipTaskbar: false,
    title: 'VocalFlow',
  });

  // Load Next.js app in development, static files in production
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../out/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Hide window instead of closing when X is clicked
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

// ─── Recording Logic ──────────────────────────────────────────────────────────
async function startRecording(): Promise<void> {
  try {
    finalTranscript = '';

    await deepgramService.startStreaming();

    micInstance = mic({
      rate: '16000',
      channels: '1',
      debug: false,
      device: 'default',
    });

    const micStream = micInstance.getAudioStream();

    micStream.on('data', (data: Buffer) => {
      deepgramService.sendAudio(data);
    });

    micStream.on('error', (error: Error) => {
      console.error('[Mic] Error:', error);
    });

    micInstance.start();

    trayService.setRecordingState(true);
    mainWindow?.webContents.send('recording-status', { isRecording: true });

    console.log('[App] Recording started');
  } catch (error) {
    console.error('[App] Failed to start recording:', error);
    mainWindow?.webContents.send('recording-error', { error: String(error) });
  }
}

async function stopRecording(): Promise<void> {
  try {
    if (micInstance) {
      micInstance.stop();
      micInstance = null;
    }

    deepgramService.stopStreaming();
    trayService.setRecordingState(false);

    mainWindow?.webContents.send('recording-status', { isRecording: false });
    mainWindow?.webContents.send('processing-status', { isProcessing: true });

    console.log('[App] Recording stopped, processing transcript...');

    if (finalTranscript.trim().length > 0) {
      // Enhance with Groq
      const enhanced = await groqService.enhanceTranscription(finalTranscript);

      // Inject text at cursor
      await injectorService.injectText(enhanced);

      mainWindow?.webContents.send('transcription-result', {
        original: finalTranscript,
        enhanced,
      });
    }

    mainWindow?.webContents.send('processing-status', { isProcessing: false });

  } catch (error) {
    console.error('[App] Failed to stop recording:', error);
    mainWindow?.webContents.send('recording-error', { error: String(error) });
  }
}

// ─── Deepgram Events ──────────────────────────────────────────────────────────
deepgramService.on('transcript', (result) => {
  if (result.isFinal) {
    finalTranscript += ' ' + result.text;
  }
  mainWindow?.webContents.send('live-transcript', result);
});

deepgramService.on('error', (error) => {
  console.error('[Deepgram Event] Error:', error);
  mainWindow?.webContents.send('recording-error', { error: String(error) });
});

// ─── Hotkey Events ────────────────────────────────────────────────────────────
hotkeyService.on('keydown', () => startRecording());
hotkeyService.on('keyup', () => stopRecording());

// ─── IPC Handlers ─────────────────────────────────────────────────────────────
ipcMain.handle('get-balance', async () => {
  const [deepgram, groq] = await Promise.all([
    deepgramService.getBalance(),
    groqService.getBalance(),
  ]);
  return { deepgram, groq };
});

ipcMain.handle('get-status', () => {
  return { status: 'idle' };
});

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  createWindow();

  if (mainWindow) {
    trayService.initialize(mainWindow);
  }

  hotkeyService.start();

  console.log('[App] VocalFlow started successfully');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    hotkeyService.stop();
    app.quit();
  }
});

app.on('before-quit', () => {
  (app as any).isQuitting = true;
  hotkeyService.stop();
  trayService.destroy();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});