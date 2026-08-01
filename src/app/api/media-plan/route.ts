import { NextRequest, NextResponse } from "next/server";
import { runMediaAgent } from "@/lib/agents/mediaAgent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      statedGoal,
      quadrant,
      capabilityGap,
      resourceType,
      resourceContent,
      timeAvailable,
      requiresOutput
    } = body;

    if (!userId || !resourceType) {
      return NextResponse.json(
        { error: "Missing required fields: userId or resourceType" },
        { status: 400 }
      );
    }

    const plan = await runMediaAgent(
      userId,
      statedGoal || "Growth stabilization",
      quadrant || "Curiosity",
      capabilityGap || "Core validation",
      resourceType,
      resourceContent || "Resource outline metadata placeholder",
      timeAvailable || "open",
      requiresOutput || false
    );

    return NextResponse.json({ mediaPlan: plan });
  } catch (error) {
    console.error("Media Plan API Error:", error);
    return NextResponse.json(
      { error: "Failed compiling multi-agent media plan" },
      { status: 500 }
    );
  }
}
