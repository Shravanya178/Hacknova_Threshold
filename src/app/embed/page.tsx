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
import IdentityConversation from "@/components/IdentityConversation";
import UserToggle from "@/components/UserToggle";
import DiagnosisReveal from "@/components/DiagnosisReveal";
import JourneyScreen from "@/components/JourneyScreen";

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

  const handleStepCompleteToggle = (stepId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
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
        // Auto-complete step upon filing evidence
        setCompletedSteps((prev) => ({
          ...prev,
          [stepId]: true
        }));
      }

      // Check for lapse re-diagnosis
      if (data.analysis?.is_lapse && data.reDiagnosis) {
        setDiagnosis(data.reDiagnosis);
        setLapseAlert({
          reasoning: data.analysis.reasoning
        });
        // Clear completed/evidence on re-diagnosis
        setEvidence({});
        setCompletedSteps({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingStepId(null);
    }
  };

  return (
    <div className="w-[400px] h-[700px] bg-secondaryBg text-primaryText flex flex-col justify-between overflow-hidden border border-white/10 relative font-sans">
      
      {/* 1. Header (User Toggle + Tabs) */}
      <header className="bg-surface border-b border-white/5 p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-widest text-mutedText font-bold">THRESHOLD</span>
          
          {/* User selector */}
          <UserToggle activeUserId={currentUser.id} onUserChange={handleUserChange} />
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
                  setActiveTab("journey");
                }}
                onDiagnoseError={(err) => {
                  setLoading(false);
                  console.error("Diagnosis failed:", err);
                }}
              />
            </div>

            {/* Results Reveal */}
            {diagnosis && (
              <DiagnosisReveal diagnosis={diagnosis} />
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

            <JourneyScreen
              steps={diagnosis.journey}
              completedSteps={completedSteps}
              evidence={evidence}
              onStepCompleteToggle={handleStepCompleteToggle}
              onReflectionSubmit={handleReflectionSubmit}
              submittingStepId={submittingStepId}
            />
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
