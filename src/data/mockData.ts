import type {
  WorkcellConfig,
  ShiftScheduleEntry,
  SkillCatalogEntry,
  HardwareComponent,
} from '@/lib/types';

// ─── Workcell Configuration ─────────────────────────────────────

export const workcellConfig: WorkcellConfig = {
  id: 'wc-alpha-01',
  name: 'Workcell Alpha-01',
  location: 'Building 7, Bay 3 — Munich Production Facility',
  robotModel: 'Universal Robots UR5e',
  gripper: 'Robotiq Hand-E Adaptive Gripper',
  cameras: '2× Basler ace 2 (GigE) + 1× Intel RealSense D435i',
  deployedSince: '2024-09-14',
};

// ─── Shift Schedule ─────────────────────────────────────────────

export const shiftSchedule: ShiftScheduleEntry[] = [
  { shift: 1, name: 'Morning', operator: 'K. Richter', startHour: 6, endHour: 14 },
  { shift: 2, name: 'Afternoon', operator: 'M. Tanaka', startHour: 14, endHour: 22 },
  { shift: 3, name: 'Night', operator: 'A. Petrov', startHour: 22, endHour: 6 },
];

// ─── Skill Catalog ──────────────────────────────────────────────

export const skillCatalog: SkillCatalogEntry[] = [
  {
    id: 'skill-fbi',
    name: 'Force-Based Insertion',
    description: 'Precision insertion of connectors using real-time force/torque feedback. Adapts insertion angle and speed based on measured Z-axis forces to prevent damage.',
    avgDuration: 8.2,
    category: 'Assembly',
  },
  {
    id: 'skill-ope',
    name: 'Object Pose Estimation',
    description: 'Uses the Intrinsic Vision Model (IVM) to estimate 6-DOF pose of target objects from RGB-D input. Runs on-edge with <100ms inference.',
    avgDuration: 0.8,
    category: 'Perception',
  },
  {
    id: 'skill-cr',
    name: 'Cable Routing',
    description: 'Deformable linear object manipulation for routing cables through predefined waypoints. Uses tactile feedback for grasp adjustment.',
    avgDuration: 12.5,
    category: 'Assembly',
  },
  {
    id: 'skill-cd',
    name: 'Connector Detection',
    description: 'High-confidence localization of electrical connectors (USB-C, JST, Molex) in cluttered environments. Outputs bounding box + grasp pose.',
    avgDuration: 1.2,
    category: 'Perception',
  },
  {
    id: 'skill-pp',
    name: 'Pick and Place',
    description: 'General-purpose grasping and placement with collision-aware motion planning. Supports bin picking with heap analysis.',
    avgDuration: 6.4,
    category: 'Manipulation',
  },
];

// ─── Hardware Components ────────────────────────────────────────

export const hardwareComponents: HardwareComponent[] = [
  { id: 'hw-001', name: 'Robot Arm', type: 'Manipulator', model: 'UR5e', serialNumber: 'UR-2024-A7X3K9' },
  { id: 'hw-002', name: 'Adaptive Gripper', type: 'End Effector', model: 'Robotiq Hand-E', serialNumber: 'RQ-HE-88231' },
  { id: 'hw-003', name: 'Left Camera', type: 'Vision', model: 'Basler ace 2 GigE', serialNumber: 'BA-22917645' },
  { id: 'hw-004', name: 'Right Camera', type: 'Vision', model: 'Basler ace 2 GigE', serialNumber: 'BA-22917702' },
  { id: 'hw-005', name: 'Depth Camera', type: 'Vision', model: 'Intel RealSense D435i', serialNumber: 'RS-D435-0091A' },
  { id: 'hw-006', name: 'Force/Torque Sensor', type: 'Sensor', model: 'OnRobot HEX-E', serialNumber: 'OR-HEX-44120' },
  { id: 'hw-007', name: 'Edge Compute Unit', type: 'Compute', model: 'NVIDIA Jetson AGX Orin', serialNumber: 'NV-AGX-7722B' },
  { id: 'hw-008', name: 'Safety Controller', type: 'Safety', model: 'SICK Flexi Classic', serialNumber: 'SK-FC-33019' },
];

// ─── Incident Templates ─────────────────────────────────────────

export interface IncidentTemplate {
  title: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  source: string;
  suggestedAction: string;
  behaviorTreeContext: string[];
}

export const incidentTemplates: IncidentTemplate[] = [
  {
    title: 'IVM confidence below threshold on connector C3',
    severity: 'warning',
    description: 'Intrinsic Vision Model reported confidence 0.58 for connector C3 detection, below the 0.65 threshold. Lighting conditions may have changed.',
    source: 'IVM',
    suggestedAction: 'Verify camera calibration and ambient lighting. Re-run perception pipeline if issue persists.',
    behaviorTreeContext: ['MoveTo(pregrasp)', 'ActivatePerception()', 'DetectConnector(C3)', 'EvaluateConfidence()', '→ FAILED'],
  },
  {
    title: 'Force limit exceeded during insertion — Check Alignment',
    severity: 'warning',
    description: 'Z-axis force reached 42.3N during connector insertion, exceeding the 35N safety threshold. Insertion was aborted and arm retracted to safe position.',
    source: 'Force Sensor',
    suggestedAction: 'Inspect connector alignment. Check if target fixture has shifted. Run alignment verification skill.',
    behaviorTreeContext: ['GraspConnector()', 'MoveTo(insertionPose)', 'ForceBasedInsert()', 'MonitorForce(Z)', '→ THRESHOLD_EXCEEDED'],
  },
  {
    title: 'Gripper feedback timeout — Cycle paused',
    severity: 'critical',
    description: 'Robotiq Hand-E did not respond to close command within 500ms timeout. Communication link may be degraded. Cycle has been paused pending operator review.',
    source: 'Gripper',
    suggestedAction: 'Check gripper USB connection. Power cycle gripper if unresponsive. Verify firmware version compatibility.',
    behaviorTreeContext: ['MoveTo(graspPose)', 'CloseGripper(force=40)', 'WaitForFeedback()', 'Timeout(500ms)', '→ PAUSED'],
  },
  {
    title: 'Camera feed latency >200ms',
    severity: 'info',
    description: 'Left Basler camera frame delivery latency increased to 247ms (nominal: <50ms). Network congestion or GigE bandwidth saturation suspected.',
    source: 'Vision System',
    suggestedAction: 'Check GigE switch port utilization. Consider reducing frame rate or resolution temporarily.',
    behaviorTreeContext: ['ActivatePerception()', 'AcquireFrame(left_cam)', 'MeasureLatency()', 'LogAnomaly()', '→ CONTINUE'],
  },
  {
    title: "Behavior tree node 'VerifyPlacement' failed — Retry initiated",
    severity: 'warning',
    description: 'Post-placement verification detected part misalignment >2mm tolerance. Automatic retry #1 initiated with adjusted placement offset.',
    source: 'Behavior Engine',
    suggestedAction: 'Monitor retry outcome. If retry fails, inspect placement fixture for debris or thermal drift.',
    behaviorTreeContext: ['PlaceObject()', 'ReleaseGripper()', 'VerifyPlacement(tol=2mm)', 'RetryWithOffset()', '→ RETRYING'],
  },
  {
    title: 'Container health check failed for perception-service',
    severity: 'critical',
    description: 'Kubernetes liveness probe for perception-service container failed 3 consecutive times. Pod restart initiated. Expected 15s downtime for perception capabilities.',
    source: 'Cluster Health',
    suggestedAction: 'Check perception-service logs for OOM or crash loop. Verify GPU memory allocation. Escalate if restart fails.',
    behaviorTreeContext: ['SystemHealthCheck()', 'PingService(perception)', 'RetryProbe(3x)', 'InitiateRestart()', '→ RESTARTING'],
  },
  {
    title: 'Cycle time drift detected: +15% above baseline',
    severity: 'info',
    description: 'Rolling average cycle time has drifted to 14.3s, which is 15.2% above the 12.4s baseline. May indicate mechanical wear or suboptimal path planning.',
    source: 'Performance Monitor',
    suggestedAction: 'Review motion planner logs for path inefficiencies. Schedule preventive maintenance check on joints 3 and 5.',
    behaviorTreeContext: ['CompleteCycle()', 'MeasureCycleTime()', 'ComputeRollingAvg()', 'CheckDrift(15%)', '→ ALERT'],
  },
];

// ─── Behavior Tree Node Names (for context generation) ──────────

export const behaviorTreeNodes = [
  'MoveTo(pregrasp)', 'MoveTo(graspPose)', 'MoveTo(insertionPose)', 'MoveTo(homePose)',
  'CloseGripper(force=40)', 'OpenGripper()', 'ReleaseGripper()',
  'ActivatePerception()', 'DetectConnector(C3)', 'EstimatePose(target)',
  'ForceBasedInsert()', 'MonitorForce(Z)', 'VerifyPlacement(tol=2mm)',
  'PlaceObject()', 'GraspConnector()', 'AcquireFrame(left_cam)',
  'CompleteCycle()', 'SystemHealthCheck()', 'WaitForFeedback()',
];

// ─── Skill Names (for rotation in simulation) ───────────────────

export const activeSkillNames = skillCatalog.map((s) => s.name);
