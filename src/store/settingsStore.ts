import { create } from 'zustand';
import type { AppSettings, AlertThresholds, DisplaySettings, NotificationRouting } from '@/lib/types';

interface SettingsActions {
  updateThresholds: (thresholds: Partial<AlertThresholds>) => void;
  updateDisplay: (display: Partial<DisplaySettings>) => void;
  updateLaborRate: (rate: number) => void;
  updateNotifications: (notifications: Partial<NotificationRouting>) => void;
  toggleSettingsPanel: () => void;
}

interface SettingsStore extends AppSettings {
  settingsPanelOpen: boolean;
  actions: SettingsActions;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  alertThresholds: {
    ivmConfidence: 0.65,
    forceLimit: 35,
    cycleTimeVariance: 2,
  },
  display: {
    refreshRate: 1.5,
    darkMode: true,
    metricUnits: true,
  },
  laborRate: 100,
  notifications: {
    email: { critical: true, warning: true, info: false },
    sms: { critical: true, warning: false, info: false },
    webhook: { critical: true, warning: true, info: true },
  },
  settingsPanelOpen: false,

  actions: {
    updateThresholds: (thresholds) =>
      set((state) => ({
        alertThresholds: { ...state.alertThresholds, ...thresholds },
      })),
    updateDisplay: (display) =>
      set((state) => ({
        display: { ...state.display, ...display },
      })),
    updateLaborRate: (rate) => set({ laborRate: rate }),
    updateNotifications: (notifications) =>
      set((state) => ({
        notifications: { ...state.notifications, ...notifications },
      })),
    toggleSettingsPanel: () =>
      set((state) => ({ settingsPanelOpen: !state.settingsPanelOpen })),
  },
}));
