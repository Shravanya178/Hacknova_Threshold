"use client";

import React, { useState } from "react";
import { Diagnosis } from "@/types/threshold";

interface IdentityConversationProps {
  userId: string;
  recentReflections: string[];
  timeAvailable: "5min" | "30min" | "open";
  location: "remote" | "in-person";
  onDiagnoseStart: () => void;
  onDiagnoseComplete: (diagnosis: Diagnosis) => void;
  onDiagnoseError: (error: string) => void;
}

export default function IdentityConversation({
  userId,
  recentReflections,
  timeAvailable,
  location,
  onDiagnoseStart,
  onDiagnoseComplete,
  onDiagnoseError
}: IdentityConversationProps) {
  const [statedGoal, setStatedGoal] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statedGoal.trim()) return;

    setLoading(true);
    onDiagnoseStart();

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          statedGoal,
          recentReflections,
          constraints: {
            timeAvailable,
            location,
            resources: ["laptop"]
          }
        })
      });

      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }

      const data = (await res.json()) as Diagnosis;
      onDiagnoseComplete(data);
    } catch (err) {
      console.error(err);
      onDiagnoseError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="identity-conversation-container">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="stated-goal-input" className="text-xs font-bold uppercase tracking-wider text-secondaryText">
          Stated Goal
        </label>
        <textarea
          id="stated-goal-input"
          value={statedGoal}
          onChange={(e) => setStatedGoal(e.target.value)}
          placeholder="I want confidence during interviews..."
          rows={3}
          disabled={loading}
          className="w-full bg-secondaryBg border border-border p-3 px-4 text-sm text-primaryText rounded-input focus-ring resize-none font-sans"
        />
        <button
          type="submit"
          disabled={loading || !statedGoal.trim()}
          className="bg-champagneGold hover:bg-champagneHover text-background font-bold py-3 px-6 rounded-btn transition-normal text-[11px] uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-subtle"
        >
          {loading ? "Diagnosing State..." : "Diagnose Growth Moment"}
        </button>
      </form>
    </div>
  );
}
