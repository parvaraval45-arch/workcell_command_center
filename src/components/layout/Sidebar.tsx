'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Brain,
  AlertTriangle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useTelemetryStore } from '@/store/telemetryStore';
import { useSettingsStore } from '@/store/settingsStore';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, section: 'overview' },
  { label: 'Production', icon: BarChart3, section: 'production' },
  { label: 'AI Skills', icon: Brain, section: 'skills' },
  { label: 'Incidents', icon: AlertTriangle, section: 'incidents' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('Overview');
  const operator = useTelemetryStore((s) => s.workcell.shiftInfo.operator);
  const toggleSettings = useSettingsStore((s) => s.actions.toggleSettingsPanel);

  // Get operator initials
  const initials = operator.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  // Current shift info
  const hour = new Date().getHours();
  const shiftNum = hour >= 6 && hour < 14 ? 1 : hour >= 14 && hour < 22 ? 2 : 3;
  const shiftLabel = shiftNum === 1 ? '6:00 AM – 2:00 PM' : shiftNum === 2 ? '2:00 PM – 10:00 PM' : '10:00 PM – 6:00 AM';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          flex flex-col h-screen border-r z-50 shrink-0
          transition-all duration-300 ease-in-out
          ${mobileOpen ? 'fixed left-0 top-0 translate-x-0' : 'max-md:fixed max-md:-translate-x-full'}
          md:relative md:translate-x-0
        `}
        style={{
          width: collapsed ? 64 : 240,
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        {/* Logo area */}
        <div
          className="flex items-center h-[56px] px-4 border-b shrink-0"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          {collapsed ? (
            /* Collapsed: geometric icon */
            <div className="flex items-center justify-center w-full">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 2L25.6 8.5V21.5L14 28L2.4 21.5V8.5L14 2Z"
                  stroke="var(--accent-primary)"
                  strokeWidth="1.5"
                  fill="none"
                />
                <text
                  x="14" y="18"
                  textAnchor="middle"
                  fill="var(--accent-primary)"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  I
                </text>
              </svg>
            </div>
          ) : (
            <div className="flex flex-col">
              <span
                className="text-[14px] font-bold tracking-[0.1em]"
                style={{ color: 'var(--accent-primary)' }}
              >
                INTRINSIC
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                Workcell Command Center
              </span>
            </div>
          )}

          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="md:hidden ml-auto p-1 rounded"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5" aria-label="Main navigation" role="navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.label;

            return (
              <div key={item.label} className="relative group">
                <button
                  onClick={() => {
                    setActiveItem(item.label);
                    onMobileClose();
                  }}
                  className={`
                    flex items-center gap-3 py-[10px] rounded-[6px] text-[13px] font-medium
                    transition-all duration-150 w-full cursor-pointer
                    ${collapsed ? 'justify-center px-0' : 'px-3'}
                  `}
                  style={{
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    background: isActive ? 'var(--accent-primary)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {!collapsed && <span>{item.label}</span>}
                </button>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded-[4px] text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-accent)',
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}

          {/* Divider */}
          <div className="my-2 mx-2 h-px" style={{ background: 'var(--border-primary)' }} />

          {/* Settings */}
          <div className="relative group">
            <button
              onClick={() => {
                toggleSettings();
                onMobileClose();
              }}
              className={`
                flex items-center gap-3 py-[10px] rounded-[6px] text-[13px] font-medium
                transition-all duration-150 w-full cursor-pointer
                ${collapsed ? 'justify-center px-0' : 'px-3'}
              `}
              style={{ color: 'var(--text-secondary)', background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Settings size={18} strokeWidth={1.8} />
              {!collapsed && <span>Settings</span>}
            </button>

            {collapsed && (
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded-[4px] text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-accent)',
                }}
              >
                Settings
              </div>
            )}
          </div>
        </nav>

        {/* Bottom: Operator info + collapse toggle */}
        <div className="border-t px-3 py-3 shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
          {/* Operator info */}
          {!collapsed && (
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{ background: 'var(--accent-muted)', color: 'var(--accent-primary)' }}
              >
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {operator}
                </span>
                <span className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                  Shift {shiftNum} · {shiftLabel}
                </span>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="flex justify-center mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{ background: 'var(--accent-muted)', color: 'var(--accent-primary)' }}
              >
                {initials}
              </div>
            </div>
          )}

          {/* Collapse toggle (hidden on mobile) */}
          <button
            onClick={onToggle}
            className="hidden md:flex items-center justify-center w-full py-[6px] rounded-[4px] transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-tertiary)', background: 'transparent', border: 'none' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}

// Hamburger button for mobile — exported for use in TopBar
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-[4px] transition-colors duration-150 cursor-pointer"
      style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <Menu size={20} />
    </button>
  );
}
