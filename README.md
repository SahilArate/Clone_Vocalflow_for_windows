# VocalFlow for Windows

A Windows desktop app that lets you dictate text into any application — browser, Word, WhatsApp, Notepad, anything — using a simple hold-to-record hotkey.

Hold `Right Alt` → Speak → Release → Text appears wherever your cursor is.

---

## What it does

VocalFlow sits quietly in your system tray and listens for a hotkey. The moment you hold `Right Alt`, it starts recording your microphone in real time and streams the audio directly to Deepgram for transcription. When you release the key, it stops recording, optionally runs the transcript through Groq to clean up grammar and spelling, and then pastes the final text at your cursor — in whatever app you were using.

No clicking. No switching windows. Just speak and it types.

---

## Features

- **Hold-to-record hotkey** — hold `Right Alt` to record, release to stop
- **Real-time streaming transcription** — powered by Deepgram's WebSocket API (nova-2 model)
- **AI post-processing** — Groq LLM fixes grammar, spelling and punctuation before injection
- **Works in any app** — text is injected via simulated `Ctrl+V`, so it works everywhere
- **System tray icon** — lives in the taskbar tray, changes color when recording
- **Account balance display** — shows your Deepgram and Groq credit balance inside the app
- **Dark UI** — clean, minimal settings panel built with Next.js and TypeScript

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron v28 |
| Frontend UI | Next.js 14 + TypeScript + React 18 |
| Speech to Text | Deepgram SDK (nova-2, WebSocket streaming) |
| AI Enhancement | Groq SDK (llama3-8b-8192) |
| Hotkey detection | uiohook-napi |
| Audio capture | mic (node.js) |
| Text injection | PowerShell + Windows clipboard |

---

## Requirements

- Windows 10 or later
- Node.js v18 or higher
- A [Deepgram API key](https://console.deepgram.com/signup) — free tier gives $200 credits
- A [Groq API key](https://console.groq.com) — free tier available

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/clone-vocalflow-for-windows.git
cd clone-vocalflow-for-windows
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your API keys

The API keys are stored in a `.env` file at the root of the project. There is also a `src/config/config.ts` file where the Deepgram key is hardcoded as required by the assignment.

Create a `.env` file in the root:

```
DEEPGRAM_API_KEY=your_deepgram_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

Also open `src/config/config.ts` and replace the placeholder with your actual Deepgram key:

```typescript
const config = {
  deepgram: {
    apiKey: 'your_deepgram_api_key_here', // hardcoded as required
    ...
  },
  ...
}
```

### 4. Run in development

Open two terminals in the project root:

**Terminal 1 — Start the UI:**
```bash
npx next dev
```

**Terminal 2 — Start Electron (after Terminal 1 shows "Ready"):**
```bash
node_modules\.bin\electron.cmd .
```

The app window will appear. You will also see a VocalFlow icon in your system tray.

---

## How to use

1. Open any app where you want to type — Notepad, browser, Word, etc.
2. Click inside a text field so your cursor is there
3. Hold the `Right Alt` key on your keyboard
4. Speak clearly into your microphone
5. Release `Right Alt`
6. Wait about 1-2 seconds for processing
7. Your spoken words will appear at the cursor, grammar-corrected

The VocalFlow window shows a live transcript while you speak, and displays the original vs enhanced text after injection.

---

## Project Structure

```
clone-vocalflow-for-windows/
│
├── electron.js                  # Main Electron entry point — app lifecycle,
│                                # recording logic, hotkey, IPC handlers
│
├── preload.js                   # Electron preload — exposes safe APIs to
│                                # the renderer via contextBridge
│
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── .env                         # API keys (not committed to git)
├── .gitignore                   # Ignores node_modules, .env, build output
│
├── src/
│   ├── config/
│   │   └── config.ts            # Centralized config — API keys, model names,
│   │                            # hotkey settings, app metadata
│   │
│   ├── services/
│   │   ├── deepgram.ts          # Deepgram service — WebSocket streaming,
│   │   │                        # live transcription, balance fetch
│   │   └── groq.ts              # Groq service — LLM post-processing,
│   │                            # grammar correction, balance fetch
│   │
│   ├── main/
│   │   ├── index.ts             # Main process logic (TypeScript version)
│   │   ├── hotkey.ts            # Global hotkey listener service
│   │   ├── injector.ts          # Text injection via clipboard + PowerShell
│   │   └── tray.ts              # System tray icon and context menu
│   │
│   ├── types/
│   │   ├── index.ts             # Shared TypeScript interfaces and types
│   │   └── mic.d.ts             # Type declaration for mic package
│   │
│   └── renderer/
│       ├── pages/               # Next.js pages (copied to /pages for build)
│       ├── components/          # React components (copied to /components)
│       └── styles/              # Global CSS (copied to /styles)
│
├── pages/
│   ├── _app.tsx                 # Next.js app wrapper, imports global styles
│   └── index.tsx                # Main UI page — status, balance, transcript
│
├── components/
│   ├── StatusCard.tsx           # Recording status display with pulse animation
│   ├── BalanceCard.tsx          # Deepgram + Groq balance display with refresh
│   └── TranscriptBox.tsx        # Shows original and Groq-enhanced transcription
│
├── styles/
│   └── globals.css              # Global dark theme CSS variables and base styles
│
└── assets/
    └── icon.ico                 # App icon for system tray and window
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DEEPGRAM_API_KEY` | Your Deepgram API key for speech-to-text |
| `GROQ_API_KEY` | Your Groq API key for grammar enhancement |

---

## How the recording pipeline works

```
User holds Right Alt
        ↓
uiohook-napi detects keydown (keycode 3640)
        ↓
mic starts capturing audio from default microphone
        ↓
Audio chunks streamed to Deepgram via WebSocket
        ↓
Deepgram returns live transcript in real time
        ↓
User releases Right Alt
        ↓
mic stops, Deepgram connection closed
        ↓
Final transcript sent to Groq for grammar fix
        ↓
Corrected text written to clipboard
        ↓
PowerShell simulates Ctrl+V at cursor position
        ↓
Text appears in whatever app the user was in
```

---

## Building for production

To build a distributable `.exe` installer:

```bash
npm run build
```

This runs Next.js static export first, then packages everything with electron-builder. The output will be in the `release/` folder.

---

## Submission

- GitHub URL: `https://github.com/YOUR_USERNAME/clone-vocalflow-for-windows`
- ZIP file: exported without `node_modules/` folder

To create the ZIP for submission:

```bash
# Make sure node_modules is in .gitignore, then zip everything else
```

Or just download the ZIP from GitHub directly — it won't include `node_modules`.

---

## Notes

- Groq does not currently expose a public balance API, so the Groq balance shows as "N/A" in the UI. This is expected behavior.
- The app requires microphone permission on first run — Windows will prompt you automatically.
- The `Right Alt` key was chosen to avoid conflicts with common shortcuts. It can be changed in `electron.js` by updating the `RIGHT_ALT` keycode constant.
- Text injection uses the Windows clipboard temporarily. Your original clipboard content is restored after injection.

---

## License

MIT