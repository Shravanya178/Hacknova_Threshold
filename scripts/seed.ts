import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || supabaseUrl.includes("your-project")) {
  console.error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL environment variable is not configured or uses default placeholders.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate dummy 1536-dimension float vector for pgvector seeding
const dummyVector = new Array(1536).fill(0);

async function seed() {
  console.log("Starting Supabase database seeding...");

  // 1. Seed Users
  const users = [
    {
      id: "aarav",
      name: "Aarav",
      stated_goal: "I want confidence during interviews.",
      recent_reflections: [
        "Finished my third portfolio project",
        "Nervous every time someone asks me to explain my work out loud",
        "I tried to share my portfolio but I fail to get any response or interest."
      ]
    },
    {
      id: "meera",
      name: "Meera",
      stated_goal: "I want confidence during interviews... I've been rejected four times this month.",
      recent_reflections: [
        "Another rejection today",
        "Maybe I'm just not good enough for this"
      ]
    }
  ];

  console.log("Seeding users...");
  for (const user of users) {
    const { error } = await supabase.from("users").upsert(user);
    if (error) {
      console.error(`Error seeding user ${user.id}:`, error);
    } else {
      console.log(`Successfully seeded user: ${user.id}`);
    }
  }

  // 2. Seed Identity States (Historical snapshots with vector narrative embeddings)
  const identityStates = [
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
    },
    {
      id: "t-aarav-3",
      user_id: "aarav",
      month: "Month 3",
      label: "Mentorship Transition",
      quadrant: "Commitment",
      capability_gap: "Communication Confidence",
      reasoning: "Started mentoring a junior designer. Found clarity in explaining simple terms to others but still stutter on self-advocacy.",
      embedding: dummyVector
    },
    {
      id: "t-meera-1",
      user_id: "meera",
      month: "Month 1",
      label: "Intense Prep Run",
      quadrant: "Commitment",
      capability_gap: "High-volume Applications",
      reasoning: "Pushing applications out daily, preparing templates, and preparing interview questions. High fatigue, external validation dependent.",
      embedding: dummyVector
    },
    {
      id: "t-meera-2",
      user_id: "meera",
      month: "Month 2",
      label: "Rejection Exhaustion",
      quadrant: "Compassion",
      capability_gap: "Emotional Buffer Protection",
      reasoning: "Diagnosed as needing emotional boundaries. Stated interview prep is secondary to restoring confidence and pacing.",
      embedding: dummyVector
    }
  ];

  console.log("Seeding identity states timeline snapshots...");
  for (const state of identityStates) {
    const { error } = await supabase.from("identity_states").upsert(state);
    if (error) {
      console.error(`Error seeding snapshot ${state.id}:`, error);
    } else {
      console.log(`Successfully seeded snapshot: ${state.id}`);
    }
  }

  // 3. Seed Evidence Entries
  const evidenceEntries = [
    {
      id: "ev-aarav-1",
      user_id: "aarav",
      step_id: "step-c1",
      type: "skill",
      content: "Finished portfolio setup",
      timestamp: "2026-07-28T12:00:00Z",
      counts_as_evidence: true
    },
    {
      id: "ev-meera-1",
      user_id: "meera",
      step_id: "step-m1",
      type: "reflective",
      content: "Applied to 5 roles",
      timestamp: "2026-07-25T14:30:00Z",
      counts_as_evidence: true
    }
  ];

  console.log("Seeding evidence ledger logs...");
  for (const entry of evidenceEntries) {
    const { error } = await supabase.from("evidence_entries").upsert(entry);
    if (error) {
      console.error(`Error seeding evidence ${entry.id}:`, error);
    } else {
      console.log(`Successfully seeded evidence: ${entry.id}`);
    }
  }

  console.log("Database seeding operation completed.");
}

seed().catch((err) => {
  console.error("Failed to execute database seeding script:", err);
});
