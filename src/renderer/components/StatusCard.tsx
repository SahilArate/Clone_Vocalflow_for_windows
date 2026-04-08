import React from 'react';
import { RecordingStatus } from '../../types';

interface StatusCardProps {
  status: RecordingStatus;
  liveText: string;
}

export default function StatusCard({ status, liveText }: StatusCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'recording':
        return {
          color: '#EF4444',
          glow: '0 0 20px rgba(239, 68, 68, 0.5)',
          label: 'Recording...',
          icon: '🔴',
        };
      case 'processing':
        return {
          color: '#F59E0B',
          glow: '0 0 20px rgba(245, 158, 11, 0.5)',
          label: 'Processing...',
          icon: '⚙️',
        };
      case 'error':
        return {
          color: '#EF4444',
          glow: 'none',
          label: 'Error occurred',
          icon: '⚠️',
        };
      default:
        return {
          color: '#4F46E5',
          glow: '0 0 20px rgba(79, 70, 229, 0.3)',
          label: 'Hold RIGHT ALT to record',
          icon: '🎤',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${config.color}40`,
        borderRadius: '16px',
        padding: '20px',
        textAlign: 'center',
        boxShadow: config.glow,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Mic Icon with pulse animation */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: `${config.color}20`,
          border: `2px solid ${config.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          fontSize: '28px',
          animation: status === 'recording' ? 'pulse 1s infinite' : 'none',
        }}
      >
        {config.icon}
      </div>

      {/* Status Label */}
      <p
        style={{
          color: config.color,
          fontWeight: '600',
          fontSize: '13px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}
      >
        {config.label}
      </p>

      {/* Live transcript text */}
      <div
        style={{
          minHeight: '40px',
          background: 'var(--bg)',
          borderRadius: '8px',
          padding: '8px 12px',
          color: liveText ? 'var(--text)' : 'var(--text-muted)',
          fontSize: '13px',
          lineHeight: '1.5',
          textAlign: 'left',
          border: '1px solid var(--border)',
        }}
      >
        {liveText || 'Your speech will appear here...'}
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}