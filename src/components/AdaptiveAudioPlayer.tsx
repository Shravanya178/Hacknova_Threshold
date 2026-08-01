"use client";

import React, { useRef, useState, useEffect } from "react";
import { MediaPlan } from "@/types/threshold";
import { Play, Pause, AlertCircle, Headphones, Volume2 } from "lucide-react";

interface SubPlayerProps {
  url: string;
  title: string;
  mediaPlan: MediaPlan;
  onReflectionSubmit: (text: string) => Promise<void>;
  submitting?: boolean;
}

export default function AdaptiveAudioPlayer({
  url,
  title,
  mediaPlan,
  onReflectionSubmit,
  submitting = false
}: SubPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<{ id: string; prompt: string } | null>(null);
  const [responseText, setResponseText] = useState("");
  const [promptResolved, setPromptResolved] = useState<Record<string, boolean>>({});

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const time = Math.floor(audio.currentTime);
      setCurrentTime(time);
      evaluatePlayPlan(time);
    };

    const handleLoadedMetadata = () => {
      setDuration(Math.floor(audio.duration));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [mediaPlan, promptResolved, activePrompt]);

  const evaluatePlayPlan = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    // 1. Evaluate skips
    const currentSkip = mediaPlan.segments.find(
      (s) => s.type === "skip" && time >= s.start && time < s.end
    );
    if (currentSkip) {
      console.log(`[AudioPlayer] Skipping segment: ${currentSkip.start} - ${currentSkip.end}`);
      audio.currentTime = currentSkip.end;
      return;
    }

    // 2. Evaluate notes
    const matchedNote = mediaPlan.notes.find(
      (n) => time >= n.trigger_point && time < n.trigger_point + 8
    );
    setActiveNote(matchedNote ? matchedNote.note : null);

    // 3. Evaluate prompts
    const matchedPrompt = mediaPlan.prompts.find(
      (p) => time >= p.trigger_point && !promptResolved[p.id]
    );
    if (matchedPrompt && (!activePrompt || activePrompt.id !== matchedPrompt.id)) {
      pauseAudio();
      setActivePrompt({ id: matchedPrompt.id, prompt: matchedPrompt.prompt });
    }
  };

  const playAudio = () => {
    audioRef.current?.play();
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim() || !activePrompt) return;

    await onReflectionSubmit(responseText);
    setPromptResolved((prev) => ({ ...prev, [activePrompt.id]: true }));
    setActivePrompt(null);
    setResponseText("");
    playAudio();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="audio-player-container flex flex-col gap-4 border border-border bg-secondaryBg p-5 rounded-card shadow-subtle relative">
      <audio ref={audioRef} src={url} />

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-champagne text-champagneGold rounded-card flex items-center justify-center flex-shrink-0">
          <Headphones className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] uppercase tracking-widest text-secondaryText font-mono font-bold block mb-0.5">
            AUDIO EXPERIENCE
          </span>
          <h4 className="text-xs font-bold text-primaryText truncate uppercase tracking-wide">
            {title}
          </h4>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={isPlaying ? pauseAudio : playAudio}
          disabled={!!activePrompt}
          className="bg-primaryAccent hover:bg-primaryHover text-background w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-normal disabled:opacity-40"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-background" /> : <Play className="w-4 h-4 fill-background translate-x-[1px]" />}
        </button>

        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-1 bg-border rounded-full relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-champagneGold"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-secondaryText font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Prompt Lock Box */}
      {activePrompt && (
        <div className="border border-champagneGold/20 bg-champagne/40 p-4 rounded-card flex flex-col gap-3 fade-in-up">
          <div className="flex items-center gap-2 text-[10px] text-champagneGold uppercase tracking-widest font-mono font-bold">
            <AlertCircle className="w-4 h-4" />
            REFLECTION GATE ACTIVE
          </div>
          <p className="text-xs text-primaryText font-medium leading-relaxed">
            {activePrompt.prompt}
          </p>
          <form onSubmit={handlePromptSubmit} className="flex flex-col gap-3">
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              disabled={submitting}
              rows={3}
              className="w-full bg-background border border-border p-3 text-xs text-primaryText rounded-input focus-ring font-sans resize-none"
              placeholder="Submit reflection to resume playback..."
            />
            <button
              type="submit"
              disabled={submitting || !responseText.trim()}
              className="self-end bg-champagneGold hover:bg-champagneHover text-background font-bold py-2 px-5 rounded-btn text-[10px] uppercase tracking-wider disabled:opacity-50 transition-normal"
            >
              {submitting ? "Saving..." : "Submit Proof"}
            </button>
          </form>
        </div>
      )}

      {/* Sidebar captions/notes */}
      {activeNote && !activePrompt && (
        <div className="bg-champagne/70 border border-champagneDark/30 p-3 rounded-card text-xs text-primaryText leading-relaxed flex items-start gap-2.5 fade-in-up">
          <Volume2 className="w-4 h-4 text-champagneGold flex-shrink-0 mt-0.5" />
          <p>{activeNote}</p>
        </div>
      )}
    </div>
  );
}
