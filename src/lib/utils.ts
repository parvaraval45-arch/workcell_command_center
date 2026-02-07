import type { StatusType } from './tokens';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getStatusColor(status: StatusType): string {
  const map: Record<StatusType, string> = {
    operational: 'var(--status-operational)',
    degraded: 'var(--status-degraded)',
    critical: 'var(--status-critical)',
    info: 'var(--status-info)',
  };
  return map[status];
}

export function getStatusBgColor(status: StatusType): string {
  const map: Record<StatusType, string> = {
    operational: 'var(--status-operational-bg)',
    degraded: 'var(--status-degraded-bg)',
    critical: 'var(--status-critical-bg)',
    info: 'var(--accent-muted)',
  };
  return map[status];
}

export function getStatusDotClass(status: StatusType): string {
  const map: Record<StatusType, string> = {
    operational: 'status-dot-operational',
    degraded: 'status-dot-degraded',
    critical: 'status-dot-critical',
    info: '',
  };
  return map[status];
}

export function formatNumber(value: number, decimals = 1): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(decimals)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(decimals)}K`;
  return value.toFixed(decimals);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
