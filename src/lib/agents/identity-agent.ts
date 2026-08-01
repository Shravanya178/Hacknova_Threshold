import { callGeminiJSON } from "./gemini";

export type IdentityAgentOutput = {
  extracted_intent: string;
  gap_hypothesis: string;
};

const SYSTEM_PROMPT = `
You are the Identity Agent of "Threshold" — an identity curator pluggable into IABTM.
Your directive is: "Diagnosis before curation."

CRITICAL REQUIREMENT:
Do NOT take the user's stated goal literally. Stated goals are often surface-level symptoms. Your job is to dissect the stated goal and the conversation context to find the real developmental gap underneath it.

Output must be a raw JSON object matching this schema:
{
  "extracted_intent": "The latent, core developmental goal the user actually seeks",
  "gap_hypothesis": "The true underlying capability gap (e.g., communication confidence rather than technical skill, or boundary shielding rather than interview speed)"
}
`;

export async function runIdentityAgent(
  statedGoal: string,
  conversation: string
): Promise<{ output: IdentityAgentOutput; log: string }> {
  const userPrompt = `
Stated Goal: "${statedGoal}"
Conversation Context:
"${conversation}"
  `;

  // Dynamic fallback defaults based on user keywords
  let fallback: IdentityAgentOutput = {
    extracted_intent: "Seeking validation and verbal confidence under evaluative interview settings.",
    gap_hypothesis: "The blocker is communication confidence under stress, not design execution skill."
  };

  if (statedGoal.toLowerCase().includes("rejected") || conversation.toLowerCase().includes("rejection")) {
    fallback = {
      extracted_intent: "Seeking recovery of self-worth and safety after high-frequency failure responses.",
      gap_hypothesis: "The block is emotional exhaustion and boundary depletion, requiring protective buffering."
    };
  }

  const { response, rawText } = await callGeminiJSON<IdentityAgentOutput>(
    SYSTEM_PROMPT,
    userPrompt,
    fallback
  );

  return {
    output: response,
    log: rawText
  };
}
