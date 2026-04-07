import { EventEmitter } from 'events';
import { GlobalKeyboardListener } from 'node-global-key-listener';

class HotkeyService extends EventEmitter {
  private listener: GlobalKeyboardListener;
  private isHolding: boolean = false;
  private targetKey: string = 'RIGHT ALT';

  constructor() {
    super();
    this.listener = new GlobalKeyboardListener();
  }

  start(): void {
    this.listener.addListener((event, down) => {
      const keyName = event.name?.toUpperCase();

      if (keyName !== this.targetKey) return;

      // Key pressed down — start recording
      if (down[this.targetKey] && !this.isHolding) {
        this.isHolding = true;
        this.emit('keydown');
        console.log('[Hotkey] Key held — starting recording');
      }

      // Key released — stop recording
      if (!down[this.targetKey] && this.isHolding) {
        this.isHolding = false;
        this.emit('keyup');
        console.log('[Hotkey] Key released — stopping recording');
      }
    });

    console.log('[Hotkey] Listening for RIGHT ALT key...');
  }

  stop(): void {
    this.listener.kill();
    console.log('[Hotkey] Stopped listening');
  }

  setKey(key: string): void {
    this.targetKey = key.toUpperCase();
    console.log(`[Hotkey] Key changed to: ${this.targetKey}`);
  }
}

export const hotkeyService = new HotkeyService();