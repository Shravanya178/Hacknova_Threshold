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
    <div className="reflection-capture mt-3 border-t border-white/5 pt-3">
      {existingEvidence ? (
        <div className="bg-background/40 border border-primaryAccent/20 p-3 rounded-[4px] flex flex-col gap-1.5 fade-in-up">
          <div className="flex items-center gap-1.5 text-[10px] text-primaryAccent uppercase tracking-wider font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label className="text-[9px] uppercase tracking-wider text-mutedText font-bold">
            Record Proof of Action
          </label>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            disabled={loading}
            className="w-full bg-background border border-white/10 p-2.5 text-xs text-primaryText rounded-[4px] focus-ring resize-none h-14 font-sans leading-relaxed"
            placeholder={
              step.verb === "rest"
                ? "Describe your recovery session..."
                : "What did you learn or accomplish?"
            }
          />
          <button
            type="submit"
            disabled={loading || !reflectionText.trim()}
            className="self-end bg-primaryAccent hover:bg-primaryHover text-secondaryBg font-bold px-3 py-1.5 uppercase tracking-wider text-[10px] rounded-[3px] transition-normal flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Submit Proof"}
            <Send className="w-3 h-3" />
          </button>
        </form>
      )}
    </div>
  );
}
