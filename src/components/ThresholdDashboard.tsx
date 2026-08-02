"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { User, Diagnosis, ExperienceStep, EvidenceEntry } from "@/types/threshold";
import usersDataRaw from "../data/users.json";
import IdentityConversation from "./IdentityConversation";
import UserToggle from "./UserToggle";
import DiagnosisReveal from "./DiagnosisReveal";
import JourneyScreen from "./JourneyScreen";
import PlanAdjustmentReveal from "./PlanAdjustmentReveal";
import JudgeModePanel, { SeededAdjustment } from "./JudgeModePanel";

const usersData = usersDataRaw as User[];

export default function ThresholdDashboard() {
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

  // Slide/Carousel Deck State
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Evidence Ledger state (completed vs evidenced)
  const [evidence, setEvidence] = useState<Record<string, EvidenceEntry>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Reflection Input state
  const [submittingStepId, setSubmittingStepId] = useState<string | null>(null);

  // Live lapse alert
  const [lapseAlert, setLapseAlert] = useState<{ reasoning: string } | null>(null);

  // DB user row
  const [dbUser, setDbUser] = useState<User | null>(null);

  // Pre-seeded lapse adjustment from Supabase
  const [seededAdjustment, setSeededAdjustment] = useState<SeededAdjustment | null>(null);

  // Live re-diagnosis adjustment from current session
  const [liveAdjustment, setLiveAdjustment] = useState<SeededAdjustment | null>(null);

  // Detect Mobile Viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/user?id=${userId}`);
      if (!res.ok) return;

      const data = await res.json();

      if (data.user) {
        setDbUser(data.user);
        setStatedGoal(data.user.stated_goal || "");
        setRecentReflections(data.user.recent_reflections || []);
      }

      if (data.latestJourney) {
        setDiagnosis(data.latestJourney);
      }

      if (data.seededAdjustment) {
        setSeededAdjustment(data.seededAdjustment);
        setLapseAlert((prev) =>
          prev
            ? prev
            : { reasoning: data.seededAdjustment.calibrationReasoning }
        );
      } else {
        setSeededAdjustment(null);
      }
    } catch (err) {
      console.error("Failed to load user profile from DB:", err);
    }
  };

  useEffect(() => {
    fetchUserProfile(currentUser.id);
  }, [currentUser.id]);

  const triggerAaravLapse = async () => {
    setLoading(true);
    setLapseAlert(null);
    setLiveAdjustment(null);
    const beforeQ = diagnosis?.quadrant || "Commitment";
    const beforeG = diagnosis?.capability_gap || "Communication Confidence, not UI Skill";
    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "aarav",
          stepId: "step-c2",
          reflectionText:
            "I felt completely overwhelmed during the presentation mock session. I want to give up on design reviews entirely.",
          statedGoal: "I want confidence during interviews.",
          constraints: {
            timeAvailable: "open",
            location: "remote",
            resources: ["laptop"],
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reDiagnosis) {
          setDiagnosis(data.reDiagnosis);
          setLapseAlert({ reasoning: data.analysis.reasoning });
          setLiveAdjustment({
            beforeQuadrant: beforeQ,
            afterQuadrant: data.reDiagnosis.quadrant,
            beforeGap: beforeG,
            afterGap: data.reDiagnosis.capability_gap,
            calibrationReasoning: data.analysis.reasoning || data.reDiagnosis.quadrant_reasoning,
          });
          fetchUserProfile("aarav");
          // Slide to Journey page automatically to show the re-calibrated journey!
          setActiveSlide(2);
        }
      }
    } catch (err) {
      console.error("Failed to trigger live Aarav lapse:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sync user data on toggle
  const handleUserChange = (userId: string) => {
    const user = usersData.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setStatedGoal(user.stated_goal);
      setRecentReflections(user.recent_reflections);
    } else {
      const customUser: User = {
        id: userId,
        name: userId.charAt(0).toUpperCase() + userId.slice(1),
        stated_goal: "",
        recent_reflections: [],
        timeline: [],
      };
      setCurrentUser(customUser);
      setStatedGoal("");
      setRecentReflections([]);
    }
    setDiagnosis(null);
    setEvidence({});
    setCompletedSteps({});
    setLapseAlert(null);
    setSeededAdjustment(null);
    setLiveAdjustment(null);
    setDbUser(null);
    setActiveSlide(0);
  };

  const handleStepCompleteToggle = (stepId: string) => {
    setCompletedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleReflectionSubmit = async (stepId: string, text: string) => {
    setSubmittingStepId(stepId);
    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          stepId,
          reflectionText: text,
          statedGoal,
          constraints: { timeAvailable, location, resources: ["laptop"] },
        }),
      });
      const data = await res.json();

      if (data.evidenceEntry) {
        setEvidence((prev) => ({ ...prev, [stepId]: data.evidenceEntry }));
        setCompletedSteps((prev) => ({ ...prev, [stepId]: true }));
      }

      if (data.analysis?.is_lapse && data.reDiagnosis) {
        setDiagnosis(data.reDiagnosis);
        setLapseAlert({ reasoning: data.analysis.reasoning });
        setEvidence({});
        setCompletedSteps({});
        // Slide to Slide 2 to show lapse recalibration adjustments!
        setActiveSlide(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingStepId(null);
    }
  };

  const isAarav = currentUser.id === "aarav";
  const liveLoopBackActive = isAarav && !!lapseAlert && !!liveAdjustment;

  const handlePrevSlide = () => {
    setActiveSlide((prev) => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    const maxIdx = !!diagnosis ? 3 : 0;
    setActiveSlide((prev) => Math.min(maxIdx, prev + 1));
  };

  // 3D Deck Transforms with Blurring on background cards
  const getSlideStyle = (i: number) => {
    const diff = i - activeSlide;
    if (diff === 0) {
      return "translate-x-0 scale-100 opacity-100 z-30 pointer-events-auto shadow-[0_25px_60px_rgba(181,158,124,0.15)] border-champagneGold/60 ring-2 ring-champagneGold/5 filter blur-none";
    } else if (diff === 1) {
      return "translate-x-[35%] lg:translate-x-[45%] scale-[0.92] opacity-40 z-20 pointer-events-none rotate-2 hover:opacity-60 filter blur-[3px]";
    } else if (diff === -1) {
      return "-translate-x-[35%] lg:-translate-x-[45%] scale-[0.92] opacity-40 z-20 pointer-events-none -rotate-2 hover:opacity-60 filter blur-[3px]";
    } else if (diff === 2) {
      return "translate-x-[65%] lg:translate-x-[85%] scale-[0.84] opacity-0 z-10 pointer-events-none rotate-6 filter blur-[5px]";
    } else if (diff === -2) {
      return "-translate-x-[65%] lg:-translate-x-[85%] scale-[0.84] opacity-0 z-10 pointer-events-none -rotate-6 filter blur-[5px]";
    } else if (diff > 2) {
      return "translate-x-[95%] scale-[0.76] opacity-0 z-0 pointer-events-none filter blur-[8px]";
    } else {
      return "-translate-x-[95%] scale-[0.76] opacity-0 z-0 pointer-events-none filter blur-[8px]";
    }
  };

  return (
    <div className="w-full border border-border border-t-4 border-t-champagneGold bg-card shadow-premium rounded-card overflow-hidden text-primaryText">
      
      {/* Dashboard Top Header */}
      <div className="bg-secondaryBg border-b border-border p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-widest text-primaryText font-mono">
            Agentic Journey Intelligence System
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Diagnoses developmental states, maps capabilities, and orchestrates live adaptive check-ins.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex gap-2.5">
            <select
              value={timeAvailable}
              onChange={(e: any) => setTimeAvailable(e.target.value)}
              className="bg-background border border-border p-2 px-3.5 text-sm text-primaryText rounded-input focus-ring font-sans"
            >
              <option value="5min">5 Min limit</option>
              <option value="30min">30 Min limit</option>
              <option value="open">Open Duration</option>
            </select>
            <select
              value={location}
              onChange={(e: any) => setLocation(e.target.value)}
              className="bg-background border border-border p-2 px-3.5 text-sm text-primaryText rounded-input focus-ring font-sans"
            >
              <option value="remote">Remote / Digital</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
          <UserToggle activeUserId={currentUser.id} onUserChange={handleUserChange} />
        </div>
      </div>

      {/* Slide Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-border bg-secondaryBg/80 p-3 px-6 gap-4">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { idx: 0, label: "01. Intake Intent" },
            { idx: 1, label: "02. Identity Map" },
            { idx: 2, label: "03. Experience Pathway" },
            { idx: 3, label: "04. Historical Timeline" }
          ].map((tab) => {
            const isActive = activeSlide === tab.idx;
            const isAvailable = tab.idx === 0 || !!diagnosis;
            return (
              <button
                key={tab.idx}
                disabled={!isAvailable}
                onClick={() => setActiveSlide(tab.idx)}
                className={`px-4.5 py-2 text-xs uppercase font-mono tracking-wider font-bold rounded-full transition-all duration-300 flex-shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-primaryText text-background shadow-subtle scale-105"
                    : isAvailable
                      ? "text-secondaryText hover:text-primaryText hover:bg-background/50"
                      : "opacity-30 cursor-not-allowed text-mutedText"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Sliding Card Stack Container with side buttons */}
      <div className="overflow-hidden w-full relative min-h-[640px] flex items-center justify-center bg-gradient-to-b from-transparent to-secondaryBg/25">
        
        {/* Prev Arrow Button (Left side of stack) */}
        <button
          onClick={handlePrevSlide}
          disabled={activeSlide === 0}
          className="absolute left-3 lg:left-6 z-40 p-3.5 rounded-full border border-border bg-surface hover:bg-secondaryBg shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-primaryText" />
        </button>

        {/* Glowing aura backing */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-champagneGold/5 rounded-full blur-[80px] pointer-events-none z-0" />
        
        {/* Card 0: Diagnostics Panel */}
        <div
          onClick={() => activeSlide !== 0 && setActiveSlide(0)}
          className={`absolute w-[92%] md:w-[75%] lg:w-[50%] h-[560px] transition-all duration-500 ease-out cursor-pointer rounded-[24px] overflow-hidden ${getSlideStyle(0)}`}
        >
          <div className={`w-full h-full bg-surface border border-border p-6 flex flex-col justify-between ${activeSlide === 0 ? "pointer-events-auto" : "pointer-events-none"}`}>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="bg-champagneGold/10 border border-champagneGold/20 text-champagneGold font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                  01. Intake Intent
                </span>
                <span className="text-xs text-secondaryText font-mono font-semibold">PHASE 1</span>
              </div>
              <h3 className="text-xl font-black text-primaryText uppercase tracking-wider mt-3">
                Expose barrier under goal
              </h3>
            </div>
            
            <div className="flex-1 flex flex-col justify-center py-4 text-left">
              <div className="bg-secondaryBg/80 p-5 border border-border rounded-card shadow-subtle">
                <IdentityConversation
                  userId={currentUser.id}
                  recentReflections={recentReflections}
                  timeAvailable={timeAvailable}
                  location={location}
                  onDiagnoseStart={() => {
                    setLoading(true);
                    setLapseAlert(null);
                  }}
                  onDiagnoseComplete={(data) => {
                    setDiagnosis(data);
                    setLoading(false);
                    setActiveSlide(1); // Auto slide to diagnosis
                  }}
                  onDiagnoseError={(err) => {
                    setLoading(false);
                    console.error("Diagnosis failed:", err);
                  }}
                />
              </div>
            </div>
            
            <p className="text-xs text-secondaryText leading-relaxed pt-4 border-t border-border/40 font-serif italic text-center">
              "We don't recommend content. We compose experiences."
            </p>
          </div>
        </div>

        {/* Card 1: Diagnosis Output */}
        <div
          onClick={() => activeSlide !== 1 && setActiveSlide(1)}
          className={`absolute w-[92%] md:w-[75%] lg:w-[50%] h-[560px] transition-all duration-500 ease-out cursor-pointer rounded-[24px] overflow-hidden ${getSlideStyle(1)}`}
        >
          <div className={`w-full h-full bg-surface border border-border p-6 flex flex-col justify-between ${activeSlide === 1 ? "pointer-events-auto" : "pointer-events-none"}`}>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="bg-champagneGold/10 border border-champagneGold/20 text-champagneGold font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                  02. Identity Map
                </span>
                <span className="text-xs text-secondaryText font-mono font-semibold">PHASE 2</span>
              </div>
              <h3 className="text-xl font-black text-primaryText uppercase tracking-wider mt-3">
                Extracted state representation
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar py-3 text-left">
              {diagnosis ? (
                <DiagnosisReveal diagnosis={diagnosis} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-secondaryText bg-secondaryBg/20 border border-dashed border-border rounded-card">
                  <p className="text-sm font-bold uppercase tracking-wider text-primaryText mb-1">Diagnosis Locked</p>
                  <p className="text-xs max-w-[200px] leading-relaxed">
                    Generate a growth diagnosis from the intake card to view state maps and agent traces.
                  </p>
                </div>
              )}
            </div>
            
            <p className="text-xs text-secondaryText leading-relaxed pt-3 border-t border-border/40 font-mono text-center">
              STATE QUADRANTS · AGENTIC PATTERNS
            </p>
          </div>
        </div>

        {/* Card 2: Interactive Growth Journey */}
        <div
          onClick={() => activeSlide !== 2 && setActiveSlide(2)}
          className={`absolute w-[92%] md:w-[75%] lg:w-[50%] h-[560px] transition-all duration-500 ease-out cursor-pointer rounded-[24px] overflow-hidden ${getSlideStyle(2)}`}
        >
          <div className={`w-full h-full bg-surface border border-border p-6 flex flex-col justify-between ${activeSlide === 2 ? "pointer-events-auto" : "pointer-events-none"}`}>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="bg-champagneGold/10 border border-champagneGold/20 text-champagneGold font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                  03. Experience Pathway
                </span>
                <span className="text-xs text-secondaryText font-mono font-semibold">PHASE 3</span>
              </div>
              <h3 className="text-xl font-black text-primaryText uppercase tracking-wider mt-3">
                Sequential action pathway
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-3 text-left">
              {diagnosis ? (
                <div className="flex flex-col gap-4">
                  {/* Lapse detected banner */}
                  {lapseAlert && (
                    <div className="border border-error/20 bg-error/5 p-4.5 rounded-card flex flex-col gap-1.5 fade-in-up">
                      <span className="text-xs font-bold text-error uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Activity className="w-4 h-4" />
                        RE-CALIBRATING JOURNEY (LAPSE DETECTED)
                      </span>
                      <p className="text-xs text-secondaryText leading-relaxed">
                        {lapseAlert.reasoning}
                      </p>
                    </div>
                  )}

                  <JourneyScreen
                    steps={diagnosis.journey}
                    completedSteps={completedSteps}
                    evidence={evidence}
                    onStepCompleteToggle={handleStepCompleteToggle}
                    onReflectionSubmit={handleReflectionSubmit}
                    submittingStepId={submittingStepId}
                    userId={currentUser.id}
                    statedGoal={statedGoal}
                    timeAvailable={timeAvailable}
                    location={location}
                    quadrant={diagnosis.quadrant}
                  />

                  {/* PlanAdjustmentReveal — live variant */}
                  {isAarav && liveLoopBackActive && liveAdjustment && (
                    <PlanAdjustmentReveal
                      reasoning={liveAdjustment.calibrationReasoning}
                      beforeQuadrant={liveAdjustment.beforeQuadrant}
                      afterQuadrant={liveAdjustment.afterQuadrant}
                      beforeGap={liveAdjustment.beforeGap}
                      afterGap={liveAdjustment.afterGap}
                      isSeeded={false}
                    />
                  )}

                  {/* PlanAdjustmentReveal — seeded variant */}
                  {isAarav && seededAdjustment && !liveLoopBackActive && (
                    <PlanAdjustmentReveal
                      reasoning={seededAdjustment.calibrationReasoning}
                      beforeQuadrant={seededAdjustment.beforeQuadrant}
                      afterQuadrant={seededAdjustment.afterQuadrant}
                      beforeGap={seededAdjustment.beforeGap}
                      afterGap={seededAdjustment.afterGap}
                      isSeeded={true}
                    />
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-secondaryText bg-secondaryBg/20 border border-dashed border-border rounded-card">
                  <p className="text-sm font-bold uppercase tracking-wider text-primaryText mb-1">Itinerary Locked</p>
                  <p className="text-xs max-w-[200px] leading-relaxed">
                    Provide your growth goal to compile a tailored, gate-locked growth itinerary.
                  </p>
                </div>
              )}
            </div>
            
            <p className="text-xs text-secondaryText leading-relaxed pt-3 border-t border-border/40 font-mono text-center">
              PROOF LEDGER · ADAPTIVE CALIBRATION
            </p>
          </div>
        </div>

        {/* Card 3: Identity Timeline Snapshot */}
        <div
          onClick={() => activeSlide !== 3 && setActiveSlide(3)}
          className={`absolute w-[92%] md:w-[75%] lg:w-[50%] h-[560px] transition-all duration-500 ease-out cursor-pointer rounded-[24px] overflow-hidden ${getSlideStyle(3)}`}
        >
          <div className={`w-full h-full bg-surface border border-border p-6 flex flex-col justify-between ${activeSlide === 3 ? "pointer-events-auto" : "pointer-events-none"}`}>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="bg-champagneGold/10 border border-champagneGold/20 text-champagneGold font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                  04. Historical Timeline
                </span>
                <span className="text-xs text-secondaryText font-mono font-semibold">PHASE 4</span>
              </div>
              <h3 className="text-xl font-black text-primaryText uppercase tracking-wider mt-3">
                Longitudinal snapshot series
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar py-3 text-left">
              <div className="relative pl-4 border-l border-border flex flex-col gap-5 py-1 ml-1.5">
                {(dbUser?.timeline || currentUser.timeline || []).map((entry) => (
                  <div key={entry.id} className="relative text-xs">
                    <div className="absolute -left-[21px] top-1.5 bg-surface border border-champagneGold w-2 h-2 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-champagneGold rounded-full animate-pulse" />
                    </div>
                    <div className="bg-secondaryBg p-4 border border-border rounded-card shadow-subtle flex flex-col gap-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs uppercase tracking-widest text-primaryText font-bold font-mono">
                          {entry.month}
                        </span>
                        <span className="text-xs font-bold text-primaryText">
                          {entry.label}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-secondaryText flex flex-col gap-1 leading-snug">
                        <span>Gap: {entry.capability_gap}</span>
                        <span className="text-champagneGold font-script text-lg leading-none mt-1">
                          State: {entry.quadrant}
                        </span>
                      </div>
                      <p className="text-xs text-secondaryText leading-relaxed mt-1 border-t border-border/50 pt-2">
                        {entry.reasoning}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-xs text-secondaryText leading-relaxed pt-3 border-t border-border/40 font-mono text-center">
              LONGITUDINAL DEVELOPMENT RECORD
            </p>
          </div>
        </div>

        {/* Next Arrow Button (Right side of stack) */}
        <button
          onClick={handleNextSlide}
          disabled={activeSlide === (!!diagnosis ? 3 : 0)}
          className="absolute right-3 lg:right-6 z-40 p-3.5 rounded-full border border-border bg-surface hover:bg-secondaryBg shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-4 h-4 text-primaryText" />
        </button>

      </div>

      {/* Simulator Desk (Collapsible toggle desk drawer) */}
      <div className="p-5 bg-secondaryBg border-t border-border flex flex-col gap-3">
        <JudgeModePanel
          onTriggerLapse={triggerAaravLapse}
          isLoading={loading}
          isActive={liveLoopBackActive}
          seededAdjustment={liveLoopBackActive ? null : seededAdjustment}
        />
      </div>

    </div>
  );
}
