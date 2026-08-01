import { callGeminiJSON } from "./gemini";

export type ReflectionAnalysis = {
  is_lapse: boolean;
  reasoning: string;
};

const SYSTEM_PROMPT = `
You are the Reflection Agent of "Threshold" — a growth diagnosis platform.
Your objective is to review user reflections on completed growth steps.
Identify if the user is showing signs of a "growth lapse."

Lapse Definition:
- A lapse means the user is experiencing extreme frustration, feelings of defeat ("I'm not good enough", "I give up"), severe anxiety, or regression.
- Normal struggle or minor practice friction is NOT a lapse.

Output format must be a raw JSON object matching this schema:
{
  "is_lapse": true or false,
  "reasoning": "Brief explanation of why you detected a lapse or determined their state is normal growth friction."
}
`;

export async function runReflectionAgent(
  reflectionText: string
): Promise<{ output: ReflectionAnalysis; log: string }> {
  const userPrompt = `
Reflection text submitted: "${reflectionText}"
Analyze if this is a growth lapse or standard practice struggle.
`;

  const fallback: ReflectionAnalysis = {
    is_lapse: false,
    reasoning: "Reflection represents standard exercise completion without indicators of critical breakdown or distress."
  };

  // Perform basic rule-based check in case of API failure or simulation
  const lowerText = reflectionText.toLowerCase();
  if (
    lowerText.includes("give up") ||
    lowerText.includes("not good enough") ||
    lowerText.includes("can't do this anymore") ||
    lowerText.includes("hate this") ||
    lowerText.includes("another rejection") ||
    lowerText.includes("fail")
  ) {
    fallback.is_lapse = true;
    fallback.reasoning = "Programmatic heuristic detected terms signaling high discouragement or potential lapse.";
  }

  const { response, rawText } = await callGeminiJSON<ReflectionAnalysis>(
    SYSTEM_PROMPT,
    userPrompt,
    fallback
  );

  return {
    output: response,
    log: rawText,
  };
}
