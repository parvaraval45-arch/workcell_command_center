import { create } from 'zustand';
import type {
  TelemetryState,
  WorkcellState,
  ProductionMetrics,
  SkillMetrics,
  Incident,
  SkillExecution,
  ForceDataPoint,
  CycleTimePoint,
  SystemStatus,
  SkillOutcome,
} from '@/lib/types';
import {
  incidentTemplates,
  activeSkillNames,
  skillCatalog,
  shiftSchedule,
} from '@/data/mockData';

// ─── Helpers ────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function drift(current: number, min: number, max: number, maxDelta: number): number {
  const delta = rand(-maxDelta, maxDelta);
  return clamp(current + delta, min, max);
}

function timeStr(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getCurrentShiftOperator(): string {
  const hour = new Date().getHours();
  const shift = shiftSchedule.find((s) => {
    if (s.startHour < s.endHour) {
      return hour >= s.startHour && hour < s.endHour;
    }
    return hour >= s.startHour || hour < s.endHour;
  });
  return shift?.operator ?? 'K. Richter';
}

// ─── Initial State Builders ─────────────────────────────────────

function buildInitialCycleTimeHistory(): CycleTimePoint[] {
  const points: CycleTimePoint[] = [];
  const now = Date.now();
  for (let i = 49; i >= 0; i--) {
    points.push({
      time: new Date(now - i * 60_000).toLocaleTimeString('en-US', { hour12: false }),
      value: parseFloat(rand(11.0, 14.5).toFixed(1)),
    });
  }
  return points;
}

function buildInitialForceProfile(): ForceDataPoint[] {
  const points: ForceDataPoint[] = [];
  const now = Date.now();
  for (let i = 59; i >= 0; i--) {
    const t = (60 - i) / 60;
    const base = 18 + 8 * Math.sin(t * Math.PI * 4);
    points.push({
      time: new Date(now - i * 1000).toLocaleTimeString('en-US', { hour12: false }),
      force: parseFloat((base + rand(-2, 2)).toFixed(1)),
      threshold: 35,
    });
  }
  return points;
}

function buildInitialSkillSummaries() {
  return skillCatalog.map((s) => ({
    name: s.name,
    totalExecutions: randInt(800, 5000),
    successRate: parseFloat(rand(88, 99.5).toFixed(1)),
    avgDuration: parseFloat((s.avgDuration + rand(-1, 1)).toFixed(1)),
  }));
}

function buildInitialExecutions(): SkillExecution[] {
  const execs: SkillExecution[] = [];
  const now = Date.now();
  for (let i = 99; i >= 0; i--) {
    const skill = activeSkillNames[randInt(0, activeSkillNames.length - 1)];
    const roll = Math.random();
    const outcome: SkillOutcome = roll < 0.85 ? 'success' : roll < 0.95 ? 'retry' : 'failure';
    execs.push({
      id: uuid(),
      timestamp: new Date(now - i * randInt(45000, 75000)),
      skill,
      duration: parseFloat(rand(5, 15).toFixed(1)),
      outcome,
      confidence: parseFloat(rand(0.7, 0.98).toFixed(3)),
    });
  }
  return execs;
}

function buildInitialIvmHistory(): { time: string; value: number }[] {
  const points: { time: string; value: number }[] = [];
  const now = Date.now();
  let val = 0.92;
  for (let i = 29; i >= 0; i--) {
    val = clamp(val + rand(-0.02, 0.02), 0.55, 0.99);
    points.push({
      time: new Date(now - i * 3000).toLocaleTimeString('en-US', { hour12: false }),
      value: parseFloat(val.toFixed(3)),
    });
  }
  return points;
}

// ─── Initial State ──────────────────────────────────────────────

const initialWorkcell: WorkcellState = {
  status: 'operational',
  uptime: 47832,
  currentSkill: 'Force-Based Insertion',
  skillProgress: 42,
  shiftInfo: {
    operator: getCurrentShiftOperator(),
    startTime: new Date(),
    target: 1200,
    completed: 847,
  },
};

const initialProduction: ProductionMetrics = {
  oee: {
    overall: 84.2,
    availability: 94.5,
    performance: 91.3,
    quality: 97.6,
  },
  cycleTime: {
    current: 12.4,
    ideal: 11.2,
    history: buildInitialCycleTimeHistory(),
  },
  throughput: {
    unitsPerHour: 48,
    trend: 'stable',
  },
  costSavings: {
    hoursSaved: 127.4,
    dollarsSaved: 8920,
  },
};

const initialSkills: SkillMetrics = {
  activeSkill: {
    name: 'Force-Based Insertion',
    successRate: 96.2,
    avgCycleTime: 8.4,
    lastExecutions: buildInitialExecutions(),
  },
  ivmConfidence: 0.92,
  ivmConfidenceHistory: buildInitialIvmHistory(),
  forceProfile: buildInitialForceProfile(),
  skills: buildInitialSkillSummaries(),
};

// ─── Store Interface ────────────────────────────────────────────

interface TelemetryActions {
  startSimulation: () => void;
  stopSimulation: () => void;
  acknowledgeIncident: (id: string) => void;
  resolveIncident: (id: string) => void;
  triggerRemoteReset: () => void;
}

type TelemetryStore = TelemetryState & TelemetryActions;

// ─── Simulation Internals ───────────────────────────────────────

let tickInterval: ReturnType<typeof setInterval> | null = null;
let cycleTimer: ReturnType<typeof setTimeout> | null = null;
let incidentTimer: ReturnType<typeof setTimeout> | null = null;
let stateChangeTimer: ReturnType<typeof setTimeout> | null = null;
const nestedTimers: ReturnType<typeof setTimeout>[] = [];

// Track ticks for periodic events
let tickCount = 0;

// ─── Store ──────────────────────────────────────────────────────

export const useTelemetryStore = create<TelemetryStore>((set, get) => ({
  // State
  workcell: initialWorkcell,
  production: initialProduction,
  skills: initialSkills,
  incidents: [],
  isSimulating: false,

  // Actions
  acknowledgeIncident: (id: string) =>
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              acknowledged: true,
              acknowledgedBy: state.workcell.shiftInfo.operator,
              acknowledgedAt: new Date(),
            }
          : inc
      ),
    })),

  resolveIncident: (id: string) =>
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === id ? { ...inc, resolvedAt: new Date(), acknowledged: true } : inc
      ),
    })),

  triggerRemoteReset: () => {
    // Go stopped briefly, then recover
    set((state) => ({
      workcell: { ...state.workcell, status: 'stopped' as SystemStatus },
    }));
    setTimeout(() => {
      set((state) => ({
        workcell: { ...state.workcell, status: 'operational' as SystemStatus },
      }));
    }, 15_000);
  },

  startSimulation: () => {
    if (get().isSimulating) return;
    set({ isSimulating: true });

    // ── Main tick: runs every 1.5s ──────────────────────────
    tickInterval = setInterval(() => {
      tickCount++;

      set((state) => {
        const { workcell, production, skills } = state;
        const isStopped = workcell.status === 'stopped';

        // 1. Uptime increments (not when stopped)
        const newUptime = isStopped ? workcell.uptime : workcell.uptime + 1;

        // 2. Skill progress advances
        const progressIncrement = isStopped ? 0 : rand(3, 8);
        let newSkillProgress = workcell.skillProgress + progressIncrement;
        let newCurrentSkill = workcell.currentSkill;

        // Skill completes → rotate to next
        if (newSkillProgress >= 100) {
          newSkillProgress = rand(0, 15);
          const currentIdx = activeSkillNames.indexOf(workcell.currentSkill);
          newCurrentSkill = activeSkillNames[(currentIdx + 1) % activeSkillNames.length];
        }

        // 3. Production unit completion tracking
        const newShiftCompleted = isStopped
          ? workcell.shiftInfo.completed
          : workcell.shiftInfo.completed + (Math.random() < 0.03 ? 1 : 0);

        // 4. OEE components drift
        const newAvailability = drift(
          production.oee.availability,
          isStopped ? 60 : 88,
          98,
          isStopped ? 2.0 : 0.4
        );
        const newPerformance = drift(production.oee.performance, 80, 96, 0.5);
        const newQuality = drift(production.oee.quality, 92, 99, 0.2);
        const newOverall = parseFloat(
          ((newAvailability * newPerformance * newQuality) / 10000).toFixed(1)
        );

        // 5. Cycle time drift
        const newCycleTime = parseFloat(
          drift(production.cycleTime.current, 10.5, 16.0, 0.3).toFixed(1)
        );

        // Push cycle time to history every 4 ticks (~6s)
        let newHistory = production.cycleTime.history;
        if (tickCount % 4 === 0) {
          newHistory = [
            ...production.cycleTime.history.slice(-49),
            { time: timeStr(), value: newCycleTime },
          ];
        }

        // 6. Throughput
        const rawUnitsPerHour = (3600 / newCycleTime);
        const adjustedUPH = parseFloat((rawUnitsPerHour * (newQuality / 100)).toFixed(0));
        const prevUPH = production.throughput.unitsPerHour;
        const throughputTrend = adjustedUPH > prevUPH + 2
          ? 'up' as const
          : adjustedUPH < prevUPH - 2
            ? 'down' as const
            : 'stable' as const;

        // 7. Cost savings accrue slowly
        const hoursSavedIncrement = isStopped ? 0 : rand(0.005, 0.02);
        const newHoursSaved = parseFloat((production.costSavings.hoursSaved + hoursSavedIncrement).toFixed(1));
        const newDollarsSaved = parseFloat((newHoursSaved * 70).toFixed(0));

        // 8. IVM Confidence — mostly stable, occasional dips
        let newIvmConfidence = drift(skills.ivmConfidence, 0.55, 0.99, 0.015);
        // Rare dramatic dip
        if (Math.random() < 0.02) {
          newIvmConfidence = parseFloat(rand(0.52, 0.68).toFixed(3));
        }
        newIvmConfidence = parseFloat(newIvmConfidence.toFixed(3));

        // 9. Force profile — sine wave + noise, occasional spikes
        const t = tickCount / 20;
        const baseForce = 18 + 8 * Math.sin(t * Math.PI);
        let newForce = baseForce + rand(-3, 3);
        // Occasional spike above threshold
        if (Math.random() < 0.03) {
          newForce = rand(33, 45);
        }
        newForce = parseFloat(newForce.toFixed(1));
        const newForceProfile = [
          ...skills.forceProfile.slice(-59),
          { time: timeStr(), force: newForce, threshold: 35 },
        ];

        // 10. Active skill stats drift
        const newActiveSkillSuccessRate = parseFloat(
          drift(skills.activeSkill.successRate, 85, 99.5, 0.3).toFixed(1)
        );
        const newActiveSkillAvgCycle = parseFloat(
          drift(skills.activeSkill.avgCycleTime, 6, 14, 0.2).toFixed(1)
        );

        // 10b. IVM confidence history — push every 2 ticks (~3s)
        let newIvmHistory = skills.ivmConfidenceHistory;
        if (tickCount % 2 === 0) {
          newIvmHistory = [
            ...skills.ivmConfidenceHistory.slice(-29),
            { time: timeStr(), value: newIvmConfidence },
          ];
        }

        // 11. Skill summary stats — slow drift
        const newSkillSummaries = skills.skills.map((s) => ({
          ...s,
          totalExecutions: s.totalExecutions + (Math.random() < 0.1 ? 1 : 0),
          successRate: parseFloat(drift(s.successRate, 85, 99.8, 0.1).toFixed(1)),
          avgDuration: parseFloat(drift(s.avgDuration, 0.5, 15, 0.05).toFixed(1)),
        }));

        return {
          workcell: {
            ...workcell,
            uptime: newUptime,
            currentSkill: newCurrentSkill,
            skillProgress: parseFloat(newSkillProgress.toFixed(0)),
            shiftInfo: {
              ...workcell.shiftInfo,
              completed: newShiftCompleted,
            },
          },
          production: {
            oee: {
              overall: newOverall,
              availability: parseFloat(newAvailability.toFixed(1)),
              performance: parseFloat(newPerformance.toFixed(1)),
              quality: parseFloat(newQuality.toFixed(1)),
            },
            cycleTime: {
              ...production.cycleTime,
              current: newCycleTime,
              history: newHistory,
            },
            throughput: {
              unitsPerHour: adjustedUPH,
              trend: throughputTrend,
            },
            costSavings: {
              hoursSaved: newHoursSaved,
              dollarsSaved: newDollarsSaved,
            },
          },
          skills: {
            activeSkill: {
              ...skills.activeSkill,
              name: newCurrentSkill,
              successRate: newActiveSkillSuccessRate,
              avgCycleTime: newActiveSkillAvgCycle,
            },
            ivmConfidence: newIvmConfidence,
            ivmConfidenceHistory: newIvmHistory,
            forceProfile: newForceProfile,
            skills: newSkillSummaries,
          },
        };
      });
    }, 1500);

    // ── Cycle completion: every 45-75s, log a skill execution ───
    function scheduleCycleCompletion() {
      const delay = randInt(45000, 75000);
      cycleTimer = setTimeout(() => {
        set((state) => {
          if (!state.isSimulating) return state;
          const isStopped = state.workcell.status === 'stopped';

          if (isStopped) {
            scheduleCycleCompletion();
            return state;
          }

          const skill = state.workcell.currentSkill;
          const roll = Math.random();
          const outcome: SkillOutcome = roll < 0.85 ? 'success' : roll < 0.95 ? 'retry' : 'failure';
          const confidence = parseFloat(rand(0.68, 0.98).toFixed(3));

          const execution: SkillExecution = {
            id: uuid(),
            timestamp: new Date(),
            skill,
            duration: parseFloat(rand(5, 15).toFixed(1)),
            outcome,
            confidence,
          };

          const newExecs = [...state.skills.activeSkill.lastExecutions.slice(-99), execution];
          const newCompleted = outcome === 'success'
            ? state.workcell.shiftInfo.completed + 1
            : state.workcell.shiftInfo.completed;

          return {
            workcell: {
              ...state.workcell,
              shiftInfo: { ...state.workcell.shiftInfo, completed: newCompleted },
            },
            skills: {
              ...state.skills,
              activeSkill: {
                ...state.skills.activeSkill,
                lastExecutions: newExecs,
              },
            },
          };
        });

        if (get().isSimulating) scheduleCycleCompletion();
      }, delay);
    }
    scheduleCycleCompletion();

    // ── Incident generation: every 60-120s ──────────────────
    function scheduleIncident() {
      const delay = randInt(60000, 120000);
      incidentTimer = setTimeout(() => {
        set((state) => {
          if (!state.isSimulating) return state;

          const template = incidentTemplates[randInt(0, incidentTemplates.length - 1)];
          const incident: Incident = {
            id: uuid(),
            timestamp: new Date(),
            severity: template.severity,
            title: template.title,
            description: template.description,
            source: template.source,
            acknowledged: false,
            suggestedAction: template.suggestedAction,
            behaviorTreeContext: template.behaviorTreeContext,
          };

          // Keep last 20 incidents, newest first
          const newIncidents = [incident, ...state.incidents].slice(0, 20);

          return { incidents: newIncidents };
        });

        if (get().isSimulating) scheduleIncident();
      }, delay);
    }
    scheduleIncident();

    // ── State changes: degraded every 3-5 min, stopped rarely ──
    function scheduleStateChange() {
      // Next degraded event in 3-5 minutes
      const degradedDelay = randInt(180_000, 300_000);
      stateChangeTimer = setTimeout(() => {
        if (!get().isSimulating) return;

        // Go degraded
        set((state) => ({
          workcell: { ...state.workcell, status: 'degraded' as SystemStatus },
        }));

        // Recover after 10-30 seconds
        const recoveryDelay = randInt(10_000, 30_000);
        nestedTimers.push(setTimeout(() => {
          if (!get().isSimulating) return;
          set((state) => ({
            workcell: { ...state.workcell, status: 'operational' as SystemStatus },
          }));
        }, recoveryDelay));

        // Rarely go fully stopped (20% chance on each degraded cycle)
        if (Math.random() < 0.2) {
          const stoppedDelay = randInt(60_000, 120_000);
          nestedTimers.push(setTimeout(() => {
            if (!get().isSimulating) return;
            set((state) => ({
              workcell: { ...state.workcell, status: 'stopped' as SystemStatus },
            }));

            const stoppedRecovery = randInt(20_000, 60_000);
            nestedTimers.push(setTimeout(() => {
              if (!get().isSimulating) return;
              set((state) => ({
                workcell: { ...state.workcell, status: 'operational' as SystemStatus },
              }));
            }, stoppedRecovery));
          }, stoppedDelay));
        }

        if (get().isSimulating) scheduleStateChange();
      }, degradedDelay);
    }
    scheduleStateChange();
  },

  stopSimulation: () => {
    set({ isSimulating: false });
    if (tickInterval) clearInterval(tickInterval);
    if (cycleTimer) clearTimeout(cycleTimer);
    if (incidentTimer) clearTimeout(incidentTimer);
    if (stateChangeTimer) clearTimeout(stateChangeTimer);
    nestedTimers.forEach(clearTimeout);
    nestedTimers.length = 0;
    tickInterval = null;
    cycleTimer = null;
    incidentTimer = null;
    stateChangeTimer = null;
    tickCount = 0;
  },
}));
