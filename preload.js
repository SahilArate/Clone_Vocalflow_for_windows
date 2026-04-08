const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vocalflow', {
  getBalance: () => ipcRenderer.invoke('get-balance'),
  getStatus: () => ipcRenderer.invoke('get-status'),

  onRecordingStatus: (callback) =>
    ipcRenderer.on('recording-status', (_, data) => callback(data)),

  onLiveTranscript: (callback) =>
    ipcRenderer.on('live-transcript', (_, data) => callback(data)),

  onTranscriptionResult: (callback) =>
    ipcRenderer.on('transcription-result', (_, data) => callback(data)),

  onProcessingStatus: (callback) =>
    ipcRenderer.on('processing-status', (_, data) => callback(data)),

  onError: (callback) =>
    ipcRenderer.on('recording-error', (_, data) => callback(data)),

  removeAllListeners: (channel) =>
    ipcRenderer.removeAllListeners(channel),
});