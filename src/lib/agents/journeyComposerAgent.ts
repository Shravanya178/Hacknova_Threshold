import { callGeminiJSON } from "./gemini";
import { ExperienceStep } from "@/types/threshold";
import { FilteredDiagnosisContext } from "./constraints-filter";

type JourneyComposerOutput = {
  steps: ExperienceStep[];
};

const SYSTEM_PROMPT = `
You are the Journey Composer Agent of "Threshold" — a growth diagnosis platform.
Your objective is: "We don't recommend content. We compose experiences."
Given the user's Growth Diagnosis (quadrant, capability gap) and constraints, compose a personalized Experience Pathway (Growth Journey).

CRITICAL RULES:
1. You must output an array of 3 to 4 steps.
2. Each step must have:
   - "id": A unique short string (e.g. "step-1", "step-2")
   - "verb": MUST be one of: "attend" | "ask" | "meet" | "apply" | "reflect" | "rest"
   - "label": A short, punchy action phrase (e.g. "Record a 2-minute elevator pitch", "Ask senior designer to review resume layout")
   - "requires_output": A boolean indicating if a reflection is required before unlocking the next step.
3. GUARDRAIL: If the quadrant is "Rest" or "Compassion", "requires_output" MUST be false for EVERY step. Never force output from someone needing rest or support.
4. If the quadrant is "Commitment" or "Curiosity", at least one step should have "requires_output" as true to enforce active feedback gates.
5. Align the experience complexity to the time available limit:
   - "5min": Simple quick practices (e.g., text a peer, write 3 points, take deep breaths).
   - "30min": Medium practices (e.g., conduct a video mock prep question, research a contact).
   - "open": Deep actions (e.g., attend a local meetup, schedule a call, run extensive mock review).

Output format must be a raw JSON object matching this schema:
{
  "steps": [
    {
      "id": "step-1",
      "verb": "ask",
      "label": "Short label",
      "requires_output": true
    }
  ]
}
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

  // Standard fallback steps if Gemini fails or is bypassed
  const fallbackSteps: Record<string, ExperienceStep[]> = {
    Commitment: [
      { id: "step-c1", verb: "ask", label: "Share portfolio link with one senior designer in your network", requires_output: true },
      { id: "step-c2", verb: "apply", label: "Practice explaining one key feature out loud for 3 minutes", requires_output: true },
      { id: "step-c3", verb: "meet", label: "Schedule a 15-minute mock talk session with a peer", requires_output: false },
      { id: "step-c4", verb: "reflect", label: "Reflect on verbal pacing and list three adjustment areas", requires_output: false }
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

  // Filter fallback based on time constraint (mock filter logic)
  let fallback = selectedFallback;
  if (context.constraints.timeLimit === "5min") {
    fallback = selectedFallback.slice(0, 2).map(s => ({
      ...s,
      label: s.label.replace("15-minute", "2-minute").replace("24 hours", "30 minutes"),
      requires_output: false // 5-minute tasks shouldn't block
    }));
  }

  const { response, rawText } = await callGeminiJSON<JourneyComposerOutput>(
    SYSTEM_PROMPT,
    userPrompt,
    { steps: fallback }
  );

  // Guarantee guardrail is enforced on live output
  let validatedSteps = response.steps || fallback;
  if (context.quadrant === "Rest" || context.quadrant === "Compassion") {
    validatedSteps = validatedSteps.map(step => ({
      ...step,
      requires_output: false
    }));
  }

  return {
    steps: validatedSteps,
    log: rawText
  };
}
