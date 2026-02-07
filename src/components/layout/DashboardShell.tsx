'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import SettingsPanel from './SettingsPanel';
import KeyboardShortcuts from '@/components/ui/KeyboardShortcuts';
import { SidebarMotion, TopBarMotion, StoppedVignette } from '@/components/ui/MotionWrapper';
import { useTelemetryStore } from '@/store/telemetryStore';

interface DashboardShellProps {
  children: React.ReactNode;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setMatches(e.matches);
    handler(mql);
    mql.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
    return () => mql.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
  }, [query]);

  return matches;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const isTablet = useMediaQuery('(min-width: 768px)');
  const status = useTelemetryStore((s) => s.workcell.status);

  // Sidebar: expanded on desktop, collapsed on tablet, hidden on mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync collapsed state with breakpoint
  useEffect(() => {
    setSidebarCollapsed(!isDesktop);
  }, [isDesktop]);

  // Close mobile menu on resize to tablet+
  useEffect(() => {
    if (isTablet) setMobileMenuOpen(false);
  }, [isTablet]);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Stopped vignette — red edges when status is stopped */}
      <StoppedVignette visible={status === 'stopped'} />

      {/* Keyboard shortcuts handler */}
      <KeyboardShortcuts onToggleSidebar={toggleSidebar} />

      {/* Sidebar — hidden on mobile, shown on tablet+ */}
      {isTablet && (
        <SidebarMotion>
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            mobileOpen={false}
            onMobileClose={() => {}}
          />
        </SidebarMotion>
      )}

      {/* Mobile sidebar overlay */}
      {!isTablet && (
        <Sidebar
          collapsed={false}
          onToggle={() => {}}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBarMotion>
          <TopBar onMobileMenuOpen={() => setMobileMenuOpen(true)} />
        </TopBarMotion>
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{ background: 'var(--bg-primary)' }}
        >
          {children}
        </main>
      </div>

      {/* Settings Panel */}
      <SettingsPanel />
    </div>
  );
}
