'use client';

import { useState, useMemo } from 'react';
import { Check, X, RefreshCw, Search } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';
import EmptyState from '@/components/ui/EmptyState';
import type { SkillOutcome } from '@/lib/types';

type FilterType = 'all' | SkillOutcome;

const OUTCOME_CONFIG = {
  success: {
    label: 'Success',
    color: 'var(--status-operational)',
    bg: 'var(--status-operational-bg)',
    Icon: Check,
  },
  failure: {
    label: 'Failure',
    color: 'var(--status-critical)',
    bg: 'var(--status-critical-bg)',
    Icon: X,
  },
  retry: {
    label: 'Retry',
    color: 'var(--status-degraded)',
    bg: 'var(--status-degraded-bg)',
    Icon: RefreshCw,
  },
};

function getConfidenceDotColor(c: number): string {
  if (c >= 0.85) return 'var(--status-operational)';
  if (c >= 0.65) return 'var(--status-degraded)';
  return 'var(--status-critical)';
}

export default function SkillExecutionLog() {
  const executions = useTelemetryStore((s) => s.skills.activeSkill.lastExecutions);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let data = [...executions].reverse(); // newest first
    if (filter !== 'all') {
      data = data.filter((e) => e.outcome === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((e) => e.skill.toLowerCase().includes(q));
    }
    return data;
  }, [executions, filter, search]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'success', label: 'Success' },
    { key: 'failure', label: 'Failure' },
    { key: 'retry', label: 'Retry' },
  ];

  return (
    <div className="card flex flex-col lg:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3
          className="text-[13px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Skill Execution Log
        </h3>
        <span
          className="font-metric text-[11px] px-2 py-0.5 rounded-[4px]"
          style={{ background: 'var(--accent-muted)', color: 'var(--accent-primary)' }}
        >
          {executions.length} executions
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 px-5 pb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-all duration-150 cursor-pointer"
              style={{
                background: filter === f.key ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: filter === f.key ? '#FFFFFF' : 'var(--text-tertiary)',
                border: `1px solid ${filter === f.key ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] flex-1 min-w-[160px] max-w-[260px]"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
        >
          <Search size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-[11px] w-full"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Table header */}
      <div
        className="grid px-5 py-2 sticky top-0 z-10"
        style={{
          gridTemplateColumns: '100px 1fr 70px 80px 80px',
          background: 'var(--bg-tertiary)',
          borderTop: '1px solid var(--border-primary)',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        {['Timestamp', 'Skill Name', 'Duration', 'Outcome', 'Confidence'].map((h) => (
          <span
            key={h}
            className="text-[10px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Table body */}
      <div className="overflow-y-auto max-h-[400px] flex-1">
        {filtered.length === 0 ? (
          <EmptyState
            icon="loading"
            message="Awaiting first skill execution..."
            submessage="Executions will appear here as skills run"
          />
        ) : (
          filtered.map((exec, i) => {
            const outcomeConfig = OUTCOME_CONFIG[exec.outcome];
            const OutcomeIcon = outcomeConfig.Icon;
            const isEven = i % 2 === 0;

            return (
              <div
                key={exec.id}
                className="grid items-center px-5 py-2.5 transition-all duration-150 group"
                style={{
                  gridTemplateColumns: '100px 1fr 70px 80px 80px',
                  background: isEven ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                  borderLeft: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = 'var(--accent-primary)';
                  e.currentTarget.style.background = 'var(--bg-surface)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = 'transparent';
                  e.currentTarget.style.background = isEven ? 'var(--bg-secondary)' : 'var(--bg-tertiary)';
                }}
              >
                {/* Timestamp */}
                <span className="font-metric text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {exec.timestamp instanceof Date
                    ? exec.timestamp.toLocaleTimeString('en-US', { hour12: false })
                    : String(exec.timestamp)}
                </span>

                {/* Skill name */}
                <span className="text-[11px] truncate pr-2" style={{ color: 'var(--text-primary)' }}>
                  {exec.skill}
                </span>

                {/* Duration */}
                <span className="font-metric text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {exec.duration.toFixed(1)}s
                </span>

                {/* Outcome badge */}
                <div className="flex items-center gap-1">
                  <div
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-[3px]"
                    style={{ background: outcomeConfig.bg }}
                  >
                    <OutcomeIcon size={9} style={{ color: outcomeConfig.color }} />
                    <span className="text-[9px] font-medium" style={{ color: outcomeConfig.color }}>
                      {outcomeConfig.label}
                    </span>
                  </div>
                </div>

                {/* Confidence */}
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-[5px] h-[5px] rounded-full shrink-0"
                    style={{ background: getConfidenceDotColor(exec.confidence) }}
                  />
                  <span className="font-metric text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {(exec.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
