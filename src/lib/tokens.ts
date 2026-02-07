export const tokens = {
  borderRadius: {
    card: '6px',
    button: '4px',
    input: '4px',
    statusDot: '50%',
  },
  padding: {
    card: '20px',
    cardCompact: '16px',
  },
  gap: {
    grid: '16px',
  },
  statusDotSize: '10px',
  fontSize: {
    caption: '11px',
    body: '13px',
    bodyLg: '14px',
    metricMd: '20px',
    metricLg: '28px',
    metricHero: '40px',
  },
  transition: {
    default: 'all 150ms ease',
    emphasis: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  colors: {
    bg: {
      primary: '#0A0E17',
      secondary: '#111827',
      tertiary: '#1A2332',
      surface: '#1E293B',
    },
    border: {
      primary: '#1E293B',
      accent: '#334155',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      tertiary: '#64748B',
    },
    status: {
      operational: '#22C55E',
      operationalBg: '#052E16',
      degraded: '#F59E0B',
      degradedBg: '#451A03',
      critical: '#EF4444',
      criticalBg: '#450A0A',
      info: '#3B82F6',
    },
    accent: {
      primary: '#0066FF',
      hover: '#2563EB',
      muted: '#1E3A5F',
    },
    chart: {
      primary: '#0066FF',
      secondary: '#8B5CF6',
      tertiary: '#06B6D4',
      quaternary: '#F59E0B',
    },
  },
} as const;

export type StatusType = 'operational' | 'degraded' | 'critical' | 'info';
