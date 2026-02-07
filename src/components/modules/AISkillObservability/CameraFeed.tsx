'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTelemetryStore } from '@/store/telemetryStore';

// ─── Bounding Box Types ──────────────────────────────────────

interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  x: number; // % from left
  y: number; // % from top
  w: number; // % width
  h: number; // % height
  visible: boolean;
  fadeIn: boolean;
}

function getBoxColor(conf: number): string {
  if (conf >= 0.85) return 'var(--status-operational)';
  if (conf >= 0.65) return 'var(--status-degraded)';
  return 'var(--status-critical)';
}

// ─── Component ───────────────────────────────────────────────

export default function CameraFeed() {
  const ivmConfidence = useTelemetryStore((s) => s.skills.ivmConfidence);
  const currentSkill = useTelemetryStore((s) => s.workcell.currentSkill);
  const isSimulating = useTelemetryStore((s) => s.isSimulating);

  // Live timestamp
  const [timestamp, setTimestamp] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const ts = now.toISOString().replace('T', ' ').slice(0, 19);
      setTimestamp(ts);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Animated bounding boxes
  const [boxes, setBoxes] = useState<BoundingBox[]>([
    {
      id: 'connector',
      label: 'Connector C3',
      confidence: 0.92,
      x: 38, y: 32, w: 22, h: 28,
      visible: true,
      fadeIn: false,
    },
    {
      id: 'tray',
      label: 'Server Tray',
      confidence: 0.97,
      x: 8, y: 55, w: 26, h: 32,
      visible: true,
      fadeIn: false,
    },
  ]);

  // Update bounding boxes based on telemetry
  const prevConfRef = useRef(ivmConfidence);
  useEffect(() => {
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id === 'connector') {
          return {
            ...box,
            confidence: parseFloat(Math.max(0.45, Math.min(0.99, ivmConfidence + (Math.random() * 0.06 - 0.03))).toFixed(2)),
            // Slightly jitter position to simulate tracking
            x: 38 + Math.sin(Date.now() / 3000) * 1.5,
            y: 32 + Math.cos(Date.now() / 4000) * 1,
          };
        }
        if (box.id === 'tray') {
          return {
            ...box,
            confidence: parseFloat(Math.max(0.80, Math.min(0.99, 0.95 + (Math.random() * 0.04 - 0.02))).toFixed(2)),
            x: 8 + Math.sin(Date.now() / 5000) * 0.5,
            y: 55 + Math.cos(Date.now() / 6000) * 0.5,
          };
        }
        return box;
      })
    );
    prevConfRef.current = ivmConfidence;
  }, [ivmConfidence]);

  // Periodically toggle a third "detection" box
  const [ephemeralBox, setEphemeralBox] = useState<BoundingBox | null>(null);
  useEffect(() => {
    if (!isSimulating) return;
    let dismissTimer: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.4) {
        setEphemeralBox({
          id: 'ephemeral',
          label: roll < 0.2 ? 'Gripper' : 'PCB Board',
          confidence: parseFloat((0.7 + Math.random() * 0.25).toFixed(2)),
          x: 55 + Math.random() * 15,
          y: 20 + Math.random() * 20,
          w: 14 + Math.random() * 6,
          h: 16 + Math.random() * 8,
          visible: true,
          fadeIn: true,
        });
        if (dismissTimer) clearTimeout(dismissTimer);
        dismissTimer = setTimeout(() => setEphemeralBox(null), 2500 + Math.random() * 2000);
      }
    }, 4000);
    return () => {
      clearInterval(interval);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [isSimulating]);

  const allBoxes = useMemo(() => {
    const result = [...boxes.filter((b) => b.visible)];
    if (ephemeralBox) result.push(ephemeralBox);
    return result;
  }, [boxes, ephemeralBox]);

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <h3
          className="text-[12px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Camera Feed
        </h3>
        <span
          className="font-metric text-[10px]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {currentSkill}
        </span>
      </div>

      {/* Camera viewport */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '16 / 9',
          background: '#080C14',
        }}
      >
        {/* Grid overlay — simulates workcell floor */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.08 }}>
          <defs>
            <pattern id="cam-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94A3B8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cam-grid)" />
        </svg>

        {/* Stylized robot arm (SVG) */}
        <svg
          className="absolute"
          style={{ left: '28%', top: '15%', width: '44%', height: '70%', opacity: 0.12 }}
          viewBox="0 0 200 200"
          fill="none"
        >
          {/* Base */}
          <circle cx="100" cy="170" r="25" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="100" cy="170" r="8" fill="#94A3B8" fillOpacity="0.3" />
          {/* Lower arm */}
          <line x1="100" y1="170" x2="65" y2="100" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Joint */}
          <circle cx="65" cy="100" r="5" stroke="#94A3B8" strokeWidth="1" />
          {/* Upper arm */}
          <line x1="65" y1="100" x2="110" y2="45" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          {/* Wrist joint */}
          <circle cx="110" cy="45" r="4" stroke="#94A3B8" strokeWidth="1" />
          {/* Gripper */}
          <line x1="110" y1="45" x2="100" y2="25" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="110" y1="45" x2="120" y2="25" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        {/* Work surface */}
        <div
          className="absolute rounded-[2px]"
          style={{
            left: '5%', top: '48%', width: '35%', height: '42%',
            border: '1px solid rgba(148, 163, 184, 0.08)',
            background: 'rgba(148, 163, 184, 0.02)',
          }}
        />

        {/* Bounding boxes */}
        {allBoxes.map((box) => {
          const color = getBoxColor(box.confidence);
          return (
            <div
              key={box.id}
              className="absolute transition-all duration-500"
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
                border: `1.5px solid ${color}`,
                borderRadius: 3,
                opacity: box.fadeIn ? 0.85 : 0.9,
                animation: box.fadeIn ? 'bbox-fade-in 400ms ease-out' : undefined,
              }}
            >
              {/* Label */}
              <div
                className="absolute -top-[18px] left-0 flex items-center gap-1.5 px-1.5 py-0.5 rounded-[2px]"
                style={{
                  background: 'rgba(10, 14, 23, 0.85)',
                  borderBottom: `1px solid ${color}`,
                }}
              >
                <span className="font-metric text-[9px] font-semibold" style={{ color }}>
                  {box.label}
                </span>
                <span className="font-metric text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
                  —
                </span>
                <span className="font-metric text-[9px] font-bold" style={{ color }}>
                  {box.confidence.toFixed(2)}
                </span>
              </div>

              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-2 h-2" style={{ borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
              <div className="absolute top-0 right-0 w-2 h-2" style={{ borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
              <div className="absolute bottom-0 left-0 w-2 h-2" style={{ borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
              <div className="absolute bottom-0 right-0 w-2 h-2" style={{ borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
            </div>
          );
        })}

        {/* ── HUD Overlays ────────────────────────────────── */}

        {/* REC indicator — top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full status-dot-critical"
            style={{ background: 'var(--status-critical)' }}
          />
          <span className="font-metric text-[10px] font-bold" style={{ color: 'var(--status-critical)' }}>
            REC
          </span>
        </div>

        {/* LIVE badge — top right */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-[3px]"
          style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--status-operational)' }} />
          <span className="font-metric text-[9px] font-semibold" style={{ color: 'var(--status-operational)' }}>
            LIVE
          </span>
        </div>

        {/* Timestamp — bottom left */}
        <div className="absolute bottom-3 left-3">
          <span className="font-metric text-[10px]" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
            CAM-01 | {timestamp}
          </span>
        </div>

        {/* Resolution — bottom right */}
        <div className="absolute bottom-3 right-3">
          <span className="font-metric text-[9px]" style={{ color: 'rgba(148, 163, 184, 0.4)' }}>
            1920×1080 @ 30fps
          </span>
        </div>

        {/* Crosshair center marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.08 }}>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="0" x2="20" y2="16" stroke="#94A3B8" strokeWidth="0.5" />
            <line x1="20" y1="24" x2="20" y2="40" stroke="#94A3B8" strokeWidth="0.5" />
            <line x1="0" y1="20" x2="16" y2="20" stroke="#94A3B8" strokeWidth="0.5" />
            <line x1="24" y1="20" x2="40" y2="20" stroke="#94A3B8" strokeWidth="0.5" />
            <circle cx="20" cy="20" r="6" stroke="#94A3B8" strokeWidth="0.5" fill="none" />
          </svg>
        </div>

        {/* Scan line animation */}
        <div className="cam-scanline" />
      </div>
    </div>
  );
}
