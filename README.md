# VocalFlow for Windows

A Windows desktop app that lets you dictate text into any application — browser, Word, WhatsApp, Notepad, anything — using a simple hold-to-record hotkey.

Hold `Right Alt` → Speak → Release → Text appears wherever your cursor is.

---

## What it does

VocalFlow sits quietly in your system tray and listens for a hotkey. The moment you hold `Right Alt`, it starts recording your microphone in real time and streams the audio directly to Deepgram for transcription. When you release the key, it stops recording, runs the transcript through Groq to clean up grammar and spelling, and then pastes the final text at your cursor — in whatever app you were using.

No clicking. No switching windows. Just speak and it types.

---

## Features

- **Hold-to-record hotkey** — hold `Right Alt` to record, release to stop
- **Real-time streaming transcription** — powered by Deepgram's WebSocket API (nova-2 model)
- **AI post-processing** — Groq LLM fixes grammar, spelling and punctuation before injection
- **Works in any app** — text is injected via simulated `Ctrl+V`, so it works everywhere
- **System tray icon** — lives in the Windows taskbar tray
- **Account balance display** — shows your Deepgram and Groq credit balance inside the app
- **Dark UI** — clean, minimal panel built with Next.js and TypeScript

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron v28 |
| Frontend UI | Next.js 14 + TypeScript + React 18 |
| Speech to Text | Deepgram SDK v3 (nova-2, WebSocket streaming) |
| AI Enhancement | Groq SDK (llama3-8b-8192) |
| Hotkey detection | uiohook-napi |
| Audio capture | mic (Node.js) |
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

Create a `.env` file in the root of the project:

```
DEEPGRAM_API_KEY=your_deepgram_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

The Deepgram key is also hardcoded in `src/config/config.ts` as required by the assignment spec. Open that file and replace the placeholder with your actual key.

### 4. Run in development

You need two terminals open at the same time.

**Terminal 1 — Start the UI:**
```bash
npx next dev
```

Wait until you see `✓ Ready` in Terminal 1, then open Terminal 2.

**Terminal 2 — Start Electron:**
```bash
node_modules\.bin\electron.cmd .
```

The VocalFlow window will appear on screen.

---

## How to use

1. Open any app where you want to type — Notepad, browser, Word, etc.
2. Click inside a text field so your cursor is placed there
3. Hold the `Right Alt` key on your keyboard and speak
4. Release `Right Alt` when done speaking
5. Wait 1-2 seconds for Groq to process
6. Your words appear at the cursor, grammar-corrected

The VocalFlow window shows a live transcript while you speak and displays the original vs Groq-enhanced text after injection.

---

## Project Structure

```
clone-vocalflow-for-windows/
│
├── electron.js                  # Main Electron entry point — window creation,
│                                # recording logic, hotkey, Deepgram, Groq, IPC
│
├── preload.js                   # Electron preload script — exposes safe APIs
│                                # to the Next.js renderer via contextBridge
│
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Project dependencies and scripts
├── .env                         # API keys (not committed to git)
├── .gitignore                   # Ignores node_modules, .env, build output
│
├── src/
│   ├── config/
│   │   └── config.ts            # Centralized config — hardcoded Deepgram key,
│   │                            # model names, hotkey, app metadata
│   │
│   ├── services/
│   │   ├── deepgram.ts          # Deepgram service class — WebSocket streaming,
│   │   │                        # live transcription, balance API
│   │   └── groq.ts              # Groq service class — LLM post-processing,
│   │                            # grammar correction
│   │
│   ├── main/
│   │   ├── index.ts             # Main process entry (TypeScript reference)
│   │   ├── hotkey.ts            # Global hotkey listener service
│   │   ├── injector.ts          # Text injection via clipboard + PowerShell
│   │   └── tray.ts              # System tray icon and context menu
│   │
│   └── types/
│       ├── index.ts             # Shared TypeScript interfaces and types
│       └── mic.d.ts             # Type declaration for mic package
│
├── pages/
│   ├── _app.tsx                 # Next.js app wrapper, imports global styles
│   └── index.tsx                # Main UI — status card, balance card, transcript
│
├── components/
│   ├── StatusCard.tsx           # Recording status with pulse animation
│   ├── BalanceCard.tsx          # Deepgram + Groq balance with refresh button
│   └── TranscriptBox.tsx        # Original vs Groq-enhanced transcription display
│
├── styles/
│   └── globals.css              # Dark theme CSS variables and base styles
│
└── assets/
    └── icon.ico                 # App icon
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
Deepgram WebSocket connection opened via listen.v1.connect()
        ↓
mic starts capturing audio from default microphone at 16kHz
        ↓
Audio chunks streamed live to Deepgram WebSocket
        ↓
Deepgram returns interim + final transcripts in real time
        ↓
User releases Right Alt
        ↓
mic stops, Deepgram connection closed
        ↓
Final transcript sent to Groq llama3-8b-8192 for grammar fix
        ↓
Corrected text written to Windows clipboard
        ↓
PowerShell simulates Ctrl+V at cursor position
        ↓
Text appears in whatever app the user was typing in
        ↓
Original clipboard content is restored
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
- ZIP file submitted without `node_modules/` folder

---

## Notes

- Groq does not expose a public balance API, so the Groq balance shows as "N/A" in the UI. This is expected.
- The app requires microphone access — Windows will prompt automatically on first use.
- `Right Alt` was chosen to avoid conflicts with common shortcuts. You can change it in `electron.js` by updating the `RIGHT_ALT` constant (currently set to keycode `3640`).
- Text injection uses the Windows clipboard temporarily. Your original clipboard content is restored after injection completes.

---

## License

MIT