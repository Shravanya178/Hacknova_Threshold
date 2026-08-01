"use client";

import React, { useState } from "react";
import { MediaPlan } from "@/types/threshold";
import { ChevronLeft, ChevronRight, AlertCircle, Presentation, Volume2 } from "lucide-react";

interface SubPlayerProps {
  content: string; // Slide text outlines split by slides/paragraphs
  title: string;
  mediaPlan: MediaPlan;
  onReflectionSubmit: (text: string) => Promise<void>;
  submitting?: boolean;
}

export default function AdaptiveSlideViewer({
  content,
  title,
  mediaPlan,
  onReflectionSubmit,
  submitting = false
}: SubPlayerProps) {
  const allSlides = content.split(/\n\n+/).filter(Boolean);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  const [promptResolved, setPromptResolved] = useState<Record<string, boolean>>({});
  const [responseText, setResponseText] = useState("");

  const totalSlides = allSlides.length;

  const isSlideSkipped = (idx: number): boolean => {
    return mediaPlan.segments.some((s) => s.type === "skip" && idx >= s.start && idx <= s.end);
  };

  const handleNext = () => {
    // 1. Evaluate prompts: lock slide progression
    const activePrompt = mediaPlan.prompts.find(
      (p) => p.trigger_point === currentSlideIndex && !promptResolved[p.id]
    );

    if (activePrompt) {
      alert("Please submit your reflection to unlock this checkpoint first!");
      return;
    }

    // 2. Step forward skipping skipped bounds
    let nextIdx = currentSlideIndex + 1;
    while (nextIdx <= totalSlides && isSlideSkipped(nextIdx)) {
      console.log(`[SlideViewer] Auto-skipping slide: ${nextIdx}`);
      nextIdx++;
    }

    if (nextIdx <= totalSlides) {
      setCurrentSlideIndex(nextIdx);
    }
  };

  const handlePrev = () => {
    let prevIdx = currentSlideIndex - 1;
    while (prevIdx >= 1 && isSlideSkipped(prevIdx)) {
      prevIdx--;
    }
    if (prevIdx >= 1) {
      setCurrentSlideIndex(prevIdx);
    }
  };

  const activePrompt = mediaPlan.prompts.find(
    (p) => p.trigger_point === currentSlideIndex && !promptResolved[p.id]
  );
  const activeNote = mediaPlan.notes.find((n) => n.trigger_point === currentSlideIndex);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim() || !activePrompt) return;

    await onReflectionSubmit(responseText);
    setPromptResolved((prev) => ({ ...prev, [activePrompt.id]: true }));
    setResponseText("");
  };

  return (
    <div className="slide-viewer-container flex flex-col gap-4 border border-border bg-secondaryBg p-5 rounded-card shadow-subtle relative">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Presentation className="w-5 h-5 text-champagneGold" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-secondaryText font-mono font-bold">
              PRESENTATION DECK
            </span>
            <h4 className="text-xs font-bold text-primaryText uppercase tracking-wide">
              {title}
            </h4>
          </div>
        </div>
        <span className="text-[10px] text-secondaryText font-mono">
          Slide {currentSlideIndex} of {totalSlides}
        </span>
      </div>

      {/* Slide Display Arena */}
      <div className="min-h-[180px] bg-background border border-border rounded-card p-5 flex flex-col justify-center relative shadow-inner">
        <p className="text-xs text-primaryText leading-relaxed text-center font-medium">
          {allSlides[currentSlideIndex - 1]}
        </p>

        {/* Slide overlay notes */}
        {activeNote && !activePrompt && (
          <div className="absolute bottom-2 left-2 right-2 bg-champagne border border-champagneDark/30 p-2.5 rounded-[10px] text-[10px] text-primaryText flex items-center gap-2 fade-in-up">
            <Volume2 className="w-3.5 h-3.5 text-champagneGold flex-shrink-0" />
            <p className="italic">"{activeNote.note}"</p>
          </div>
        )}
      </div>

      {/* Prompt overlay block */}
      {activePrompt && (
        <div className="border border-champagneGold/20 bg-champagne/40 p-4 rounded-card flex flex-col gap-3 fade-in-up">
          <div className="flex items-center gap-2 text-[10px] text-champagneGold uppercase tracking-widest font-mono font-bold">
            <AlertCircle className="w-4 h-4" />
            CHECKPOINT GATE: COMPLETE THE PROMPT
          </div>
          <p className="text-xs text-primaryText font-medium leading-relaxed">
            {activePrompt.prompt}
          </p>
          <form onSubmit={handlePromptSubmit} className="flex flex-col gap-3">
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              disabled={submitting}
              rows={3}
              className="w-full bg-background border border-border p-3 text-xs text-primaryText rounded-input focus-ring font-sans resize-none"
              placeholder="Submit reflection to unlock next slide..."
            />
            <button
              type="submit"
              disabled={submitting || !responseText.trim()}
              className="self-end bg-champagneGold hover:bg-champagneHover text-background font-bold py-2 px-5 rounded-btn text-[10px] uppercase tracking-wider disabled:opacity-50 transition-normal"
            >
              {submitting ? "Saving..." : "Verify & Unlock Slide"}
            </button>
          </form>
        </div>
      )}

      {/* Direction indicators */}
      <div className="flex justify-between items-center mt-2.5">
        <button
          onClick={handlePrev}
          disabled={currentSlideIndex <= 1}
          className="border border-border bg-background hover:bg-secondaryBg text-primaryText p-2 rounded-btn disabled:opacity-30 disabled:cursor-not-allowed transition-normal flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentSlideIndex >= totalSlides}
          className="border border-border bg-background hover:bg-secondaryBg text-primaryText p-2 rounded-btn disabled:opacity-30 disabled:cursor-not-allowed transition-normal flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
