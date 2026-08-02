"use client";

import React, { useState } from "react";
import { ExperienceStep, MediaPlan } from "@/types/threshold";
import PodcastPage from "./PodcastPage";
import CreatorsPage from "./CreatorsPage";
import ExpertsPage from "./ExpertsPage";
import { AlertCircle, CheckCircle2, ChevronRight, Activity, Send } from "lucide-react";

interface CreativeHubPlayerProps {
  step: ExperienceStep;
  userId: string;
  statedGoal: string;
  timeAvailable: "5min" | "30min" | "open";
  location: "remote" | "in-person";
  onReflectionSubmit: (stepId: string, text: string) => Promise<void>;
  submitting?: boolean;
}

export default function CreativeHubPlayer({
  step,
  userId,
  statedGoal,
  timeAvailable,
  location,
  onReflectionSubmit,
  submitting = false
}: CreativeHubPlayerProps) {
  const [activeTab, setActiveTab] = useState<"podcast" | "creators" | "experts">("podcast");
  const [recentInteractions, setRecentInteractions] = useState<string[]>([]);
  const [responseText, setResponseText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Fallback media plan prompt
  const activePrompt = step.requires_output 
    ? "Submit your realization regarding creative media, storytelling, and executive advisory networks, and how they apply to your developmental goal."
    : "Write a brief reflection on your takeaways from exploring the IABTM Creative Hub platform.";

  const logInteraction = (event: string) => {
    const time = new Date().toLocaleTimeString();
    setRecentInteractions((prev) => [`[${time}] ${event}`, ...prev.slice(0, 4)]);
  };

  const handleReflectionFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    // Concat recent interactions to reflection to provide richer evidence context
    const fullEvidenceText = recentInteractions.length > 0 
      ? `${responseText}\n\n[Interaction Log]\n${recentInteractions.join("\n")}`
      : responseText;

    await onReflectionSubmit(step.id, fullEvidenceText);
    setSubmitted(true);
    setResponseText("");
    logInteraction("Evidence filed to Proof Ledger successfully.");
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-[90vh] bg-background text-primaryText overflow-hidden creative-hub-scope rounded-xl relative">
      
      {/* 1. Creative Hub Sub-Page Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        {activeTab === "podcast" && (
          <PodcastPage 
            onTabChange={setActiveTab} 
            onPlayEpisode={(title) => logInteraction(`Started listening to podcast episode: "${title}"`)}
          />
        )}
        {activeTab === "creators" && (
          <CreatorsPage 
            onTabChange={setActiveTab} 
            onViewCreatorKit={(name) => logInteraction(`Viewed creator media kit for: "${name}"`)}
          />
        )}
        {activeTab === "experts" && (
          <ExpertsPage 
            onTabChange={setActiveTab} 
            onSelectExpert={(name) => logInteraction(`Requested advisor connection brief for: "${name}"`)}
          />
        )}
      </div>

      {/* 2. Floating/Docked Evidence Ledger & Reflection Panel */}
      <div className="w-full lg:w-[350px] bg-secondaryBg border-t lg:border-t-0 lg:border-l border-border p-6 flex flex-col justify-between overflow-y-auto no-scrollbar select-none z-10">
        <div className="space-y-6">
          <div className="flex flex-col gap-1 border-b border-border pb-3">
            <span className="text-[9px] uppercase tracking-widest text-secondaryText font-mono font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-champagneGold" />
              INTELLIGENCE LEDGER LOG
            </span>
            <h3 className="text-xs font-bold text-primaryText uppercase tracking-wider">
              Gated Proof of Growth
            </h3>
          </div>

          {/* Interactive logs */}
          <div className="space-y-2">
            <span className="text-[8px] uppercase tracking-widest text-secondaryText font-mono font-bold">
              Activity Stream
            </span>
            <div className="bg-background border border-border rounded-lg p-3 min-h-[90px] max-h-[140px] overflow-y-auto custom-scrollbar font-mono text-[9px] text-secondaryText flex flex-col gap-1.5">
              {recentInteractions.length === 0 ? (
                <span className="italic text-mutedText text-[8px]">No interactions recorded yet. Click buttons inside pages (play, search, view kit) to log activity.</span>
              ) : (
                recentInteractions.map((act, idx) => (
                  <div key={idx} className="flex gap-1.5 items-start fade-in-up">
                    <ChevronRight className="w-3 h-3 text-champagneGold flex-shrink-0 mt-0.5" />
                    <span className="break-all">{act}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reflection checklist prompt */}
          <div className="bg-champagne/40 border border-border p-4.5 rounded-lg flex flex-col gap-3">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-champagneGold uppercase tracking-widest font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              Reflection Prompt
            </div>
            <p className="text-xs text-primaryText leading-relaxed">
              {activePrompt}
            </p>
          </div>
        </div>

        {/* Reflection submit form */}
        <div className="mt-6 pt-4 border-t border-border">
          {submitted ? (
            <div className="p-4 bg-success/5 border border-success/20 rounded-lg flex flex-col items-center justify-center text-center gap-2 fade-in-up">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <span className="text-xs font-bold text-primaryText uppercase tracking-wider">Proof Filed</span>
              <p className="text-[10px] text-secondaryText leading-relaxed">
                Your growth reflection and interaction logs have been registered inside the Evidence Ledger.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReflectionFormSubmit} className="flex flex-col gap-3">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                disabled={submitting}
                rows={3}
                className="w-full bg-background border border-border p-3 text-xs text-primaryText rounded-input focus-ring font-sans resize-none"
                placeholder="Write down your key learnings to file proof and unlock the next step..."
                required
              />
              <button
                type="submit"
                disabled={submitting || !responseText.trim()}
                className="w-full bg-champagneGold hover:bg-champagneHover text-background font-bold py-3 rounded-btn text-[10px] uppercase tracking-wider disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-subtle hover:scale-[1.01] active:scale-98"
              >
                {submitting ? (
                  "Filing Proof..."
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    FILE EVIDENCE
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
