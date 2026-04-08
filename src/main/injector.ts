import { clipboard, app } from 'electron';

class InjectorService {
  private previousClipboard: string = '';

  async injectText(text: string): Promise<void> {
    try {
      if (!text || text.trim().length === 0) return;

      // Save whatever was in clipboard before
      this.previousClipboard = clipboard.readText();

      // Put our transcribed text into clipboard
      clipboard.writeText(text);

      // Small delay to make sure clipboard is ready
      await this.delay(100);

      // Simulate Ctrl+V to paste
      await this.simulatePaste();

      // Small delay then restore original clipboard
      await this.delay(200);
      clipboard.writeText(this.previousClipboard);

      console.log(`[Injector] Text injected: "${text}"`);

    } catch (error) {
      console.error('[Injector] Failed to inject text:', error);
      throw error;
    }
  }

  private async simulatePaste(): Promise<void> {
    const { exec } = require('child_process');

    return new Promise((resolve, reject) => {
      // Use PowerShell to simulate Ctrl+V on Windows
      const command = `powershell -command "
        Add-Type -AssemblyName System.Windows.Forms;
        [System.Windows.Forms.SendKeys]::SendWait('^v');
      "`;

      exec(command, (error: any) => {
        if (error) {
          console.error('[Injector] PowerShell paste failed:', error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const injectorService = new InjectorService();