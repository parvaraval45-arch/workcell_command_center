'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';

// Simulated "previous shift" baselines (static, slightly worse)
const prevShift = {
  oee: 79.8,
  throughput: 44,
  avgCycleTime: 13.6,
};

interface ComparisonRowProps {
  label: string;
  current: number;
  previous: number;
  unit: string;
  lowerIsBetter?: boolean;
  isEven: boolean;
}

function ComparisonRow({ label, current, previous, unit, lowerIsBetter = false, isEven }: ComparisonRowProps) {
  const diff = current - previous;
  const pctChange = ((diff / Math.abs(previous)) * 100).toFixed(1);
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  const color = improved ? 'var(--status-operational)' : 'var(--status-critical)';
  const Icon = improved ? TrendingUp : TrendingDown;

  return (
    <div
      className="flex items-center px-4 py-3"
      style={{ background: isEven ? 'var(--bg-secondary)' : 'var(--bg-tertiary)' }}
    >
      <span className="text-[12px] flex-1" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span className="font-metric text-[14px] font-semibold w-20 text-right" style={{ color: 'var(--text-primary)' }}>
        {current.toFixed(1)}{unit}
      </span>
      <div className="flex items-center gap-1 w-24 justify-end">
        <Icon size={12} style={{ color }} />
        <span className="font-metric text-[11px] font-medium" style={{ color }}>
          {diff > 0 ? '+' : ''}{pctChange}%
        </span>
      </div>
    </div>
  );
}

export default function ShiftComparison() {
  const oee = useTelemetryStore((s) => s.production.oee.overall);
  const throughput = useTelemetryStore((s) => s.production.throughput.unitsPerHour);
  const cycleTime = useTelemetryStore((s) => s.production.cycleTime.current);

  return (
    <div className="card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3
          className="text-[13px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Shift Comparison
        </h3>
        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          vs. previous shift
        </span>
      </div>

      {/* Table header */}
      <div className="flex items-center px-4 py-2" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <span className="text-[10px] font-medium uppercase tracking-wider flex-1" style={{ color: 'var(--text-tertiary)' }}>
          Metric
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider w-20 text-right" style={{ color: 'var(--text-tertiary)' }}>
          Current
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider w-24 text-right" style={{ color: 'var(--text-tertiary)' }}>
          Change
        </span>
      </div>

      {/* Rows */}
      <ComparisonRow
        label="OEE"
        current={oee}
        previous={prevShift.oee}
        unit="%"
        isEven={false}
      />
      <ComparisonRow
        label="Throughput"
        current={throughput}
        previous={prevShift.throughput}
        unit=" UPH"
        isEven={true}
      />
      <ComparisonRow
        label="Avg Cycle Time"
        current={cycleTime}
        previous={prevShift.avgCycleTime}
        unit="s"
        lowerIsBetter
        isEven={false}
      />

      {/* Footer summary */}
      <div className="px-4 py-3 mt-auto" style={{ borderTop: '1px solid var(--border-primary)' }}>
        {oee > prevShift.oee && throughput > prevShift.throughput ? (
          <span className="text-[11px]" style={{ color: 'var(--status-operational)' }}>
            Current shift outperforming previous across all metrics
          </span>
        ) : oee < prevShift.oee && throughput < prevShift.throughput ? (
          <span className="text-[11px]" style={{ color: 'var(--status-critical)' }}>
            Current shift underperforming — review operational parameters
          </span>
        ) : (
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            Mixed performance — some metrics above, some below baseline
          </span>
        )}
      </div>
    </div>
  );
}
