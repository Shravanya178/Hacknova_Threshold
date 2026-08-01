"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { Diagnosis } from "@/types/threshold";

interface DiagnosisRevealProps {
  diagnosis: Diagnosis;
}

export default function DiagnosisReveal({ diagnosis }: DiagnosisRevealProps) {
  const [showWhyThis, setShowWhyThis] = useState<boolean>(true);
  const [showWhyNotX, setShowWhyNotX] = useState<boolean>(false);
  const [showTrace, setShowTrace] = useState<boolean>(false);

  return (
    <div className="diagnosis-reveal flex flex-col gap-5 border border-border bg-surface p-6 rounded-card shadow-subtle fade-in-up">
      
      {/* 1. Step-by-Step Agent Trace Log */}
      <div className="border border-border p-4 bg-secondaryBg rounded-card">
        <button
          onClick={() => setShowTrace(!showTrace)}
          className="w-full text-[10px] uppercase tracking-widest text-primaryText font-bold flex justify-between items-center"
        >
          <span className="flex items-center gap-1.5 font-mono">
            <Terminal className="w-3.5 h-3.5 text-champagneGold" />
            AGENT EXECUTION TRACE
          </span>
          {showTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showTrace && (
          <div className="mt-3 flex flex-col gap-3 max-h-[220px] overflow-y-auto no-scrollbar font-mono text-[10px] text-secondaryText border-t border-border pt-3">
            {diagnosis.trace.map((item, idx) => (
              <div key={idx} className="border-b border-border pb-2 last:border-0 last:pb-0">
                <span className="text-primaryText font-bold block mb-0.5">
                  [{item.agent}]
                </span>
                {item.tool && (
                  <div className="text-secondaryText text-[9px] mb-0.5">
                    Action: <span className="underline">{item.tool}</span>
                  </div>
                )}
                {item.input && (
                  <div className="text-[8px] opacity-75 mb-0.5 break-all">
                    Input: {JSON.stringify(item.input)}
                  </div>
                )}
                {item.result && (
                  <div className="text-[8px] text-primaryText break-all font-sans bg-background/50 p-1.5 rounded-[4px] mt-0.5">
                    Output: {JSON.stringify(item.result)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Quadrant Reveal */}
      <div className="flex justify-between items-baseline border-b border-border pb-3">
        <span className="text-[11px] uppercase tracking-wider text-secondaryText font-bold">Growth State</span>
        <span className="font-script text-3xl text-champagneGold leading-none">
          {diagnosis.quadrant}
        </span>
      </div>

      {/* 3. Capability Gap */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-wider text-secondaryText font-bold">Capability Gap</span>
        <span className="text-base font-semibold text-primaryText leading-relaxed">{diagnosis.capability_gap}</span>
      </div>

      {/* 4. Why This Expandable */}
      <div className="border border-border rounded-card bg-secondaryBg">
        <button
          onClick={() => setShowWhyThis(!showWhyThis)}
          className="w-full px-4 py-3 text-[10px] uppercase tracking-wider text-primaryText font-bold flex justify-between items-center"
        >
          <span>Why This?</span>
          {showWhyThis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showWhyThis && (
          <div className="px-4 pb-4 border-t border-border pt-3 flex flex-col gap-2">
            <p className="text-xs text-secondaryText leading-relaxed">
              <strong className="text-primaryText">State Reasoning:</strong> {diagnosis.quadrant_reasoning}
            </p>
            <p className="text-xs text-secondaryText leading-relaxed italic mt-1">
              <strong className="text-primaryText">Need Analysis:</strong> {diagnosis.gap_reasoning}
            </p>
          </div>
        )}
      </div>

      {/* 5. Why Not X Expandable */}
      <div className="border border-border rounded-card bg-secondaryBg">
        <button
          onClick={() => setShowWhyNotX(!showWhyNotX)}
          className="w-full px-4 py-3 text-[10px] uppercase tracking-wider text-primaryText font-bold flex justify-between items-center"
        >
          <span>Why Not Alternatives?</span>
          {showWhyNotX ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showWhyNotX && (
          <div className="px-4 pb-4 border-t border-border pt-3 flex flex-col gap-3">
            {diagnosis.rejected_quadrants.map((item, idx) => (
              <div key={idx} className="text-xs text-secondaryText border-l-2 border-champagneGold pl-3">
                <span className="font-bold text-primaryText block text-[10px] uppercase tracking-wider mb-0.5">
                  {item.quadrant}
                </span>
                {item.reason_rejected}
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
