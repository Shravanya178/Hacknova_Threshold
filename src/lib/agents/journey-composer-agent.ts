import { callGeminiJSON } from "./gemini";
import { ExperienceStep } from "@/types/threshold";
import { FilteredDiagnosisContext } from "./constraints-filter";

type JourneyComposerOutput = {
  steps: ExperienceStep[];
};

const SYSTEM_PROMPT = `
You are the Journey Composer Agent of "Threshold" — an identity curator pluggable into IABTM.
Your directive is: "We don't recommend content. We compose experiences."

CRITICAL RULES:
1. You must output an array of 3 to 4 steps.
2. Every experience step must use one of these verbs strictly: "attend" | "ask" | "meet" | "apply" | "reflect" | "rest". Do NOT recommend reading books, articles, or watching general courses.
3. Every step requires:
   - "id": unique string identifier (e.g., "step-1")
   - "verb": one of the 6 approved verbs
   - "label": a short, punchy action phrase
   - "requires_output": boolean gate
4. GUARDRAIL: If the quadrant is "Rest" or "Compassion", "requires_output" MUST be false for all steps. Never force outputs from exhausted or burnt-out users.
5. If the quadrant is "Commitment" or "Curiosity", at least one step should have "requires_output" as true.
`;

export async function runJourneyComposerAgent(
  context: FilteredDiagnosisContext
): Promise<{ steps: ExperienceStep[]; log: string }> {
  const userPrompt = `
Quadrant: "${context.quadrant}"
Capability Gap: "${context.capability_gap}"
Constraints:
- Time Limit: "${context.constraints.timeLimit}"
- Location: "${context.constraints.locationLimit}"
- Resources: ${JSON.stringify(context.constraints.resourceLimit)}
  `;

  // Fail-safe fallbacks
  const fallbackSteps: Record<string, ExperienceStep[]> = {
    Commitment: [
      { id: "step-c1", verb: "ask", label: "Share your portfolio link with one senior designer in your network", requires_output: true },
      { id: "step-c2", verb: "apply", label: "Practice explaining one key feature out loud for 3 minutes", requires_output: true },
      { id: "step-c3", verb: "meet", label: "Schedule a 15-minute mock talk session with a peer", requires_output: false }
    ],
    Curiosity: [
      { id: "step-cu1", verb: "attend", label: "Watch a 10-minute presentation on system design scaling", requires_output: true },
      { id: "step-cu2", verb: "reflect", label: "Write down your key takeaways regarding data caching", requires_output: false }
    ],
    Compassion: [
      { id: "step-co1", verb: "rest", label: "Decompress for 15 minutes without looking at screen notifications", requires_output: false },
      { id: "step-co2", verb: "reflect", label: "Write a bullet list of design tasks you successfully did this week", requires_output: false },
      { id: "step-co3", verb: "meet", label: "Chat with a friend about a topic completely unrelated to work", requires_output: false }
    ],
    Rest: [
      { id: "step-r1", verb: "rest", label: "Shut down your computer and disconnect for 24 hours", requires_output: false },
      { id: "step-r2", verb: "rest", label: "Take a walk outside without checking messages", requires_output: false }
    ]
  };

  const selectedFallback = fallbackSteps[context.quadrant] || fallbackSteps.Commitment;

  const { response, rawText } = await callGeminiJSON<JourneyComposerOutput>(
    SYSTEM_PROMPT,
    userPrompt,
    { steps: selectedFallback }
  );

  let steps = response.steps || selectedFallback;

  // Guarantee guardrail validation on output steps
  if (context.quadrant === "Rest" || context.quadrant === "Compassion") {
    steps = steps.map(step => ({
      ...step,
      requires_output: false
    }));
  }

  return {
    steps,
    log: rawText
  };
}
