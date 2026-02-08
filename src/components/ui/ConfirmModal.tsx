'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onCancel();
      }}
    >
      <div
        className="rounded-[6px] p-6 w-full max-w-[400px] mx-4 animate-scale-in"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-accent)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Icon + title */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-[4px] shrink-0"
            style={{
              background: danger ? 'var(--status-critical-bg)' : 'var(--status-degraded-bg)',
            }}
          >
            <AlertTriangle
              size={18}
              style={{ color: danger ? 'var(--status-critical)' : 'var(--status-degraded)' }}
            />
          </div>
          <div>
            <h3
              className="text-[14px] font-semibold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h3>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-[4px] text-[13px] font-medium transition-all duration-150"
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.borderColor = 'var(--border-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-[4px] text-[13px] font-medium transition-all duration-150"
            style={{
              background: danger ? 'var(--status-critical)' : 'var(--accent-primary)',
              color: '#fff',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
