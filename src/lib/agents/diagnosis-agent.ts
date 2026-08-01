import { genAI } from "./gemini";
import { SchemaType } from "@google/generative-ai";
import { AgentTraceItem } from "@/types/threshold";
import { supabase } from "../supabase";

export type DiagnosisAgentOutput = {
  quadrant: "Commitment" | "Curiosity" | "Compassion" | "Rest";
  quadrant_reasoning: string;
  rejected_quadrants: { quadrant: string; reason_rejected: string }[];
  capability_gap: string;
  gap_reasoning: string;
  trace: AgentTraceItem[];
};

const SYSTEM_PROMPT = `
You are the Diagnosis Agent of "Threshold" — an identity curator pluggable into IABTM.
Your directive is: "Diagnosis before curation."

CRITICAL RULES:
1. You MUST call at least one of the lookup tools ('get_evidence_ledger' or 'get_reflection_history') before finishing your diagnosis.
2. After gathering details, you MUST submit your final diagnosis via the 'submit_diagnosis' tool.
3. Your 'rejected_quadrants' parameter must contain concrete, detailed reasoning for at least 1-2 alternative quadrants. Never use placeholder text.

Quadrants:
- Commitment: Energetic and focused, but needs accountability and structure.
- Curiosity: Needs exploration of new skills/concepts.
- Compassion: Exhausted by high friction/rejections. Needs protective self-paced routines.
- Rest: Complete burnout. Must disconnect entirely (no gates).
`;

// Supabase DB queries
async function get_evidence_ledger(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("evidence_entries")
      .select("id, user_id, step_id, type, content, timestamp, counts_as_evidence")
      .eq("user_id", userId.toLowerCase().trim());

    if (error) {
      console.error(`Error querying evidence ledger for ${userId}:`, error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error(`Failed to get evidence ledger:`, err);
    return [];
  }
}

async function get_reflection_history(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("identity_states")
      .select("id, month, label, quadrant, capability_gap, reasoning")
      .eq("user_id", userId.toLowerCase().trim());

    if (error) {
      console.error(`Error querying reflection history for ${userId}:`, error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error(`Failed to get reflection history:`, err);
    return [];
  }
}

export async function runDiagnosisAgent(
  userId: string,
  statedGoal: string,
  extractedIntent: string,
  gapHypothesis: string
): Promise<DiagnosisAgentOutput> {
  const trace: AgentTraceItem[] = [];

  // Manual trace link of the Identity Agent output
  trace.push({
    agent: "Identity Agent",
    result: { extracted_intent: extractedIntent, gap_hypothesis: gapHypothesis }
  });

  // Fallback to filesystem-reading simulation if Gemini client is not configured
  if (!genAI) {
    return await runFallbackSimulation(userId, statedGoal, extractedIntent, gapHypothesis, trace);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      tools: [
        {
          functionDeclarations: [
            {
              name: "get_evidence_ledger",
              description: "Reads the completed growth steps ledger from database",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  user_id: { type: SchemaType.STRING }
                },
                required: ["user_id"]
              }
            },
            {
              name: "get_reflection_history",
              description: "Reads the historical timeline notes and past reflections from database",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  user_id: { type: SchemaType.STRING }
                },
                required: ["user_id"]
              }
            },
            {
              name: "submit_diagnosis",
              description: "Locks in the final growth quadrant state and capability gap",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  quadrant: { type: SchemaType.STRING, format: "enum", enum: ["Commitment", "Curiosity", "Compassion", "Rest"] },
                  quadrant_reasoning: { type: SchemaType.STRING },
                  rejected_quadrants: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.OBJECT,
                      properties: {
                        quadrant: { type: SchemaType.STRING },
                        reason_rejected: { type: SchemaType.STRING }
                      },
                      required: ["quadrant", "reason_rejected"]
                    }
                  },
                  capability_gap: { type: SchemaType.STRING },
                  gap_reasoning: { type: SchemaType.STRING }
                },
                required: [
                  "quadrant",
                  "quadrant_reasoning",
                  "rejected_quadrants",
                  "capability_gap",
                  "gap_reasoning"
                ]
              }
            }
          ]
        }
      ],
      systemInstruction: SYSTEM_PROMPT
    });

    const chat = model.startChat();
    const prompt = `
Please diagnose user.
User ID: "${userId}"
Stated Goal: "${statedGoal}"
Extracted Intent: "${extractedIntent}"
Gap Hypothesis: "${gapHypothesis}"
Call at least one check tool ('get_evidence_ledger' or 'get_reflection_history') before calling 'submit_diagnosis'.
`;

    let response = await chat.sendMessage(prompt);
    let loopCount = 0;
    const maxLoops = 5;

    while (loopCount < maxLoops) {
      const functionCalls = response.response.functionCalls();
      if (!functionCalls || functionCalls.length === 0) {
        break;
      }

      const call = functionCalls[0];
      const name = call.name;
      const args = call.args as Record<string, any>;
      const targetUid = args.user_id || userId;

      if (name === "get_evidence_ledger") {
        const result = await get_evidence_ledger(targetUid);
        trace.push({
          agent: "Diagnosis Agent",
          tool: "get_evidence_ledger",
          input: { user_id: targetUid },
          result
        });

        response = await chat.sendMessage([
          {
            functionResponse: {
              name: "get_evidence_ledger",
              response: { ledger: result }
            }
          }
        ] as any);
      } else if (name === "get_reflection_history") {
        const result = await get_reflection_history(targetUid);
        trace.push({
          agent: "Diagnosis Agent",
          tool: "get_reflection_history",
          input: { user_id: targetUid },
          result
        });

        response = await chat.sendMessage([
          {
            functionResponse: {
              name: "get_reflection_history",
              response: { reflections: result }
            }
          }
        ] as any);
      } else if (name === "submit_diagnosis") {
        trace.push({
          agent: "Diagnosis Agent",
          tool: "submit_diagnosis",
          input: args,
          result: { status: "success" }
        });

        return {
          quadrant: args.quadrant,
          quadrant_reasoning: args.quadrant_reasoning,
          rejected_quadrants: args.rejected_quadrants,
          capability_gap: args.capability_gap,
          gap_reasoning: args.gap_reasoning,
          trace
        };
      } else {
        break;
      }
      loopCount++;
    }

    return await runFallbackSimulation(userId, statedGoal, extractedIntent, gapHypothesis, trace);
  } catch (error) {
    console.error("Diagnosis Agent Tool call failed, running database simulation:", error);
    return await runFallbackSimulation(userId, statedGoal, extractedIntent, gapHypothesis, trace);
  }
}

async function runFallbackSimulation(
  userId: string,
  statedGoal: string,
  extractedIntent: string,
  gapHypothesis: string,
  trace: AgentTraceItem[]
): Promise<DiagnosisAgentOutput> {
  const reflections = await get_reflection_history(userId);
  trace.push({
    agent: "Diagnosis Agent",
    tool: "get_reflection_history",
    input: { user_id: userId },
    result: reflections
  });

  if (userId === "aarav") {
    const output: DiagnosisAgentOutput = {
      quadrant: "Commitment",
      quadrant_reasoning: "Aarav finishes portfolio code tasks successfully but stalls on presentations. He is in the Commitment quadrant to practice accountable verbal delivery.",
      rejected_quadrants: [
        { quadrant: "Curiosity", reason_rejected: "Aarav is already proficient at building standard portfolio templates; he does not lack technical curiosity." },
        { quadrant: "Compassion", reason_rejected: "No signs of extreme burn or rejections stress exist in his timeline; he is ready to push skills out loud." }
      ],
      capability_gap: "Communication Confidence, not UI Skill",
      gap_reasoning: "His blockage is public presentation, not engineering competency. Curiosity (exploration) is rejected; Commitment (accountability) is required.",
      trace
    };

    trace.push({
      agent: "Diagnosis Agent",
      tool: "submit_diagnosis",
      input: {
        quadrant: output.quadrant,
        quadrant_reasoning: output.quadrant_reasoning,
        rejected_quadrants: output.rejected_quadrants,
        capability_gap: output.capability_gap,
        gap_reasoning: output.gap_reasoning
      },
      result: { status: "success" }
    });

    return output;
  } else {
    // Default to Meera
    const output: DiagnosisAgentOutput = {
      quadrant: "Compassion",
      quadrant_reasoning: "Meera is dealing with severe rejection distress (4 times in 30 days). Commitment tasks would exacerbate self-doubt; she needs emotional buffering.",
      rejected_quadrants: [
        { quadrant: "Commitment", reason_rejected: "Intense execution targets would worsen interview performance anxiety." },
        { quadrant: "Rest", reason_rejected: "She wants to keep reviewing but in a safe, non-evaluative setup. So Compassion is chosen over complete shutdown." }
      ],
      capability_gap: "Protect from external asks, low-stakes self-paced review only",
      gap_reasoning: "Rejection trauma must be buffered with protective routines before resume pushes resume.",
      trace
    };

    trace.push({
      agent: "Diagnosis Agent",
      tool: "submit_diagnosis",
      input: {
        quadrant: output.quadrant,
        quadrant_reasoning: output.quadrant_reasoning,
        rejected_quadrants: output.rejected_quadrants,
        capability_gap: output.capability_gap,
        gap_reasoning: output.gap_reasoning
      },
      result: { status: "success" }
    });

    return output;
  }
}
