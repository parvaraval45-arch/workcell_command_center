'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Check, X, RefreshCw, RotateCcw } from 'lucide-react';
import { ExpandableSection } from '@/components/ui/MotionWrapper';
import type { Incident } from '@/lib/types';

const SEVERITY_CONFIG = {
  critical: {
    color: 'var(--status-critical)',
    bg: 'var(--status-critical-bg)',
    border: 'var(--status-critical)',
    glow: '0 0 16px rgba(239, 68, 68, 0.1)',
  },
  warning: {
    color: 'var(--status-degraded)',
    bg: 'var(--status-degraded-bg)',
    border: 'var(--status-degraded)',
    glow: 'none',
  },
  info: {
    color: 'var(--status-info)',
    bg: 'var(--accent-muted)',
    border: 'var(--status-info)',
    glow: 'none',
  },
};

// BT node status icon
function BtNodeIcon({ status }: { status: string }) {
  if (status === 'success') return <Check size={10} style={{ color: 'var(--status-operational)' }} />;
  if (status === 'warning') return <RefreshCw size={10} style={{ color: 'var(--status-degraded)' }} />;
  return <X size={10} style={{ color: 'var(--status-critical)' }} />;
}

function parseBtNode(node: string): { label: string; status: 'success' | 'warning' | 'failure' } {
  if (node.startsWith('→ ') || node.includes('FAILED') || node.includes('EXCEEDED') || node.includes('PAUSED')) {
    return { label: node, status: 'failure' };
  }
  if (node.includes('Retry') || node.includes('RETRYING') || node.includes('RESTARTING')) {
    return { label: node, status: 'warning' };
  }
  return { label: node, status: 'success' };
}

interface AlertCardProps {
  incident: Incident;
  onAcknowledge: (id: string) => void;
  onRemoteReset: (id: string) => void;
  forceZ?: number;
  ivmConfidence?: number;
}

export default function AlertCard({ incident, onAcknowledge, onRemoteReset, forceZ, ivmConfidence }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[incident.severity];
  const isUnacked = !incident.acknowledged;
  const isResolved = !!incident.resolvedAt;

  const timestamp = incident.timestamp instanceof Date
    ? incident.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
    : String(incident.timestamp);

  return (
    <div
      className="rounded-[6px] overflow-hidden transition-all duration-200 alert-card-enter"
      style={{
        background: 'var(--bg-secondary)',
        borderLeft: `4px solid ${cfg.color}`,
        border: `1px solid ${isUnacked ? cfg.border : 'var(--border-primary)'}`,
        borderLeftWidth: '4px',
        borderLeftColor: cfg.color,
        opacity: isResolved ? 0.5 : incident.acknowledged ? 0.75 : 1,
        boxShadow: isUnacked && incident.severity === 'critical' ? cfg.glow : 'none',
        animation: isUnacked ? 'alert-pulse-border 2s ease-in-out infinite' : 'none',
        animationName: isUnacked && incident.severity !== 'info' ? 'alert-pulse-border' : 'none',
      }}
    >
      {/* Main content — clicking anywhere toggles expansion */}
      <div className="px-4 py-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Top row: severity badge + timestamp */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-metric text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            {timestamp}
          </span>
          <span
            className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[3px]"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            {incident.severity}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-[14px] font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
          {incident.title}
        </h4>

        {/* Source */}
        <p className="text-[11px] mb-2" style={{ color: 'var(--text-secondary)' }}>
          Source: {incident.source}
        </p>

        {/* Description */}
        <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--text-tertiary)' }}>
          {incident.description}
        </p>

        {/* Suggested action */}
        <div
          className="px-3 py-2 rounded-[4px] mb-3"
          style={{ background: 'var(--accent-muted)' }}
        >
          <span className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Suggested: {incident.suggestedAction}
          </span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] font-medium cursor-pointer transition-colors duration-150 mb-2"
          style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', padding: 0 }}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {expanded ? 'Hide Details' : 'Show BT Context & Sensor Data'}
        </button>

        {/* Expanded section */}
        <ExpandableSection expanded={expanded}>
          <div className="mt-2 pt-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
            {/* Behavior Tree Context */}
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Behavior Tree Context
            </p>
            <div className="flex items-center gap-1 flex-wrap mb-4">
              {incident.behaviorTreeContext.map((node, i) => {
                const parsed = parseBtNode(node);
                const isLast = i === incident.behaviorTreeContext.length - 1;
                return (
                  <div key={i} className="flex items-center gap-1">
                    <div
                      className="flex items-center gap-1 px-2 py-1 rounded-[3px]"
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: `1px solid ${
                          parsed.status === 'failure' ? 'rgba(239,68,68,0.3)'
                          : parsed.status === 'warning' ? 'rgba(245,158,11,0.3)'
                          : 'var(--border-primary)'
                        }`,
                      }}
                    >
                      <BtNodeIcon status={parsed.status} />
                      <span
                        className="font-metric text-[10px]"
                        style={{
                          color: parsed.status === 'failure' ? 'var(--status-critical)'
                            : parsed.status === 'warning' ? 'var(--status-degraded)'
                            : 'var(--text-secondary)',
                        }}
                      >
                        {parsed.label}
                      </span>
                    </div>
                    {!isLast && (
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>→</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sensor Readings */}
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Sensor Readings at Incident Time
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="px-2 py-1.5 rounded-[3px]" style={{ background: 'var(--bg-tertiary)' }}>
                <span className="text-[9px] uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>Force Z</span>
                <span className="font-metric text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {(forceZ ?? 23.7).toFixed(1)}N
                </span>
                <span className="text-[9px] block" style={{ color: 'var(--text-tertiary)' }}>(limit: 35N)</span>
              </div>
              <div className="px-2 py-1.5 rounded-[3px]" style={{ background: 'var(--bg-tertiary)' }}>
                <span className="text-[9px] uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>IVM Confidence</span>
                <span className="font-metric text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {(ivmConfidence ?? 0.91).toFixed(2)}
                </span>
              </div>
              <div className="px-2 py-1.5 rounded-[3px]" style={{ background: 'var(--bg-tertiary)' }}>
                <span className="text-[9px] uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>Gripper Pos</span>
                <span className="font-metric text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  12.3mm
                </span>
              </div>
            </div>
          </div>
        </ExpandableSection>

        {/* Action buttons — stop event propagation so clicks don't toggle expand */}
        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-primary)' }} onClick={(e) => e.stopPropagation()}>
          {!incident.acknowledged ? (
            <button
              onClick={() => onAcknowledge(incident.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[11px] font-medium transition-all duration-150 cursor-pointer focus-ring"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.borderColor = 'var(--border-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-primary)';
              }}
            >
              <Check size={12} />
              Acknowledge
            </button>
          ) : (
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              Acknowledged by {incident.acknowledgedBy ?? 'operator'}{' '}
              at {incident.acknowledgedAt instanceof Date
                ? incident.acknowledgedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                : ''}
            </span>
          )}

          {incident.severity === 'critical' && !incident.resolvedAt && (
            <button
              onClick={() => onRemoteReset(incident.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[11px] font-medium transition-all duration-150 cursor-pointer ml-auto focus-ring"
              style={{
                background: 'var(--accent-primary)',
                color: '#FFFFFF',
                border: '1px solid var(--accent-primary)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <RotateCcw size={12} />
              Remote Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
