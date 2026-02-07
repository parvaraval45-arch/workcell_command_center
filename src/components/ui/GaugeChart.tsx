'use client';

interface GaugeChartProps {
  value: number;
  label: string;
  max?: number;
}

export default function GaugeChart({ value, label, max = 100 }: GaugeChartProps) {
  const percentage = (value / max) * 100;
  const color =
    percentage >= 90
      ? 'var(--status-operational)'
      : percentage >= 70
        ? 'var(--status-degraded)'
        : 'var(--status-critical)';

  return (
    <div className="card p-5 flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 264} 264`}
            style={{ transition: 'stroke-dasharray 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-metric text-[20px] font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {value}%
          </span>
        </div>
      </div>
      <span
        className="text-[11px] font-medium uppercase tracking-wider"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
    </div>
  );
}
