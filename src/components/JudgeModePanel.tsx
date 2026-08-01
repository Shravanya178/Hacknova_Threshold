"use client";

import React, { useState } from "react";
import PlanAdjustmentReveal from "./PlanAdjustmentReveal";

export interface SeededAdjustment {
  beforeQuadrant: string;
  afterQuadrant: string;
  beforeGap: string;
  afterGap: string;
  calibrationReasoning: string;
}

interface JudgeModePanelProps {
  onTriggerLapse: () => void;
  isLoading: boolean;
  isActive: boolean;
  seededAdjustment?: SeededAdjustment | null;
}

export default function JudgeModePanel({
  onTriggerLapse,
  isLoading,
  isActive,
  seededAdjustment = null,
}: JudgeModePanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const hasSeededAdjustment = !!seededAdjustment;

  return (
    <div className="border border-border bg-secondaryBg rounded-card overflow-hidden shadow-subtle w-full">
      
      {/* Clickable toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 px-5 text-xs font-black uppercase tracking-widest text-primaryText hover:bg-black/5 transition-normal font-mono"
      >
        <span>Evaluation & Lapse Simulation Desk</span>
        <span className="text-xs font-bold text-champagneGold uppercase tracking-wider font-mono">
          {isOpen ? "Collapse [-]" : "Expand [+]"}
        </span>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-border flex flex-col gap-4 bg-background/50 text-left">
          
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest text-primaryText font-bold font-mono">
              Simulator Status
            </span>
            <span
              className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full font-mono ${
                hasSeededAdjustment
                  ? "bg-champagneGold/10 text-champagneGold border border-champagneGold/30"
                  : "bg-green-500/10 text-green-500"
              }`}
            >
              {hasSeededAdjustment ? "Adjustment Seeded" : "Ready"}
            </span>
          </div>

          {/* Seeded Adjustment details */}
          {hasSeededAdjustment && !isActive && (
            <div className="flex flex-col gap-2.5 pt-1">
              <p className="text-xs text-secondaryText leading-relaxed font-mono uppercase tracking-wide">
                Pre-seeded adjustment active — read from Supabase:
              </p>
              <PlanAdjustmentReveal
                reasoning={seededAdjustment!.calibrationReasoning}
                beforeQuadrant={seededAdjustment!.beforeQuadrant}
                afterQuadrant={seededAdjustment!.afterQuadrant}
                beforeGap={seededAdjustment!.beforeGap}
                afterGap={seededAdjustment!.afterGap}
                isSeeded={true}
              />
            </div>
          )}

          {isActive && !hasSeededAdjustment && (
            <p className="text-xs text-secondaryText leading-relaxed">
              Live loop-back calibration is now active. Scroll up to see the updated journey and plan adjustment panel.
            </p>
          )}

          {!hasSeededAdjustment && !isActive && (
            <p className="text-xs text-secondaryText leading-relaxed">
              Simulate a sudden growth lapse (discouragement/avoidance) during step completion to trigger the multi-agent loop-back self-correction in real time.
            </p>
          )}

          {/* Trigger button */}
          <button
            onClick={onTriggerLapse}
            disabled={isLoading || isActive}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-card text-xs font-bold uppercase tracking-wider transition-all ${
              isActive
                ? "bg-champagneGold/20 text-champagneGold border border-champagneGold/30 cursor-not-allowed"
                : "bg-primaryText text-background hover:bg-primaryText/90 active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Recalibrating Plan...
              </span>
            ) : isActive ? (
              "Lapse Adjustment Active"
            ) : hasSeededAdjustment ? (
              "Re-Trigger Live Loop-Back"
            ) : (
              "Trigger Aarav Growth Lapse Loop-Back"
            )}
          </button>

        </div>
      )}

    </div>
  );
}
