"use client";

import React, { useEffect, useRef, useState } from "react";
import { MediaPlan, EvidenceEntry } from "@/types/threshold";
import { Play, Pause, AlertCircle, CheckCircle } from "lucide-react";

interface SubPlayerProps {
  mediaId: string;
  title: string;
  mediaPlan: MediaPlan;
  onReflectionSubmit: (text: string) => Promise<void>;
  submitting?: boolean;
}

export default function AdaptiveVideoPlayer({
  mediaId,
  title,
  mediaPlan,
  onReflectionSubmit,
  submitting = false
}: SubPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<{ id: string; prompt: string } | null>(null);
  const [responseText, setResponseText] = useState("");
  const [promptResolved, setPromptResolved] = useState<Record<string, boolean>>({});

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const timeIntervalRef = useRef<any>(null);

  // Initialize YouTube Player API
  useEffect(() => {
    // Check if YT script is already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const onPlayerReady = () => {
      // API is ready
    };

    window.onYouTubeIframeAPIReady = onPlayerReady;

    return () => {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, []);

  // Set up YT Player instance
  useEffect(() => {
    let checkYT = setInterval(() => {
      if (window.YT && window.YT.Player && iframeRef.current) {
        clearInterval(checkYT);
        playerRef.current = new window.YT.Player(iframeRef.current, {
          events: {
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                startTrackingTime();
              } else {
                setIsPlaying(false);
                stopTrackingTime();
              }
            }
          }
        });
      }
    }, 200);

    return () => clearInterval(checkYT);
  }, [mediaId]);

  const startTrackingTime = () => {
    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    timeIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = Math.floor(playerRef.current.getCurrentTime());
        setCurrentTime(time);
        evaluatePlayPlan(time);
      }
    }, 500);
  };

  const stopTrackingTime = () => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
  };

  const evaluatePlayPlan = (time: number) => {
    // 1. Evaluate skips
    const currentSkip = mediaPlan.segments.find(
      (s) => s.type === "skip" && time >= s.start && time < s.end
    );
    if (currentSkip) {
      console.log(`[VideoPlayer] Skipping segment: ${currentSkip.start} - ${currentSkip.end}`);
      playerRef.current.seekTo(currentSkip.end, true);
      return;
    }

    // 2. Evaluate notes
    const matchedNote = mediaPlan.notes.find(
      (n) => time >= n.trigger_point && time < n.trigger_point + 10
    );
    setActiveNote(matchedNote ? matchedNote.note : null);

    // 3. Evaluate prompts
    const matchedPrompt = mediaPlan.prompts.find(
      (p) => time >= p.trigger_point && !promptResolved[p.id]
    );
    if (matchedPrompt && (!activePrompt || activePrompt.id !== matchedPrompt.id)) {
      pauseVideo();
      setActivePrompt({ id: matchedPrompt.id, prompt: matchedPrompt.prompt });
    }
  };

  const playVideo = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const pauseVideo = () => {
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim() || !activePrompt) return;

    await onReflectionSubmit(responseText);
    setPromptResolved((prev) => ({ ...prev, [activePrompt.id]: true }));
    setActivePrompt(null);
    setResponseText("");
    playVideo();
  };

  return (
    <div className="video-player-container flex flex-col gap-4 border border-border bg-secondaryBg p-4 rounded-card shadow-subtle relative">
      <span className="text-[9px] uppercase tracking-widest text-secondaryText font-mono font-bold">
        VIDEO EXPERIENCE: {title}
      </span>

      <div className="relative aspect-video w-full rounded-card overflow-hidden bg-black border border-border">
        {/* YT Iframe with enablejsapi */}
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${mediaId}?enablejsapi=1&rel=0&controls=1`}
          className="w-full h-full absolute inset-0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />

        {/* Overlay reflection checkpoint prompt */}
        {activePrompt && (
          <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center p-6 text-center z-20 fade-in-up">
            <AlertCircle className="w-8 h-8 text-champagneGold mb-2 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-champagneGold font-bold font-mono">
              REFLECTION GATED LOCK
            </span>
            <p className="text-xs text-primaryText font-medium my-3 max-w-sm leading-relaxed">
              {activePrompt.prompt}
            </p>
            <form onSubmit={handlePromptSubmit} className="w-full flex flex-col gap-3">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                disabled={submitting}
                rows={3}
                className="w-full bg-secondaryBg border border-border p-3 text-xs text-primaryText rounded-input focus-ring font-sans resize-none"
                placeholder="Type your reflection to unlock progression..."
              />
              <button
                type="submit"
                disabled={submitting || !responseText.trim()}
                className="bg-champagneGold hover:bg-champagneHover text-background font-bold py-2.5 px-6 rounded-btn text-[10px] uppercase tracking-wider disabled:opacity-50 transition-normal"
              >
                {submitting ? "Submitting Proof..." : "Submit to Continue"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Floating Notes Bar */}
      {activeNote && (
        <div className="bg-champagne/70 border border-champagneDark/30 p-3 rounded-card text-xs text-primaryText leading-relaxed flex items-start gap-2.5 fade-in-up">
          <span className="text-[9px] uppercase tracking-widest text-champagneGold font-mono font-bold mt-0.5">
            NOTE:
          </span>
          <p>{activeNote}</p>
        </div>
      )}
    </div>
  );
}

// Add TS global window interface expansion
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}
