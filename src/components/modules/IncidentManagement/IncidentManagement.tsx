'use client';

import AlertFeed from './AlertFeed';
import IncidentTimeline from './IncidentTimeline';

export default function IncidentManagement() {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <h2
          className="text-[14px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-primary)' }}
        >
          Incident Management
        </h2>
        <div className="flex-1 h-px" style={{ background: 'var(--border-primary)' }} />
      </div>

      {/* 2fr 1fr grid: Alert Feed + Incident Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AlertFeed />
        <IncidentTimeline />
      </div>
    </section>
  );
}
