import { ExperienceStep } from "@/types/threshold";

export type Constraints = {
  timeAvailable: "5min" | "30min" | "open";
  location: "remote" | "in-person";
  resources: string[];
};

export type FilteredDiagnosisContext = {
  quadrant: "Commitment" | "Curiosity" | "Compassion" | "Rest";
  capability_gap: string;
  constraints: {
    timeLimit: "5min" | "30min" | "open";
    locationLimit: "remote" | "in-person";
    resourceLimit: string[];
  };
  drop_off_detected?: boolean;
};

/**
 * Constraints Filter — plain TypeScript function (NOT an LLM call).
 * Input: ExperienceStep[] + a time_available value ("5min" | "30min" | "open").
 * Filters or resizes steps that don't fit the user's available time.
 */
export function runConstraintsFilter(
  steps: ExperienceStep[],
  timeAvailable: "5min" | "30min" | "open"
): ExperienceStep[] {
  if (timeAvailable === "open") {
    // Keep all steps as is in their default format
    return steps;
  }

  // Adjust or filter steps to fit within the constraint
  return steps.map((step) => {
    let label = step.label;
    let requires_output = step.requires_output;

    if (timeAvailable === "5min") {
      // 5-minute sessions should be extremely brief and non-blocking
      requires_output = false; // No output gating for 5-minute micro-tasks
      
      if (
        label.toLowerCase().includes("schedule") ||
        label.toLowerCase().includes("meet") ||
        label.toLowerCase().includes("attend")
      ) {
        label = `Draft a calendar invite or brief note for: "${label}" (5m prep)`;
      } else if (
        label.toLowerCase().includes("explain") ||
        label.toLowerCase().includes("practice") ||
        label.toLowerCase().includes("present")
      ) {
        label = `Explain the core concept out loud to yourself for 2 minutes`;
      } else {
        label = `Quick review: ${label} (5m version)`;
      }
    } else if (timeAvailable === "30min") {
      // 30-minute sessions accommodate medium-length tasks
      if (
        label.toLowerCase().includes("attend a scale workshop") ||
        label.toLowerCase().includes("meet for an hour") ||
        label.toLowerCase().includes("schedule a long mockup")
      ) {
        label = `Research contacts & draft agenda for: "${label}" (30m prep)`;
      }
    }

    return {
      ...step,
      id: step.id,
      verb: step.verb,
      label,
      requires_output
    };
  });
}

/**
 * Filter Diagnosis Context — filters metadata details to feed into the Journey Composer.
 */
export function filterDiagnosisContext(
  diagnosis: { quadrant: string; capability_gap: string },
  constraints: Constraints
): FilteredDiagnosisContext {
  return {
    quadrant: diagnosis.quadrant as any,
    capability_gap: diagnosis.capability_gap,
    constraints: {
      timeLimit: constraints.timeAvailable,
      locationLimit: constraints.location,
      resourceLimit: constraints.resources || []
    }
  };
}
