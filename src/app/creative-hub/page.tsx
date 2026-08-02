"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CreativeHubPlayer from "@/components/CreativeHub/CreativeHubPlayer";
import { ExperienceStep } from "@/types/threshold";

function CreativeHubPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  // All context passed as URL search params from JourneyScreen
  const userId = params.get("userId") || "";
  const statedGoal = params.get("statedGoal") || "";
  const stepId = params.get("stepId") || "step-creative-hub";
  const mediaTitle = params.get("mediaTitle") || "IABTM Creative Hub";
  const mediaCapabilityGap = params.get("mediaCapabilityGap") || "";
  const mediaContent = params.get("mediaContent") || "";
  const timeAvailable = (params.get("timeAvailable") as "5min" | "30min" | "open") || "open";
  const location = (params.get("location") as "remote" | "in-person") || "remote";
  const requiresOutput = params.get("requiresOutput") === "true";
  const returnTo = params.get("returnTo") || "/embed";

  // Reconstruct a minimal ExperienceStep so CreativeHubPlayer gets what it needs
  const step: ExperienceStep = {
    id: stepId,
    verb: "attend",
    label: "Engage with your personalized IABTM Creative Hub to build confidence and perspective.",
    requires_output: requiresOutput,
    resource_type: "creative_hub",
    media: {
      id: mediaContent || "creative-hub",
      title: mediaTitle,
      source: "IABTM",
      capability_gap: mediaCapabilityGap,
      content: mediaContent,
    },
  };

  const handleReflectionSubmit = async (sid: string, text: string) => {
    // Post the reflection back to the API exactly as the embed page does
    try {
      await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          stepId: sid,
          reflectionText: text,
          statedGoal,
          constraints: { timeAvailable, location, resources: ["laptop"] },
        }),
      });
    } catch (err) {
      console.error("CreativeHub page: reflection submit failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-primaryText flex flex-col font-sans">
      {/* Back bar */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3 flex items-center gap-3 shadow-subtle">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondaryText hover:text-primaryText transition-normal"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journey
        </button>
        <div className="flex-1" />
        <span className="text-[10px] uppercase tracking-widest text-secondaryText font-mono font-bold">
          IABTM Creative Hub
        </span>
        {mediaCapabilityGap && (
          <span className="text-[8px] uppercase tracking-wider text-secondaryText font-mono border border-border px-2 py-0.5 rounded-full hidden sm:block">
            Gap: {mediaCapabilityGap}
          </span>
        )}
      </header>

      {/* Full-page Creative Hub player */}
      <div className="flex-1 overflow-hidden">
        <CreativeHubPlayer
          step={step}
          userId={userId}
          statedGoal={statedGoal}
          timeAvailable={timeAvailable}
          location={location}
          onReflectionSubmit={handleReflectionSubmit}
          submitting={false}
        />
      </div>
    </div>
  );
}

export default function CreativeHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <span className="text-xs uppercase tracking-widest text-secondaryText font-mono animate-pulse">
            Loading Creative Hub...
          </span>
        </div>
      }
    >
      <CreativeHubPageInner />
    </Suspense>
  );
}
