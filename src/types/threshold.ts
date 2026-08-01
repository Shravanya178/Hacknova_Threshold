export type ExperienceStep = {
  id: string;
  verb: "attend" | "ask" | "meet" | "apply" | "reflect" | "rest";
  label: string;
  requires_output: boolean;
};

export type EvidenceEntry = {
  id: string;
  user_id: string;
  step_id: string;
  type: "behavioral" | "social" | "emotional" | "skill" | "reflective";
  content: string;
  timestamp: string;
};

export type AgentTraceItem = {
  agent: string;
  tool?: string;
  input?: any;
  result?: any;
};

export type Diagnosis = {
  quadrant: "Commitment" | "Curiosity" | "Compassion" | "Rest";
  quadrant_reasoning: string;
  rejected_quadrants: { quadrant: string; reason_rejected: string }[];
  capability_gap: string;
  gap_reasoning: string;
  journey: ExperienceStep[];
  trace: AgentTraceItem[];
};

export type TimelineEntry = {
  id: string;
  month: string;
  label: string;
  quadrant: "Commitment" | "Curiosity" | "Compassion" | "Rest";
  capability_gap: string;
  reasoning: string;
};

export type User = {
  id: string;
  name: string;
  stated_goal: string;
  recent_reflections: string[];
  timeline: TimelineEntry[];
};
