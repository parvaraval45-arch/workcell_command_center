'use client';

import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

// Threshold constants
const HIGH_THRESHOLD = 0.85;
const LOW_THRESHOLD = 0.65;

function getConfidenceColor(val: number): string {
  if (val >= HIGH_THRESHOLD) return 'var(--status-operational)';
  if (val >= LOW_THRESHOLD) return 'var(--status-degraded)';
  return 'var(--status-critical)';
}

function getConfidenceGlow(val: number): string {
  if (val >= HIGH_THRESHOLD) return 'rgba(34, 197, 94, 0.4)';
  if (val >= LOW_THRESHOLD) return 'rgba(245, 158, 11, 0.4)';
  return 'rgba(239, 68, 68, 0.4)';
}

function getConfidenceLabel(val: number): string {
  if (val >= HIGH_THRESHOLD) return 'High Confidence';
  if (val >= LOW_THRESHOLD) return 'Reduced Confidence';
  return 'Verification Required';
}

export default function IVMConfidenceMonitor() {
  const confidence = useTelemetryStore((s) => s.skills.ivmConfidence);
  const history = useTelemetryStore((s) => s.skills.ivmConfidenceHistory);

  const color = getConfidenceColor(confidence);
  const glow = getConfidenceGlow(confidence);
  const label = getConfidenceLabel(confidence);
  const isLow = confidence < LOW_THRESHOLD;
  const isMedium = confidence >= LOW_THRESHOLD && confidence < HIGH_THRESHOLD;

  // Thermometer marker position (0-100%)
  const markerPct = Math.min(Math.max((confidence / 1.0) * 100, 0), 100);

  // Sparkline data as SVG path
  const sparkline = useMemo(() => {
    if (history.length < 2) return null;
    const w = 280;
    const h = 40;
    const vals = history.map((p) => p.value);
    const min = Math.min(...vals, 0.5);
    const max = Math.max(...vals, 1.0);
    const range = max - min || 0.1;

    const points = vals.map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    });

    return {
      path: `M${points.join(' L')}`,
      area: `M0,${h} L${points.join(' L')} L${w},${h} Z`,
      w,
      h,
      // Reference lines
      highY: h - ((HIGH_THRESHOLD - min) / range) * h,
      lowY: h - ((LOW_THRESHOLD - min) / range) * h,
    };
  }, [history]);

  return (
    <div
      className="card p-5 flex flex-col"
      style={{
        borderColor: isLow ? 'var(--status-critical)' : isMedium ? 'var(--status-degraded)' : undefined,
        animation: isLow ? 'ivm-border-flash 1.5s ease-in-out infinite' : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[13px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          IVM Confidence
        </h3>
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-[4px]"
          style={{
            background: isLow ? 'var(--status-critical-bg)' : isMedium ? 'var(--status-degraded-bg)' : 'var(--status-operational-bg)',
            color,
          }}
        >
          {label}
        </span>
      </div>

      {/* Verification required banner */}
      {isLow && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-[4px] mb-4"
          style={{
            background: 'var(--status-critical-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <AlertTriangle size={14} style={{ color: 'var(--status-critical)', flexShrink: 0 }} />
          <span className="text-[11px] font-medium" style={{ color: 'var(--status-critical)' }}>
            Verification Required — Confidence below threshold
          </span>
        </div>
      )}

      {/* Hero metric */}
      <div className="flex items-center justify-center py-4">
        <AnimatedNumber
          value={confidence}
          decimals={2}
          className={`text-[36px] font-bold leading-none transition-colors duration-300 ${isLow ? 'ivm-shake' : ''}`}
          style={{ color }}
        />
      </div>

      {/* Thermometer gauge */}
      <div className="mb-5">
        <div className="relative h-[10px] rounded-full overflow-hidden flex">
          {/* Red zone: 0–65% */}
          <div
            className="h-full"
            style={{ width: `${LOW_THRESHOLD * 100}%`, background: 'var(--status-critical)', opacity: 0.3 }}
          />
          {/* Amber zone: 65–85% */}
          <div
            className="h-full"
            style={{ width: `${(HIGH_THRESHOLD - LOW_THRESHOLD) * 100}%`, background: 'var(--status-degraded)', opacity: 0.3 }}
          />
          {/* Green zone: 85–100% */}
          <div
            className="h-full"
            style={{ width: `${(1 - HIGH_THRESHOLD) * 100}%`, background: 'var(--status-operational)', opacity: 0.3 }}
          />
          {/* Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full border-2 transition-all duration-500"
            style={{
              left: `${markerPct}%`,
              transform: `translate(-50%, -50%)`,
              background: color,
              borderColor: 'var(--bg-secondary)',
              boxShadow: `0 0 8px ${glow}`,
            }}
          />
        </div>
        {/* Threshold labels */}
        <div className="relative h-4 mt-1">
          <span
            className="absolute text-[9px] font-metric"
            style={{ left: `${LOW_THRESHOLD * 100}%`, transform: 'translateX(-50%)', color: 'var(--text-tertiary)' }}
          >
            0.65
          </span>
          <span
            className="absolute text-[9px] font-metric"
            style={{ left: `${HIGH_THRESHOLD * 100}%`, transform: 'translateX(-50%)', color: 'var(--text-tertiary)' }}
          >
            0.85
          </span>
        </div>
      </div>

      {/* Sparkline */}
      {sparkline && (
        <div className="mt-auto">
          <span className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>
            Trend (last 30 readings)
          </span>
          <svg viewBox={`0 0 ${sparkline.w} ${sparkline.h}`} className="w-full" style={{ height: 40 }}>
            {/* Threshold reference lines */}
            <line
              x1={0} y1={sparkline.highY} x2={sparkline.w} y2={sparkline.highY}
              stroke="var(--status-operational)" strokeDasharray="4 3" strokeWidth={0.5} strokeOpacity={0.4}
            />
            <line
              x1={0} y1={sparkline.lowY} x2={sparkline.w} y2={sparkline.lowY}
              stroke="var(--status-critical)" strokeDasharray="4 3" strokeWidth={0.5} strokeOpacity={0.4}
            />
            {/* Area fill */}
            <path d={sparkline.area} fill={color} fillOpacity={0.08} />
            {/* Line */}
            <path d={sparkline.path} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
            {/* Current value dot */}
            <circle
              cx={sparkline.w}
              cy={sparkline.h - ((confidence - Math.min(...history.map((p) => p.value), 0.5)) / (Math.max(...history.map((p) => p.value), 1.0) - Math.min(...history.map((p) => p.value), 0.5) || 0.1)) * sparkline.h}
              r={3}
              fill={color}
              stroke="var(--bg-secondary)"
              strokeWidth={1.5}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
