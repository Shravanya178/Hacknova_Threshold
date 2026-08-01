import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  const normalizedId = id.toLowerCase().trim();

  try {
    // 1. Fetch user profile
    const { data: userRow } = await supabase
      .from("users")
      .select("id, name, stated_goal, recent_reflections")
      .eq("id", normalizedId)
      .maybeSingle();

    // 1b. Fetch timeline snapshots from identity_states table
    const { data: timelineRows } = await supabase
      .from("identity_states")
      .select("id, month, label, quadrant, capability_gap, reasoning")
      .eq("user_id", normalizedId);

    // Sort chronologically and parse JSON reasoning if present
    const timeline = (timelineRows || []).map((t: any) => {
      if (t.reasoning && t.reasoning.startsWith("{")) {
        try {
          const parsed = JSON.parse(t.reasoning);
          return {
            ...t,
            ...parsed,
            reasoning: parsed.calibration_reasoning || parsed.reasoning || t.reasoning
          };
        } catch (e) {
          return t;
        }
      }
      return t;
    }).sort((a, b) => {
      const numA = parseInt(a.month.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.month.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    const userWithTimeline = userRow ? {
      ...userRow,
      timeline
    } : null;

    // 2. Fetch user's latest journey if any
    const { data: journeyRow } = await supabase
      .from("journeys")
      .select("id, quadrant, capability_gap, gap_reasoning, created_at")
      .eq("user_id", normalizedId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let steps: any[] = [];
    if (journeyRow) {
      const { data: stepsRows } = await supabase
        .from("journey_steps")
        .select("id, verb, label, requires_output, media, resource_type")
        .eq("journey_id", journeyRow.id)
        .order("id", { ascending: true });

      steps = stepsRows || [];
    }

    // 3. Extract seeded lapse adjustment from timeline if present.
    //    The seed script writes a timeline entry with is_seeded_adjustment: true
    //    and carries the full before/after diff fields needed by PlanAdjustmentReveal.
    let seededAdjustment: {
      beforeQuadrant: string;
      afterQuadrant: string;
      beforeGap: string;
      afterGap: string;
      calibrationReasoning: string;
    } | null = null;

    const adjustmentEntry = timeline.find(
      (t: any) => t.is_seeded_adjustment === true
    );

    if (adjustmentEntry) {
      seededAdjustment = {
        beforeQuadrant: adjustmentEntry.before_quadrant || "",
        afterQuadrant: adjustmentEntry.after_quadrant || adjustmentEntry.quadrant || "",
        beforeGap: adjustmentEntry.before_capability_gap || "",
        afterGap: adjustmentEntry.after_capability_gap || adjustmentEntry.capability_gap || "",
        calibrationReasoning:
          adjustmentEntry.calibration_reasoning ||
          adjustmentEntry.reasoning ||
          "",
      };
    }

    return NextResponse.json({
      user: userWithTimeline,
      latestJourney: journeyRow
        ? {
            ...journeyRow,
            journey: steps,
          }
        : null,
      // Exposed to embed page so JudgeModePanel + PlanAdjustmentReveal
      // can render the seeded adjustment immediately on load
      seededAdjustment,
    });
  } catch (err) {
    console.error("API /api/user failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
