'use client';

import DashboardShell from '@/components/layout/DashboardShell';
import DebugPanel from '@/components/ui/DebugPanel';
import ToastContainer from '@/components/ui/Toast';
import SimulationBootstrap from '@/components/SimulationBootstrap';
import WorkcellHealth from '@/components/modules/WorkcellHealth/WorkcellHealth';
import ProductionMetrics from '@/components/modules/ProductionMetrics';
import AISkillObservability from '@/components/modules/AISkillObservability';
import IncidentManagement from '@/components/modules/IncidentManagement';
import { StaggerContainer, StaggerItem } from '@/components/ui/MotionWrapper';

export default function Home() {
  return (
    <DashboardShell>
      <SimulationBootstrap />
      <ToastContainer />

      <StaggerContainer>
        {/* ── MODULE 1: Workcell Health Overview (sticky) ────── */}
        <StaggerItem className="mb-6 health-sticky">
          <div id="health-section">
            <WorkcellHealth />
          </div>
        </StaggerItem>

        {/* ── MODULE 2: Production Metrics Panel ─────────────── */}
        <StaggerItem className="mb-6">
          <div id="production-section">
            <ProductionMetrics />
          </div>
        </StaggerItem>

        {/* ── MODULE 3: AI Skill Observability ───────────────── */}
        <StaggerItem className="mb-6">
          <div id="skills-section">
            <AISkillObservability />
          </div>
        </StaggerItem>

        {/* ── MODULE 4: Incident Management & Alerting ───────── */}
        <StaggerItem className="mb-6">
          <div id="incidents-section">
            <IncidentManagement />
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        className="mt-8 mb-4 pt-6 text-center"
        style={{ borderTop: '1px solid var(--border-primary)' }}
      >
        <p
          className="text-[12px] font-medium tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          Intrinsic Workcell Command Center v1.0 — Built by Parva Raval
        </p>
        <p
          className="text-[11px] mt-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Prototype for PM Intern Application · Data is simulated
        </p>
      </footer>

      {/* Debug panel */}
      <DebugPanel />
    </DashboardShell>
  );
}
