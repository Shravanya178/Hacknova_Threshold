import { NextRequest, NextResponse } from "next/server";
import { runThresholdPipeline } from "@/lib/agents/pipeline";

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

    const diagnosis = await runThresholdPipeline(
      userId,
      statedGoal,
      recentReflections || [],
      constraints || { timeAvailable: "open", location: "remote", resources: [] }
    );

    return NextResponse.json(diagnosis);
  } catch (error) {
    console.error("Diagnosis API Error:", error);
    return NextResponse.json(
      { error: "Internal server error running agent pipeline" },
      { status: 500 }
    );
  }
}
