'use client';

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
        <h2
          className="text-[14px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-primary)' }}
        >
          AI Skill Performance
        </h2>
        <div className="flex-1 h-px" style={{ background: 'var(--border-primary)' }} />
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
