'use client';

import { BarChart3 } from 'lucide-react';
import OEEGauge from './OEEGauge';
import ProductionCounter from './ProductionCounter';
import CostSavings from './CostSavings';
import CycleTimeTrend from './CycleTimeTrend';
import ShiftComparison from './ShiftComparison';

export default function ProductionMetrics() {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} style={{ color: 'var(--chart-primary)' }} />
          <h2
            className="text-[14px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-primary)' }}
          >
            Production Metrics
          </h2>
        </div>
        <div className="flex-1 h-px" style={{ background: 'var(--chart-primary)', opacity: 0.3 }} />
      </div>

      {/* 3-column grid — CycleTimeTrend spans 2 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <OEEGauge />
        <ProductionCounter />
        <CostSavings />
        <CycleTimeTrend />
        <ShiftComparison />
      </div>
    </section>
  );
}
