'use client';

import { useState } from 'react';
import { Bug, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const workcell = useTelemetryStore((s) => s.workcell);
  const production = useTelemetryStore((s) => s.production);
  const skills = useTelemetryStore((s) => s.skills);
  const incidents = useTelemetryStore((s) => s.incidents);
  const isSimulating = useTelemetryStore((s) => s.isSimulating);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-[4px] text-[11px] font-medium transition-all duration-150"
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-tertiary)',
          border: '1px solid var(--border-primary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-accent)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-primary)';
          e.currentTarget.style.color = 'var(--text-tertiary)';
        }}
      >
        <Bug size={14} />
        Debug
      </button>
    );
  }

  const statusColor =
    workcell.status === 'operational'
      ? 'var(--status-operational)'
      : workcell.status === 'degraded'
        ? 'var(--status-degraded)'
        : 'var(--status-critical)';

  return (
    <div
      className="fixed bottom-4 right-4 z-50 rounded-[6px] overflow-hidden"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        width: minimized ? '260px' : '360px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)' }}
      >
        <div className="flex items-center gap-2">
          <Bug size={12} style={{ color: 'var(--accent-primary)' }} />
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Telemetry Debug
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-metric"
            style={{
              background: isSimulating ? 'var(--status-operational-bg)' : 'var(--status-critical-bg)',
              color: isSimulating ? 'var(--status-operational)' : 'var(--status-critical)',
            }}
          >
            {isSimulating ? 'LIVE' : 'STOPPED'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            {minimized ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!minimized && (
        <div className="p-3 max-h-[420px] overflow-y-auto space-y-3">
          {/* System State */}
          <Section title="System State">
            <Row label="Status">
              <span className="font-metric" style={{ color: statusColor }}>
                {workcell.status.toUpperCase()}
              </span>
            </Row>
            <Row label="Uptime">
              <span className="font-metric">{formatUptime(workcell.uptime)}</span>
            </Row>
            <Row label="Current Skill">
              <span className="font-metric text-[10px]">{workcell.currentSkill}</span>
            </Row>
            <Row label="Skill Progress">
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--bg-surface)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${workcell.skillProgress}%`,
                      background: 'var(--accent-primary)',
                    }}
                  />
                </div>
                <span className="font-metric">{workcell.skillProgress}%</span>
              </div>
            </Row>
            <Row label="Shift Completed">
              <span className="font-metric">{workcell.shiftInfo.completed}/{workcell.shiftInfo.target}</span>
            </Row>
          </Section>

          {/* OEE */}
          <Section title="OEE">
            <Row label="Overall">
              <span className="font-metric" style={{ color: 'var(--accent-primary)' }}>
                {production.oee.overall}%
              </span>
            </Row>
            <Row label="Availability">
              <span className="font-metric">{production.oee.availability}%</span>
            </Row>
            <Row label="Performance">
              <span className="font-metric">{production.oee.performance}%</span>
            </Row>
            <Row label="Quality">
              <span className="font-metric">{production.oee.quality}%</span>
            </Row>
          </Section>

          {/* Production */}
          <Section title="Production">
            <Row label="Cycle Time">
              <span className="font-metric">{production.cycleTime.current}s</span>
            </Row>
            <Row label="Ideal Cycle">
              <span className="font-metric" style={{ color: 'var(--text-tertiary)' }}>
                {production.cycleTime.ideal}s
              </span>
            </Row>
            <Row label="Throughput">
              <span className="font-metric">{production.throughput.unitsPerHour} UPH</span>
            </Row>
            <Row label="Trend">
              <span
                className="font-metric"
                style={{
                  color: production.throughput.trend === 'up'
                    ? 'var(--status-operational)'
                    : production.throughput.trend === 'down'
                      ? 'var(--status-critical)'
                      : 'var(--text-tertiary)',
                }}
              >
                {production.throughput.trend.toUpperCase()}
              </span>
            </Row>
            <Row label="$ Saved">
              <span className="font-metric" style={{ color: 'var(--status-operational)' }}>
                ${production.costSavings.dollarsSaved.toLocaleString()}
              </span>
            </Row>
          </Section>

          {/* AI Skills */}
          <Section title="AI Skills">
            <Row label="IVM Confidence">
              <span
                className="font-metric"
                style={{
                  color: skills.ivmConfidence < 0.65
                    ? 'var(--status-critical)'
                    : skills.ivmConfidence < 0.80
                      ? 'var(--status-degraded)'
                      : 'var(--status-operational)',
                }}
              >
                {(skills.ivmConfidence * 100).toFixed(1)}%
              </span>
            </Row>
            <Row label="Force (latest)">
              <span className="font-metric">
                {skills.forceProfile[skills.forceProfile.length - 1]?.force ?? '—'}N
              </span>
            </Row>
            <Row label="Executions">
              <span className="font-metric">{skills.activeSkill.lastExecutions.length}</span>
            </Row>
            <Row label="Success Rate">
              <span className="font-metric">{skills.activeSkill.successRate}%</span>
            </Row>
          </Section>

          {/* Incidents */}
          <Section title={`Incidents (${incidents.length})`}>
            {incidents.length === 0 ? (
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>None yet — first incident in 60-120s</span>
            ) : (
              incidents.slice(0, 5).map((inc) => (
                <div key={inc.id} className="flex items-start gap-2 py-0.5">
                  <span
                    className="text-[9px] px-1 py-0.5 rounded font-metric shrink-0 mt-0.5"
                    style={{
                      background:
                        inc.severity === 'critical'
                          ? 'var(--status-critical-bg)'
                          : inc.severity === 'warning'
                            ? 'var(--status-degraded-bg)'
                            : 'var(--accent-muted)',
                      color:
                        inc.severity === 'critical'
                          ? 'var(--status-critical)'
                          : inc.severity === 'warning'
                            ? 'var(--status-degraded)'
                            : 'var(--status-info)',
                    }}
                  >
                    {inc.severity.toUpperCase()}
                  </span>
                  <span className="text-[10px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
                    {inc.title}
                  </span>
                </div>
              ))
            )}
          </Section>

          {/* History length */}
          <div className="text-[9px] pt-1" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-primary)' }}>
            Cycle history: {production.cycleTime.history.length} pts &middot; Force profile: {skills.forceProfile.length} pts
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-[9px] font-semibold uppercase tracking-widest mb-1.5 pb-1"
        style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-primary)' }}
      >
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      <div className="text-[11px]" style={{ color: 'var(--text-primary)' }}>
        {children}
      </div>
    </div>
  );
}
