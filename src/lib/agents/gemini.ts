import { GoogleGenerativeAI } from "@google/generative-ai";

// Read comma-separated keys or single fallback key
const apiKeysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
const apiKeys: string[] = apiKeysStr
  .split(",")
  .map(k => k.trim())
  .filter(Boolean);

let currentKeyIndex = 0;

// Export client wrapper to maintain compatibility with existing codebase checks
export const genAI = apiKeys.length > 0 ? new GoogleGenerativeAI(apiKeys[0]) : null;

export function getActiveGenAIClient(): { client: GoogleGenerativeAI | null; key: string } {
  if (apiKeys.length === 0) {
    return { client: null, key: "" };
  }
  const key = apiKeys[currentKeyIndex];
  return { client: new GoogleGenerativeAI(key), key };
}

export function rotateApiKey(): boolean {
  if (apiKeys.length <= 1) return false;
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  console.log(`[KEY_ROTATION] Rotated to Gemini API key index ${currentKeyIndex}`);
  return true;
}

/**
 * Executes a Gemini API operation with automatic key rotation on 429 Rate Limits.
 */
export async function executeGeminiWithRotation<T>(
  fn: (client: GoogleGenerativeAI) => Promise<T>
): Promise<T> {
  const maxRetries = Math.max(apiKeys.length, 3);
  let attempt = 0;

  while (attempt < maxRetries) {
    const { client, key } = getActiveGenAIClient();
    if (!client) {
      throw new Error("No Gemini API keys configured inside .env.local.");
    }

    try {
      return await fn(client);
    } catch (error: any) {
      const isRateLimit =
        error?.status === 429 ||
        (error?.message && error.message.includes("429")) ||
        (error?.message && error.message.toLowerCase().includes("quota exceeded")) ||
        (error?.message && error.message.toLowerCase().includes("too many requests"));

      if (isRateLimit && apiKeys.length > 1) {
        console.warn(`[KEY_ROTATION] Encountered rate limit (429) on key index ${currentKeyIndex}. Rotating keys...`);
        rotateApiKey();
        attempt++;
        continue;
      }
      throw error;
    }
  }

  throw new Error("All configured Gemini API keys returned 429 rate limit errors.");
}

/**
 * Utility to make structured JSON calls to Gemini with key rotation support.
 */
export async function callGeminiJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  fallback: T
): Promise<{ response: T; rawText: string }> {
  try {
    return await executeGeminiWithRotation(async (client) => {
      const model = client.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
        generationConfig: {
          responseMimeType: "application/json",
        },
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userPrompt);
      const responseText = result.response.text();
      const cleaned = responseText.trim();
      const parsed = JSON.parse(cleaned) as T;
      return { response: parsed, rawText: responseText };
    });
  } catch (error) {
    console.error("Gemini JSON call failed after rotation attempts:", error);
    return { response: fallback, rawText: `Error: ${error instanceof Error ? error.message : String(error)}` };
  }
}
