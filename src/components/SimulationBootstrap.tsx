'use client';

import { useEffect } from 'react';
import { useTelemetryStore } from '@/store/telemetryStore';

export default function SimulationBootstrap() {
  const startSimulation = useTelemetryStore((s) => s.startSimulation);
  const stopSimulation = useTelemetryStore((s) => s.stopSimulation);

  useEffect(() => {
    startSimulation();
    return () => stopSimulation();
  }, [startSimulation, stopSimulation]);

  return null;
}
