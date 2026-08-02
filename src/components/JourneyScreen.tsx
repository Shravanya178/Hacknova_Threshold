"use client";

import React, { useState } from "react";
import { Lock, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { ExperienceStep, EvidenceEntry } from "@/types/threshold";
import ReflectionCapture from "./ReflectionCapture";
import AdaptiveMediaPlayer from "./AdaptiveMediaPlayer";
import CreativeHubPlayer from "./CreativeHub/CreativeHubPlayer";

interface JourneyScreenProps {
  steps: ExperienceStep[];
  completedSteps: Record<string, boolean>;
  evidence: Record<string, EvidenceEntry>;
  onStepCompleteToggle: (stepId: string) => void;
  onReflectionSubmit: (stepId: string, text: string) => Promise<void>;
  submittingStepId?: string | null;
  userId: string;
  statedGoal: string;
  timeAvailable: "5min" | "30min" | "open";
  location: "remote" | "in-person";
  quadrant?: string;
}

export default function JourneyScreen({
  steps,
  completedSteps,
  evidence,
  onStepCompleteToggle,
  onReflectionSubmit,
  submittingStepId,
  userId,
  statedGoal,
  timeAvailable,
  location,
  quadrant
}: JourneyScreenProps) {
  const [activeReflectionStep, setActiveReflectionStep] = useState<string | null>(null);
  const [expandedMediaIds, setExpandedMediaIds] = useState<Record<string, boolean>>({});
  const [creativeHubOpenStep, setCreativeHubOpenStep] = useState<ExperienceStep | null>(null);

  const isStepLocked = (index: number): boolean => {
    if (index === 0) return false;
    for (let i = 0; i < index; i++) {
      const prevStep = steps[i];
      if (prevStep.requires_output && !evidence[prevStep.id]) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="journey-screen flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-border pb-3">
        <span className="text-[11px] uppercase tracking-wider text-secondaryText font-bold">
          Growth Experience Itinerary
        </span>
        <span className="text-[10px] uppercase tracking-widest text-primaryText font-bold">
          Itinerary, Not A Feed
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {steps.map((step, idx) => {
          const locked = isStepLocked(idx);
          const completed = completedSteps[step.id] || false;
          const hasEvidence = !!evidence[step.id];

          return (
            <div
              key={step.id}
              className={`p-5 border rounded-card transition-normal shadow-subtle ${
                locked
                  ? "bg-secondaryBg/40 border-border opacity-40 blur-[0.3px] pointer-events-none select-none"
                  : "bg-surface border-border hover:border-black/10"
              }`}
            >
              {/* Step Title Header */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-widest text-primaryText font-mono bg-black/5 px-2 py-0.5 rounded-[3px] font-bold">
                      {step.verb}
                    </span>
                    {step.requires_output && (
                      <span className="text-[9px] uppercase tracking-widest text-secondaryText font-mono border border-border px-2 py-0.2 rounded-[3px] font-semibold">
                        Gated (requires proof)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-primaryText font-medium leading-relaxed mt-2.5">
                    {step.label}
                  </p>

                  {/* Media item integration if present */}
                  {step.media && (
                    <div 
                      onClick={() => {
                        if (step.resource_type === "creative_hub") {
                          setCreativeHubOpenStep(step);
                        } else {
                          setExpandedMediaIds(prev => ({ ...prev, [step.id]: !prev[step.id] }));
                        }
                      }}
                      className="mt-3.5 p-3.5 bg-champagne/40 border border-border hover:border-champagneGold hover:bg-champagne/60 rounded-card flex flex-col gap-1.5 w-full max-w-lg cursor-pointer transition-normal select-none"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[8px] uppercase tracking-widest text-primaryText font-bold font-mono flex items-center gap-1">
                          {step.resource_type === "creative_hub" ? "IABTM Creative Hub" : "IABTM Curated Resource"}
                          <span className="text-[7px] text-secondaryText lowercase font-sans font-normal">
                            ({step.resource_type === "creative_hub"
                              ? "click to launch hub" 
                              : expandedMediaIds[step.id] ? "click to collapse" : "click to demo content"})
                          </span>
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-secondaryText font-semibold">
                          Gap: {step.media.capability_gap}
                        </span>
                      </div>
                      <p className="text-[10px] text-primaryText leading-normal italic font-serif">
                        "{step.media.title}"
                      </p>
                      {expandedMediaIds[step.id] && (
                        <div className="mt-3 pt-3 border-t border-border w-full fade-in-up" onClick={(e) => e.stopPropagation()}>
                          <AdaptiveMediaPlayer
                            step={step}
                            userId={userId}
                            statedGoal={statedGoal}
                            timeAvailable={timeAvailable}
                            location={location}
                            onReflectionSubmit={onReflectionSubmit}
                            submitting={submittingStepId === step.id}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Completion Switch / Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {locked ? (
                    <Lock className="w-3.5 h-3.5 text-mutedText" />
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Checkbox for Completion Status (Visible State 1) */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id={`complete-${step.id}`}
                          checked={completed}
                          onChange={() => onStepCompleteToggle(step.id)}
                          className="w-3.5 h-3.5 rounded-[3px] border-border bg-background text-primaryText focus:ring-0 cursor-pointer"
                        />
                        <label
                          htmlFor={`complete-${step.id}`}
                          className="text-[9px] uppercase tracking-wider text-secondaryText font-bold cursor-pointer select-none"
                        >
                          {completed ? "Completed" : "Complete"}
                        </label>
                      </div>

                      {/* Evidence Tag (Visible State 2 - Shown separately) */}
                      {hasEvidence && (
                        <div className="flex items-center gap-1 text-success text-[9px] uppercase tracking-wider font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Proof Filed
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reflection capture triggers */}
              {!locked && (
                <div className="mt-3.5">
                  <button
                    onClick={() =>
                      setActiveReflectionStep(activeReflectionStep === step.id ? null : step.id)
                    }
                    className="text-[9px] uppercase tracking-wider text-secondaryText hover:text-primaryText font-bold flex items-center gap-1.5 transition-normal"
                  >
                    <span>{hasEvidence ? "View Proof" : "Record Proof"}</span>
                    {activeReflectionStep === step.id ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {activeReflectionStep === step.id && (
                    <ReflectionCapture
                      step={step}
                      onSubmit={(text) => onReflectionSubmit(step.id, text)}
                      loading={submittingStepId === step.id}
                      existingEvidence={evidence[step.id]}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Creative Hub Lightbox Modal Overlay */}
      {creativeHubOpenStep && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-8 fade-in-up" 
          onClick={() => setCreativeHubOpenStep(null)}
        >
          <div 
            className="bg-surface max-w-6xl w-full h-[90vh] rounded-2xl shadow-2xl relative border border-border flex flex-col overflow-hidden creative-hub-scope" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setCreativeHubOpenStep(null)}
              className="absolute top-4 right-4 bg-background hover:bg-secondaryBg border border-border p-2 rounded-full text-primaryText hover:text-secondary hover:scale-105 active:scale-95 transition-all z-50 shadow-md flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg leading-none w-5 h-5 flex items-center justify-center">close</span>
            </button>
            <CreativeHubPlayer
              step={creativeHubOpenStep}
              userId={userId}
              statedGoal={statedGoal}
              timeAvailable={timeAvailable}
              location={location}
              onReflectionSubmit={async (stepId, text) => {
                await onReflectionSubmit(stepId, text);
                setTimeout(() => {
                  setCreativeHubOpenStep(null);
                }, 1200);
              }}
              submitting={submittingStepId === creativeHubOpenStep.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
