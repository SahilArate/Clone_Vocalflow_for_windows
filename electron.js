process.on('uncaughtException', (error) => {
  console.error('[FATAL ERROR]:', error.message);
  const fs = require('fs');
  fs.writeFileSync('error.log', error.stack || error.message);
});

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { clipboard } = require('electron');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

let mainWindow = null;

// ── Create Window ─────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 680,
    resizable: false,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: 'VocalFlow',
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

// ── Inject text via clipboard + Ctrl+V ───────────────────────────────────────
async function injectText(text) {
  return new Promise((resolve) => {
    const previous = clipboard.readText();
    clipboard.writeText(text);
    setTimeout(() => {
      exec(`powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')"`, () => {
        setTimeout(() => {
          clipboard.writeText(previous);
          resolve();
        }, 200);
      });
    }, 100);
  });
}

// ── App Ready ─────────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  createWindow();

  // Load packages
  const { DeepgramClient } = require('@deepgram/sdk');
  const Groq = require('groq-sdk');
  const { uIOhook } = require('uiohook-napi');
  const mic = require('mic');

  // Load API keys from .env
  require('dotenv').config();
  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || '';
  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

  // Init clients
  const deepgramClient = new DeepgramClient(DEEPGRAM_API_KEY);
  const groqClient = new Groq({ apiKey: GROQ_API_KEY });

  let dgConnection = null;
  let micInstance = null;
  let finalTranscript = '';
  let isRecording = false;

  // ── Deepgram Streaming ──────────────────────────────────────────────────────
  async function startDeepgram() {
    return new Promise((resolve) => {
      dgConnection = deepgramClient.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
      });

      // Wait for connection to open before resolving
      dgConnection.on('open', () => {
        console.log('[Deepgram] Connected');
        resolve();
      });

      // Live transcript events
      dgConnection.on('Results', (data) => {
        const transcript = data?.channel?.alternatives?.[0]?.transcript;
        const isFinal = data?.is_final;

        if (transcript && transcript.trim()) {
          if (isFinal) finalTranscript += ' ' + transcript;
          mainWindow?.webContents.send('live-transcript', {
            text: transcript,
            isFinal,
          });
        }
      });

      dgConnection.on('error', (err) => {
        console.error('[Deepgram] Error:', err);
        resolve(); // resolve anyway so recording still works
      });

      dgConnection.on('close', () => {
        console.log('[Deepgram] Connection closed');
      });

      // Safety timeout — resolve after 3s even if open event doesn't fire
      setTimeout(resolve, 3000);
    });
  }

  // ── Groq Enhancement ───────────────────────────────────────────────────────
  async function enhanceText(text) {
    try {
      const result = await groqClient.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'Fix grammar and spelling. Return ONLY the corrected text, nothing else.',
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      });
      return result.choices?.[0]?.message?.content?.trim() || text;
    } catch (err) {
      console.error('[Groq] Enhancement failed:', err.message);
      return text;
    }
  }

  // ── Start Recording ─────────────────────────────────────────────────────────
  async function startRecording() {
    if (isRecording) return;
    isRecording = true;
    finalTranscript = '';

    try {
      console.log('[App] Connecting to Deepgram...');
      await startDeepgram();

      micInstance = mic({ rate: '16000', channels: '1', debug: false });
      const micStream = micInstance.getAudioStream();

      micStream.on('data', (data) => {
        if (dgConnection) dgConnection.send(data);
      });

      micStream.on('error', (err) => {
        console.error('[Mic] Error:', err.message);
      });

      micInstance.start();
      mainWindow?.webContents.send('recording-status', { isRecording: true });
      console.log('[App] Recording started — speak now!');
    } catch (err) {
      console.error('[App] Start recording error:', err.message);
      isRecording = false;
      mainWindow?.webContents.send('recording-error', { error: err.message });
    }
  }

  // ── Stop Recording ──────────────────────────────────────────────────────────
  async function stopRecording() {
    if (!isRecording) return;
    isRecording = false;

    try {
      if (micInstance) {
        micInstance.stop();
        micInstance = null;
      }

      if (dgConnection) {
        dgConnection.finish();
        dgConnection = null;
      }

      mainWindow?.webContents.send('recording-status', { isRecording: false });
      mainWindow?.webContents.send('processing-status', { isProcessing: true });

      console.log('[App] Recording stopped. Transcript:', finalTranscript.trim());

      if (finalTranscript.trim()) {
        console.log('[App] Enhancing with Groq...');
        const enhanced = await enhanceText(finalTranscript.trim());
        console.log('[App] Enhanced:', enhanced);

        await injectText(enhanced);

        mainWindow?.webContents.send('transcription-result', {
          original: finalTranscript.trim(),
          enhanced,
        });
      } else {
        console.log('[App] No transcript captured');
      }

      mainWindow?.webContents.send('processing-status', { isProcessing: false });
    } catch (err) {
      console.error('[App] Stop recording error:', err.message);
      mainWindow?.webContents.send('processing-status', { isProcessing: false });
    }
  }

  // ── Hotkey Listener ─────────────────────────────────────────────────────────
  const RIGHT_ALT = 3640;
  let keyHeld = false;

  uIOhook.on('keydown', (event) => {
    if (event.keycode === RIGHT_ALT && !keyHeld) {
      keyHeld = true;
      startRecording();
    }
  });

  uIOhook.on('keyup', (event) => {
    if (event.keycode === RIGHT_ALT && keyHeld) {
      keyHeld = false;
      stopRecording();
    }
  });

  uIOhook.start();
  console.log('[App] Hotkey listener started — Hold RIGHT ALT to record');

  // ── IPC: Get Balance ────────────────────────────────────────────────────────
  ipcMain.handle('get-balance', async () => {
    try {
      const res = await fetch('https://api.deepgram.com/v1/projects', {
        headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` },
      });
      const data = await res.json();
      const projectId = data?.projects?.[0]?.project_id;

      let deepgramBalance = 0;
      if (projectId) {
        const balRes = await fetch(
          `https://api.deepgram.com/v1/projects/${projectId}/balances`,
          { headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` } }
        );
        const balData = await balRes.json();
        deepgramBalance = balData?.balances?.[0]?.amount || 0;
      }

      return {
        deepgram: { balance: parseFloat(deepgramBalance.toFixed(2)), currency: 'USD' },
        groq: { balance: -1, currency: 'USD' },
      };
    } catch {
      return {
        deepgram: { balance: 0, currency: 'USD' },
        groq: { balance: -1, currency: 'USD' },
      };
    }
  });

  ipcMain.handle('get-status', () => ({ status: 'idle' }));

  console.log('[App] VocalFlow ready!');
});

app.on('window-all-closed', () => app.quit());
app.on('before-quit', () => { app.isQuitting = true; });