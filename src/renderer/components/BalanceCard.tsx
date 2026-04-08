import React from 'react';
import { AccountBalance } from '../../types';

interface BalanceCardProps {
  balance: AccountBalance | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function BalanceCard({
  balance,
  isLoading,
  onRefresh,
}: BalanceCardProps) {
  const formatBalance = (amount: number, currency: string): string => {
    if (amount === -1) return 'N/A';
    return `${currency} $${amount.toFixed(2)}`;
  };

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            color: 'var(--text)',
            fontWeight: '600',
            fontSize: '13px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          💳 Account Balances
        </span>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            padding: '4px 10px',
            fontSize: '11px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          {isLoading ? '⏳' : '🔄 Refresh'}
        </button>
      </div>

      {/* Deepgram Balance */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg)',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '8px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🎙️</span>
          <div>
            <p
              style={{
                color: 'var(--text)',
                fontWeight: '600',
                fontSize: '13px',
              }}
            >
              Deepgram
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              Speech to Text
            </p>
          </div>
        </div>
        <span
          style={{
            color: '#10B981',
            fontWeight: '700',
            fontSize: '14px',
          }}
        >
          {isLoading
            ? '...'
            : balance
            ? formatBalance(
                balance.deepgram.balance,
                balance.deepgram.currency
              )
            : '—'}
        </span>
      </div>

      {/* Groq Balance */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg)',
          borderRadius: '10px',
          padding: '10px 14px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🤖</span>
          <div>
            <p
              style={{
                color: 'var(--text)',
                fontWeight: '600',
                fontSize: '13px',
              }}
            >
              Groq
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              AI Post-processing
            </p>
          </div>
        </div>
        <span
          style={{
            color: '#F59E0B',
            fontWeight: '700',
            fontSize: '14px',
          }}
        >
          {isLoading
            ? '...'
            : balance
            ? formatBalance(balance.groq.balance, balance.groq.currency)
            : '—'}
        </span>
      </div>
    </div>
  );
}