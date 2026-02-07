'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'flat';
}

export default function MetricCard({ label, value, unit, change, trend }: MetricCardProps) {
  const trendColor =
    trend === 'up'
      ? 'var(--status-operational)'
      : trend === 'down'
        ? 'var(--status-critical)'
        : 'var(--text-tertiary)';

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="card p-5">
      <p
        className="text-[11px] font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span
          className="font-metric text-[28px] font-semibold leading-none"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-[12px] font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {unit}
          </span>
        )}
      </div>
      {change !== undefined && trend && (
        <div className="flex items-center gap-1 mt-2" style={{ color: trendColor }}>
          <TrendIcon size={12} />
          <span className="font-metric text-[11px] font-medium">
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
      )}
    </div>
  );
}
