import fs from "fs";
import path from "path";
import { callGeminiJSON } from "./gemini";
import { runThresholdPipeline } from "./pipeline";
import { EvidenceEntry, Diagnosis } from "@/types/threshold";

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

  // 2. Write the entry directly to data/{userId}.json
  const dataFilePath = path.join(process.cwd(), "data", `${userId}.json`);
  let fileContent: any = {};
  if (fs.existsSync(dataFilePath)) {
    const raw = fs.readFileSync(dataFilePath, "utf8");
    fileContent = JSON.parse(raw);
  } else {
    fileContent = {
      user_id: userId,
      recent_reflections: [],
      evidence_ledger: [],
      reflection_history: []
    };
  }

  fileContent.evidence_ledger = fileContent.evidence_ledger || [];
  fileContent.evidence_ledger.push(evidenceEntry);

  fileContent.recent_reflections = fileContent.recent_reflections || [];
  fileContent.recent_reflections.push(reflectionText);

  // Write updated data back to JSON file database
  fs.writeFileSync(dataFilePath, JSON.stringify(fileContent, null, 2), "utf8");

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
      statedGoal || "Restore confidence and stability",
      fileContent.recent_reflections,
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
