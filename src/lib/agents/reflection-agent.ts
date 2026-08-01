import { callGeminiJSON } from "./gemini";
import { runThresholdPipeline } from "./pipeline";
import { EvidenceEntry, Diagnosis } from "@/types/threshold";
import { supabase } from "../supabase";

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

export async function processUserReflection(
  userId: string,
  stepId: string,
  reflectionText: string,
  statedGoal: string,
  constraints?: any
): Promise<{
  evidenceEntry: EvidenceEntry;
  analysis: ReflectionAnalysis;
  reDiagnosis: Diagnosis | null;
  log: string;
}> {
  // 1. Create the EvidenceEntry
  const evidenceEntry: EvidenceEntry = {
    id: `ev-${Date.now()}`,
    user_id: userId,
    step_id: stepId,
    type: "reflective",
    content: reflectionText,
    timestamp: new Date().toISOString()
  };

  // 2. Read existing user data and update reflections in Supabase
  const normalizedUid = userId.toLowerCase().trim();
  
  // Fetch existing recent_reflections
  const { data: userRow } = await supabase
    .from("users")
    .select("recent_reflections, name, stated_goal")
    .eq("id", normalizedUid)
    .single();

  const reflections: string[] = userRow?.recent_reflections 
    ? (userRow.recent_reflections as string[]) 
    : [];
  
  reflections.push(reflectionText);

  // Upsert user details & reflections
  const userName = userRow?.name || (userId.charAt(0).toUpperCase() + userId.slice(1));
  const currentStatedGoal = userRow?.stated_goal || statedGoal || "Identify and bridge growth barriers";

  await supabase
    .from("users")
    .upsert({
      id: normalizedUid,
      name: userName,
      stated_goal: currentStatedGoal,
      recent_reflections: reflections
    });

  // Insert evidence entry
  await supabase
    .from("evidence_entries")
    .insert({
      id: evidenceEntry.id,
      user_id: normalizedUid,
      step_id: stepId,
      type: evidenceEntry.type,
      content: evidenceEntry.content,
      timestamp: evidenceEntry.timestamp,
      counts_as_evidence: true
    });

  // 3. LLM analysis to determine if this indicates a lapse
  const userPrompt = `
Reflection text submitted: "${reflectionText}"
Analyze if this is a growth lapse or standard practice struggle.
  `;

  const fallback: ReflectionAnalysis = {
    is_lapse: false,
    reasoning: "Reflection represents standard exercise completion without indicators of critical breakdown or distress."
  };

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

  const analysis = response;
  let reDiagnosis: Diagnosis | null = null;

  // 4. If a lapse is detected, re-invoke pipeline (which runs diagnosis-agent.ts first)
  if (analysis.is_lapse) {
    reDiagnosis = await runThresholdPipeline(
      userId,
      currentStatedGoal,
      reflections,
      constraints || { timeAvailable: "open", location: "remote", resources: [] }
    );
  }

  return {
    evidenceEntry,
    analysis,
    reDiagnosis,
    log: rawText
  };
}
