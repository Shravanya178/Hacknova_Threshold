import { NextRequest, NextResponse } from "next/server";
import { compiledThresholdGraph } from "@/lib/graph/threshold-graph";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, statedGoal, recentReflections, constraints } = body;

    if (!userId || !statedGoal) {
      return NextResponse.json(
        { error: "Missing required fields: userId or statedGoal" },
        { status: 400 }
      );
    }

    const result = await compiledThresholdGraph.invoke({
      userId,
      statedGoal,
      recentReflections: recentReflections || [],
      constraints: constraints || { timeAvailable: "open", location: "remote", resources: [] },
      trace: []
    });

    const diagnosis = {
      quadrant: result.quadrant,
      quadrant_reasoning: result.quadrantReasoning,
      rejected_quadrants: result.rejectedQuadrants,
      capability_gap: result.capabilityGap,
      gap_reasoning: result.gapReasoning,
      journey: result.journeySteps || [],
      trace: result.trace || []
    };

    console.log("DIAGNOSE ROUTE RESPONSE:", JSON.stringify(diagnosis, null, 2));
    return NextResponse.json(diagnosis);
  } catch (error) {
    console.error("Diagnosis API Error via LangGraph:", error);
    return NextResponse.json(
      { error: "Internal server error running LangGraph agent pipeline" },
      { status: 500 }
    );
  }
}
