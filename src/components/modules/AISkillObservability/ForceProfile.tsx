'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';

const FORCE_LIMIT = 35;

interface ChartPoint {
  idx: number;
  time: string;
  force: number;
  threshold: number;
  overThreshold: number | null;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartPoint }> }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const isOver = d.force > FORCE_LIMIT;

  return (
    <div
      className="rounded-[4px] px-3 py-2"
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-accent)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <p className="font-metric text-[12px] mb-0.5" style={{ color: isOver ? 'var(--status-critical)' : 'var(--text-primary)' }}>
        {d.force.toFixed(1)} N
      </p>
      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{d.time}</p>
      {isOver && (
        <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--status-critical)' }}>
          Exceeds force limit
        </p>
      )}
    </div>
  );
}

export default function ForceProfile() {
  const forceProfile = useTelemetryStore((s) => s.skills.forceProfile);

  const currentForce = forceProfile.length > 0 ? forceProfile[forceProfile.length - 1].force : 0;
  const isOverThreshold = currentForce > FORCE_LIMIT;

  const data = useMemo((): ChartPoint[] => {
    return forceProfile.map((p, i) => ({
      idx: i + 1,
      time: p.time,
      force: p.force,
      threshold: p.threshold,
      overThreshold: p.force > FORCE_LIMIT ? p.force : null,
    }));
  }, [forceProfile]);

  return (
    <div className="card p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[13px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Force Profile (Z-axis)
        </h3>
        <div className="flex items-center gap-3">
          {isOverThreshold && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-[4px]"
              style={{ background: 'var(--status-critical-bg)' }}
            >
              <AlertTriangle size={11} style={{ color: 'var(--status-critical)' }} />
              <span className="text-[10px] font-medium" style={{ color: 'var(--status-critical)' }}>
                Check Alignment
              </span>
            </div>
          )}
          <span
            className="font-metric text-[14px] font-semibold"
            style={{ color: isOverThreshold ? 'var(--status-critical)' : 'var(--text-primary)' }}
          >
            {currentForce.toFixed(1)}N
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
            <defs>
              <linearGradient id="forceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0066FF" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#0066FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forceOverGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--border-primary)"
              strokeOpacity={0.2}
              vertical={false}
            />
            <XAxis
              dataKey="idx"
              tick={{ fontSize: 9, fill: '#64748B', fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              interval={14}
            />
            <YAxis
              domain={[0, 50]}
              tick={{ fontSize: 9, fill: '#64748B', fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={32}
              tickFormatter={(v: number) => `${v}N`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--border-accent)', strokeWidth: 1 }}
            />
            <ReferenceLine
              y={FORCE_LIMIT}
              stroke="var(--status-critical)"
              strokeDasharray="6 3"
              strokeWidth={1}
              strokeOpacity={0.7}
              label={{
                value: 'Force Limit',
                position: 'right',
                fill: 'var(--status-critical)',
                fontSize: 9,
                fontFamily: 'var(--font-mono)',
              }}
            />
            <Area
              type="monotone"
              dataKey="force"
              stroke="var(--accent-primary)"
              strokeWidth={1.5}
              fill="url(#forceGradient)"
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="overThreshold"
              stroke="var(--status-critical)"
              strokeWidth={0}
              fill="url(#forceOverGradient)"
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded" style={{ background: 'var(--accent-primary)' }} />
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Z-axis Force</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded" style={{ background: 'var(--status-critical)', borderTop: '1px dashed var(--status-critical)' }} />
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Limit ({FORCE_LIMIT}N)</span>
        </div>
      </div>
    </div>
  );
}
