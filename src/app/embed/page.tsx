"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Check,
  Loader,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  History,
  Activity,
  Award,
  BookOpen
} from "lucide-react";
import { User, Diagnosis, ExperienceStep, EvidenceEntry } from "@/types/threshold";
import usersDataRaw from "../../data/users.json";

const usersData = usersDataRaw as User[];

export default function EmbedPage() {
  const [currentUser, setCurrentUser] = useState<User>(usersData[0]);
  const [statedGoal, setStatedGoal] = useState<string>(usersData[0].stated_goal);
  const [recentReflections, setRecentReflections] = useState<string[]>(
    usersData[0].recent_reflections
  );
  
  // Constraints
  const [timeAvailable, setTimeAvailable] = useState<"5min" | "30min" | "open">("open");
  const [location, setLocation] = useState<"remote" | "in-person">("remote");

  // App State
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"diagnose" | "journey" | "timeline">("diagnose");
  const [showTrace, setShowTrace] = useState<boolean>(false);
  
  // Evidence Ledger state (completed vs evidenced)
  const [evidence, setEvidence] = useState<Record<string, EvidenceEntry>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  
  // Reflection Input state
  const [activeReflectionStepId, setActiveReflectionStepId] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState<string>("");
  const [submittingReflection, setSubmittingReflection] = useState<boolean>(false);
  const [lapseAlert, setLapseAlert] = useState<{ reasoning: string } | null>(null);

  // Sync user data on toggle
  const handleUserChange = (userId: string) => {
    const user = usersData.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setStatedGoal(user.stated_goal);
      setRecentReflections(user.recent_reflections);
      setDiagnosis(null);
      setEvidence({});
      setCompletedSteps({});
      setActiveReflectionStepId(null);
      setLapseAlert(null);
      setActiveTab("diagnose");
    }
  };

  const handleDiagnose = async () => {
    setLoading(true);
    setLapseAlert(null);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          statedGoal,
          recentReflections,
          constraints: {
            timeAvailable,
            location,
            resources: ["laptop"]
          }
        })
      });
      const data = await res.json();
      setDiagnosis(data);
      setActiveTab("journey");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (stepId: string, checked: boolean) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: checked
    }));
  };

  const openReflectionDialog = (stepId: string) => {
    setActiveReflectionStepId(stepId);
    setReflectionText("");
  };

  const submitReflection = async (stepId: string) => {
    if (!reflectionText.trim()) return;
    setSubmittingReflection(true);
    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          stepId,
          reflectionText,
          statedGoal,
          recentReflections,
          constraints: {
            timeAvailable,
            location,
            resources: ["laptop"]
          }
        })
      });
      const data = await res.json();

      // Add to evidence ledger
      if (data.evidenceEntry) {
        setEvidence((prev) => ({
          ...prev,
          [stepId]: data.evidenceEntry
        }));
      }

      // Check for lapse re-diagnosis (Tier 2)
      if (data.analysis?.is_lapse && data.reDiagnosis) {
        setDiagnosis(data.reDiagnosis);
        setLapseAlert({
          reasoning: data.analysis.reasoning
        });
      }

      // Close input
      setActiveReflectionStepId(null);
      setReflectionText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReflection(false);
    }
  };

  // Check if a step is locked based on previous requires_output steps
  const isStepLocked = (step: ExperienceStep, index: number, journey: ExperienceStep[]) => {
    if (index === 0) return false;
    // Look at all previous steps. If any requires_output is true AND has no evidence submitted, then locked.
    for (let i = 0; i < index; i++) {
      const prevStep = journey[i];
      if (prevStep.requires_output && !evidence[prevStep.id]) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="w-[400px] h-[700px] bg-secondaryBg text-primaryText flex flex-col justify-between overflow-hidden border border-white/10 relative font-sans">
      
      {/* 1. Header (User Toggle + Tabs) */}
      <header className="bg-surface border-b border-white/5 p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-widest text-mutedText font-bold">THRESHOLD</span>
          
          {/* User selector */}
          <div className="flex gap-1 border border-white/10 p-0.5 rounded-[4px] bg-background">
            <button
              onClick={() => handleUserChange("aarav")}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-[3px] transition-normal ${
                currentUser.id === "aarav" ? "bg-primaryAccent text-secondaryBg" : "text-secondaryText hover:text-primaryText"
              }`}
            >
              AARAV
            </button>
            <button
              onClick={() => handleUserChange("meera")}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-[3px] transition-normal ${
                currentUser.id === "meera" ? "bg-primaryAccent text-secondaryBg" : "text-secondaryText hover:text-primaryText"
              }`}
            >
              MEERA
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <nav className="flex justify-between border-t border-white/5 pt-2">
          <button
            onClick={() => setActiveTab("diagnose")}
            className={`text-xs uppercase tracking-wider font-semibold py-1 border-b-2 transition-normal ${
              activeTab === "diagnose"
                ? "border-primaryAccent text-primaryText"
                : "border-transparent text-mutedText hover:text-secondaryText"
            }`}
          >
            Diagnosis
          </button>
          <button
            onClick={() => {
              if (diagnosis) setActiveTab("journey");
            }}
            disabled={!diagnosis}
            className={`text-xs uppercase tracking-wider font-semibold py-1 border-b-2 transition-normal ${
              !diagnosis ? "opacity-30 cursor-not-allowed" : ""
            } ${
              activeTab === "journey"
                ? "border-primaryAccent text-primaryText"
                : "border-transparent text-mutedText hover:text-secondaryText"
            }`}
          >
            Journey
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`text-xs uppercase tracking-wider font-semibold py-1 border-b-2 transition-normal ${
              activeTab === "timeline"
                ? "border-primaryAccent text-primaryText"
                : "border-transparent text-mutedText hover:text-secondaryText"
            }`}
          >
            Timeline
          </button>
        </nav>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 no-scrollbar">
        
        {/* TABS 1: DIAGNOSIS (Or inputs to run diagnosis) */}
        {activeTab === "diagnose" && (
          <div className="flex flex-col gap-5 fade-in-up">
            
            {/* Conversation inputs */}
            <div className="bg-surface p-4 border border-white/5 flex flex-col gap-4">
              <label className="text-[10px] uppercase tracking-wider text-mutedText font-bold">Stated Goal</label>
              <textarea
                value={statedGoal}
                onChange={(e) => setStatedGoal(e.target.value)}
                className="w-full bg-background border border-white/10 p-3 text-xs text-primaryText rounded-[4px] focus-ring resize-none h-16 font-sans leading-relaxed"
                placeholder="What is your current growth intention?"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-mutedText font-bold block mb-1">Time Limit</label>
                  <select
                    value={timeAvailable}
                    onChange={(e: any) => setTimeAvailable(e.target.value)}
                    className="w-full bg-background border border-white/10 p-2 text-xs text-primaryText rounded-[4px] focus-ring"
                  >
                    <option value="5min">5 Minutes</option>
                    <option value="30min">30 Minutes</option>
                    <option value="open">Open Ended</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-mutedText font-bold block mb-1">Location</label>
                  <select
                    value={location}
                    onChange={(e: any) => setLocation(e.target.value)}
                    className="w-full bg-background border border-white/10 p-2 text-xs text-primaryText rounded-[4px] focus-ring"
                  >
                    <option value="remote">Remote / Digital</option>
                    <option value="in-person">In-Person</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleDiagnose}
                disabled={loading}
                className="w-full bg-primaryAccent hover:bg-primaryHover text-secondaryBg font-bold py-3 uppercase tracking-wider text-[11px] rounded-none transition-normal flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    ANALYZING...
                  </>
                ) : (
                  <>
                    START HERE
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Results Reveal */}
            {diagnosis && (
              <div className="flex flex-col gap-4 border border-white/5 bg-surface p-4 fade-in-up">
                <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                  <span className="text-[10px] uppercase tracking-wider text-mutedText font-bold">Growth State</span>
                  <span className="font-script text-2xl text-primaryAccent leading-none">
                    {diagnosis.quadrant}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-mutedText font-bold">Identified Gap</span>
                  <span className="text-sm font-semibold text-primaryText">{diagnosis.capability_gap}</span>
                </div>

                <div className="flex flex-col gap-2 bg-background p-3 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-mutedText font-bold">Why This?</span>
                  <p className="text-xs text-secondaryText leading-relaxed">{diagnosis.quadrant_reasoning}</p>
                  <p className="text-xs text-secondaryText leading-relaxed mt-1 italic">{diagnosis.gap_reasoning}</p>
                </div>

                {/* Why Not X list */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-mutedText font-bold">Excluded States</span>
                  <div className="flex flex-col gap-2">
                    {diagnosis.rejected_quadrants.map((item, idx) => (
                      <div key={idx} className="text-xs text-mutedText border-l-2 border-white/10 pl-3">
                        <span className="font-bold text-secondaryText block text-[10px] uppercase tracking-wider">{item.quadrant}</span>
                        {item.reason_rejected}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trace Button Trigger */}
                <button
                  onClick={() => setShowTrace(!showTrace)}
                  className="text-xs text-primaryAccent hover:underline uppercase tracking-wider font-semibold text-left pt-2 flex items-center justify-between"
                >
                  <span>{showTrace ? "Hide Audit Trace" : "Audit Agent Decisions"}</span>
                  {showTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showTrace && (
                  <div className="bg-background border border-white/10 p-3 max-h-[180px] overflow-y-auto text-[10px] font-mono text-mutedText flex flex-col gap-2 no-scrollbar">
                    {diagnosis.trace.map((item, index) => (
                      <div key={index} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className="text-primaryAccent font-bold">[{item.agent}]</span>
                        {item.tool && (
                          <div className="text-secondaryText">
                            Tool: <span className="underline">{item.tool}</span>
                          </div>
                        )}
                        {item.input && (
                          <div className="text-[9px] opacity-75">
                            Args: {JSON.stringify(item.input)}
                          </div>
                        )}
                        {item.result && (
                          <div className="text-[9px] text-primaryText">
                            Out: {JSON.stringify(item.result)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TABS 2: JOURNEY */}
        {activeTab === "journey" && diagnosis && (
          <div className="flex flex-col gap-4 fade-in-up">
            
            {/* Lapse warning box if user encountered emotional lapse */}
            {lapseAlert && (
              <div className="border border-error/20 bg-error/5 p-3 rounded-[4px] flex flex-col gap-1 fade-in-up">
                <span className="text-[10px] font-bold text-error uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  RE-CALIBRATING JOURNEY (LAPSE DETECTED)
                </span>
                <p className="text-xs text-secondaryText leading-relaxed">
                  {lapseAlert.reasoning}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[10px] uppercase tracking-wider text-mutedText font-bold">Experience Pathway</span>
              <span className="text-[10px] font-script text-primaryAccent text-lg">
                State: {diagnosis.quadrant}
              </span>
            </div>

            {/* Step list */}
            <div className="flex flex-col gap-3 relative">
              {diagnosis.journey.map((step, idx) => {
                const locked = isStepLocked(step, idx, diagnosis.journey);
                const hasEvidence = !!evidence[step.id];
                const completed = completedSteps[step.id] || hasEvidence;

                return (
                  <div
                    key={step.id}
                    className={`border p-4 transition-all duration-normal flex flex-col gap-3 bg-surface ${
                      locked
                        ? "border-white/5 opacity-30 select-none pointer-events-none"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      
                      {/* Checkbox wrapper */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          disabled={locked}
                          checked={completed}
                          onChange={(e) => handleCheckboxChange(step.id, e.target.checked)}
                          className="w-4 h-4 border-2 border-white/20 bg-background rounded-none text-primaryAccent focus-ring cursor-pointer"
                        />
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-widest text-primaryAccent font-bold">
                            {step.verb}
                          </span>
                          <span className="text-xs font-medium leading-tight text-primaryText mt-0.5">
                            {step.label}
                          </span>
                        </div>
                      </div>

                      {/* Locked icon or status badge */}
                      <div>
                        {locked ? (
                          <Lock className="w-4 h-4 text-mutedText" />
                        ) : hasEvidence ? (
                          <span className="text-[9px] bg-success/10 text-success border border-success/20 px-2 py-0.5 uppercase tracking-wider font-semibold rounded-[3px]">
                            EVIDENCE RECORDED
                          </span>
                        ) : step.requires_output ? (
                          <span className="text-[9px] bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 uppercase tracking-wider font-semibold rounded-[3px]">
                            GATED INPUT REQUIRED
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Completion separate signal ledger indicators */}
                    <div className="flex gap-4 border-t border-white/5 pt-2 text-[10px] text-mutedText">
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${completed ? "bg-success" : "bg-white/20"}`} />
                        COMPLETED: {completed ? "YES" : "NO"}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${hasEvidence ? "bg-success" : "bg-white/20"}`} />
                        PROOF OF GROWTH: {hasEvidence ? "SUBMITTED" : "PENDING"}
                      </span>
                    </div>

                    {/* Reflection input section */}
                    {!locked && !hasEvidence && (
                      <div className="mt-2">
                        {activeReflectionStepId === step.id ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={reflectionText}
                              onChange={(e) => setReflectionText(e.target.value)}
                              className="w-full bg-background border border-white/10 p-2 text-xs text-primaryText focus-ring rounded-[4px] resize-none h-14"
                              placeholder="Write a reflection. Note: Words like 'fail', 'rejection', or 'give up' simulate emotional drift..."
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setActiveReflectionStepId(null)}
                                className="px-3 py-1 bg-surface border border-white/10 text-[10px] uppercase font-bold tracking-wider hover:bg-background transition-normal"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => submitReflection(step.id)}
                                disabled={submittingReflection}
                                className="px-3 py-1 bg-primaryAccent text-secondaryBg text-[10px] uppercase font-bold tracking-wider hover:bg-primaryHover transition-normal flex items-center gap-1"
                              >
                                {submittingReflection ? <Loader className="w-3 h-3 animate-spin" /> : null}
                                SUBMIT PROOF
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => openReflectionDialog(step.id)}
                            className="w-full py-1.5 bg-background border border-white/10 hover:border-white/25 text-[10px] font-bold uppercase tracking-wider text-secondaryText hover:text-primaryText transition-normal"
                          >
                            RECORD PROOF
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TABS 3: TIMELINE (Longitudinal Snapshot) */}
        {activeTab === "timeline" && (
          <div className="flex flex-col gap-4 fade-in-up">
            <div className="border-b border-white/5 pb-2">
              <span className="text-[10px] uppercase tracking-wider text-mutedText font-bold">Identity Timeline</span>
            </div>

            <div className="relative pl-6 border-l border-white/10 flex flex-col gap-6 py-2 ml-3">
              {currentUser.timeline.map((entry) => (
                <div key={entry.id} className="relative fade-in-up">
                  {/* Timeline point */}
                  <div className="absolute -left-[30px] top-1.5 bg-secondaryBg border-2 border-primaryAccent w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-primaryAccent rounded-full" />
                  </div>

                  <div className="bg-surface p-4 border border-white/5">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[9px] uppercase tracking-widest text-primaryAccent font-bold">
                        {entry.month}
                      </span>
                      <span className="text-[10px] font-semibold text-primaryText">
                        {entry.label}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-primaryText mb-1 flex justify-between items-center">
                      <span>Gap: {entry.capability_gap}</span>
                      <span className="font-script text-base text-primaryAccent/80">State: {entry.quadrant}</span>
                    </div>

                    <p className="text-xs text-secondaryText leading-relaxed">
                      {entry.reasoning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="bg-surface border-t border-white/5 p-3 text-center">
        <span className="text-[9px] uppercase tracking-widest text-mutedText">
          DIAGNOSIS BEFORE CURATION • ITINERARY OVER FEED
        </span>
      </footer>
    </div>
  );
}
