import { supabase } from "../supabase";
import { TimelineEntry } from "@/types/threshold";

// Fetches timeline history snapshots for the user from Supabase (pgvector enabled table)
export async function getUserTimeline(userId: string): Promise<TimelineEntry[]> {
  try {
    const { data, error } = await supabase
      .from("identity_states")
      .select("id, month, label, quadrant, capability_gap, reasoning")
      .eq("user_id", userId.toLowerCase().trim());

    if (error) {
      console.error(`Supabase error fetching timeline for ${userId}:`, error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Sort chronologically by month (e.g. Month 1, Month 2, Month 3)
    const sorted = [...data].sort((a, b) => {
      const numA = parseInt(a.month.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.month.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    return sorted as TimelineEntry[];
  } catch (err) {
    console.error(`Failed to fetch user timeline for ${userId}:`, err);
    return [];
  }
}
