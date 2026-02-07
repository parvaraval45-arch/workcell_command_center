'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Pause, RotateCcw, OctagonX, Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';
import { cn } from '@/lib/utils';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { showToast } from '@/components/ui/Toast';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { AnimatedStatusDot, AnimatedStatusText, StatusIcon } from '@/components/ui/StatusTransition';
import type { SystemStatus } from '@/lib/types';

// ─── Status Config ──────────────────────────────────────────────

interface StatusConfig {
  color: string;
  bg: string;
  glow: string;
  borderColor: string;
  dotClass: string;
  label: string;
  reason: string;
}

function getStatusConfig(status: SystemStatus, ivmConfidence: number): StatusConfig {
  switch (status) {
    case 'operational':
      return {
        color: 'var(--status-operational)',
        bg: 'var(--status-operational-bg)',
        glow: '0 0 20px rgba(34, 197, 94, 0.15)',
        borderColor: 'rgba(34, 197, 94, 0.25)',
        dotClass: 'status-dot-operational',
        label: 'Operational',
        reason: 'All systems nominal',
      };
    case 'degraded':
      return {
        color: 'var(--status-degraded)',
        bg: 'var(--status-degraded-bg)',
        glow: '0 0 20px rgba(245, 158, 11, 0.2)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        dotClass: 'status-dot-degraded',
        label: 'Degraded',
        reason: ivmConfidence < 0.65
          ? 'IVM confidence below threshold'
          : 'Performance deviation detected',
      };
    case 'stopped':
      return {
        color: 'var(--status-critical)',
        bg: 'var(--status-critical-bg)',
        glow: '0 0 24px rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 0.35)',
        dotClass: 'status-dot-critical',
        label: 'Stopped',
        reason: 'Cycle paused — operator review required',
      };
  }
}

// ─── Uptime Formatter ───────────────────────────────────────────

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

// ─── Mini Sparkline (SVG) ───────────────────────────────────────

function MiniSparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 60;
  const h = 24;
  const pad = 2;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg width={w} height={h} className="shrink-0" viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="var(--accent-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Endpoint dot */}
      {values.length > 0 && (() => {
        const lastVal = values[values.length - 1];
        const cx = w - pad;
        const cy = h - pad - ((lastVal - min) / range) * (h - pad * 2);
        return <circle cx={cx} cy={cy} r="2" fill="var(--accent-primary)" />;
      })()}
    </svg>
  );
}

// ─── Mini Progress Ring ─────────────────────────────────────────

function MiniProgressRing({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const r = 14;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (pct / 100) * circ;

  const color = pct >= 75
    ? 'var(--status-operational)'
    : pct >= 50
      ? 'var(--status-degraded)'
      : 'var(--status-critical)';

  return (
    <svg width={36} height={36} className="shrink-0 -rotate-90">
      <circle cx="18" cy="18" r={r} fill="none" stroke="var(--bg-surface)" strokeWidth="3" />
      <circle
        cx="18" cy="18" r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  );
}

// ─── Quick Action Button ────────────────────────────────────────

interface ActionConfig {
  type: 'pause' | 'reset' | 'estop';
  title: string;
  description: string;
  confirmLabel: string;
  danger: boolean;
}

const actionConfigs: Record<string, ActionConfig> = {
  pause: {
    type: 'pause',
    title: 'Pause Workcell?',
    description: 'This will pause the current cycle at the next safe stop point. The robot arm will hold its current position.',
    confirmLabel: 'Pause Cycle',
    danger: false,
  },
  reset: {
    type: 'reset',
    title: 'Reset Workcell?',
    description: 'This will abort the current cycle and return the robot to its home position. Any in-progress work will be discarded.',
    confirmLabel: 'Reset to Home',
    danger: false,
  },
  estop: {
    type: 'estop',
    title: 'Emergency Stop?',
    description: 'This will immediately cut power to all actuators. The robot arm will require a manual restart and re-calibration.',
    confirmLabel: 'E-Stop Now',
    danger: true,
  },
};

// ─── Main Component ─────────────────────────────────────────────

export default function WorkcellHealth() {
  const workcell = useTelemetryStore((s) => s.workcell);
  const production = useTelemetryStore((s) => s.production);
  const skills = useTelemetryStore((s) => s.skills);

  // Live uptime counter at 1s granularity
  const [liveUptime, setLiveUptime] = useState(workcell.uptime);
  const uptimeBase = useRef(workcell.uptime);
  const lastStoreUptime = useRef(workcell.uptime);

  useEffect(() => {
    // Sync base when store uptime changes (tick from store)
    if (workcell.uptime !== lastStoreUptime.current) {
      uptimeBase.current = workcell.uptime;
      lastStoreUptime.current = workcell.uptime;
      setLiveUptime(workcell.uptime);
    }
  }, [workcell.uptime]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (workcell.status !== 'stopped') {
        setLiveUptime((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [workcell.status]);

  // Modal state
  const [modalAction, setModalAction] = useState<ActionConfig | null>(null);

  const handleConfirm = () => {
    if (!modalAction) return;
    const messages: Record<string, string> = {
      pause: 'Workcell paused — cycle will complete at next safe stop',
      reset: 'Workcell reset initiated — returning to home position',
      estop: 'EMERGENCY STOP executed — all actuators powered down',
    };
    const types: Record<string, 'success' | 'warning' | 'info'> = {
      pause: 'info',
      reset: 'warning',
      estop: 'warning',
    };
    showToast(messages[modalAction.type], types[modalAction.type], 4000);
    setModalAction(null);
  };

  // Status config
  const config = getStatusConfig(workcell.status, skills.ivmConfidence);

  // Cycle time sparkline data (last 10 values)
  const sparklineValues = useMemo(
    () => production.cycleTime.history.slice(-10).map((p) => p.value),
    [production.cycleTime.history]
  );

  // BT step info for active skill display
  const btStep = Math.max(1, Math.floor((workcell.skillProgress / 100) * 7));

  // OEE color
  const oeeColor = production.oee.overall >= 75
    ? 'var(--status-operational)'
    : production.oee.overall >= 60
      ? 'var(--status-degraded)'
      : 'var(--status-critical)';

  return (
    <>
      <div
        className="health-strip card relative overflow-hidden transition-all duration-300"
        style={{
          boxShadow: `0 1px 3px rgba(0,0,0,0.3), ${config.glow}`,
          borderColor: config.borderColor,
        }}
      >
        {/* Colored left border accent */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[4px] transition-colors duration-300"
          style={{ background: config.color }}
        />

        <div className="health-grid">
          {/* ── 1. STATUS BANNER ─────────────────────────────────── */}
          <div className="flex items-center gap-4 pl-6 pr-4 py-4">
            <div className="flex flex-col items-start gap-1.5">
              <div className="flex items-center gap-3">
                <AnimatedStatusDot
                  status={workcell.status}
                  dotClass={config.dotClass}
                  color={config.color}
                />
                <StatusIcon status={workcell.status} />
                <AnimatedStatusText
                  text={config.label}
                  color={config.color}
                  className="text-[20px] font-semibold leading-none"
                />
              </div>
              <div className="flex flex-col gap-0.5 pl-[24px]">
                <span
                  className="font-metric text-[12px] transition-colors duration-300"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Uptime: {formatUptime(liveUptime)}
                </span>
                {workcell.status !== 'operational' && (
                  <span
                    className="text-[11px] transition-colors duration-300"
                    style={{ color: config.color, opacity: 0.85 }}
                  >
                    {config.reason}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── DIVIDER ──────────────────────────────────────────── */}
          <div className="w-px self-stretch my-3" style={{ background: 'var(--border-primary)' }} />

          {/* ── 2. ACTIVE SKILL ──────────────────────────────────── */}
          <div className="flex flex-col justify-center px-5 py-4 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <span className="text-[11px] font-medium uppercase tracking-[0.05em]" style={{ color: 'var(--text-tertiary)' }}>
                Active Skill
              </span>
            </div>
            <p
              className="text-[15px] font-semibold truncate mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {workcell.currentSkill}
            </p>
            {/* Shimmer progress bar */}
            <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
              <div
                className="h-full rounded-full shimmer-bar transition-all duration-500 ease-out"
                style={{
                  width: `${workcell.skillProgress}%`,
                  background: workcell.status === 'stopped'
                    ? 'var(--status-critical)'
                    : 'var(--accent-primary)',
                }}
              />
            </div>
            <p className="text-[11px] mt-1.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
              Step {btStep} of 7 — <span className="font-metric">{workcell.skillProgress}%</span> complete
            </p>
          </div>

          {/* ── DIVIDER ──────────────────────────────────────────── */}
          <div className="w-px self-stretch my-3" style={{ background: 'var(--border-primary)' }} />

          {/* ── 3. QUICK METRICS ─────────────────────────────────── */}
          {/* Shift Progress */}
          <div className="flex items-center gap-3 px-4 py-4">
            <MiniProgressRing value={workcell.shiftInfo.completed} max={workcell.shiftInfo.target} />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-medium uppercase tracking-[0.05em]" style={{ color: 'var(--text-tertiary)' }}>
                Shift
              </span>
              <AnimatedNumber
                value={workcell.shiftInfo.completed}
                decimals={0}
                className="text-[20px] font-semibold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              />
              <span className="font-metric text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                / {workcell.shiftInfo.target} units
              </span>
            </div>
          </div>

          {/* Cycle Time */}
          <div className="flex items-center gap-3 px-4 py-4">
            <MiniSparkline values={sparklineValues} />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-medium uppercase tracking-[0.05em]" style={{ color: 'var(--text-tertiary)' }}>
                Cycle
              </span>
              <div className="flex items-baseline gap-1">
                <AnimatedNumber
                  value={production.cycleTime.current}
                  decimals={1}
                  className="text-[20px] font-semibold leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                />
                <span className="font-metric text-[11px]" style={{ color: 'var(--text-tertiary)' }}>s</span>
              </div>
              <div className="flex items-center gap-1">
                {production.cycleTime.current <= production.cycleTime.ideal * 1.05 ? (
                  <TrendingDown size={10} style={{ color: 'var(--status-operational)' }} />
                ) : (
                  <TrendingUp size={10} style={{ color: 'var(--status-degraded)' }} />
                )}
                <span className="font-metric text-[10px]" style={{
                  color: production.cycleTime.current <= production.cycleTime.ideal * 1.05
                    ? 'var(--status-operational)'
                    : 'var(--status-degraded)'
                }}>
                  {((production.cycleTime.current - production.cycleTime.ideal) / production.cycleTime.ideal * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* OEE */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-[4px]"
              style={{ background: 'var(--bg-surface)' }}
            >
              <span className="font-metric text-[11px] font-bold" style={{ color: oeeColor }}>
                OEE
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-medium uppercase tracking-[0.05em]" style={{ color: 'var(--text-tertiary)' }}>
                OEE
              </span>
              <AnimatedNumber
                value={production.oee.overall}
                decimals={1}
                suffix="%"
                className="text-[20px] font-semibold leading-tight"
                style={{ color: oeeColor }}
              />
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                A:{production.oee.availability.toFixed(0)} P:{production.oee.performance.toFixed(0)} Q:{production.oee.quality.toFixed(0)}
              </span>
            </div>
          </div>

          {/* ── DIVIDER ──────────────────────────────────────────── */}
          <div className="w-px self-stretch my-3" style={{ background: 'var(--border-primary)' }} />

          {/* ── 4. QUICK ACTIONS ─────────────────────────────────── */}
          <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-4">
            {/* Pause */}
            <button
              onClick={() => setModalAction(actionConfigs.pause)}
              className="action-btn-ghost group relative focus-ring"
              title="Pause Cycle"
              aria-label="Pause workcell cycle"
            >
              <Pause size={16} />
              <span className="action-tooltip">Pause</span>
            </button>

            {/* Reset */}
            <button
              onClick={() => setModalAction(actionConfigs.reset)}
              className="action-btn-ghost group relative focus-ring"
              title="Reset to Home"
              aria-label="Reset workcell to home position"
            >
              <RotateCcw size={16} />
              <span className="action-tooltip">Reset</span>
            </button>

            {/* E-Stop */}
            <button
              onClick={() => setModalAction(actionConfigs.estop)}
              className="action-btn-estop group relative focus-ring"
              title="Emergency Stop"
              aria-label="Emergency stop all actuators"
            >
              <OctagonX size={18} />
              <span className="action-tooltip action-tooltip-danger">E-Stop</span>
            </button>
          </div>
        </div>

        {/* Stopped overlay — dims rest of strip subtly */}
        {workcell.status === 'stopped' && (
          <div
            className="absolute inset-0 pointer-events-none rounded-[6px] transition-opacity duration-300"
            style={{
              background: 'linear-gradient(90deg, transparent 280px, rgba(239, 68, 68, 0.03) 280px)',
            }}
          />
        )}
      </div>

      {/* Confirmation modal */}
      <ConfirmModal
        open={modalAction !== null}
        title={modalAction?.title ?? ''}
        description={modalAction?.description ?? ''}
        confirmLabel={modalAction?.confirmLabel ?? 'Confirm'}
        danger={modalAction?.danger ?? false}
        onConfirm={handleConfirm}
        onCancel={() => setModalAction(null)}
      />
    </>
  );
}
