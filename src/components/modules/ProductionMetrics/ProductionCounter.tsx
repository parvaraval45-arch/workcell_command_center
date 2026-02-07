'use client';

import { useMemo } from 'react';
import { AreaChart, Area, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

export default function ProductionCounter() {
  const shiftInfo = useTelemetryStore((s) => s.workcell.shiftInfo);
  const throughput = useTelemetryStore((s) => s.production.throughput);

  const { completed, target } = shiftInfo;
  const pct = Math.min((completed / target) * 100, 100);

  // Calculate pace
  const now = new Date();
  const shiftStart = new Date(shiftInfo.startTime);
  const elapsedHrs = Math.max((now.getTime() - shiftStart.getTime()) / 3_600_000, 0.1);
  const shiftDurationHrs = 8;
  const expectedByNow = (elapsedHrs / shiftDurationHrs) * target;
  const paceRatio = completed / Math.max(expectedByNow, 1);

  const pace = paceRatio >= 1.05 ? 'ahead' : paceRatio >= 0.95 ? 'on-pace' : 'behind';
  const paceConfig = {
    'ahead': { label: 'Ahead', color: 'var(--status-operational)', bg: 'var(--status-operational-bg)', icon: TrendingUp },
    'on-pace': { label: 'On Pace', color: 'var(--status-info)', bg: 'var(--accent-muted)', icon: Minus },
    'behind': { label: 'Behind', color: 'var(--status-critical)', bg: 'var(--status-critical-bg)', icon: TrendingDown },
  }[pace];

  // Projected completion time
  const ratePerHr = completed / elapsedHrs;
  const remaining = target - completed;
  const hoursToComplete = ratePerHr > 0 ? remaining / ratePerHr : Infinity;
  const projectedTime = new Date(now.getTime() + hoursToComplete * 3_600_000);
  const projectedStr = hoursToComplete < 24
    ? projectedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '—';

  // Build sparkline data: cumulative production over simulated shift
  const sparklineData = useMemo(() => {
    const points = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const hrs = t * elapsedHrs;
      const actual = Math.round(t * completed);
      const targetLine = Math.round((hrs / shiftDurationHrs) * target);
      const label = `${hrs.toFixed(1)}h`;
      points.push({ name: label, actual, target: targetLine });
    }
    return points;
  }, [completed, target, elapsedHrs, shiftDurationHrs]);

  const PaceIcon = paceConfig.icon;

  const barColor = pct >= 80
    ? 'var(--status-operational)'
    : pct >= 50
      ? 'var(--accent-primary)'
      : 'var(--status-degraded)';

  return (
    <div className="card p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-[13px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Shift Production
        </h3>
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium"
          style={{ background: paceConfig.bg, color: paceConfig.color }}
        >
          <PaceIcon size={12} />
          {paceConfig.label}
        </div>
      </div>

      {/* Big number */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <AnimatedNumber
          value={completed}
          decimals={0}
          className="text-[28px] font-bold leading-none"
          style={{ color: 'var(--text-primary)' }}
        />
        <span className="font-metric text-[16px]" style={{ color: 'var(--text-tertiary)' }}>
          / {target}
        </span>
        <span className="text-[11px] ml-1" style={{ color: 'var(--text-tertiary)' }}>units</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-[8px] rounded-full overflow-hidden mb-2" style={{ background: 'var(--bg-surface)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      {/* Projected completion */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          Projected completion: <span className="font-metric" style={{ color: 'var(--text-secondary)' }}>{projectedStr}</span>
        </span>
        <span className="font-metric text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          {throughput.unitsPerHour} UPH
        </span>
      </div>

      {/* Sparkline */}
      <div className="flex-1 min-h-[100px]">
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={sparklineData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0066FF" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#0066FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <ReferenceLine
              stroke="var(--text-tertiary)"
              strokeDasharray="4 4"
              strokeWidth={1}
              segment={[
                { x: sparklineData[0]?.name, y: 0 },
                { x: sparklineData[sparklineData.length - 1]?.name, y: target },
              ]}
              ifOverflow="extendDomain"
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="var(--text-tertiary)"
              strokeDasharray="4 4"
              strokeWidth={1}
              fill="none"
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="var(--accent-primary)"
              strokeWidth={2}
              fill="url(#prodGradient)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
