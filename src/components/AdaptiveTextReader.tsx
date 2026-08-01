"use client";

import React, { useState } from "react";
import { MediaPlan } from "@/types/threshold";
import { AlertCircle, HelpCircle, BookOpen } from "lucide-react";

interface SubPlayerProps {
  content: string;
  title: string;
  mediaPlan: MediaPlan;
  onReflectionSubmit: (text: string) => Promise<void>;
  submitting?: boolean;
}

export default function AdaptiveTextReader({
  content,
  title,
  mediaPlan,
  onReflectionSubmit,
  submitting = false
}: SubPlayerProps) {
  // Split content by paragraphs or clean headers
  const sections = content.split(/\n\n+/).filter(Boolean);
  const [promptResolved, setPromptResolved] = useState<Record<string, boolean>>({});
  const [responseText, setResponseText] = useState("");

  // Determine what is the current gated section index
  const getGatedIndex = (): number => {
    for (const prompt of mediaPlan.prompts) {
      if (!promptResolved[prompt.id]) {
        return prompt.trigger_point; // Gated at this index
      }
    }
    return sections.length; // No gates left
  };

  const gatedIndex = getGatedIndex();

  const handlePromptSubmit = async (e: React.FormEvent, promptId: string) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    await onReflectionSubmit(responseText);
    setPromptResolved((prev) => ({ ...prev, [promptId]: true }));
    setResponseText("");
  };

  return (
    <div className="text-reader-container flex flex-col gap-4 border border-border bg-secondaryBg p-5 rounded-card shadow-subtle relative">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <BookOpen className="w-5 h-5 text-champagneGold" />
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-widest text-secondaryText font-mono font-bold">
            TEXT EXPERIENCE
          </span>
          <h4 className="text-xs font-bold text-primaryText uppercase tracking-wide">
            {title}
          </h4>
        </div>
      </div>

      <div className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
        {sections.map((section, idx) => {
          // Check if index is skipped
          const isSkipped = mediaPlan.segments.some(
            (s) => s.type === "skip" && idx >= s.start && idx <= s.end
          );
          if (isSkipped) {
            return (
              <div key={idx} className="border-l-2 border-border/40 pl-3 py-1 bg-black/[0.02]">
                <span className="text-[8px] uppercase tracking-widest font-mono text-mutedText font-semibold">
                  [Section ${idx + 1} Skipped by Media Agent to optimize reading constraint]
                </span>
              </div>
            );
          }

          // Check if index is hidden due to gated prompt block scroll
          if (idx > gatedIndex) {
            return null; // Gated scroll block
          }

          const matchedNote = mediaPlan.notes.find((n) => n.trigger_point === idx);
          const matchedPrompt = mediaPlan.prompts.find((p) => p.trigger_point === idx);

          return (
            <div key={idx} className="flex flex-col gap-3 relative fade-in-up border-b border-border/20 pb-4">
              <div className="flex gap-4">
                {/* Main text content */}
                <div className="flex-1">
                  <p className="text-xs text-primaryText leading-relaxed text-justify">
                    {section}
                  </p>
                </div>

                {/* Sidebar Callout Note */}
                {matchedNote && (
                  <div className="w-[120px] bg-champagne border border-champagneDark/30 p-2.5 rounded-[10px] text-[10px] text-secondaryText leading-relaxed flex flex-col gap-1.5 flex-shrink-0 self-start">
                    <span className="text-[8px] font-bold text-champagneGold uppercase tracking-widest font-mono">
                      ANNOTATION
                    </span>
                    <p className="italic font-serif">"{matchedNote.note}"</p>
                  </div>
                )}
              </div>

              {/* Reflection Checkpoint Input Gate */}
              {matchedPrompt && !promptResolved[matchedPrompt.id] && (
                <div className="mt-2.5 p-4 border border-champagneGold/20 bg-champagne/30 rounded-card flex flex-col gap-3.5 w-full">
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-mono font-bold text-champagneGold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    REFLECTION LOCK: ANSWER TO PROGRESS SCROLLING
                  </div>
                  <p className="text-xs text-primaryText font-medium">
                    {matchedPrompt.prompt}
                  </p>
                  <form
                    onSubmit={(e) => handlePromptSubmit(e, matchedPrompt.id)}
                    className="flex flex-col gap-2.5"
                  >
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      disabled={submitting}
                      rows={3}
                      className="w-full bg-background border border-border p-3 text-xs text-primaryText rounded-input focus-ring font-sans resize-none"
                      placeholder="Write your response to unlock the rest of the text..."
                    />
                    <button
                      type="submit"
                      disabled={submitting || !responseText.trim()}
                      className="self-end bg-champagneGold hover:bg-champagneHover text-background font-bold py-2 px-5 rounded-btn text-[10px] uppercase tracking-wider disabled:opacity-50 transition-normal"
                    >
                      {submitting ? "Saving..." : "Verify & Unlock"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
