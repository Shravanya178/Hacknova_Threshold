"use client";

import React, { useState } from "react";
import { Lock, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { ExperienceStep, EvidenceEntry } from "@/types/threshold";
import ReflectionCapture from "./ReflectionCapture";

interface JourneyScreenProps {
  steps: ExperienceStep[];
  completedSteps: Record<string, boolean>;
  evidence: Record<string, EvidenceEntry>;
  onStepCompleteToggle: (stepId: string) => void;
  onReflectionSubmit: (stepId: string, text: string) => void;
  submittingStepId?: string | null;
}

export default function JourneyScreen({
  steps,
  completedSteps,
  evidence,
  onStepCompleteToggle,
  onReflectionSubmit,
  submittingStepId
}: JourneyScreenProps) {
  const [activeReflectionStep, setActiveReflectionStep] = useState<string | null>(null);

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
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[10px] uppercase tracking-wider text-mutedText font-bold">
          Growth Experience Itinerary
        </span>
        <span className="text-[9px] uppercase tracking-widest text-primaryAccent font-bold">
          Itinerary, Not A Feed
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {steps.map((step, idx) => {
          const locked = isStepLocked(idx);
          const completed = completedSteps[step.id] || false;
          const hasEvidence = !!evidence[step.id];

          return (
            <div
              key={step.id}
              className={`p-4 border rounded-[4px] transition-normal ${
                locked
                  ? "bg-background/20 border-white/5 opacity-40 blur-[0.5px] pointer-events-none select-none"
                  : "bg-surface border-white/5 hover:border-white/10"
              }`}
            >
              {/* Step Title Header */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-widest text-primaryAccent font-mono bg-primaryAccent/5 px-1.5 py-0.5 rounded-[2px] font-bold">
                      {step.verb}
                    </span>
                    {step.requires_output && (
                      <span className="text-[8px] uppercase tracking-widest text-mutedText font-mono border border-white/10 px-1 py-0.2 rounded-[2px] font-semibold">
                        Gated (requires proof)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-primaryText font-medium leading-relaxed mt-1">
                    {step.label}
                  </p>

                  {/* Media item integration if present */}
                  {step.media && (
                    <div className="mt-2.5 p-2 bg-background border border-white/5 rounded-[3px] flex flex-col gap-1 w-full max-w-lg">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[8px] uppercase tracking-widest text-primaryAccent font-bold font-mono">
                          IABTM Curated Resource
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-mutedText font-semibold">
                          Gap: {step.media.capability_gap}
                        </span>
                      </div>
                      <p className="text-[10px] text-secondaryText leading-normal italic font-serif">
                        "{step.media.title}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Completion Switch / Actions */}
                <div className="flex items-center gap-2">
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
                          className="w-3.5 h-3.5 rounded-[2px] border-white/10 bg-background text-primaryAccent focus:ring-0 cursor-pointer"
                        />
                        <label
                          htmlFor={`complete-${step.id}`}
                          className="text-[9px] uppercase tracking-wider text-mutedText font-semibold cursor-pointer select-none"
                        >
                          {completed ? "Completed" : "Complete"}
                        </label>
                      </div>

                      {/* Evidence Tag (Visible State 2 - Shown separately) */}
                      {hasEvidence && (
                        <div className="flex items-center gap-1 text-success text-[9px] uppercase tracking-wider font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Proof Filed
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Reflection capture triggers */}
              {!locked && (
                <div className="mt-2.5">
                  <button
                    onClick={() =>
                      setActiveReflectionStep(activeReflectionStep === step.id ? null : step.id)
                    }
                    className="text-[9px] uppercase tracking-wider text-secondaryText hover:text-primaryAccent font-bold flex items-center gap-1"
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
    </div>
  );
}
