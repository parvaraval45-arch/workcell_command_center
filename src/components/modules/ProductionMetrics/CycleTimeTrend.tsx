'use client';

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
  Area, ComposedChart,
} from 'recharts';
import { useTelemetryStore } from '@/store/telemetryStore';

interface ChartPoint {
  idx: number;
  time: string;
  value: number;
  ideal: number;
  isOutlier: boolean;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartPoint }> }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const deviation = (((d.value - d.ideal) / d.ideal) * 100).toFixed(1);
  const devColor = d.value <= d.ideal * 1.05 ? 'var(--status-operational)' : d.value >= d.ideal * 1.15 ? 'var(--status-critical)' : 'var(--status-degraded)';

  return (
    <div
      className="rounded-[4px] px-3 py-2"
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-accent)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <p className="font-metric text-[12px] mb-1" style={{ color: 'var(--text-primary)' }}>
        {d.value.toFixed(1)}s
      </p>
      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
        {d.time}
      </p>
      <p className="text-[10px] mt-1" style={{ color: devColor }}>
        {Number(deviation) > 0 ? '+' : ''}{deviation}% from ideal
      </p>
      {d.isOutlier && (
        <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--status-critical)' }}>
          ⚠ Outlier detected
        </p>
      )}
    </div>
  );
}

function OutlierDot(props: { cx?: number; cy?: number; payload?: ChartPoint }) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload?.isOutlier) return null;
  return (
    <circle cx={cx} cy={cy} r={4} fill="var(--status-critical)" stroke="var(--bg-secondary)" strokeWidth={2} />
  );
}

export default function CycleTimeTrend() {
  const history = useTelemetryStore((s) => s.production.cycleTime.history);
  const ideal = useTelemetryStore((s) => s.production.cycleTime.ideal);

  const data = useMemo(() => {
    // Calculate rolling mean and stddev
    const values = history.map((h) => h.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    const stddev = Math.sqrt(variance);

    return history.map((h, i): ChartPoint => ({
      idx: i + 1,
      time: h.time,
      value: h.value,
      ideal,
      isOutlier: Math.abs(h.value - mean) > 2 * stddev,
    }));
  }, [history, ideal]);

  const yMin = Math.floor(Math.min(...data.map((d) => d.value), ideal) - 1);
  const yMax = Math.ceil(Math.max(...data.map((d) => d.value), ideal) + 1);

  return (
    <div className="card p-5 flex flex-col lg:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[13px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cycle Time Trend
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded" style={{ background: 'var(--accent-primary)' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded" style={{ background: 'var(--text-tertiary)', borderTop: '1px dashed var(--text-tertiary)' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Ideal ({ideal}s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--status-critical)' }} />
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Outlier</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
            <defs>
              <linearGradient id="ctGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0066FF" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#0066FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--border-primary)"
              strokeOpacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="idx"
              tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              interval={9}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={35}
              tickFormatter={(v: number) => `${v}s`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'var(--border-accent)', strokeWidth: 1 }}
            />
            <ReferenceLine
              y={ideal}
              stroke="var(--text-tertiary)"
              strokeDasharray="6 3"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="value"
              fill="url(#ctGradient)"
              stroke="none"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--accent-primary)"
              strokeWidth={2}
              dot={<OutlierDot />}
              activeDot={{ r: 4, fill: 'var(--accent-primary)', stroke: 'var(--bg-secondary)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
