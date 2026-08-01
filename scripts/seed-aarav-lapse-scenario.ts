/**
 * seed-aarav-lapse-scenario.ts
 *
 * Purpose:
 *   Loads Aarav's existing seeded identity and initial diagnosis/journey from Supabase,
 *   backdates his most recent evidence entry beyond the 3-day inactivity threshold so
 *   checkDropOffDetection() fires naturally when the graph runs, then invokes the real
 *   compiled LangGraph pipeline. The full execution flows through:
 *
 *     reflectionNode (detects inactivity drop-off)
 *       → diagnosisNode (re-diagnoses with lapse context)
 *       → constraintsNode
 *       → composerNode (produces genuinely new journey)
 *
 *   The before/after diff is logged and validated. If the shift is weak or nonsensical
 *   the script flags it and aborts without seeding. If it passes, all results are written
 *   back into Supabase so the app renders the adjustment from stored data on load.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json -r tsconfig-paths/register scripts/seed-aarav-lapse-scenario.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

// Loaded after env is ready
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { compiledThresholdGraph } = require("../src/lib/graph/threshold-graph");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { supabase } = require("../src/lib/supabase");

// ─── Types ────────────────────────────────────────────────────────────────────

interface BeforeState {
  statedGoal: string;
  recentReflections: string[];
  quadrant: string;
  capabilityGap: string;
  journeySteps: any[];
  latestEvidenceId: string | null;
  latestEvidenceTimestamp: string | null;
}

interface AfterState {
  quadrant: string;
  quadrantReasoning: string;
  capabilityGap: string;
  gapReasoning: string;
  journeySteps: any[];
  lapseReasoning: string;
  isLapse: boolean;
  trace: any[];
}

interface DiffResult {
  quadrantChanged: boolean;
  gapChanged: boolean;
  stepCountChanged: boolean;
  stepLabelsChanged: boolean;
  issues: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a timestamp that is `daysAgo` days in the past from now */
function backdateTimestamp(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

/** Normalises a string for loose equality checks */
function normalise(s: string): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

/**
 * Validates the before→after diff.
 * Returns an object listing issues; an empty issues array means the diff is healthy.
 */
function validateDiff(before: BeforeState, after: AfterState): DiffResult {
  const issues: string[] = [];

  const quadrantChanged = before.quadrant !== after.quadrant;
  const gapChanged = normalise(before.capabilityGap) !== normalise(after.capabilityGap);

  const beforeLabels = (before.journeySteps || []).map((s: any) => normalise(s.label)).join("|");
  const afterLabels = (after.journeySteps || []).map((s: any) => normalise(s.label)).join("|");
  const stepLabelsChanged = beforeLabels !== afterLabels;
  const stepCountChanged = (before.journeySteps || []).length !== (after.journeySteps || []).length;

  // Weak shift checks
  if (!quadrantChanged && !gapChanged) {
    issues.push("WEAK SHIFT: Both quadrant and capability_gap are identical to the before state.");
  }

  if (!after.isLapse) {
    issues.push("LAPSE NOT DETECTED: reflectionNode did not flag this as a lapse/drop-off. The loopback did not fire.");
  }

  if (!after.lapseReasoning || after.lapseReasoning.trim().length < 20) {
    issues.push("WEAK REASONING: lapseReasoning is empty or too short to be meaningful.");
  }

  if ((after.journeySteps || []).length === 0) {
    issues.push("EMPTY JOURNEY: composerNode produced zero steps.");
  }

  if (!stepLabelsChanged && !stepCountChanged) {
    issues.push("IDENTICAL JOURNEY: The new journey steps are identical to the prior journey. The pipeline may not have re-composed.");
  }

  // Nonsense checks
  const validQuadrants = ["Commitment", "Curiosity", "Compassion", "Rest"];
  if (!validQuadrants.includes(after.quadrant)) {
    issues.push(`INVALID QUADRANT: "${after.quadrant}" is not a valid Threshold quadrant.`);
  }

  return { quadrantChanged, gapChanged, stepCountChanged, stepLabelsChanged, issues };
}

/** Pretty-prints the diff to console */
function logDiff(before: BeforeState, after: AfterState, diff: DiffResult): void {
  const sep = "─".repeat(60);

  console.log(`\n${sep}`);
  console.log("  BEFORE → AFTER DIAGNOSIS DIFF");
  console.log(sep);

  console.log(`\n  Quadrant:        ${before.quadrant}  →  ${after.quadrant}  ${diff.quadrantChanged ? "✅ CHANGED" : "⚠️  SAME"}`);
  console.log(`  Capability Gap:  "${before.capabilityGap}"`);
  console.log(`               →  "${after.capabilityGap}"  ${diff.gapChanged ? "✅ CHANGED" : "⚠️  SAME"}`);

  console.log("\n  BEFORE Journey Steps:");
  (before.journeySteps || []).forEach((s: any, i: number) => {
    console.log(`    ${i + 1}. [${s.verb}] ${s.label}`);
  });

  console.log("\n  AFTER Journey Steps:");
  (after.journeySteps || []).forEach((s: any, i: number) => {
    console.log(`    ${i + 1}. [${s.verb}] ${s.label}`);
  });

  console.log(`\n  Steps Changed:   ${diff.stepLabelsChanged || diff.stepCountChanged ? "✅ YES" : "⚠️  NO"}`);

  console.log("\n  Lapse Detected:  " + (after.isLapse ? "✅ YES" : "❌ NO"));
  console.log(`  Lapse Reasoning: "${after.lapseReasoning}"`);

  console.log(`\n  Quadrant Reasoning: "${after.quadrantReasoning}"`);
  console.log(`  Gap Reasoning:      "${after.gapReasoning}"`);

  console.log(`\n${sep}`);

  if (diff.issues.length > 0) {
    console.log("\n  ⚠️  DIFF VALIDATION ISSUES:");
    diff.issues.forEach((issue) => console.log(`    • ${issue}`));
    console.log(sep);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║       AARAV LAPSE SCENARIO — REAL PIPELINE SEED         ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  // ── Step 1: Load Aarav's current state ──────────────────────────────────────

  console.log("▶ Step 1: Loading Aarav's current state from Supabase...");

  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("name, stated_goal, recent_reflections")
    .eq("id", "aarav")
    .maybeSingle();

  if (userErr || !userRow) {
    throw new Error(
      "Could not load Aarav from Supabase. Make sure scripts/seed.ts has been run first.\n" +
        JSON.stringify(userErr)
    );
  }

  // Fetch timeline from identity_states
  const { data: timelineRows, error: timelineErr } = await supabase
    .from("identity_states")
    .select("id, month, label, quadrant, capability_gap, reasoning")
    .eq("user_id", "aarav");

  if (timelineErr) {
    console.warn("  ⚠ Failed to load timeline from identity_states:", timelineErr);
  }

  // Map userRow to have timeline property
  (userRow as any).timeline = (timelineRows || []).map((t: any) => {
    if (t.reasoning && t.reasoning.startsWith("{")) {
      try {
        const parsed = JSON.parse(t.reasoning);
        return { ...t, ...parsed, reasoning: parsed.calibration_reasoning || parsed.reasoning || t.reasoning };
      } catch (e) {
        return t;
      }
    }
    return t;
  });

  // Fetch the most recent journey to get before-state steps
  const { data: latestJourney } = await supabase
    .from("journeys")
    .select("id, quadrant, steps")
    .eq("user_id", "aarav")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch most recent diagnosis for before-state gap
  const { data: latestDiagnosis } = await supabase
    .from("diagnoses")
    .select("quadrant, capability_gap, gap_reasoning")
    .eq("user_id", "aarav")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch most recent evidence entry (we will backdate this to trigger inactivity)
  const { data: latestEvidence } = await supabase
    .from("evidence_entries")
    .select("id, timestamp")
    .eq("user_id", "aarav")
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle();

  const beforeState: BeforeState = {
    statedGoal: userRow.stated_goal || "I want confidence during interviews.",
    recentReflections: userRow.recent_reflections || [],
    quadrant: latestDiagnosis?.quadrant || latestJourney?.quadrant || "Commitment",
    capabilityGap: latestDiagnosis?.capability_gap || "Communication Confidence, not UI Skill",
    journeySteps: latestJourney?.steps || [],
    latestEvidenceId: latestEvidence?.id || null,
    latestEvidenceTimestamp: latestEvidence?.timestamp || null,
  };

  console.log("  ✓ Loaded Aarav's profile.");
  console.log(`    Goal:     "${beforeState.statedGoal}"`);
  console.log(`    Quadrant: ${beforeState.quadrant}`);
  console.log(`    Gap:      "${beforeState.capabilityGap}"`);
  console.log(`    Steps:    ${beforeState.journeySteps.length} step(s)`);
  console.log(
    `    Latest evidence: ${beforeState.latestEvidenceId ?? "none"} at ${
      beforeState.latestEvidenceTimestamp ?? "—"
    }`
  );

  // ── Step 2: Backdate evidence to exceed the 3-day inactivity threshold ───────

  console.log("\n▶ Step 2: Backdating evidence to trigger inactivity drop-off detection...");

  // We backdate 4 days; threshold is 3 days (72 hours), so this is safely over.
  const BACKDATE_DAYS = 4;
  const backdatedTimestamp = backdateTimestamp(BACKDATE_DAYS);

  if (beforeState.latestEvidenceId) {
    // Backdate the existing entry
    const { error: updateErr } = await supabase
      .from("evidence_entries")
      .update({ timestamp: backdatedTimestamp })
      .eq("id", beforeState.latestEvidenceId);

    if (updateErr) {
      throw new Error("Failed to backdate evidence entry: " + JSON.stringify(updateErr));
    }
    console.log(
      `  ✓ Backdated evidence "${beforeState.latestEvidenceId}" to ${backdatedTimestamp} (${BACKDATE_DAYS} days ago).`
    );
  } else {
    // No evidence exists yet — insert a fresh backdated entry
    const newId = `ev-aarav-backdate-${Date.now()}`;
    const { error: insertErr } = await supabase.from("evidence_entries").insert({
      id: newId,
      user_id: "aarav",
      step_id: "step-c1",
      type: "skill",
      content: "Finished first mock portfolio walkthrough",
      timestamp: backdatedTimestamp,
      counts_as_evidence: true,
    });

    if (insertErr) {
      throw new Error("Failed to insert backdated evidence entry: " + JSON.stringify(insertErr));
    }
    console.log(
      `  ✓ Inserted new backdated evidence entry "${newId}" at ${backdatedTimestamp}.`
    );
    beforeState.latestEvidenceId = newId;
  }

  // ── Step 3: Invoke the real compiled LangGraph ───────────────────────────────

  console.log("\n▶ Step 3: Invoking compiled LangGraph (threshold-graph.ts)...");
  console.log("  The graph will enter via reflectionNode → drop-off detected");
  console.log("  → loopback to diagnosisNode → constraintsNode → composerNode\n");

  // The lapse reflection text contains a lapse signal ("give up") to ensure
  // both the programmatic heuristic and the LLM both return is_lapse: true.
  // The inactivity backdating already guarantees isDropOff: true from checkDropOffDetection().
  const LAPSE_REFLECTION =
    "I skipped my mock session again. I want to give up — I don't think I can do this. " +
    "Every time I try to explain my work out loud I freeze completely. " +
    "I've been avoiding the practice steps for days now.";

  const STEP_ID = beforeState.journeySteps[0]?.id || "step-c1";

  let graphResult: any;
  try {
    graphResult = await compiledThresholdGraph.invoke({
      userId: "aarav",
      stepId: STEP_ID,
      reflectionText: LAPSE_REFLECTION,
      recentReflections: beforeState.recentReflections,
      statedGoal: beforeState.statedGoal,
      constraints: { timeAvailable: "open", location: "remote", resources: [] },
      trace: [],
    });
  } catch (invokeErr: any) {
    throw new Error("LangGraph invocation failed: " + (invokeErr?.message || String(invokeErr)));
  }

  console.log("  ✓ LangGraph pipeline completed.");

  const afterState: AfterState = {
    quadrant: graphResult.quadrant || "Commitment",
    quadrantReasoning: graphResult.quadrantReasoning || "",
    capabilityGap: graphResult.capabilityGap || "",
    gapReasoning: graphResult.gapReasoning || "",
    journeySteps: graphResult.journeySteps || [],
    lapseReasoning: graphResult.lapseReasoning || "",
    isLapse: graphResult.isLapse === true,
    trace: graphResult.trace || [],
  };

  // ── Step 4: Validate and log the diff ───────────────────────────────────────

  console.log("\n▶ Step 4: Validating before → after diff...");

  const diff = validateDiff(beforeState, afterState);
  logDiff(beforeState, afterState, diff);

  if (diff.issues.length > 0) {
    // Restore the evidence timestamp so we leave Supabase clean
    if (beforeState.latestEvidenceTimestamp && beforeState.latestEvidenceId) {
      await supabase
        .from("evidence_entries")
        .update({ timestamp: beforeState.latestEvidenceTimestamp })
        .eq("id", beforeState.latestEvidenceId);
      console.log("\n  ↩ Restored original evidence timestamp (no seeding performed).");
    }
    console.error(
      "\n❌ SEEDING ABORTED: Diff validation failed. Review the issues above before relying on this scenario.\n"
    );
    process.exit(1);
  }

  console.log("  ✅ Diff validated — shift is meaningful and well-reasoned.");

  // ── Step 5: Write the full adjustment back into Supabase ────────────────────

  console.log("\n▶ Step 5: Writing adjustment state back into Supabase...");

  // 5a. Insert lapse adjustment entry into the identity_states table
  const identityStateRow = {
    id: `adj-aarav-lapse-${Date.now()}`,
    user_id: "aarav",
    month: "Month 3 (Lapse Adjustment)",
    label: "Avoidance Spiral Detected",
    quadrant: afterState.quadrant,
    capability_gap: afterState.capabilityGap,
    reasoning: JSON.stringify({
      is_seeded_adjustment: true,
      before_quadrant: beforeState.quadrant,
      before_capability_gap: beforeState.capabilityGap,
      after_quadrant: afterState.quadrant,
      after_capability_gap: afterState.capabilityGap,
      calibration_reasoning: afterState.quadrantReasoning,
      reasoning: afterState.lapseReasoning || afterState.quadrantReasoning,
    }),
    embedding: new Array(1536).fill(0), // dummy vector
  };

  const { error: identityInsertErr } = await supabase
    .from("identity_states")
    .insert(identityStateRow);

  if (identityInsertErr) {
    console.warn("  ⚠ Failed to insert timeline adjustment entry into identity_states:", identityInsertErr);
  } else {
    console.log("  ✓ Timeline adjustment entry inserted into identity_states.");
  }

  // Update user profile reflections
  const { error: userUpdateErr } = await supabase
    .from("users")
    .update({
      recent_reflections: [
        ...beforeState.recentReflections,
        LAPSE_REFLECTION,
      ],
    })
    .eq("id", "aarav");

  if (userUpdateErr) {
    console.warn("  ⚠ Failed to update user profile reflections:", userUpdateErr);
  } else {
    console.log("  ✓ User profile reflections updated.");
  }

  // 5b. Seed the lapse reflection as a new evidence entry (backdated slightly
  //     less than the trigger entry so the timeline ordering is correct)
  const lapseEvidenceId = `ev-aarav-lapse-${Date.now()}`;
  const { error: lapseEvidenceErr } = await supabase.from("evidence_entries").insert({
    id: lapseEvidenceId,
    user_id: "aarav",
    step_id: STEP_ID,
    type: "reflective",
    content: LAPSE_REFLECTION,
    // Timestamp 1 hour ago — after the backdated entry, before now
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    counts_as_evidence: true,
    dropoff_reason: "Inactivity drop-off: 4-day gap exceeds 3-day threshold",
  });

  if (lapseEvidenceErr) {
    console.warn("  ⚠ Failed to insert lapse reflection evidence entry:", lapseEvidenceErr);
  } else {
    console.log(`  ✓ Lapse reflection evidence entry "${lapseEvidenceId}" inserted.`);
  }

  // 5c. Full execution trace logged to console (full object for manual review)
  console.log("\n▶ Step 6: Full execution trace from LangGraph run:");
  console.log(JSON.stringify(afterState.trace, null, 2));

  // ── Done ────────────────────────────────────────────────────────────────────

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║               SEEDING COMPLETE ✅                       ║");
  console.log("╠══════════════════════════════════════════════════════════╣");
  console.log(`║  Before quadrant:  ${beforeState.quadrant.padEnd(34)}║`);
  console.log(`║  After  quadrant:  ${afterState.quadrant.padEnd(34)}║`);
  console.log("║                                                          ║");
  console.log(`║  Before gap:  "${beforeState.capabilityGap.substring(0, 42)}"`.padEnd(61) + "║");
  console.log(`║  After  gap:  "${afterState.capabilityGap.substring(0, 42)}"`.padEnd(61) + "║");
  console.log("║                                                          ║");
  console.log("║  When Aarav's profile loads in the app, the adjustment  ║");
  console.log("║  will already be present in his history — no trigger    ║");
  console.log("║  needed. JudgeModePanel and PlanAdjustmentReveal will   ║");
  console.log("║  read it directly from the stored timeline.             ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");
}

run().catch((err: any) => {
  console.error("\n❌ FATAL ERROR — seed-aarav-lapse-scenario.ts crashed:");
  console.error(err);
  process.exit(1);
});
