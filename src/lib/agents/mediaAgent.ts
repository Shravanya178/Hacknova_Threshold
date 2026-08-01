import { executeGeminiWithRotation } from "./gemini";
import { SchemaType } from "@google/generative-ai";
import { MediaPlan, Diagnosis } from "@/types/threshold";

const SYSTEM_PROMPT = `
You are the Media Agent for "Threshold".
Your goal is to parse a raw media resource (which could be a video, audio track, text article, or presentation slide deck) and build a customized, dynamic "Media Plan".

The Media Plan contains:
1. Segments: marked as "watch" (keep/active) or "skip" (automatically skipped or hidden).
2. Notes: non-blocking overlays with guidance aligned to the user's capability gap.
3. Prompts: reflection checkpoints that pause playback or block page progression until the user inputs their reflection.

Rules & Constraints:
- Total active ("watch") segments must fit within the user's remaining time constraint (e.g. 5min, 30min).
- The start and end positions refer to:
  * Seconds: for "video" and "audio" (e.g. start: 0, end: 120).
  * Section Index (0-based): for "text" (e.g. start: 1, end: 3).
  * Slide Index (1-based): for "slides" (e.g. start: 2, end: 5).
- If the step requires output (requires_output: true), you MUST define at least one "prompt" (reflective checkpoint).
- For Rest and Compassion quadrants, you must NOT include any prompts/checkpoints (prompts: []).
`;

export async function runMediaAgent(
  userId: string,
  statedGoal: string,
  quadrant: Diagnosis["quadrant"],
  capabilityGap: string,
  resourceType: "video" | "audio" | "text" | "slides",
  resourceContent: string,
  timeAvailable: "5min" | "30min" | "open",
  requiresOutput: boolean
): Promise<MediaPlan> {
  try {
    return await executeGeminiWithRotation(async (client) => {
      const model = client.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
        tools: [
          {
            functionDeclarations: [
              {
                name: "submit_media_plan",
                description: "Submits the structured media skipping and reflective pause plan",
                parameters: {
                  type: SchemaType.OBJECT,
                  properties: {
                    segments: {
                      type: SchemaType.ARRAY,
                      items: {
                        type: SchemaType.OBJECT,
                        properties: {
                          id: { type: SchemaType.STRING },
                          type: { type: SchemaType.STRING, format: "enum", enum: ["watch", "skip"] },
                          start: { type: SchemaType.NUMBER },
                          end: { type: SchemaType.NUMBER },
                          label: { type: SchemaType.STRING }
                        },
                        required: ["id", "type", "start", "end"]
                      }
                    },
                    notes: {
                      type: SchemaType.ARRAY,
                      items: {
                        type: SchemaType.OBJECT,
                        properties: {
                          id: { type: SchemaType.STRING },
                          trigger_point: { type: SchemaType.NUMBER },
                          note: { type: SchemaType.STRING }
                        },
                        required: ["id", "trigger_point", "note"]
                      }
                    },
                    prompts: {
                      type: SchemaType.ARRAY,
                      items: {
                        type: SchemaType.OBJECT,
                        properties: {
                          id: { type: SchemaType.STRING },
                          trigger_point: { type: SchemaType.NUMBER },
                          prompt: { type: SchemaType.STRING }
                        },
                        required: ["id", "trigger_point", "prompt"]
                      }
                    }
                  },
                  required: ["segments", "notes", "prompts"]
                }
              }
            ]
          }
        ],
        systemInstruction: SYSTEM_PROMPT
      });

      const userPrompt = `
Generate a media plan for the following:
User: "${userId}"
Stated Goal: "${statedGoal}"
Quadrant: "${quadrant}"
Capability Gap: "${capabilityGap}"
Resource Type: "${resourceType}"
Time Available Constraint: "${timeAvailable}"
Requires Output Gating: ${requiresOutput}

Resource Metadata/Outline:
${resourceContent}
`;

      const contents = [{ role: "user", parts: [{ text: userPrompt }] }];
      const result = await model.generateContent({ contents });

      const functionCalls = result.response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        const args = functionCalls[0].args as any;
        return {
          segments: args.segments || [],
          notes: args.notes || [],
          prompts: args.prompts || []
        };
      }

      return runFallbackMediaPlan(resourceType, requiresOutput, quadrant);
    });
  } catch (error) {
    console.error("Media Agent failed, using fallback:", error);
    return runFallbackMediaPlan(resourceType, requiresOutput, quadrant);
  }
}

function runFallbackMediaPlan(
  resourceType: "video" | "audio" | "text" | "slides",
  requiresOutput: boolean,
  quadrant: Diagnosis["quadrant"]
): MediaPlan {
  // Simple heuristic plan fallback
  const prompts =
    requiresOutput && quadrant !== "Rest" && quadrant !== "Compassion"
      ? [
          {
            id: "p-1",
            trigger_point: resourceType === "video" || resourceType === "audio" ? 60 : 2,
            prompt: "What is your main realization or take-away from this part?"
          }
        ]
      : [];

  return {
    segments: [
      { id: "s-1", type: "watch", start: 0, end: resourceType === "video" || resourceType === "audio" ? 180 : 3 }
    ],
    notes: [
      {
        id: "n-1",
        trigger_point: 0,
        note: "Focus on connecting this concept to your primary growth milestone."
      }
    ],
    prompts
  };
}
