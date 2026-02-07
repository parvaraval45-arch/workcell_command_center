'use client';

import { useEffect, useState } from 'react';
import { useTelemetryStore } from '@/store/telemetryStore';

// ─── Component Status Dots ───────────────────────────────────

function StatusDot({ status }: { status: 'ok' | 'warn' | 'error' }) {
  const color =
    status === 'ok' ? 'var(--status-operational)'
    : status === 'warn' ? 'var(--status-degraded)'
    : 'var(--status-critical)';

  return (
    <circle r="3" fill={color} opacity={0.9}>
      {status === 'ok' && (
        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite" />
      )}
    </circle>
  );
}

// ─── Main Schematic Component ────────────────────────────────

export default function WorkcellSchematic() {
  const workcellStatus = useTelemetryStore((s) => s.workcell.status);
  const skillProgress = useTelemetryStore((s) => s.workcell.skillProgress);
  const currentSkill = useTelemetryStore((s) => s.workcell.currentSkill);

  // Animate robot arm rotation based on skill progress
  const [armAngle, setArmAngle] = useState(0);
  useEffect(() => {
    // Map skill progress (0-100) to arm sweep (-30 to 30 degrees)
    const targetAngle = -30 + (skillProgress / 100) * 60;
    setArmAngle(targetAngle);
  }, [skillProgress]);

  const isOk = workcellStatus === 'operational';
  const isDegraded = workcellStatus === 'degraded';

  // Active zone pulse color
  const activeColor = isOk ? 'var(--accent-primary)' : isDegraded ? 'var(--status-degraded)' : 'var(--status-critical)';

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <h3
          className="text-[12px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Workcell Layout
        </h3>
        <span
          className="font-metric text-[10px]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Top-down schematic
        </span>
      </div>

      {/* Schematic viewport */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: '16 / 9',
          background: '#060A12',
        }}
      >
        <svg
          viewBox="0 0 640 360"
          className="w-full h-full"
          style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="schematic-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1E293B" strokeWidth="0.5" />
            </pattern>
            {/* Active zone glow */}
            <radialGradient id="active-glow" cx="50%" cy="50%">
              <stop offset="0%" stopColor={activeColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={activeColor} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="640" height="360" fill="url(#schematic-grid)" />

          {/* ── Work Surface ─────────────────────────────── */}
          <rect x="180" y="80" width="280" height="200" rx="4"
            fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 2" />
          <text x="320" y="290" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="500">
            WORK SURFACE
          </text>

          {/* ── Gripper Zone (active area) ────────────────── */}
          <rect x="260" y="130" width="120" height="100" rx="3"
            fill="url(#active-glow)" stroke={activeColor} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" />
          </rect>
          <text x="320" y="188" textAnchor="middle" fill={activeColor} fontSize="8" opacity="0.7">
            ACTIVE ZONE
          </text>

          {/* ── Robot Arm (articulated, animated) ─────────── */}
          <g transform={`translate(320, 180)`}>
            {/* Base circle */}
            <circle cx="0" cy="0" r="18" fill="none" stroke="#64748B" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="6" fill="#334155" stroke="#64748B" strokeWidth="1" />

            {/* Arm segments — rotate based on skill progress */}
            <g style={{ transform: `rotate(${armAngle}deg)`, transformOrigin: '0 0', transition: 'transform 1s ease-in-out' }}>
              {/* Lower arm */}
              <line x1="0" y1="0" x2="-35" y2="-55" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
              <circle cx="-35" cy="-55" r="4" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />

              {/* Upper arm */}
              <line x1="-35" y1="-55" x2="10" y2="-95" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="10" cy="-95" r="3.5" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />

              {/* End effector / gripper */}
              <line x1="10" y1="-95" x2="3" y2="-110" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="-95" x2="17" y2="-110" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Label */}
            <text x="0" y="32" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="600">
              UR5e
            </text>
            <g transform="translate(0, 22)">
              <StatusDot status={isOk ? 'ok' : isDegraded ? 'warn' : 'error'} />
            </g>
          </g>

          {/* ── Tray A (left) ─────────────────────────────── */}
          <rect x="50" y="110" width="90" height="60" rx="3"
            fill="none" stroke="#475569" strokeWidth="1" />
          <text x="95" y="145" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="500">
            TRAY A
          </text>
          <text x="95" y="157" textAnchor="middle" fill="#64748B" fontSize="7">
            Input Parts
          </text>
          <g transform="translate(50, 110)">
            <StatusDot status="ok" />
          </g>

          {/* ── Tray B (right) ────────────────────────────── */}
          <rect x="500" y="110" width="90" height="60" rx="3"
            fill="none" stroke="#475569" strokeWidth="1" />
          <text x="545" y="145" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="500">
            TRAY B
          </text>
          <text x="545" y="157" textAnchor="middle" fill="#64748B" fontSize="7">
            Output
          </text>
          <g transform="translate(500, 110)">
            <StatusDot status="ok" />
          </g>

          {/* ── Camera 1 (top-left FOV trapezoid) ─────────── */}
          <g transform="translate(170, 40)">
            {/* Camera body */}
            <rect x="-8" y="-6" width="16" height="12" rx="2"
              fill="#1E293B" stroke="#64748B" strokeWidth="1" />
            {/* FOV cone */}
            <polygon points="0,8 -60,80 60,80"
              fill="rgba(0, 102, 255, 0.04)" stroke="rgba(0, 102, 255, 0.15)" strokeWidth="0.5" strokeDasharray="3 2" />
            <text x="0" y="-12" textAnchor="middle" fill="#64748B" fontSize="7" fontWeight="600">
              Basler CAM-01
            </text>
            <g transform="translate(12, 0)">
              <StatusDot status="ok" />
            </g>
          </g>

          {/* ── Camera 2 (top-right) ──────────────────────── */}
          <g transform="translate(470, 40)">
            <rect x="-8" y="-6" width="16" height="12" rx="2"
              fill="#1E293B" stroke="#64748B" strokeWidth="1" />
            <polygon points="0,8 -60,80 60,80"
              fill="rgba(0, 102, 255, 0.04)" stroke="rgba(0, 102, 255, 0.15)" strokeWidth="0.5" strokeDasharray="3 2" />
            <text x="0" y="-12" textAnchor="middle" fill="#64748B" fontSize="7" fontWeight="600">
              Basler CAM-02
            </text>
            <g transform="translate(12, 0)">
              <StatusDot status="ok" />
            </g>
          </g>

          {/* ── Force/Torque Sensor ───────────────────────── */}
          <g transform="translate(320, 250)">
            <rect x="-30" y="-8" width="60" height="16" rx="2"
              fill="none" stroke="#475569" strokeWidth="0.8" />
            <text x="0" y="3" textAnchor="middle" fill="#64748B" fontSize="7">
              F/T Sensor
            </text>
            <g transform="translate(34, 0)">
              <StatusDot status={isOk ? 'ok' : 'warn'} />
            </g>
          </g>

          {/* ── Robotiq Hand-E (gripper label) ────────────── */}
          <g transform="translate(320, 60)">
            <rect x="-38" y="-8" width="76" height="16" rx="2"
              fill="none" stroke="#475569" strokeWidth="0.8" />
            <text x="0" y="3" textAnchor="middle" fill="#64748B" fontSize="7">
              Robotiq Hand-E
            </text>
            <g transform="translate(42, 0)">
              <StatusDot status="ok" />
            </g>
          </g>

          {/* ── Safety Controller ─────────────────────────── */}
          <g transform="translate(555, 310)">
            <rect x="-35" y="-8" width="70" height="16" rx="2"
              fill="none" stroke="#475569" strokeWidth="0.8" />
            <text x="0" y="3" textAnchor="middle" fill="#64748B" fontSize="7">
              Safety Controller
            </text>
            <g transform="translate(38, 0)">
              <StatusDot status="ok" />
            </g>
          </g>

          {/* ── Legend ─────────────────────────────────────── */}
          <g transform="translate(30, 320)">
            <circle cx="0" cy="0" r="3" fill="var(--status-operational)" opacity="0.8" />
            <text x="8" y="3" fill="#64748B" fontSize="7">Healthy</text>
            <circle cx="55" cy="0" r="3" fill="var(--status-degraded)" opacity="0.8" />
            <text x="63" y="3" fill="#64748B" fontSize="7">Degraded</text>
            <circle cx="120" cy="0" r="3" fill="var(--status-critical)" opacity="0.8" />
            <text x="128" y="3" fill="#64748B" fontSize="7">Fault</text>
          </g>

          {/* Scale reference */}
          <g transform="translate(30, 345)">
            <line x1="0" y1="0" x2="64" y2="0" stroke="#475569" strokeWidth="0.5" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#475569" strokeWidth="0.5" />
            <line x1="64" y1="-3" x2="64" y2="3" stroke="#475569" strokeWidth="0.5" />
            <text x="32" y="-5" textAnchor="middle" fill="#475569" fontSize="7">1 m</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
