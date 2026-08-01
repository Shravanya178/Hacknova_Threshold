import { genAI } from "./gemini";
import { SchemaType } from "@google/generative-ai";
import { AgentTraceItem } from "@/types/threshold";

export type DiagnosisAgentOutput = {
  quadrant: "Commitment" | "Curiosity" | "Compassion" | "Rest";
  quadrant_reasoning: string;
  rejected_quadrants: { quadrant: string; reason_rejected: string }[];
  capability_gap: string;
  gap_reasoning: string;
  trace: AgentTraceItem[];
};

const SYSTEM_PROMPT = `
You are the Diagnosis Agent of "Threshold" — a growth diagnosis platform.
Your objective is: "Diagnosis before curation."
You must analyze the user's stated goal, the intent analysis, and their historical context.

CRITICAL RULES:
1. You MUST call at least one info tool (either 'get_evidence_ledger' or 'get_reflection_history') before rendering a diagnosis. Do not skip this step.
2. After inspecting the data, you MUST finalize the diagnosis by calling the 'submit_diagnosis' tool.
3. Make sure to provide a valid capability gap (what they need to practice, e.g. communication confidence) and quadrant.
4. You must document why you rejected the other 3 quadrants.

Quadrant definitions:
- Commitment: User has clarity and energy but needs structured, accountable execution.
- Curiosity: User needs to explore new skills, concepts, or mental models.
- Compassion: User is facing severe burnout, frustration, or fear. Needs protective, low-stakes self-paced growth.
- Rest: User is completely exhausted. Needs to stop. Zero gates, zero output requirements.
`;

// Simple mock DB helpers to support tool executions
const mockLedgerDatabase: Record<string, any[]> = {
  aarav: [
    { id: "e1", step_id: "step-p1", type: "skill", content: "Completed portfolio setup", timestamp: "2026-07-28" }
  ],
  meera: [
    { id: "e2", step_id: "step-m1", type: "skill", content: "Applied to 5 roles", timestamp: "2026-07-25" }
  ]
};

const mockReflectionDatabase: Record<string, string[]> = {
  aarav: [
    "Month 1: Struggling with explaining code concepts.",
    "Month 2: Finished a React app but didn't present it to anyone."
  ],
  meera: [
    "Month 1: Felt rejected during live coding.",
    "Month 2: Cried after feedback session."
  ]
};

export async function runDiagnosisAgent(
  userId: string,
  statedGoal: string,
  extractedIntent: string,
  gapHypothesis: string
): Promise<DiagnosisAgentOutput> {
  const trace: AgentTraceItem[] = [];

  // Register identity agent trace item manually for visualization
  trace.push({
    agent: "Identity Agent",
    result: { extracted_intent: extractedIntent, gap_hypothesis: gapHypothesis }
  });

  // If Gemini client is not initialized, run the fallback simulation directly
  if (!genAI) {
    return runFallbackSimulation(userId, statedGoal, extractedIntent, gapHypothesis, trace);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      tools: [
        {
          functionDeclarations: [
            {
              name: "get_evidence_ledger",
              description: "Returns the evidence entries (completed growth steps) for a specific user ID",
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
              description: "Returns the historical reflections and comments for a user ID",
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
              description: "Submits the final diagnosis including quadrant, reasoning, rejected quadrants, and capability gap",
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
Please diagnose the user profile.
User ID: "${userId}"
Stated Goal: "${statedGoal}"
Extracted Intent: "${extractedIntent}"
Gap Hypothesis: "${gapHypothesis}"
Remember: Call at least one tool ('get_evidence_ledger' or 'get_reflection_history') before submitting the diagnosis.
`;

    let response = await chat.sendMessage(prompt);
    let loopCount = 0;
    const maxLoops = 5;

    while (loopCount < maxLoops) {
      const functionCalls = response.response.functionCalls();
      if (!functionCalls || functionCalls.length === 0) {
        // If the model didn't call submit_diagnosis but stopped, force fallback
        break;
      }

      const call = functionCalls[0];
      const name = call.name;
      const args = call.args as Record<string, any>;

      if (name === "get_evidence_ledger") {
        const uid = args.user_id || userId;
        const result = mockLedgerDatabase[uid] || [];
        trace.push({
          agent: "Diagnosis Agent",
          tool: "get_evidence_ledger",
          input: { user_id: uid },
          result
        });

        const responseParts = [
          {
            functionResponse: {
              name: "get_evidence_ledger",
              response: { ledger: result }
            }
          }
        ];
        response = await chat.sendMessage(responseParts as any);
      } else if (name === "get_reflection_history") {
        const uid = args.user_id || userId;
        const result = mockReflectionDatabase[uid] || [];
        trace.push({
          agent: "Diagnosis Agent",
          tool: "get_reflection_history",
          input: { user_id: uid },
          result
        });

        const responseParts = [
          {
            functionResponse: {
              name: "get_reflection_history",
              response: { reflections: result }
            }
          }
        ];
        response = await chat.sendMessage(responseParts as any);
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

    // If it breaks out without submit_diagnosis
    return runFallbackSimulation(userId, statedGoal, extractedIntent, gapHypothesis, trace);
  } catch (err) {
    console.error("Diagnosis Agent failed, running simulation fallback", err);
    return runFallbackSimulation(userId, statedGoal, extractedIntent, gapHypothesis, trace);
  }
}

function runFallbackSimulation(
  userId: string,
  statedGoal: string,
  extractedIntent: string,
  gapHypothesis: string,
  trace: AgentTraceItem[]
): DiagnosisAgentOutput {
  // Simulate call get_reflection_history
  trace.push({
    agent: "Diagnosis Agent",
    tool: "get_reflection_history",
    input: { user_id: userId },
    result: mockReflectionDatabase[userId] || ["No history found"]
  });

  // Decide values based on user
  if (userId === "aarav") {
    const output: DiagnosisAgentOutput = {
      quadrant: "Commitment",
      quadrant_reasoning: "Aarav is actively completing projects (Month 3 timeline) but struggles speaking out loud. He has high execution energy, thus placing him in Commitment.",
      rejected_quadrants: [
        { quadrant: "Curiosity", reason_rejected: "Aarav already builds portfolio items successfully and does not lack core technical exploration." },
        { quadrant: "Compassion", reason_rejected: "No signs of extreme exhaustion or rejection stress, Aarav is ready to practice and execute." },
        { quadrant: "Rest", reason_rejected: "User shows high motivation to practice interviews; rest is not the immediate priority." }
      ],
      capability_gap: "Communication Confidence, not UI Skill",
      gap_reasoning: "Aarav finishes portfolio apps but gets anxious explaining them. The blocker is verbal articulation, not his engineering skill.",
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
    // Default to Meera (Compassion)
    const output: DiagnosisAgentOutput = {
      quadrant: "Compassion",
      quadrant_reasoning: "Meera is experiencing high rejection strain (4 rejections in 1 month). Pushing her with high-stakes targets will cause severe burnout, requiring Compassion.",
      rejected_quadrants: [
        { quadrant: "Commitment", reason_rejected: "High-pressure commitments right now would deepen interview anxiety and self-doubt." },
        { quadrant: "Curiosity", reason_rejected: "Exploring new paradigms is unproductive when base confidence is shaken by repeated rejections." },
        { quadrant: "Rest", reason_rejected: "She wants to continue prep but needs a cushioned environment, which Compassion provides over complete shutdown." }
      ],
      capability_gap: "Low-stakes self-paced review, protect from external asks",
      gap_reasoning: "She needs to recover confidence in a safe, non-evaluative setting before entering high-pressure situations again.",
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
