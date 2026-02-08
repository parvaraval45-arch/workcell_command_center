'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

function getOEEColor(val: number): string {
  if (val >= 75) return 'var(--status-operational)';
  if (val >= 60) return 'var(--status-degraded)';
  return 'var(--status-critical)';
}

function ComponentBar({ label, value }: { label: string; value: number }) {
  const color = getOEEColor(value);
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-[11px] font-semibold w-4 shrink-0"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </span>
      <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(value, 100)}%`,
            background: color,
            transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
      <span className="font-metric text-[12px] w-12 text-right" style={{ color }}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

export default function OEEGauge() {
  const oee = useTelemetryStore((s) => s.production.oee);
  const [showTooltip, setShowTooltip] = useState(false);

  const color = getOEEColor(oee.overall);

  // SVG donut params
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (oee.overall / 100) * circumference;

  return (
    <div className="card p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[13px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Overall Equipment Effectiveness
        </h3>
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Info
            size={14}
            className="cursor-help"
            style={{ color: 'var(--text-tertiary)' }}
          />
          {showTooltip && (
            <div
              className="absolute right-0 top-6 z-20 w-56 p-3 rounded-[4px] text-[11px] leading-relaxed"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-accent)',
                color: 'var(--text-secondary)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              }}
            >
              <span className="font-metric" style={{ color: 'var(--text-primary)' }}>
                OEE = A × P × Q
              </span>
              <br />
              Availability × Performance × Quality.
              Measures how effectively the workcell converts scheduled time into quality output.
            </div>
          )}
        </div>
      </div>

      {/* Donut Chart */}
      <div className="flex items-center justify-center py-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--bg-surface)"
              strokeWidth={strokeWidth}
            />
            {/* Value arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{
                transition: 'stroke-dashoffset 500ms cubic-bezier(0.4, 0, 0.2, 1), stroke 300ms ease',
                filter: `drop-shadow(0 0 6px ${color}33)`,
              }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatedNumber
              value={oee.overall}
              decimals={1}
              className="text-[40px] font-bold leading-none"
              style={{ color }}
            />
            <span className="text-[11px] font-medium mt-1" style={{ color: 'var(--text-tertiary)' }}>
              % OEE
            </span>
          </div>
        </div>
      </div>

      {/* Component Bars */}
      <div className="space-y-2.5 mt-2">
        <ComponentBar label="A" value={oee.availability} />
        <ComponentBar label="P" value={oee.performance} />
        <ComponentBar label="Q" value={oee.quality} />
      </div>
    </div>
  );
}
