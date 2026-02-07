'use client';

import { ShieldAlert } from 'lucide-react';
import AlertFeed from './AlertFeed';
import IncidentTimeline from './IncidentTimeline';

export default function IncidentManagement() {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} style={{ color: 'var(--status-critical)' }} />
          <h2
            className="text-[14px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-primary)' }}
          >
            Incident Management
          </h2>
        </div>
        <div className="flex-1 h-px" style={{ background: 'var(--status-critical)', opacity: 0.2 }} />
      </div>

      {/* 2fr 1fr grid: Alert Feed + Incident Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AlertFeed />
        <IncidentTimeline />
      </div>
    </section>
  );
}
