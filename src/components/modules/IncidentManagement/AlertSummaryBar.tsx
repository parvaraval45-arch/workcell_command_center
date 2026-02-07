'use client';

import { Bell } from 'lucide-react';
import type { Incident, IncidentSeverity } from '@/lib/types';

type FilterType = 'all' | IncidentSeverity;
type TimeRange = 'shift' | 'hour' | 'day';

interface AlertSummaryBarProps {
  incidents: Incident[];
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (t: TimeRange) => void;
}

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: 'var(--status-critical)', bg: 'var(--status-critical-bg)' },
  warning: { label: 'Warning', color: 'var(--status-degraded)', bg: 'var(--status-degraded-bg)' },
  info: { label: 'Info', color: 'var(--status-info)', bg: 'var(--accent-muted)' },
};

const TIME_LABELS: Record<TimeRange, string> = {
  shift: 'This Shift',
  hour: 'Last Hour',
  day: 'Last 24h',
};

export default function AlertSummaryBar({
  incidents,
  filter,
  onFilterChange,
  timeRange,
  onTimeRangeChange,
}: AlertSummaryBarProps) {
  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const warningCount = incidents.filter((i) => i.severity === 'warning').length;
  const infoCount = incidents.filter((i) => i.severity === 'info').length;
  const unackCount = incidents.filter((i) => !i.acknowledged).length;

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'critical', label: 'Critical' },
    { key: 'warning', label: 'Warning' },
    { key: 'info', label: 'Info' },
  ];

  return (
    <div
      className="flex items-center gap-4 flex-wrap px-5 py-3 rounded-[4px] mb-4"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
    >
      {/* Severity counts */}
      <div className="flex items-center gap-2">
        {(['critical', 'warning', 'info'] as const).map((sev) => {
          const count = sev === 'critical' ? criticalCount : sev === 'warning' ? warningCount : infoCount;
          const cfg = SEVERITY_CONFIG[sev];
          return (
            <span
              key={sev}
              className="font-metric text-[11px] font-medium px-2 py-0.5 rounded-[3px]"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {count} {cfg.label}
            </span>
          );
        })}
      </div>

      {/* Unacknowledged */}
      <div className="flex items-center gap-1.5">
        <Bell
          size={12}
          className={unackCount > 0 ? 'alert-bell-pulse' : ''}
          style={{ color: unackCount > 0 ? 'var(--status-degraded)' : 'var(--text-tertiary)' }}
        />
        <span
          className="font-metric text-[11px] font-medium"
          style={{ color: unackCount > 0 ? 'var(--status-degraded)' : 'var(--text-tertiary)' }}
        >
          {unackCount} Unacknowledged
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Filter pills */}
      <div className="flex items-center gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className="px-2.5 py-1 rounded-[4px] text-[10px] font-medium transition-all duration-150 cursor-pointer"
            style={{
              background: filter === f.key ? 'var(--accent-primary)' : 'transparent',
              color: filter === f.key ? '#FFFFFF' : 'var(--text-tertiary)',
              border: `1px solid ${filter === f.key ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Time range */}
      <select
        value={timeRange}
        onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
        className="text-[10px] font-medium px-2 py-1 rounded-[4px] cursor-pointer outline-none"
        style={{
          background: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        {(Object.entries(TIME_LABELS) as [TimeRange, string][]).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
    </div>
  );
}
