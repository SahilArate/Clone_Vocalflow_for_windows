import { Tray, Menu, app, nativeImage, BrowserWindow } from 'electron';
import path from 'path';

class TrayService {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow | null = null;
  private isRecording: boolean = false;

  initialize(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow;

    // Create a simple colored icon programmatically
    const icon = nativeImage.createFromDataURL(this.getIconDataURL('idle'));

    this.tray = new Tray(icon);
    this.tray.setToolTip('VocalFlow — Hold RIGHT ALT to record');

    this.updateContextMenu();

    // Click on tray icon → show/hide window
    this.tray.on('click', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isVisible()) {
          this.mainWindow.hide();
        } else {
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      }
    });

    console.log('[Tray] Tray initialized');
  }

  setRecordingState(isRecording: boolean): void {
    this.isRecording = isRecording;

    if (this.tray) {
      const icon = nativeImage.createFromDataURL(
        this.getIconDataURL(isRecording ? 'recording' : 'idle')
      );
      this.tray.setImage(icon);
      this.tray.setToolTip(
        isRecording
          ? 'VocalFlow — Recording...'
          : 'VocalFlow — Hold RIGHT ALT to record'
      );
    }

    this.updateContextMenu();
  }

  private updateContextMenu(): void {
    if (!this.tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: this.isRecording ? '🔴 Recording...' : '⚪ Idle',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: '⚙️ Open Settings',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
          }
        },
      },
      { type: 'separator' },
      {
        label: '❌ Quit VocalFlow',
        click: () => {
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  // Generate a simple SVG icon as base64
  private getIconDataURL(state: 'idle' | 'recording'): string {
    const color = state === 'recording' ? '#FF4444' : '#4F46E5';
    const svg = `
      <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="7" fill="${color}"/>
        <rect x="6" y="4" width="4" height="6" rx="2" fill="white"/>
        <rect x="5" y="10" width="6" height="1.5" rx="0.75" fill="white"/>
        <rect x="7.5" y="11.5" width="1" height="1.5" fill="white"/>
      </svg>
    `;
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}

export const trayService = new TrayService();