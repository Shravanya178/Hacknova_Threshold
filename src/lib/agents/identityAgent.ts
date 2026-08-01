import { callGeminiJSON } from "./gemini";

export type IdentityAgentOutput = {
  extracted_intent: string;
  gap_hypothesis: string;
};

const SYSTEM_PROMPT = `
You are the Identity Agent of "Threshold" — a growth diagnosis platform.
Your objective is: "Diagnosis before curation."
Do not suggest resources, books, or courses.
Instead, read the user's stated goal and recent reflections. Extract the true, latent developmental need or gap beneath their stated surface level goal.

Output format must be a raw JSON object matching this schema:
{
  "extracted_intent": "Brief summary of what the user is actually seeking at a core level",
  "gap_hypothesis": "A hypothesis describing the core capability gap (e.g. communication confidence, not technical skills)"
}

Keep your responses concise, using clear editorial language matching the tone of a high-end wellness platform.
`;

export async function runIdentityAgent(
  statedGoal: string,
  recentReflections: string[]
): Promise<{ output: IdentityAgentOutput; log: string }> {
  const userPrompt = `
Stated Goal: "${statedGoal}"
Recent Reflections:
${recentReflections.map((r, i) => `- "${r}"`).join("\n")}
  `;

  // Standard fallback
  const fallback: IdentityAgentOutput = {
    extracted_intent: "Wants validation and communication stability under interview pressure",
    gap_hypothesis: "Capability gap lies in verbal confidence, not UI implementation competency",
  };

  const { response, rawText } = await callGeminiJSON<IdentityAgentOutput>(
    SYSTEM_PROMPT,
    userPrompt,
    fallback
  );

  return {
    output: response,
    log: rawText,
  };
}
