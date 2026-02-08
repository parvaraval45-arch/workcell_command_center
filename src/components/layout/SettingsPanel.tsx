'use client';

import { useEffect, useRef } from 'react';
import { X, Server, Cpu, Camera, Grip } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { workcellConfig } from '@/data/mockData';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4
      className="text-[11px] font-semibold uppercase tracking-wider mb-3"
      style={{ color: 'var(--text-tertiary)' }}
    >
      {children}
    </h4>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="font-metric text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="settings-slider w-full"
      />
    </div>
  );
}

export default function SettingsPanel() {
  const isOpen = useSettingsStore((s) => s.settingsPanelOpen);
  const toggle = useSettingsStore((s) => s.actions.toggleSettingsPanel);
  const thresholds = useSettingsStore((s) => s.alertThresholds);
  const display = useSettingsStore((s) => s.display);
  const laborRate = useSettingsStore((s) => s.laborRate);
  const notifications = useSettingsStore((s) => s.notifications);
  const { updateThresholds, updateDisplay, updateLaborRate, updateNotifications } = useSettingsStore((s) => s.actions);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggle();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, toggle]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[80]"
        style={{ background: 'rgba(0,0,0,0.15)' }}
        onClick={(e) => { if (e.target === overlayRef.current) toggle(); }}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-screen z-[85] overflow-y-auto settings-slide-in"
        style={{
          width: 'min(420px, 90vw)',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-primary)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.06)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
          style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}
        >
          <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h2>
          <button
            onClick={toggle}
            className="p-1.5 rounded-[4px] cursor-pointer transition-colors"
            style={{ color: 'var(--text-tertiary)', background: 'transparent', border: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* ── Workcell Configuration ────────────────── */}
          <div>
            <SectionLabel>Workcell Configuration</SectionLabel>
            <div className="space-y-2">
              {[
                { icon: Server, label: 'Robot Model', value: workcellConfig.robotModel },
                { icon: Grip, label: 'Gripper', value: workcellConfig.gripper },
                { icon: Camera, label: 'Cameras', value: workcellConfig.cameras },
                { icon: Cpu, label: 'Location', value: workcellConfig.location },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-3 rounded-[4px]"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <item.icon size={14} style={{ color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0 }} />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                      {item.label}
                    </span>
                    <span className="text-[12px] block truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--border-primary)' }} />

          {/* ── Alert Thresholds ──────────────────────── */}
          <div>
            <SectionLabel>Alert Thresholds</SectionLabel>
            <SliderRow
              label="IVM Confidence Threshold"
              value={thresholds.ivmConfidence}
              min={0.5}
              max={0.95}
              step={0.05}
              unit=""
              onChange={(v) => updateThresholds({ ivmConfidence: v })}
            />
            <SliderRow
              label="Force Limit"
              value={thresholds.forceLimit}
              min={20}
              max={50}
              step={1}
              unit="N"
              onChange={(v) => updateThresholds({ forceLimit: v })}
            />
            <SliderRow
              label="Cycle Time Variance"
              value={thresholds.cycleTimeVariance}
              min={1}
              max={4}
              step={0.5}
              unit="σ"
              onChange={(v) => updateThresholds({ cycleTimeVariance: v })}
            />
          </div>

          <div className="h-px" style={{ background: 'var(--border-primary)' }} />

          {/* ── Display Settings ──────────────────────── */}
          <div>
            <SectionLabel>Display Settings</SectionLabel>

            {/* Refresh rate */}
            <div className="mb-4">
              <span className="text-[12px] block mb-2" style={{ color: 'var(--text-secondary)' }}>
                Refresh Rate
              </span>
              <div className="flex gap-2">
                {[1, 2, 5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => updateDisplay({ refreshRate: rate })}
                    className="px-3 py-1.5 rounded-[4px] text-[11px] font-medium cursor-pointer transition-all"
                    style={{
                      background: display.refreshRate === rate ? 'var(--accent-primary)' : 'var(--bg-surface)',
                      color: display.refreshRate === rate ? '#FFFFFF' : 'var(--text-secondary)',
                      border: `1px solid ${display.refreshRate === rate ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                    }}
                  >
                    {rate}s
                  </button>
                ))}
              </div>
            </div>

            {/* Dark/Light mode */}
            <div className="mb-4">
              <span className="text-[12px] block mb-2" style={{ color: 'var(--text-secondary)' }}>
                Theme
              </span>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 rounded-[4px] text-[11px] font-medium cursor-pointer"
                  style={{
                    background: 'var(--accent-primary)',
                    color: '#FFFFFF',
                    border: '1px solid var(--accent-primary)',
                  }}
                >
                  Light
                </button>
                <button
                  className="px-3 py-1.5 rounded-[4px] text-[11px] font-medium cursor-pointer relative"
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-tertiary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  Dark
                  <span
                    className="absolute -top-1.5 -right-1.5 text-[8px] font-semibold px-1 rounded"
                    style={{ background: 'var(--status-degraded-bg)', color: 'var(--status-degraded)' }}
                  >
                    Soon
                  </span>
                </button>
              </div>
            </div>

            {/* Metric units */}
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                Unit System
              </span>
              <div className="flex gap-2">
                {[{ label: 'Metric', val: true }, { label: 'Imperial', val: false }].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => updateDisplay({ metricUnits: opt.val })}
                    className="px-3 py-1.5 rounded-[4px] text-[11px] font-medium cursor-pointer transition-all"
                    style={{
                      background: display.metricUnits === opt.val ? 'var(--accent-primary)' : 'var(--bg-surface)',
                      color: display.metricUnits === opt.val ? '#FFFFFF' : 'var(--text-secondary)',
                      border: `1px solid ${display.metricUnits === opt.val ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--border-primary)' }} />

          {/* ── Labor Rate ────────────────────────────── */}
          <div>
            <SectionLabel>Labor Rate</SectionLabel>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-metric" style={{ color: 'var(--text-tertiary)' }}>$</span>
              <input
                type="number"
                value={laborRate}
                min={10}
                max={500}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v) && v >= 10 && v <= 500) updateLaborRate(v);
                }}
                className="settings-input w-24 font-metric"
              />
              <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>/hr</span>
            </div>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Used for automation ROI and cost savings calculations
            </p>
          </div>

          <div className="h-px" style={{ background: 'var(--border-primary)' }} />

          {/* ── Notification Routing ──────────────────── */}
          <div>
            <SectionLabel>Notification Routing</SectionLabel>
            <div
              className="rounded-[4px] overflow-hidden"
              style={{ border: '1px solid var(--border-primary)' }}
            >
              {/* Header */}
              <div
                className="grid px-3 py-2"
                style={{
                  gridTemplateColumns: '1fr 60px 60px 70px',
                  background: 'var(--bg-tertiary)',
                }}
              >
                <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  Channel
                </span>
                {['Critical', 'Warning', 'Info'].map((sev) => (
                  <span
                    key={sev}
                    className="text-[9px] font-medium uppercase tracking-wider text-center"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {sev}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {(['email', 'sms', 'webhook'] as const).map((channel, i) => (
                <div
                  key={channel}
                  className="grid px-3 py-2 items-center"
                  style={{
                    gridTemplateColumns: '1fr 60px 60px 70px',
                    background: i % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                  }}
                >
                  <span className="text-[11px] capitalize" style={{ color: 'var(--text-secondary)' }}>
                    {channel}
                  </span>
                  {(['critical', 'warning', 'info'] as const).map((sev) => (
                    <div key={sev} className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={notifications[channel][sev]}
                        onChange={(e) => {
                          updateNotifications({
                            [channel]: {
                              ...notifications[channel],
                              [sev]: e.target.checked,
                            },
                          });
                        }}
                        className="settings-checkbox"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
