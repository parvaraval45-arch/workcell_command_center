'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, ChevronRight, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';
import { MobileMenuButton } from './Sidebar';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onMobileMenuOpen: () => void;
}

export default function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const incidents = useTelemetryStore((s) => s.incidents);
  const isSimulating = useTelemetryStore((s) => s.isSimulating);
  const status = useTelemetryStore((s) => s.workcell.status);
  const [currentTime, setCurrentTime] = useState('');
  const [bellShake, setBellShake] = useState(false);
  const prevStatusRef = useRef(status);

  // Connection reconnect simulation
  const [connectionState, setConnectionState] = useState<'connected' | 'reconnecting'>('connected');

  const unacknowledgedCount = incidents.filter((i) => !i.acknowledged).length;

  // Live clock — updates every second
  useEffect(() => {
    const update = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reconnect simulation — brief "Reconnecting..." flash every ~5 minutes
  useEffect(() => {
    if (!isSimulating) return;

    const scheduleReconnect = () => {
      const delay = 270_000 + Math.random() * 60_000; // 4.5-5.5 min
      return setTimeout(() => {
        setConnectionState('reconnecting');
        setTimeout(() => {
          setConnectionState('connected');
        }, 1500 + Math.random() * 1000); // 1.5-2.5s
      }, delay);
    };

    const timer = scheduleReconnect();
    return () => clearTimeout(timer);
  }, [isSimulating, connectionState]);

  // Bell shake on status change
  useEffect(() => {
    if (status !== prevStatusRef.current) {
      setBellShake(true);
      const timer = setTimeout(() => setBellShake(false), 600);
      prevStatusRef.current = status;
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Bell shake on new incident
  const prevIncidentCount = useRef(incidents.length);
  useEffect(() => {
    if (incidents.length > prevIncidentCount.current) {
      setBellShake(true);
      setTimeout(() => setBellShake(false), 600);
    }
    prevIncidentCount.current = incidents.length;
  }, [incidents.length]);

  return (
    <header
      className="flex items-center justify-between h-[52px] px-4 md:px-6 border-b shrink-0 z-30"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
      }}
      role="banner"
    >
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <MobileMenuButton onClick={onMobileMenuOpen} />

        <nav className="flex items-center gap-1.5" aria-label="Breadcrumb">
          <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Workcell Alpha-01
          </span>
          <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
          <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Overview
          </span>
        </nav>
      </div>

      {/* Right: connection, clock, bell */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Connection status */}
        <div className="hidden sm:flex items-center gap-1.5" role="status" aria-label="Connection status">
          {!isSimulating ? (
            <>
              <WifiOff size={13} style={{ color: 'var(--status-critical)' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--status-critical)' }}>
                Disconnected
              </span>
            </>
          ) : connectionState === 'reconnecting' ? (
            <>
              <Loader2 size={13} className="empty-state-spin" style={{ color: 'var(--status-degraded)' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--status-degraded)' }}>
                Reconnecting...
              </span>
            </>
          ) : (
            <>
              <Wifi size={13} style={{ color: 'var(--status-operational)' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--status-operational)' }}>
                Connected
              </span>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border-primary)' }} />

        {/* Live clock */}
        <span
          className="font-metric text-[12px] hidden sm:inline"
          style={{ color: 'var(--text-tertiary)' }}
          aria-label={`Current time: ${currentTime}`}
        >
          {currentTime}
        </span>

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border-primary)' }} />

        {/* Notification bell */}
        <button
          className={cn(
            'relative p-2 rounded-[4px] transition-colors duration-150 cursor-pointer focus-ring',
            bellShake && 'bell-shake'
          )}
          style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          aria-label={`Notifications${unacknowledgedCount > 0 ? `, ${unacknowledgedCount} unread` : ''}`}
        >
          <Bell size={18} strokeWidth={1.8} />
          {unacknowledgedCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-metric font-bold px-1"
              style={{ background: 'var(--status-critical)', color: '#fff' }}
              aria-hidden="true"
            >
              {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
