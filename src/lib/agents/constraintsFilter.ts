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
};

/**
 * Constraints Filter — plain TypeScript function.
 * Adds constraints to the diagnosis context, determining what kinds of ExperienceSteps can be generated.
 */
export function runConstraintsFilter(
  diagnosis: { quadrant: string; capability_gap: string },
  constraints: Constraints
): FilteredDiagnosisContext {
  return {
    quadrant: diagnosis.quadrant as any,
    capability_gap: diagnosis.capability_gap,
    constraints: {
      timeLimit: constraints.timeAvailable,
      locationLimit: constraints.location,
      resourceLimit: constraints.resources || [],
    },
  };
}
