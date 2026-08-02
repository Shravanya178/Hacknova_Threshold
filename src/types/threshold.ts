export type ExperienceStep = {
  id: string;
  verb: "attend" | "ask" | "meet" | "apply" | "reflect" | "rest";
  label: string;
  requires_output: boolean;
  resource_type?: "video" | "audio" | "text" | "slides" | "creative_hub";
  media_plan?: MediaPlan;
  media?: {
    id: string;
    title: string;
    source: "IABTM";
    capability_gap: string;
    content?: string;
  };
};

export type MediaPlanSegment = {
  id: string;
  type: "watch" | "skip";
  // Segment range: time bounds for video/audio, indexes for text/slides
  start: number;
  end: number;
  label?: string;
};

export type MediaOverlayNote = {
  id: string;
  // Position trigger (time for video/audio, index for text/slides)
  trigger_point: number;
  note: string;
};

export type MediaReflectionPause = {
  id: string;
  // Position trigger to lock progress until prompt submitted
  trigger_point: number;
  prompt: string;
};

export type MediaPlan = {
  segments: MediaPlanSegment[];
  notes: MediaOverlayNote[];
  prompts: MediaReflectionPause[];
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
