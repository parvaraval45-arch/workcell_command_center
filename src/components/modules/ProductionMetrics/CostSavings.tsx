'use client';

import { Clock, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

export default function CostSavings() {
  const costSavings = useTelemetryStore((s) => s.production.costSavings);

  const laborRate = 100;
  const manualHoursEquivalent = costSavings.hoursSaved * 3.2;
  const speedMultiplier = (manualHoursEquivalent / Math.max(costSavings.hoursSaved, 0.1)).toFixed(1);

  return (
    <div className="card p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[13px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Automation ROI
        </h3>
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-[4px]"
          style={{ background: 'var(--status-operational-bg)' }}
        >
          <TrendingUp size={12} style={{ color: 'var(--status-operational)' }} />
          <span className="text-[11px] font-medium" style={{ color: 'var(--status-operational)' }}>
            Saving
          </span>
        </div>
      </div>

      {/* Hours saved */}
      <div
        className="flex items-center gap-4 p-4 rounded-[4px] mb-3"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-[4px] shrink-0"
          style={{ background: 'var(--accent-muted)' }}
        >
          <Clock size={18} style={{ color: 'var(--accent-primary)' }} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-medium uppercase tracking-[0.05em]" style={{ color: 'var(--text-tertiary)' }}>
            Hours Saved
          </span>
          <div className="flex items-baseline gap-1.5">
            <AnimatedNumber
              value={costSavings.hoursSaved}
              decimals={1}
              className="text-[24px] font-bold leading-none"
              style={{ color: 'var(--text-primary)' }}
            />
            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>hrs</span>
          </div>
        </div>
      </div>

      {/* Cost reduction */}
      <div
        className="flex items-center gap-4 p-4 rounded-[4px] mb-4"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-[4px] shrink-0"
          style={{ background: 'var(--status-operational-bg)' }}
        >
          <DollarSign size={18} style={{ color: 'var(--status-operational)' }} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-medium uppercase tracking-[0.05em]" style={{ color: 'var(--text-tertiary)' }}>
            Cost Reduction
          </span>
          <div className="flex items-baseline gap-1.5">
            <AnimatedNumber
              value={costSavings.dollarsSaved}
              decimals={0}
              prefix="$"
              className="text-[24px] font-bold leading-none"
              style={{ color: 'var(--status-operational)' }}
            />
          </div>
        </div>
      </div>

      {/* Speed comparison */}
      <div
        className="flex items-center gap-3 p-3 rounded-[4px]"
        style={{ border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}
      >
        <Zap size={14} style={{ color: 'var(--chart-tertiary)', flexShrink: 0 }} />
        <div className="flex flex-col">
          <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            vs. manual benchmark: <span className="font-metric font-semibold" style={{ color: 'var(--chart-tertiary)' }}>{speedMultiplier}x</span> faster
          </span>
          <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            Based on ${laborRate}/hr labor rate
          </span>
        </div>
      </div>
    </div>
  );
}
