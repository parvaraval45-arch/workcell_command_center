'use client';

import { ShieldCheck, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'shield' | 'loading';
  message: string;
  submessage?: string;
}

export default function EmptyState({ icon = 'shield', message, submessage }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center h-48 rounded-[6px] gap-3"
      style={{ background: 'var(--bg-tertiary)' }}
    >
      {icon === 'shield' ? (
        <ShieldCheck size={32} style={{ color: 'var(--status-operational)', opacity: 0.5 }} />
      ) : (
        <Loader2 size={24} className="empty-state-spin" style={{ color: 'var(--text-tertiary)' }} />
      )}
      <p className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
        {message}
      </p>
      {submessage && (
        <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          {submessage}
        </p>
      )}
    </div>
  );
}
