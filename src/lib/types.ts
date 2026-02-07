// ─── System Status ──────────────────────────────────────────────

export type SystemStatus = 'operational' | 'degraded' | 'stopped';
export type IncidentSeverity = 'critical' | 'warning' | 'info';
export type SkillOutcome = 'success' | 'failure' | 'retry';
export type ThroughputTrend = 'up' | 'down' | 'stable';

// ─── Workcell State ─────────────────────────────────────────────

export interface ShiftInfo {
  operator: string;
  startTime: Date;
  target: number;
  completed: number;
}

export interface WorkcellState {
  status: SystemStatus;
  uptime: number;
  currentSkill: string;
  skillProgress: number;
  shiftInfo: ShiftInfo;
}

// ─── Production Metrics ─────────────────────────────────────────

export interface OEEMetrics {
  overall: number;
  availability: number;
  performance: number;
  quality: number;
}

export interface CycleTimePoint {
  time: string;
  value: number;
}

export interface CycleTimeMetrics {
  current: number;
  ideal: number;
  history: CycleTimePoint[];
}

export interface ThroughputMetrics {
  unitsPerHour: number;
  trend: ThroughputTrend;
}

export interface CostSavings {
  hoursSaved: number;
  dollarsSaved: number;
}

export interface ProductionMetrics {
  oee: OEEMetrics;
  cycleTime: CycleTimeMetrics;
  throughput: ThroughputMetrics;
  costSavings: CostSavings;
}

// ─── AI Skill Metrics ───────────────────────────────────────────

export interface SkillExecution {
  id: string;
  timestamp: Date;
  skill: string;
  duration: number;
  outcome: SkillOutcome;
  confidence: number;
}

export interface ForceDataPoint {
  time: string;
  force: number;
  threshold: number;
}

export interface SkillSummary {
  name: string;
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
}

export interface ActiveSkill {
  name: string;
  successRate: number;
  avgCycleTime: number;
  lastExecutions: SkillExecution[];
}

export interface IvmConfidencePoint {
  time: string;
  value: number;
}

export interface SkillMetrics {
  activeSkill: ActiveSkill;
  ivmConfidence: number;
  ivmConfidenceHistory: IvmConfidencePoint[];
  forceProfile: ForceDataPoint[];
  skills: SkillSummary[];
}

// ─── Incidents ──────────────────────────────────────────────────

export interface Incident {
  id: string;
  timestamp: Date;
  severity: IncidentSeverity;
  title: string;
  description: string;
  source: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  suggestedAction: string;
  behaviorTreeContext: string[];
}

// ─── Static Config ──────────────────────────────────────────────

export interface HardwareComponent {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
}

export interface SkillCatalogEntry {
  id: string;
  name: string;
  description: string;
  avgDuration: number;
  category: string;
}

export interface ShiftScheduleEntry {
  shift: number;
  name: string;
  operator: string;
  startHour: number;
  endHour: number;
}

export interface WorkcellConfig {
  id: string;
  name: string;
  location: string;
  robotModel: string;
  gripper: string;
  cameras: string;
  deployedSince: string;
}

// ─── Full Telemetry Store Shape ─────────────────────────────────

export interface TelemetryState {
  workcell: WorkcellState;
  production: ProductionMetrics;
  skills: SkillMetrics;
  incidents: Incident[];
  isSimulating: boolean;
}

// ─── Settings / Configuration ───────────────────────────────────

export interface AlertThresholds {
  ivmConfidence: number;
  forceLimit: number;
  cycleTimeVariance: number;
}

export interface DisplaySettings {
  refreshRate: number;
  darkMode: boolean;
  metricUnits: boolean;
}

export interface NotificationRouting {
  email: { critical: boolean; warning: boolean; info: boolean };
  sms: { critical: boolean; warning: boolean; info: boolean };
  webhook: { critical: boolean; warning: boolean; info: boolean };
}

export interface AppSettings {
  alertThresholds: AlertThresholds;
  display: DisplaySettings;
  laborRate: number;
  notifications: NotificationRouting;
}

// ─── Legacy compat (used by existing components) ────────────────

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
}

export interface TelemetryDataPoint {
  timestamp: string;
  value: number;
}
