import fs from "fs";
import path from "path";
import { callGeminiJSON } from "./gemini";
import { ExperienceStep } from "@/types/threshold";
import { FilteredDiagnosisContext } from "./constraints-filter";
import { searchYouTube } from "../youtube";

type JourneyComposerOutput = {
  steps: ExperienceStep[];
};

type MediaCatalogItem = {
  id: string;
  title: string;
  source: "IABTM";
  capability_gap: string;
  content?: string;
};

// Reads media catalog from disk
export function readMediaCatalog(): MediaCatalogItem[] {
  try {
    const filePath = path.join(process.cwd(), "data", "media-catalog.json");
    if (!fs.existsSync(filePath)) {
      console.warn("media-catalog.json not found");
      return [];
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to read media-catalog.json:", error);
    return [];
  }
}

// Normalizes capability gaps to prevent mismatches
function normalizeGap(gap: string): string {
  return gap
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

// Find closest matching media
export function findMatchingMedia(capabilityGap: string, catalog: MediaCatalogItem[]): MediaCatalogItem | null {
  if (!capabilityGap || catalog.length === 0) return null;
  const target = normalizeGap(capabilityGap);

  // 1. Try exact match after normalization
  let match = catalog.find(item => normalizeGap(item.capability_gap) === target);
  if (match) return match;

  // 2. Try substring match
  match = catalog.find(item => {
    const itemGap = normalizeGap(item.capability_gap);
    return target.includes(itemGap) || itemGap.includes(target);
  });
  if (match) return match;

  // 3. Fallback: find the item that shares the most common words
  const cleanTargetWords = capabilityGap.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

  let bestMatch: MediaCatalogItem | null = null;
  let maxOverlap = 0;

  for (const item of catalog) {
    const itemWords = item.capability_gap.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    const overlap = itemWords.filter(w => cleanTargetWords.includes(w)).length;
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestMatch = item;
    }
  }

  // 4. Default fallback: if still no match, return the first catalog entry so it never returns empty!
  return bestMatch || catalog[0] || null;
}

const SYSTEM_PROMPT = `
You are the Journey Composer Agent of "Threshold" — an identity curator pluggable into IABTM.
Your directive is: "We don't recommend content. We compose experiences."

CRITICAL RULES:
1. You must output an array of 3 to 4 steps.
2. Every experience step must use one of these verbs strictly: "attend" | "ask" | "meet" | "apply" | "reflect" | "rest". Do NOT recommend reading books, articles, or watching general courses.
3. Every step requires:
   - "id": unique string identifier (e.g., "step-1")
   - "verb": one of the 6 approved verbs
   - "label": a short, punchy action phrase
   - "requires_output": boolean gate
   - "media": (Optional) An object containing "id", "title", "source" ("IABTM"), and "capability_gap".
4. GUARDRAIL: If the quadrant is "Rest" or "Compassion", "requires_output" MUST be false for all steps. Never force outputs from exhausted or burnt-out users.
5. If the quadrant is "Commitment" or "Curiosity", at least one step should have "requires_output" as true.
6. INTEGRATE MEDIA AS AN EXPERIENCE INGREDIENT: You MUST attach the provided matching IABTM media asset to at least one step in the steps array (typically an "attend" or "reflect" step) under the "media" property. Select the closest matching catalog entry by capability_gap, don't require an exact match, and never return an empty media field.
`;

export async function runJourneyComposerAgent(
  context: FilteredDiagnosisContext
): Promise<{ steps: ExperienceStep[]; log: string }> {
  // Load media catalog
  const catalog = readMediaCatalog();
  let matchedMedia = findMatchingMedia(context.capability_gap, catalog);

  // Try to find a real, highly relevant YouTube video matching the capability gap
  try {
    const ytResult = await searchYouTube(context.capability_gap);
    if (ytResult) {
      console.log(`[Journey Composer] Found relevant YouTube video: "${ytResult.title}" (${ytResult.id})`);
      matchedMedia = {
        id: ytResult.id,
        title: ytResult.title,
        source: "IABTM",
        resource_type: "video" as any,
        capability_gap: context.capability_gap,
        content: ytResult.id
      };
    }
  } catch (err) {
    console.error("YouTube search fallback query in composer failed:", err);
  }

  let dropoffPrompt = "";
  if (context.drop_off_detected) {
    dropoffPrompt = `
WARNING: The user is experiencing recent pattern drop-off or timeline gaps.
You MUST compose extremely small, lower-friction steps to restore confidence:
- Reduce step difficulty and time commitments (limit steps to 5-10 minutes).
- Bias toward "rest" or "reflect" verbs, avoiding high-pressure active gates.
`;
  }

  const userPrompt = `
Quadrant: "${context.quadrant}"
Capability Gap: "${context.capability_gap}"
Constraints:
- Time Limit: "${context.constraints.timeLimit}"
- Location: "${context.constraints.locationLimit}"
- Resources: ${JSON.stringify(context.constraints.resourceLimit)}

Matched Media Asset to integrate:
${matchedMedia ? JSON.stringify(matchedMedia, null, 2) : "None"}

${dropoffPrompt}

Please compose the experience pathway. Make sure to attach the matched media asset (if available) to the most appropriate step in the array.
  `;

  // Fail-safe fallbacks
  const fallbackSteps: Record<string, ExperienceStep[]> = {
    Commitment: [
      { id: "step-c1", verb: "ask", label: "Share your portfolio link with one senior designer in your network", requires_output: true },
      { id: "step-c2", verb: "apply", label: "Practice explaining one key feature out loud for 3 minutes", requires_output: true },
      { id: "step-c3", verb: "meet", label: "Schedule a 15-minute mock talk session with a peer", requires_output: false }
    ],
    Curiosity: [
      { id: "step-cu1", verb: "attend", label: "Watch a presentation on design patterns related to your gap", requires_output: true },
      { id: "step-cu2", verb: "reflect", label: "Write down your key takeaways regarding the pattern", requires_output: false }
    ],
    Compassion: [
      { id: "step-co1", verb: "rest", label: "Decompress for 15 minutes without looking at screen notifications", requires_output: false },
      { id: "step-co2", verb: "reflect", label: "Write a bullet list of design tasks you successfully did this week", requires_output: false },
      { id: "step-co3", verb: "meet", label: "Chat with a friend about a topic completely unrelated to work", requires_output: false }
    ],
    Rest: [
      { id: "step-r1", verb: "rest", label: "Shut down your computer and disconnect for 24 hours", requires_output: false },
      { id: "step-r2", verb: "rest", label: "Take a walk outside without checking messages", requires_output: false }
    ]
  };

  let selectedFallback = fallbackSteps[context.quadrant] || fallbackSteps.Commitment;
  if (context.drop_off_detected) {
    selectedFallback = [
      { id: "step-drop-1", verb: "rest", label: "Decompress and take a 10-minute offline break", requires_output: false },
      { id: "step-drop-2", verb: "reflect", label: "Write down one visual design achievement from this week", requires_output: false }
    ];
  }

  // Customize the fallback steps dynamically based on the matched media
  let customizedFallback = selectedFallback.map(step => {
    if (matchedMedia) {
      if (step.verb === "attend") {
        return {
          ...step,
          label: `Review and study the curated resource: "${matchedMedia.title}"`
        };
      }
      if (step.verb === "reflect") {
        return {
          ...step,
          label: `Submit your realization on "${context.capability_gap}" in relation to "${matchedMedia.title}"`
        };
      }
    }
    return step;
  });

  // Attach matched media to fallback step as well to guarantee match in fallback path
  if (matchedMedia && customizedFallback.length > 0) {
    const targetFallbackStep = customizedFallback.find(s => s.verb === "attend" || s.verb === "reflect") || customizedFallback[0];
    targetFallbackStep.resource_type = (matchedMedia as any).resource_type || "video";
    targetFallbackStep.media = {
      id: matchedMedia.id,
      title: matchedMedia.title,
      source: "IABTM",
      capability_gap: matchedMedia.capability_gap,
      content: matchedMedia.content
    };
  }

  const { response, rawText } = await callGeminiJSON<JourneyComposerOutput>(
    SYSTEM_PROMPT,
    userPrompt,
    { steps: customizedFallback }
  );

  let steps = response.steps || customizedFallback;
  if (context.drop_off_detected && steps.length > 2) {
    steps = steps.slice(0, 2).map(s => {
      if (s.verb === "apply" || s.verb === "ask") {
        return { ...s, verb: "reflect" as const };
      }
      return s;
    });
  }

  // Final validation sweep on output steps:
  // 1. Force Rest/Compassion guardrail
  if (context.quadrant === "Rest" || context.quadrant === "Compassion") {
    steps = steps.map(step => ({
      ...step,
      requires_output: false
    }));
  }

  // 2. Double check that matched media is attached to at least one step in steps.
  // If the model output steps but failed to attach the media, attach it programmatically!
  const hasAttachedMedia = steps.some(step => step.media && step.media.id);
  if (!hasAttachedMedia && matchedMedia && steps.length > 0) {
    const targetStep = steps.find(s => s.verb === "attend" || s.verb === "reflect") || steps[0];
    targetStep.resource_type = (matchedMedia as any).resource_type || "video";
    targetStep.media = {
      id: matchedMedia.id,
      title: matchedMedia.title,
      source: "IABTM",
      capability_gap: matchedMedia.capability_gap,
      content: matchedMedia.content
    };
  }

  // Ensure all steps with attached media have the resource_type populated
  steps = steps.map(s => {
    if (s.media && s.media.id === matchedMedia?.id) {
      return {
        ...s,
        resource_type: (matchedMedia as any).resource_type || "video"
      };
    }
    return s;
  });

  return {
    steps,
    log: rawText
  };
}
