"use client";

import React, { useState, useEffect } from "react";
import { ExperienceStep, MediaPlan } from "@/types/threshold";
import AdaptiveVideoPlayer from "./AdaptiveVideoPlayer";
import AdaptiveAudioPlayer from "./AdaptiveAudioPlayer";
import AdaptiveTextReader from "./AdaptiveTextReader";
import AdaptiveSlideViewer from "./AdaptiveSlideViewer";
import CreativeHubPlayer from "./CreativeHub/CreativeHubPlayer";
import { Loader2 } from "lucide-react";

interface AdaptiveMediaPlayerProps {
  step: ExperienceStep;
  userId: string;
  statedGoal: string;
  timeAvailable: "5min" | "30min" | "open";
  location: "remote" | "in-person";
  onReflectionSubmit: (stepId: string, text: string) => Promise<void>;
  submitting?: boolean;
}

export default function AdaptiveMediaPlayer({
  step,
  userId,
  statedGoal,
  timeAvailable,
  location,
  onReflectionSubmit,
  submitting = false
}: AdaptiveMediaPlayerProps) {
  const [mediaPlan, setMediaPlan] = useState<MediaPlan | null>(step.media_plan || null);
  const [loading, setLoading] = useState<boolean>(false);

  // If no media plan is attached, dynamically generate it on mount
  useEffect(() => {
    if (step.media_plan) {
      setMediaPlan(step.media_plan);
      return;
    }

    if (!step.media) {
      return;
    }

    const fetchPlan = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/media-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            statedGoal,
            quadrant: "Curiosity", // Default quadrant placeholder, will be populated on API call
            capabilityGap: step.media?.capability_gap || "Growth milestone validation",
            resourceType: step.resource_type || "video",
            resourceContent: step.media?.content || "Default learning asset resources outline",
            timeAvailable,
            requiresOutput: step.requires_output
          })
        });

        if (res.ok) {
          const data = await res.json();
          setMediaPlan(data.mediaPlan);
        } else {
          throw new Error("Failed to load plan");
        }
      } catch (err) {
        console.error("Failed to generate media plan:", err);
        // Load fallback plan
        setMediaPlan(runFallbackMediaPlan(step.resource_type || "video", step.requires_output));
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [step]);

  const runFallbackMediaPlan = (
    type: "video" | "audio" | "text" | "slides" | "creative_hub",
    requiresOutput: boolean
  ): MediaPlan => {
    return {
      segments: [{ id: "s-f", type: "watch", start: 0, end: type === "video" || type === "audio" || type === "creative_hub" ? 180 : 3 }],
      notes: [{ id: "n-f", trigger_point: 0, note: "Focus on connection to current goals." }],
      prompts: requiresOutput
        ? [{ id: "p-f", trigger_point: type === "video" || type === "audio" || type === "creative_hub" ? 60 : 1, prompt: "What is your main take-away?" }]
        : []
    };
  };

  const handleSubPlayerReflection = async (text: string) => {
    await onReflectionSubmit(step.id, text);
  };

  if (!step.media) {
    return null;
  }

  if (loading || !mediaPlan) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 border border-border bg-secondaryBg rounded-card">
        <Loader2 className="w-6 h-6 animate-spin text-champagneGold" />
        <span className="text-[10px] uppercase tracking-widest text-secondaryText font-mono font-bold">
          COMPILING MULTI-AGENT MEDIA PLAN...
        </span>
      </div>
    );
  }

  const resourceType = step.resource_type || "video";

  if (resourceType === "video") {
    // Extract video ID from youtube URL or fallback
    const ytId = step.media.id || "dQw4w9WgXcQ";
    return (
      <AdaptiveVideoPlayer
        mediaId={ytId}
        title={step.media.title}
        mediaPlan={mediaPlan}
        onReflectionSubmit={handleSubPlayerReflection}
        submitting={submitting}
      />
    );
  }

  if (resourceType === "audio") {
    const audioUrl = step.media.content || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    return (
      <AdaptiveAudioPlayer
        url={audioUrl}
        title={step.media.title}
        mediaPlan={mediaPlan}
        onReflectionSubmit={handleSubPlayerReflection}
        submitting={submitting}
      />
    );
  }

  if (resourceType === "text") {
    const articleText =
      step.media.content ||
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Section 1.\n\nVestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Section 2.\n\nDonec elementum convallis lectus vel efficitur. Section 3.";
    return (
      <AdaptiveTextReader
        content={articleText}
        title={step.media.title}
        mediaPlan={mediaPlan}
        onReflectionSubmit={handleSubPlayerReflection}
        submitting={submitting}
      />
    );
  }

  if (resourceType === "slides") {
    const slideOutline =
      step.media.content ||
      "Slide 1: Overview of growth roadmap parameters.\n\nSlide 2: Focus on deliberate components design.\n\nSlide 3: Reflective gating mechanics detailed.";
    return (
      <AdaptiveSlideViewer
        content={slideOutline}
        title={step.media.title}
        mediaPlan={mediaPlan}
        onReflectionSubmit={handleSubPlayerReflection}
        submitting={submitting}
      />
    );
  }

  if (resourceType === "creative_hub") {
    return (
      <CreativeHubPlayer
        step={step}
        userId={userId}
        statedGoal={statedGoal}
        timeAvailable={timeAvailable}
        location={location}
        onReflectionSubmit={onReflectionSubmit}
        submitting={submitting}
      />
    );
  }

  return null;
}
