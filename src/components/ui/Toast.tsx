'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastData {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    color: 'var(--status-operational)',
    bg: 'var(--status-operational-bg)',
  },
  warning: {
    icon: AlertTriangle,
    color: 'var(--status-degraded)',
    bg: 'var(--status-degraded-bg)',
  },
  error: {
    icon: XCircle,
    color: 'var(--status-critical)',
    bg: 'var(--status-critical-bg)',
  },
  info: {
    icon: Info,
    color: 'var(--status-info)',
    bg: 'var(--accent-muted)',
  },
};

// Global toast state
let toastListeners: Array<(toasts: ToastData[]) => void> = [];
let toastQueue: ToastData[] = [];

function notifyListeners() {
  toastListeners.forEach((fn) => fn([...toastQueue]));
}

export function showToast(
  message: string,
  type: ToastData['type'] = 'info',
  duration = 4000,
  title?: string
) {
  const toast: ToastData = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    message,
    type,
    duration,
  };

  // Max 3 visible — dismiss oldest first
  if (toastQueue.length >= 3) {
    toastQueue = toastQueue.slice(1);
  }
  toastQueue = [...toastQueue, toast];
  notifyListeners();

  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== toast.id);
    notifyListeners();
  }, duration);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== setToasts);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    toastQueue = toastQueue.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type];
        const Icon = config.icon;
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-[6px] min-w-[320px] max-w-[420px]',
              'animate-slide-in'
            )}
            style={{
              background: 'var(--bg-secondary)',
              border: `1px solid ${config.color}`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.08), 0 0 12px ${config.color}11`,
            }}
            role="alert"
            aria-live="assertive"
          >
            <Icon size={16} style={{ color: config.color, flexShrink: 0, marginTop: 2 }} />
            <div className="flex-1 min-w-0">
              {toast.title && (
                <p className="text-[13px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  {toast.title}
                </p>
              )}
              <span className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="p-1 rounded transition-colors shrink-0 focus-ring"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
