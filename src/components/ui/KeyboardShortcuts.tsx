'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useTelemetryStore } from '@/store/telemetryStore';
import { showToast } from './Toast';

const shortcuts = [
  { key: 'S', description: 'Toggle sidebar' },
  { key: '1', description: 'Jump to Health Overview' },
  { key: '2', description: 'Jump to Production Metrics' },
  { key: '3', description: 'Jump to AI Skill Performance' },
  { key: '4', description: 'Jump to Incident Management' },
  { key: 'A', description: 'Acknowledge latest alert' },
  { key: 'Esc', description: 'Close any open panel' },
  { key: '?', description: 'Show this help' },
];

interface KeyboardShortcutsProps {
  onToggleSidebar: () => void;
}

export default function KeyboardShortcuts({ onToggleSidebar }: KeyboardShortcutsProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const toggleSettings = useSettingsStore((s) => s.actions.toggleSettingsPanel);
  const settingsOpen = useSettingsStore((s) => s.settingsPanelOpen);
  const acknowledgeIncident = useTelemetryStore((s) => s.acknowledgeIncident);
  const incidents = useTelemetryStore((s) => s.incidents);

  const scrollToSection = useCallback((index: number) => {
    const sectionIds = ['health-section', 'production-section', 'skills-section', 'incidents-section'];
    const el = document.getElementById(sectionIds[index]);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      const key = e.key.toLowerCase();

      if (key === '?' || (key === '/' && e.shiftKey)) {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
        return;
      }

      if (key === 'escape') {
        if (helpOpen) setHelpOpen(false);
        else if (settingsOpen) toggleSettings();
        return;
      }

      if (key === 's' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onToggleSidebar();
        return;
      }

      if (key >= '1' && key <= '4') {
        e.preventDefault();
        scrollToSection(parseInt(key) - 1);
        return;
      }

      if (key === 'a' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const latest = incidents.find((i) => !i.acknowledged);
        if (latest) {
          acknowledgeIncident(latest.id);
          showToast(`Alert acknowledged: ${latest.title}`, 'success', 3000);
        }
        return;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [helpOpen, settingsOpen, toggleSettings, onToggleSidebar, scrollToSection, acknowledgeIncident, incidents]);

  if (!helpOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[90]"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={() => setHelpOpen(false)}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] w-full max-w-[380px] rounded-[8px] animate-scale-in"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <div className="flex items-center gap-2">
            <Keyboard size={16} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={() => setHelpOpen(false)}
            className="p-1 rounded-[4px] transition-colors focus-ring"
            style={{ color: 'var(--text-tertiary)', background: 'transparent', border: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            aria-label="Close shortcuts help"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="px-5 py-4 space-y-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1.5">
              <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                {s.description}
              </span>
              <kbd
                className="px-2 py-0.5 rounded-[3px] text-[11px] font-metric font-semibold min-w-[28px] text-center"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-accent)',
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
