"use client";

import React, { useState } from "react";

interface UserToggleProps {
  activeUserId: string;
  onUserChange: (userId: string) => void;
}

export default function UserToggle({ activeUserId, onUserChange }: UserToggleProps) {
  const isPredefined = activeUserId === "aarav" || activeUserId === "meera";
  const [isCustom, setIsCustom] = useState<boolean>(!isPredefined);
  const [customName, setCustomName] = useState<string>(!isPredefined ? activeUserId : "");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim()) {
      onUserChange(customName.toLowerCase().trim());
    }
  };

  return (
    <div className="user-toggle flex items-center gap-2 flex-wrap">
      <div className="flex gap-1 border border-border p-0.5 rounded-full bg-secondaryBg">
        <button
          onClick={() => {
            setIsCustom(false);
            onUserChange("aarav");
          }}
          className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-normal ${
            !isCustom && activeUserId === "aarav"
              ? "bg-champagneGold text-background shadow-subtle"
              : "text-secondaryText hover:text-primaryText"
          }`}
        >
          AARAV
        </button>
        <button
          onClick={() => {
            setIsCustom(false);
            onUserChange("meera");
          }}
          className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-normal ${
            !isCustom && activeUserId === "meera"
              ? "bg-champagneGold text-background shadow-subtle"
              : "text-secondaryText hover:text-primaryText"
          }`}
        >
          MEERA
        </button>
        <button
          onClick={() => {
            setIsCustom(true);
            if (customName.trim()) {
              onUserChange(customName.toLowerCase().trim());
            }
          }}
          className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-normal ${
            isCustom
              ? "bg-champagneGold text-background shadow-subtle"
              : "text-secondaryText hover:text-primaryText"
          }`}
        >
          CUSTOM
        </button>
      </div>

      {isCustom && (
        <form onSubmit={handleCustomSubmit} className="flex gap-1.5 items-center">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="User ID (e.g. siddharth)..."
            className="bg-background border border-border p-1.5 px-3 text-xs text-primaryText rounded-input focus-ring w-40 font-sans"
          />
          <button
            type="submit"
            className="bg-champagneGold hover:bg-champagneHover text-background text-[10px] font-bold px-3 py-1.5 rounded-btn uppercase tracking-wider transition-normal"
          >
            Load
          </button>
        </form>
      )}
    </div>
  );
}
