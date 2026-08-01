"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { ExperienceStep, EvidenceEntry } from "@/types/threshold";

interface ReflectionCaptureProps {
  step: ExperienceStep;
  onSubmit: (reflectionText: string) => void;
  loading?: boolean;
  existingEvidence?: EvidenceEntry;
}

export default function ReflectionCapture({
  step,
  onSubmit,
  loading = false,
  existingEvidence
}: ReflectionCaptureProps) {
  const [reflectionText, setReflectionText] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;
    onSubmit(reflectionText);
    setReflectionText("");
  };

  return (
    <div className="reflection-capture mt-3.5 border-t border-border pt-3.5">
      {existingEvidence ? (
        <div className="bg-secondaryBg border border-border p-4 rounded-card flex flex-col gap-1.5 fade-in-up">
          <div className="flex items-center gap-1.5 text-[10px] text-primaryText uppercase tracking-wider font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            Evidence Submitted
          </div>
          <p className="text-xs text-secondaryText italic leading-relaxed">
            "{existingEvidence.content}"
          </p>
          <span className="text-[9px] text-mutedText">
            Recorded at: {new Date(existingEvidence.timestamp).toLocaleString()}
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <label className="text-[10px] uppercase tracking-wider text-secondaryText font-bold">
            Record Proof of Action
          </label>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            disabled={loading}
            className="w-full bg-background border border-border p-3 text-xs text-primaryText rounded-input focus-ring resize-none h-16 font-sans leading-relaxed"
            placeholder={
              step.verb === "rest"
                ? "Describe your recovery session..."
                : "What did you learn or accomplish?"
            }
          />
          <button
            type="submit"
            disabled={loading || !reflectionText.trim()}
            className="self-end bg-champagneGold hover:bg-champagneHover text-background font-bold px-4 py-2 uppercase tracking-wider text-[10px] rounded-btn transition-normal flex items-center gap-1.5 disabled:opacity-50 shadow-subtle"
          >
            {loading ? "Saving..." : "Submit Proof"}
            <Send className="w-3 h-3" />
          </button>
        </form>
      )}
    </div>
  );
}
