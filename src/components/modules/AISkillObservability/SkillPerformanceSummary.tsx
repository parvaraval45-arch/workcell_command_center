'use client';

import { useMemo } from 'react';
import { useTelemetryStore } from '@/store/telemetryStore';

function getSuccessRateColor(rate: number): string {
  if (rate >= 95) return 'var(--status-operational)';
  if (rate >= 90) return 'var(--status-degraded)';
  return 'var(--status-critical)';
}

export default function SkillPerformanceSummary() {
  const skills = useTelemetryStore((s) => s.skills.skills);
  const activeSkillName = useTelemetryStore((s) => s.skills.activeSkill.name);

  // Sort by success rate (lowest first to surface problems)
  const sorted = useMemo(() => {
    return [...skills].sort((a, b) => a.successRate - b.successRate);
  }, [skills]);

  return (
    <div className="card p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[13px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Skill Summary
        </h3>
        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          {skills.length} registered
        </span>
      </div>

      {/* Skills list */}
      <div className="space-y-3 flex-1">
        {sorted.map((skill) => {
          const isActive = skill.name === activeSkillName;
          const barColor = getSuccessRateColor(skill.successRate);

          return (
            <div
              key={skill.name}
              className="p-3 rounded-[4px] transition-all duration-200"
              style={{
                background: isActive ? 'var(--bg-surface)' : 'var(--bg-tertiary)',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                boxShadow: isActive ? 'var(--glow-blue)' : 'none',
              }}
            >
              {/* Skill name + active indicator */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium truncate pr-2" style={{ color: 'var(--text-primary)' }}>
                  {skill.name}
                </span>
                {isActive && (
                  <span
                    className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] shrink-0"
                    style={{ background: 'var(--accent-muted)', color: 'var(--accent-primary)' }}
                  >
                    Active
                  </span>
                )}
              </div>

              {/* Success rate bar */}
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="flex-1 h-[5px] rounded-full overflow-hidden"
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(skill.successRate, 100)}%`,
                      background: barColor,
                    }}
                  />
                </div>
                <span
                  className="font-metric text-[11px] font-semibold w-12 text-right shrink-0"
                  style={{ color: barColor }}
                >
                  {skill.successRate.toFixed(1)}%
                </span>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3">
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  <span className="font-metric">{skill.totalExecutions.toLocaleString()}</span> runs
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  <span className="font-metric">{skill.avgDuration.toFixed(1)}</span>s avg
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
