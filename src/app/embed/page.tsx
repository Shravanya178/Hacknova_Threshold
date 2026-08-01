"use client";

import React, { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { User, Diagnosis, ExperienceStep, EvidenceEntry } from "@/types/threshold";
import usersDataRaw from "../../data/users.json";
import IdentityConversation from "@/components/IdentityConversation";
import UserToggle from "@/components/UserToggle";
import DiagnosisReveal from "@/components/DiagnosisReveal";
import JourneyScreen from "@/components/JourneyScreen";
import PlanAdjustmentReveal from "@/components/PlanAdjustmentReveal";
import JudgeModePanel, { SeededAdjustment } from "@/components/JudgeModePanel";

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

  // Evidence Ledger state (completed vs evidenced)
  const [evidence, setEvidence] = useState<Record<string, EvidenceEntry>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Reflection Input state
  const [submittingStepId, setSubmittingStepId] = useState<string | null>(null);

  // Live lapse alert (fires when the judge triggers a fresh loop-back at runtime)
  const [lapseAlert, setLapseAlert] = useState<{ reasoning: string } | null>(null);

  // DB user row (for timeline rendering)
  const [dbUser, setDbUser] = useState<User | null>(null);

  // Pre-seeded lapse adjustment from Supabase (written by seed-aarav-lapse-scenario.ts).
  // When present, JudgeModePanel and PlanAdjustmentReveal read this stored data directly —
  // no live trigger needed for the demo to show the loop-back result.
  const [seededAdjustment, setSeededAdjustment] = useState<SeededAdjustment | null>(null);
  const [liveAdjustment, setLiveAdjustment] = useState<SeededAdjustment | null>(null);

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

      // If the seed script has already run for this user, expose the stored adjustment.
      // seededAdjustment takes precedence over the old timeline-string-scan heuristic.
      if (data.seededAdjustment) {
        setSeededAdjustment(data.seededAdjustment);
        // Also set a lapseAlert so the journey tab shows the lapse banner — but only
        // if there isn't already a live lapse active (don't overwrite a fresh run).
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
          // Refresh profile so seeded adjustment state stays consistent
          fetchUserProfile("aarav");
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
    setActiveTab("diagnose");
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingStepId(null);
    }
  };

  // Whether a lapse adjustment (seeded or live) is in any way active
  const isAarav = currentUser.id === "aarav";
  // isActive on JudgeModePanel means a live loop-back just ran this session
  const liveLoopBackActive = isAarav && !!lapseAlert && !!liveAdjustment;

  return (
    <div className="w-[400px] h-[700px] bg-background text-primaryText flex flex-col justify-between overflow-hidden border border-border relative font-sans">

      {/* 1. Header */}
      <header className="bg-background border-b border-border p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-widest text-secondaryText font-bold font-mono">
            THRESHOLD
          </span>
          <UserToggle activeUserId={currentUser.id} onUserChange={handleUserChange} />
        </div>

        <nav className="flex justify-between border-t border-border pt-2">
          <button
            onClick={() => setActiveTab("diagnose")}
            className={`text-xs uppercase tracking-wider font-semibold py-1 border-b-2 transition-normal ${
              activeTab === "diagnose"
                ? "border-champagneGold text-primaryText"
                : "border-transparent text-secondaryText hover:text-primaryText"
            }`}
          >
            Diagnosis
          </button>
          <button
            onClick={() => { if (diagnosis) setActiveTab("journey"); }}
            disabled={!diagnosis}
            className={`text-xs uppercase tracking-wider font-semibold py-1 border-b-2 transition-normal ${
              !diagnosis ? "opacity-30 cursor-not-allowed" : ""
            } ${
              activeTab === "journey"
                ? "border-champagneGold text-primaryText"
                : "border-transparent text-secondaryText hover:text-primaryText"
            }`}
          >
            Journey
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`text-xs uppercase tracking-wider font-semibold py-1 border-b-2 transition-normal ${
              activeTab === "timeline"
                ? "border-champagneGold text-primaryText"
                : "border-transparent text-secondaryText hover:text-primaryText"
            }`}
          >
            Timeline
          </button>
        </nav>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 no-scrollbar">

        {/* TAB 1: DIAGNOSIS */}
        {activeTab === "diagnose" && (
          <div className="flex flex-col gap-5 fade-in-up">
            <div className="bg-secondaryBg p-5 border border-border flex flex-col gap-4 rounded-card shadow-subtle">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-secondaryText font-bold block mb-1">
                    Time Limit
                  </label>
                  <select
                    value={timeAvailable}
                    onChange={(e: any) => setTimeAvailable(e.target.value)}
                    className="w-full bg-background border border-border p-2 text-xs text-primaryText rounded-input focus-ring font-sans"
                  >
                    <option value="5min">5 Minutes</option>
                    <option value="30min">30 Minutes</option>
                    <option value="open">Open Ended</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-secondaryText font-bold block mb-1">
                    Location
                  </label>
                  <select
                    value={location}
                    onChange={(e: any) => setLocation(e.target.value)}
                    className="w-full bg-background border border-border p-2 text-xs text-primaryText rounded-input focus-ring font-sans"
                  >
                    <option value="remote">Remote / Digital</option>
                    <option value="in-person">In-Person</option>
                  </select>
                </div>
              </div>

              <IdentityConversation
                userId={currentUser.id}
                recentReflections={recentReflections}
                timeAvailable={timeAvailable}
                location={location}
                onDiagnoseStart={() => { setLoading(true); setLapseAlert(null); }}
                onDiagnoseComplete={(data) => {
                  setDiagnosis(data);
                  setLoading(false);
                  setActiveTab("journey");
                }}
                onDiagnoseError={(err) => { setLoading(false); console.error("Diagnosis failed:", err); }}
              />
            </div>

            {diagnosis && <DiagnosisReveal diagnosis={diagnosis} />}
          </div>
        )}

        {/* TAB 2: JOURNEY */}
        {activeTab === "journey" && diagnosis && (
          <div className="flex flex-col gap-4 fade-in-up">

            {/* Lapse banner — shown for both live and seeded lapses */}
            {lapseAlert && (
              <div className="border border-error/20 bg-error/5 p-4 rounded-card flex flex-col gap-1 fade-in-up">
                <span className="text-[10px] font-bold text-error uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Activity className="w-3.5 h-3.5" />
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

            {/* PlanAdjustmentReveal — seeded variant (no live lapse triggered this session) */}
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

            {/* Judge Mode Panel — only shown for Aarav */}
            {isAarav && (
              <JudgeModePanel
                onTriggerLapse={triggerAaravLapse}
                isLoading={loading}
                isActive={liveLoopBackActive}
                seededAdjustment={liveLoopBackActive ? null : seededAdjustment}
              />
            )}
          </div>
        )}

        {/* TAB 3: TIMELINE */}
        {activeTab === "timeline" && (
          <div className="flex flex-col gap-4 fade-in-up">
            <div className="border-b border-border pb-3">
              <span className="text-[11px] uppercase tracking-wider text-secondaryText font-bold">
                Identity Timeline
              </span>
            </div>

            <div className="relative pl-6 border-l border-border flex flex-col gap-6 py-2 ml-3">
              {(dbUser?.timeline || currentUser.timeline || []).map((entry) => (
                <div key={entry.id} className="relative fade-in-up">
                  <div className="absolute -left-[30px] top-2 bg-background border-2 border-primaryText w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-primaryText rounded-full" />
                  </div>

                  <div className="bg-secondaryBg p-4 border border-border rounded-card shadow-subtle">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[9px] uppercase tracking-widest text-primaryText font-bold font-mono">
                        {entry.month}
                      </span>
                      <span className="text-[10px] font-semibold text-primaryText">
                        {entry.label}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-primaryText mb-1 flex justify-between items-center">
                      <span>Gap: {entry.capability_gap}</span>
                      <span className="font-script text-base text-primaryText/80">
                        State: {entry.quadrant}
                      </span>
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
      <footer className="bg-background border-t border-border p-3.5 text-center">
        <span className="text-[9px] uppercase tracking-widest text-secondaryText font-medium font-mono">
          DIAGNOSIS BEFORE CURATION • ITINERARY OVER FEED
        </span>
      </footer>
    </div>
  );
}
