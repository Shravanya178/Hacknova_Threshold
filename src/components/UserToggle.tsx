"use client";

import React from "react";

interface UserToggleProps {
  activeUserId: string;
  onUserChange: (userId: string) => void;
}

export default function UserToggle({ activeUserId, onUserChange }: UserToggleProps) {
  return (
    <div className="user-toggle flex gap-1 border border-white/10 p-0.5 rounded-[4px] bg-background">
      <button
        onClick={() => onUserChange("aarav")}
        className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-[3px] transition-normal ${
          activeUserId === "aarav"
            ? "bg-primaryAccent text-secondaryBg"
            : "text-secondaryText hover:text-primaryText"
        }`}
      >
        AARAV
      </button>
      <button
        onClick={() => onUserChange("meera")}
        className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-[3px] transition-normal ${
          activeUserId === "meera"
            ? "bg-primaryAccent text-secondaryBg"
            : "text-secondaryText hover:text-primaryText"
        }`}
      >
        MEERA
      </button>
    </div>
  );
}
