'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useTelemetryStore } from '@/store/telemetryStore';
import { showToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import AlertSummaryBar from './AlertSummaryBar';
import AlertCard from './AlertCard';
import type { IncidentSeverity } from '@/lib/types';

type FilterType = 'all' | IncidentSeverity;
type TimeRange = 'shift' | 'hour' | 'day';

export default function AlertFeed() {
  const incidents = useTelemetryStore((s) => s.incidents);
  const acknowledgeIncident = useTelemetryStore((s) => s.acknowledgeIncident);
  const triggerRemoteReset = useTelemetryStore((s) => s.triggerRemoteReset);
  const resolveIncident = useTelemetryStore((s) => s.resolveIncident);
  const forceProfile = useTelemetryStore((s) => s.skills.forceProfile);
  const ivmConfidence = useTelemetryStore((s) => s.skills.ivmConfidence);

  const [filter, setFilter] = useState<FilterType>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('shift');
  const [resetModalId, setResetModalId] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const prevCountRef = useRef(incidents.length);

  // Current force for sensor display
  const currentForce = forceProfile.length > 0 ? forceProfile[forceProfile.length - 1].force : 0;

  // Flash when new critical alert arrives
  useEffect(() => {
    let flashTimer: ReturnType<typeof setTimeout> | null = null;
    if (incidents.length > prevCountRef.current) {
      const newest = incidents[0];
      if (newest && newest.severity === 'critical') {
        setFlashActive(true);
        flashTimer = setTimeout(() => setFlashActive(false), 600);
      }
    }
    prevCountRef.current = incidents.length;
    return () => { if (flashTimer) clearTimeout(flashTimer); };
  }, [incidents]);

  // Filter by time range
  const timeFiltered = useMemo(() => {
    const now = Date.now();
    return incidents.filter((inc) => {
      const ts = inc.timestamp instanceof Date ? inc.timestamp.getTime() : 0;
      if (timeRange === 'hour') return now - ts < 3_600_000;
      if (timeRange === 'day') return now - ts < 86_400_000;
      return true; // 'shift' = show all
    });
  }, [incidents, timeRange]);

  // Filter by severity
  const filtered = useMemo(() => {
    if (filter === 'all') return timeFiltered;
    return timeFiltered.filter((i) => i.severity === filter);
  }, [timeFiltered, filter]);

  const handleAcknowledge = (id: string) => {
    acknowledgeIncident(id);
  };

  const handleRemoteReset = (id: string) => {
    setResetModalId(id);
  };

  const confirmReset = () => {
    if (resetModalId) {
      triggerRemoteReset();
      resolveIncident(resetModalId);
      showToast('Reset command sent. Estimated recovery: 15s', 'warning', 5000);
      setResetModalId(null);
    }
  };

  return (
    <div className="flex flex-col lg:col-span-2">
      {/* Summary bar */}
      <AlertSummaryBar
        incidents={timeFiltered}
        filter={filter}
        onFilterChange={setFilter}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      {/* Feed */}
      <div className="relative">
        {/* Critical flash overlay */}
        {flashActive && (
          <div
            className="absolute inset-x-0 top-0 h-1 z-10 rounded-t"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--status-critical), transparent)',
              animation: 'alert-flash 0.6s ease-out forwards',
            }}
          />
        )}

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <EmptyState
              icon="shield"
              message="No incidents this shift. All systems normal."
              submessage="Monitoring active — alerts will appear here"
            />
          ) : (
            filtered.map((inc) => (
              <AlertCard
                key={inc.id}
                incident={inc}
                onAcknowledge={handleAcknowledge}
                onRemoteReset={handleRemoteReset}
                forceZ={currentForce}
                ivmConfidence={ivmConfidence}
              />
            ))
          )}
        </div>
      </div>

      {/* Reset confirmation modal */}
      <ConfirmModal
        open={resetModalId !== null}
        title="Trigger Remote Reset?"
        description="This will restart the current workcell process via the Executive Bridge. The workcell will enter a safe state during reset (~15 seconds)."
        confirmLabel="Confirm Reset"
        danger
        onConfirm={confirmReset}
        onCancel={() => setResetModalId(null)}
      />
    </div>
  );
}
