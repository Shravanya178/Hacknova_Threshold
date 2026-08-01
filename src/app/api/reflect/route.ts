import { NextRequest, NextResponse } from "next/server";
import { compiledThresholdGraph } from "@/lib/graph/threshold-graph";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, stepId, reflectionText, statedGoal, constraints } = body;

    if (!userId || !stepId || !reflectionText) {
      return NextResponse.json(
        { error: "Missing required fields: userId, stepId, or reflectionText" },
        { status: 400 }
      );
    }

    const result = await compiledThresholdGraph.invoke({
      userId,
      stepId,
      reflectionText,
      statedGoal: statedGoal || "",
      constraints: constraints || { timeAvailable: "open", location: "remote", resources: [] },
      recentReflections: [],
      trace: []
    });

    const evidenceEntry = {
      id: `ev-${Date.now()}`,
      user_id: userId,
      step_id: stepId,
      type: "reflective",
      content: reflectionText,
      timestamp: new Date().toISOString()
    };

    const reDiagnosis = result.isLapse ? {
      quadrant: result.quadrant,
      quadrant_reasoning: result.quadrantReasoning,
      rejected_quadrants: result.rejectedQuadrants,
      capability_gap: result.capabilityGap,
      gap_reasoning: result.gapReasoning,
      journey: result.journeySteps || [],
      trace: result.trace || []
    } : null;

    return NextResponse.json({
      evidenceEntry,
      analysis: {
        is_lapse: result.isLapse || false,
        reasoning: result.lapseReasoning || "Standard completion validated"
      },
      reDiagnosis
    });
  } catch (error) {
    console.error("Reflection API Error via LangGraph:", error);
    return NextResponse.json(
      { error: "Internal server error running LangGraph reflection step" },
      { status: 500 }
    );
  }
}
