import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

// Initialize client if key is present
export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Utility to make structured JSON calls to Gemini.
 * It uses the native responseMimeType system configuration.
 */
export async function callGeminiJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  fallback: T
): Promise<{ response: T; rawText: string }> {
  if (!genAI || !apiKey) {
    console.warn("GEMINI_API_KEY is missing. Using static fallback simulator.");
    return { response: fallback, rawText: JSON.stringify(fallback) };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();
    
    // Parse response
    const cleaned = responseText.trim();
    const parsed = JSON.parse(cleaned) as T;
    return { response: parsed, rawText: responseText };
  } catch (error) {
    console.error("Gemini LLM call encountered an error:", error);
    return { response: fallback, rawText: `Error: ${error instanceof Error ? error.message : String(error)}` };
  }
}
