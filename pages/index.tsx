import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import StatusCard from '../components/StatusCard';
import BalanceCard from '../components/BalanceCard';
import TranscriptBox from '../components/TranscriptBox';
import { AccountBalance, RecordingStatus } from '../src/types';

// Extend window type for Electron bridge
declare global {
  interface Window {
    vocalflow: {
      getBalance: () => Promise<AccountBalance>;
      getStatus: () => Promise<{ status: string }>;
      onRecordingStatus: (cb: (data: { isRecording: boolean }) => void) => void;
      onLiveTranscript: (cb: (data: { text: string; isFinal: boolean }) => void) => void;
      onTranscriptionResult: (cb: (data: { original: string; enhanced: string }) => void) => void;
      onProcessingStatus: (cb: (data: { isProcessing: boolean }) => void) => void;
      onError: (cb: (data: { error: string }) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

export default function Home() {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [liveText, setLiveText] = useState('');
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [lastTranscript, setLastTranscript] = useState({ original: '', enhanced: '' });

  // ── Fetch balance ──────────────────────────────────────────────
  const fetchBalance = async () => {
    if (!window.vocalflow) return;
    setIsBalanceLoading(true);
    try {
      const data = await window.vocalflow.getBalance();
      setBalance(data);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  // ── Setup Electron listeners ───────────────────────────────────
  useEffect(() => {
    if (!window.vocalflow) return;

    // Fetch balance on load
    fetchBalance();

    // Recording status
    window.vocalflow.onRecordingStatus(({ isRecording }) => {
      setStatus(isRecording ? 'recording' : 'idle');
      if (isRecording) {
        setLiveText('');
        setLastTranscript({ original: '', enhanced: '' });
      }
    });

    // Live transcript while speaking
    window.vocalflow.onLiveTranscript(({ text }) => {
      setLiveText(text);
    });

    // Final result after processing
    window.vocalflow.onTranscriptionResult(({ original, enhanced }) => {
      setLastTranscript({ original, enhanced });
      setLiveText('');
    });

    // Processing status
    window.vocalflow.onProcessingStatus(({ isProcessing }) => {
      setStatus(isProcessing ? 'processing' : 'idle');
    });

    // Error handling
    window.vocalflow.onError(({ error }) => {
      console.error('App error:', error);
      setStatus('error');
    });

    return () => {
      ['recording-status', 'live-transcript', 'transcription-result',
        'processing-status', 'recording-error'].forEach((channel) => {
        window.vocalflow.removeAllListeners(channel);
      });
    };
  }, []);

  return (
    <>
      <Head>
        <title>VocalFlow</title>
      </Head>

      <div
        style={{
          height: '100vh',
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Title Bar (draggable) ── */}
        <div
          style={{
            padding: '14px 16px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            WebkitAppRegion: 'drag',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          } as React.CSSProperties}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🎙️</span>
            <span
              style={{
                color: 'var(--text)',
                fontWeight: '700',
                fontSize: '16px',
                letterSpacing: '0.02em',
              }}
            >
              VocalFlow
            </span>
          </div>

          <span
            style={{
              background: '#4F46E520',
              color: '#4F46E5',
              border: '1px solid #4F46E540',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.05em',
            }}
          >
            WINDOWS
          </span>
        </div>

        {/* ── Scrollable Content ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Hotkey hint */}
          <div
            style={{
              background: '#4F46E510',
              border: '1px solid #4F46E530',
              borderRadius: '10px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '14px' }}>⌨️</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Hold{' '}
              <kbd
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '1px 6px',
                  color: 'var(--text)',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              >
                Right Alt
              </kbd>{' '}
              to start recording in any app
            </span>
          </div>

          {/* Status Card */}
          <StatusCard status={status} liveText={liveText} />

          {/* Balance Card */}
          <BalanceCard
            balance={balance}
            isLoading={isBalanceLoading}
            onRefresh={fetchBalance}
          />

          {/* Transcript Box */}
          <TranscriptBox
            original={lastTranscript.original}
            enhanced={lastTranscript.enhanced}
          />
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            Powered by Deepgram & Groq • v1.0.0
          </span>
        </div>
      </div>
    </>
  );
}