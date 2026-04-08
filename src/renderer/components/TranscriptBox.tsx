import React from 'react';

interface TranscriptBoxProps {
  original: string;
  enhanced: string;
}

export default function TranscriptBox({
  original,
  enhanced,
}: TranscriptBoxProps) {
  if (!original && !enhanced) return null;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '16px',
      }}
    >
      {/* Header */}
      <p
        style={{
          color: 'var(--text)',
          fontWeight: '600',
          fontSize: '13px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}
      >
        📝 Last Transcription
      </p>

      {/* Original Text */}
      {original && (
        <div style={{ marginBottom: '10px' }}>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '11px',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Original
          </p>
          <div
            style={{
              background: 'var(--bg)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              lineHeight: '1.6',
              border: '1px solid var(--border)',
            }}
          >
            {original}
          </div>
        </div>
      )}

      {/* Enhanced Text */}
      {enhanced && enhanced !== original && (
        <div>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '11px',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            ✨ Enhanced by Groq
          </p>
          <div
            style={{
              background: 'var(--bg)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: 'var(--text)',
              fontSize: '13px',
              lineHeight: '1.6',
              border: '1px solid #4F46E540',
            }}
          >
            {enhanced}
          </div>
        </div>
      )}

      {/* Injected badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '10px',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10B981',
          }}
        />
        <span style={{ color: '#10B981', fontSize: '11px' }}>
          Text injected at cursor successfully
        </span>
      </div>
    </div>
  );
}