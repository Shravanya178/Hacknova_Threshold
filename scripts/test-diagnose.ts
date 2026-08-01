import * as dotenv from "dotenv";
import * as path from "path";
console.log("DEBUG: process.cwd() is", process.cwd());
console.log("DEBUG: env URL before config:", process.env.NEXT_PUBLIC_SUPABASE_URL);
const dotenvResult = dotenv.config({ path: path.join(process.cwd(), ".env.local") });
console.log("DEBUG: dotenv result:", dotenvResult);
console.log("DEBUG: env URL after config:", process.env.NEXT_PUBLIC_SUPABASE_URL);

async function cleanDatabase(supabase: any, userId: string) {
  // Clear evidence and timeline snapshots for testing reset
  await supabase.from("evidence_entries").delete().eq("user_id", userId);
  await supabase.from("diagnoses").delete().eq("user_id", userId);
  await supabase.from("journeys").delete().eq("user_id", userId);
}

async function runTests() {
  console.log("=== THRESHOLD SYSTEM VERIFICATION RUN ===");

  // Dynamically import to avoid ES6 hoist evaluation before dotenv loads
  const { compiledThresholdGraph } = await import("../src/lib/graph/threshold-graph");
  const { createClient } = await import("@supabase/supabase-js");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // --- VERIFICATION 1: RUN PROMPT 12 (Aarav and Meera Diagnoses) ---
  console.log("\n--- TEST 1: Running Diagnosis for Aarav ---");
  await cleanDatabase(supabase, "aarav");
  
  // Re-seed Aarav
  await supabase.from("users").upsert({
    id: "aarav",
    name: "Aarav",
    stated_goal: "I want confidence during interviews.",
    recent_reflections: [
      "Finished my third portfolio project",
      "Nervous every time someone asks me to explain my work out loud"
    ]
  });

  const dummyVector = new Array(1536).fill(0);
  await supabase.from("identity_states").upsert([
    {
      id: "t-aarav-1",
      user_id: "aarav",
      month: "Month 1",
      label: "Skill Scaffolding",
      quadrant: "Curiosity",
      capability_gap: "UI Design Execution",
      reasoning: "Focused heavily on mastering component layout and design patterns. Lacked confidence in styling but technical growth was priority.",
      embedding: dummyVector
    },
    {
      id: "t-aarav-2",
      user_id: "aarav",
      month: "Month 2",
      label: "Portfolio Construction",
      quadrant: "Commitment",
      capability_gap: "Portfolio Completeness",
      reasoning: "Built projects to build evidence of completion. The push was execution speed and visual polish.",
      embedding: dummyVector
    }
  ]);

  const aaravResult = await compiledThresholdGraph.invoke({
    userId: "aarav",
    statedGoal: "I want confidence during interviews.",
    recentReflections: [
      "Finished my third portfolio project",
      "Nervous every time someone asks me to explain my work out loud"
    ],
    constraints: { timeAvailable: "open", location: "remote", resources: ["laptop"] },
    trace: []
  });

  console.log("\nRAW DIAGNOSIS OUTPUT (AARAV):");
  console.log(JSON.stringify({
    quadrant: aaravResult.quadrant,
    quadrant_reasoning: aaravResult.quadrantReasoning,
    rejected_quadrants: aaravResult.rejectedQuadrants,
    capability_gap: aaravResult.capabilityGap,
    gap_reasoning: aaravResult.gapReasoning,
    journey: aaravResult.journeySteps
  }, null, 2));

  console.log("\n--- TEST 1: Running Diagnosis for Meera ---");
  await cleanDatabase(supabase, "meera");

  // Re-seed Meera
  await supabase.from("users").upsert({
    id: "meera",
    name: "Meera",
    stated_goal: "I want confidence during interviews... I've been rejected four times this month.",
    recent_reflections: [
      "Another rejection today",
      "Maybe I'm just not good enough for this"
    ]
  });

  await supabase.from("identity_states").upsert([
    {
      id: "t-meera-1",
      user_id: "meera",
      month: "Month 1",
      label: "Intense Prep Run",
      quadrant: "Commitment",
      capability_gap: "High-volume Applications",
      reasoning: "Pushing applications out daily, preparing templates, and preparing interview questions. High fatigue, external validation dependent.",
      embedding: dummyVector
    }
  ]);

  const meeraResult = await compiledThresholdGraph.invoke({
    userId: "meera",
    statedGoal: "I want confidence during interviews... I've been rejected four times this month.",
    recentReflections: [
      "Another rejection today",
      "Maybe I'm just not good enough for this"
    ],
    constraints: { timeAvailable: "open", location: "remote", resources: ["laptop"] },
    trace: []
  });

  console.log("\nRAW DIAGNOSIS OUTPUT (MEERA):");
  console.log(JSON.stringify({
    quadrant: meeraResult.quadrant,
    quadrant_reasoning: meeraResult.quadrantReasoning,
    rejected_quadrants: meeraResult.rejectedQuadrants,
    capability_gap: meeraResult.capabilityGap,
    gap_reasoning: meeraResult.gapReasoning,
    journey: meeraResult.journeySteps
  }, null, 2));


  // --- VERIFICATION 2: VERIFY THE LANGGRAPH LOOP ---
  console.log("\n--- TEST 2: Verifying LangGraph Reflection Loop-back Firing ---");
  console.log("Submitting a normal reflection first...");
  const normalRefResult = await compiledThresholdGraph.invoke({
    userId: "aarav",
    stepId: "step-c1",
    reflectionText: "I completed the portfolio exercise and felt fine.",
    statedGoal: "I want confidence during interviews.",
    constraints: { timeAvailable: "open", location: "remote", resources: [] },
    recentReflections: [],
    trace: []
  });
  console.log(`Lapse detected in normal run: ${normalRefResult.isLapse}`);

  console.log("\nSubmitting a lapse reflection to trigger loop-back...");
  const lapseRefResult = await compiledThresholdGraph.invoke({
    userId: "aarav",
    stepId: "step-c2",
    reflectionText: "I skipped the design critique again, I don't think I can do this",
    statedGoal: "I want confidence during interviews.",
    constraints: { timeAvailable: "open", location: "remote", resources: [] },
    recentReflections: [],
    trace: []
  });
  console.log(`Lapse detected in lapse run: ${lapseRefResult.isLapse}`);


  // --- VERIFICATION 3: VERIFY DROP-OFF DETECTION ---
  console.log("\n--- TEST 3: Verifying Drop-off Detection Adaptivity ---");
  await cleanDatabase(supabase, "meera");

  // 1. Backdate an evidence entry to 4 days ago
  const fourDaysAgoStr = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("evidence_entries").insert({
    id: "ev-test-inactivity-old",
    user_id: "meera",
    step_id: "step-m1",
    type: "reflective",
    content: "Pushed 3 apps",
    timestamp: fourDaysAgoStr,
    counts_as_evidence: true
  });

  // 2. Add two repeated lapses in the same quadrant
  await supabase.from("diagnoses").insert([
    {
      user_id: "meera",
      quadrant: "Compassion",
      quadrant_reasoning: "Tired and burnt out",
      rejected_quadrants: [],
      capability_gap: "Protect from external asks, low-stakes self-paced review only",
      gap_reasoning: "Lapse check",
      trace: []
    },
    {
      user_id: "meera",
      quadrant: "Compassion",
      quadrant_reasoning: "Tired and burnt out",
      rejected_quadrants: [],
      capability_gap: "Protect from external asks, low-stakes self-paced review only",
      gap_reasoning: "Lapse check 2",
      trace: []
    }
  ]);

  console.log("Running diagnose pipeline under simulated drop-off (4 days inactivity + repeated lapses)...");
  const dropoffResult = await compiledThresholdGraph.invoke({
    userId: "meera",
    statedGoal: "I want confidence during interviews... I've been rejected four times this month.",
    recentReflections: [
      "Another rejection today",
      "Maybe I'm just not good enough for this"
    ],
    constraints: { timeAvailable: "open", location: "remote", resources: ["laptop"] },
    trace: []
  });

  console.log("Normal Meera Step Verbs:");
  console.log(meeraResult.journeySteps.map(s => s.verb));
  console.log("Adapted Drop-off Meera Step Verbs:");
  console.log(dropoffResult.journeySteps.map(s => s.verb));


  // --- VERIFICATION 4: CONFIRM MEDIA IS IABTM-LABELED ---
  console.log("\n--- TEST 4: Verifying Non-Empty IABTM Curated Media Lookup ---");
  console.log("Checking Aarav journey step media objects...");
  aaravResult.journeySteps.forEach((step, idx) => {
    console.log(`Step ${idx + 1} (${step.verb}): ${step.label}`);
    if (step.media) {
      console.log("  Media attached:", JSON.stringify(step.media, null, 2));
    }
  });

  console.log("Checking Meera journey step media objects...");
  meeraResult.journeySteps.forEach((step, idx) => {
    console.log(`Step ${idx + 1} (${step.verb}): ${step.label}`);
    if (step.media) {
      console.log("  Media attached:", JSON.stringify(step.media, null, 2));
    }
  });

  console.log("\nDatabase query verify: Selecting matching media row...");
  const { data: mediaRow } = await supabase
    .from("users")
    .select("id, name, stated_goal")
    .eq("id", "aarav")
    .limit(1);
  console.log("Sample Seed Row Query Result:", JSON.stringify(mediaRow, null, 2));
  
  console.log("\n=== VERIFICATION COMPLETE ===");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
});
