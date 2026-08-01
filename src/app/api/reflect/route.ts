import { NextRequest, NextResponse } from "next/server";
import { processUserReflection } from "@/lib/agents/reflection-agent";

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

    const { evidenceEntry, analysis, reDiagnosis } = await processUserReflection(
      userId,
      stepId,
      reflectionText,
      statedGoal,
      constraints
    );

    return NextResponse.json({
      evidenceEntry,
      analysis,
      reDiagnosis
    });
  } catch (error) {
    console.error("Reflection API Error:", error);
    return NextResponse.json(
      { error: "Internal server error analyzing reflection" },
      { status: 500 }
    );
  }
}
