const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');

// Set environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Run the main TypeScript entry via ts-node
require('ts-node').register({
  project: path.join(__dirname, 'tsconfig.json'),
  transpileOnly: true,
});

// Load main process
require('./src/main/index');

// ─── Preload Script (exposes safe APIs to renderer) ───────────────────────────
// This acts as the bridge between Electron and Next.js UI
const { contextBridge, ipcRenderer } = require('electron');

if (process.type === 'renderer') {
  contextBridge.exposeInMainWorld('vocalflow', {
    // Get account balances
    getBalance: () => ipcRenderer.invoke('get-balance'),

    // Get app status
    getStatus: () => ipcRenderer.invoke('get-status'),

    // Listen to recording status changes
    onRecordingStatus: (callback) =>
      ipcRenderer.on('recording-status', (_, data) => callback(data)),

    // Listen to live transcript
    onLiveTranscript: (callback) =>
      ipcRenderer.on('live-transcript', (_, data) => callback(data)),

    // Listen to final transcription result
    onTranscriptionResult: (callback) =>
      ipcRenderer.on('transcription-result', (_, data) => callback(data)),

    // Listen to processing status
    onProcessingStatus: (callback) =>
      ipcRenderer.on('processing-status', (_, data) => callback(data)),

    // Listen to errors
    onError: (callback) =>
      ipcRenderer.on('recording-error', (_, data) => callback(data)),

    // Remove all listeners (cleanup)
    removeAllListeners: (channel) =>
      ipcRenderer.removeAllListeners(channel),
  });
}