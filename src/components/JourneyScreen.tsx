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
  const [expandedMediaIds, setExpandedMediaIds] = useState<Record<string, boolean>>({});

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
                      onClick={() => setExpandedMediaIds(prev => ({ ...prev, [step.id]: !prev[step.id] }))}
                      className="mt-3.5 p-3.5 bg-secondaryBg border border-border hover:border-black/10 rounded-card flex flex-col gap-1.5 w-full max-w-lg cursor-pointer transition-normal select-none"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[8px] uppercase tracking-widest text-primaryText font-bold font-mono flex items-center gap-1">
                          IABTM Curated Resource
                          <span className="text-[7px] text-secondaryText lowercase font-sans font-normal">
                            ({expandedMediaIds[step.id] ? "click to collapse" : "click to demo content"})
                          </span>
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-secondaryText font-semibold">
                          Gap: {step.media.capability_gap}
                        </span>
                      </div>
                      <p className="text-[10px] text-primaryText leading-normal italic font-serif">
                        "{step.media.title}"
                      </p>
                      {expandedMediaIds[step.id] && step.media.content && (
                        <div className="mt-2 pt-2 border-t border-border text-[10px] text-secondaryText leading-relaxed font-sans normal-case fade-in-up">
                          <span className="font-bold text-primaryText block mb-0.5 uppercase tracking-wider text-[8px] font-mono">
                            Interactive Growth Guide:
                          </span>
                          {step.media.content}
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
    </div>
  );
}
