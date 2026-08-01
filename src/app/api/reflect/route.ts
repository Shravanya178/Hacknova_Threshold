import { NextRequest, NextResponse } from "next/server";
import { runReflectionAgent } from "@/lib/agents/reflectionAgent";
import { runThresholdPipeline } from "@/lib/agents/pipeline";
import { EvidenceEntry } from "@/types/threshold";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, stepId, reflectionText, statedGoal, recentReflections, constraints } = body;

    if (!userId || !stepId || !reflectionText) {
      return NextResponse.json(
        { error: "Missing required fields: userId, stepId, or reflectionText" },
        { status: 400 }
      );
    }

    // 1. Create the EvidenceEntry
    const evidenceEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      user_id: userId,
      step_id: stepId,
      type: "reflective",
      content: reflectionText,
      timestamp: new Date().toISOString()
    };

    // 2. Run Reflection Agent to analyze the reflection content
    const analysisResult = await runReflectionAgent(reflectionText);

    let reDiagnosis = null;

    // 3. If a lapse is detected, trigger the Re-diagnosis flow
    if (analysisResult.output.is_lapse) {
      // Fold the lapse reflection into the user's recent reflections
      const updatedReflections = [...(recentReflections || []), reflectionText];

      // Re-run pipeline to produce a new diagnosis (expecting Compassion or Rest)
      reDiagnosis = await runThresholdPipeline(
        userId,
        statedGoal || "Restore confidence and stability",
        updatedReflections,
        constraints || { timeAvailable: "open", location: "remote", resources: [] }
      );
    }

    return NextResponse.json({
      evidenceEntry,
      analysis: analysisResult.output,
      reDiagnosis // null if no lapse, contains new Diagnosis object if lapse occurred
    });
  } catch (error) {
    console.error("Reflection API Error:", error);
    return NextResponse.json(
      { error: "Internal server error analyzing reflection" },
      { status: 500 }
    );
  }
}
