'use client';

import { Sparkles } from 'lucide-react';
import IVMConfidenceMonitor from './IVMConfidenceMonitor';
import ForceProfile from './ForceProfile';
import CameraFeed from './CameraFeed';
import WorkcellSchematic from './WorkcellSchematic';
import SkillExecutionLog from './SkillExecutionLog';
import SkillPerformanceSummary from './SkillPerformanceSummary';

export default function AISkillObservability() {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
          <h2
            className="text-[14px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-primary)' }}
          >
            AI Skill Performance
          </h2>
        </div>
        <div className="flex-1 h-px" style={{ background: 'var(--accent-primary)', opacity: 0.3 }} />
      </div>

      {/* Top row: IVM + Force Profile (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <IVMConfidenceMonitor />
        <ForceProfile />
      </div>

      {/* Middle row: Camera Feed + Workcell Schematic (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <CameraFeed />
        <WorkcellSchematic />
      </div>

      {/* Bottom row: Execution Log (2 cols) + Skill Summary (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SkillExecutionLog />
        <SkillPerformanceSummary />
      </div>
    </section>
  );
}
