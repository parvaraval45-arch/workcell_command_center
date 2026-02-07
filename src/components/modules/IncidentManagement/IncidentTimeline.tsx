'use client';

import { useMemo } from 'react';
import { useTelemetryStore } from '@/store/telemetryStore';

const SEVERITY_DOT = {
  critical: { color: 'var(--status-critical)', bg: 'var(--status-critical-bg)' },
  warning: { color: 'var(--status-degraded)', bg: 'var(--status-degraded-bg)' },
  info: { color: 'var(--status-info)', bg: 'var(--accent-muted)' },
};

export default function IncidentTimeline() {
  const incidents = useTelemetryStore((s) => s.incidents);

  const stats = useMemo(() => {
    const critical = incidents.filter((i) => i.severity === 'critical').length;
    const warning = incidents.filter((i) => i.severity === 'warning').length;
    const info = incidents.filter((i) => i.severity === 'info').length;
    return { total: incidents.length, critical, warning, info };
  }, [incidents]);

  return (
    <div className="card p-5 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3
          className="text-[13px] font-medium uppercase tracking-wider mb-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          Incident Timeline
        </h3>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="font-metric text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>
            {stats.total}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            shift incidents
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {stats.critical > 0 && (
            <span className="font-metric text-[10px] px-1.5 py-0.5 rounded-[3px]" style={{ background: 'var(--status-critical-bg)', color: 'var(--status-critical)' }}>
              {stats.critical} Critical
            </span>
          )}
          {stats.warning > 0 && (
            <span className="font-metric text-[10px] px-1.5 py-0.5 rounded-[3px]" style={{ background: 'var(--status-degraded-bg)', color: 'var(--status-degraded)' }}>
              {stats.warning} Warning
            </span>
          )}
          {stats.info > 0 && (
            <span className="font-metric text-[10px] px-1.5 py-0.5 rounded-[3px]" style={{ background: 'var(--accent-muted)', color: 'var(--status-info)' }}>
              {stats.info} Info
            </span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto max-h-[500px] pr-1">
        {incidents.length === 0 ? (
          <div className="flex items-center justify-center h-32" style={{ color: 'var(--text-tertiary)' }}>
            <span className="text-[12px]">No incidents yet</span>
          </div>
        ) : (
          <div className="relative pl-6">
            {/* Vertical line */}
            <div
              className="absolute left-[7px] top-1 bottom-1 w-[2px]"
              style={{ background: 'var(--border-primary)' }}
            />

            {incidents.map((inc, i) => {
              const cfg = SEVERITY_DOT[inc.severity];
              const isResolved = !!inc.resolvedAt;
              const isActive = !isResolved && !inc.acknowledged;
              const timeLabel = inc.timestamp instanceof Date
                ? inc.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                : '';

              // Duration bar
              let durationStr = '';
              if (isResolved && inc.resolvedAt instanceof Date && inc.timestamp instanceof Date) {
                const dur = (inc.resolvedAt.getTime() - inc.timestamp.getTime()) / 1000;
                durationStr = dur < 60 ? `${Math.round(dur)}s` : `${Math.round(dur / 60)}m`;
              }

              return (
                <div
                  key={inc.id}
                  className="relative mb-4 last:mb-0"
                  style={{ opacity: isResolved ? 0.5 : 1 }}
                >
                  {/* Dot */}
                  <div
                    className="absolute -left-6 top-0.5 w-[16px] h-[16px] rounded-full flex items-center justify-center"
                    style={{
                      background: cfg.bg,
                      border: `2px solid ${cfg.color}`,
                      animation: isActive ? `pulse-${inc.severity === 'critical' ? 'critical' : inc.severity === 'warning' ? 'degraded' : 'operational'} 2s ease-in-out infinite` : 'none',
                    }}
                  >
                    <div
                      className="w-[6px] h-[6px] rounded-full"
                      style={{ background: cfg.color }}
                    />
                  </div>

                  {/* Content */}
                  <div className="ml-2">
                    <span className="font-metric text-[10px] block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {timeLabel}
                    </span>
                    <span
                      className="text-[11px] font-medium leading-tight block"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {inc.title.length > 50 ? inc.title.slice(0, 50) + '...' : inc.title}
                    </span>

                    {/* Duration bar for resolved incidents */}
                    {isResolved && durationStr && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div
                          className="h-[3px] rounded-full"
                          style={{
                            width: '40px',
                            background: cfg.color,
                            opacity: 0.4,
                          }}
                        />
                        <span className="font-metric text-[9px]" style={{ color: 'var(--text-tertiary)' }}>
                          {durationStr}
                        </span>
                      </div>
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <span className="text-[9px] font-medium mt-0.5 inline-block" style={{ color: cfg.color }}>
                        Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
