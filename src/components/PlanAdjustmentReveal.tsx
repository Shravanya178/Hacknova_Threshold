"use client";

import React from "react";
import { ShieldAlert, ArrowRight, Database } from "lucide-react";

interface PlanAdjustmentRevealProps {
  reasoning: string;
  beforeQuadrant?: string;
  afterQuadrant?: string;
  beforeGap?: string;
  afterGap?: string;
  /**
   * When true, the adjustment was pre-computed by the lapse seed script and is
   * being read from stored Supabase data — not from a fresh live API call.
   * The component renders an identical diff but changes the badge label so a
   * judge can distinguish a seeded scenario from a just-triggered one.
   */
  isSeeded?: boolean;
}

export default function PlanAdjustmentReveal({
  reasoning,
  beforeQuadrant = "Commitment",
  afterQuadrant = "Compassion",
  beforeGap = "Communication Confidence, not UI Skill",
  afterGap = "Self-Advocacy & Emotional Boundary Insulation",
  isSeeded = false,
}: PlanAdjustmentRevealProps) {
  return (
    <div className="border border-champagneGold bg-champagne/20 p-4.5 rounded-card flex flex-col gap-3.5 fade-in-up shadow-subtle w-full max-w-lg mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <span className="text-[10px] font-bold text-champagneGold uppercase tracking-wider flex items-center gap-1.5 font-mono">
          {isSeeded ? (
            <Database className="w-4 h-4 text-champagneGold" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-champagneGold animate-pulse" />
          )}
          {isSeeded ? "Seeded Loop-Back Calibration" : "Real-Time Loop-Back Calibration"}
        </span>
        <span
          className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
            isSeeded
              ? "bg-champagneGold/10 text-champagneGold border border-champagneGold/30"
              : "bg-champagneGold/10 text-champagneGold"
          }`}
        >
          {isSeeded ? "Pre-seeded" : "Active"}
        </span>
      </div>

      {/* ── Quadrant + Gap diff grid ── */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-wider text-secondaryText font-mono">
            State Quadrant
          </span>
          <div className="flex items-center gap-1.5 font-semibold text-primaryText">
            <span className="text-mutedText line-through font-script text-sm leading-none">{beforeQuadrant}</span>
            <ArrowRight className="w-3.5 h-3.5 text-mutedText" />
            <span className="text-champagneGold font-script text-lg leading-none font-bold">{afterQuadrant}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-wider text-secondaryText font-mono">
            Capability Gap Focus
          </span>
          <div className="flex flex-col gap-0.5 text-[11px] leading-snug">
            <span className="text-mutedText line-through">{beforeGap}</span>
            <span className="text-primaryText font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-champagneGold animate-pulse" />
              {afterGap}
            </span>
          </div>
        </div>
      </div>

      {/* ── Reasoning block ── */}
      <div className="bg-background/60 p-3 rounded-card border border-border text-xs leading-relaxed text-secondaryText">
        <div className="font-bold text-primaryText uppercase text-[9px] tracking-wider mb-1 font-mono">
          {isSeeded
            ? "Agentic Reasoning (from seeded run)"
            : "Calibration Insight (Agentic Reasoning)"}
        </div>
        {reasoning}
      </div>

      {/* ── Seeded origin note ── */}
      {isSeeded && (
        <p className="text-[9px] text-mutedText font-mono uppercase tracking-wider text-center">
          Pre-computed by real pipeline · stored in Supabase · no live trigger needed
        </p>
      )}
    </div>
  );
}
