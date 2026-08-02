"use client";

import React, { useState, useEffect, useRef } from "react";

interface PodcastPageProps {
  onTabChange: (tab: "podcast" | "creators" | "experts") => void;
  onPlayEpisode?: (title: string) => void;
}

export default function PodcastPage({ onTabChange, onPlayEpisode }: PodcastPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(765); // 12:45 in seconds
  const duration = 2300; // 38:20 in seconds
  const [activeCategory, setActiveCategory] = useState("all");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (onPlayEpisode) {
      onPlayEpisode("The Future of Multi-Modal Procurement in EMEA");
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const percent = (currentTime / duration) * 100;

  // Filter episodes based on category
  const episodes = [
    {
      id: "ep-1",
      category: "tech",
      categoryLabel: "GLOBAL TRAVEL TECH",
      date: "OCT 24, 2024",
      duration: "38 MINS",
      title: "AI-Driven Sourcing: Beyond the Hype Cycles",
      desc: "A deep dive into how machine learning is actually impacting hotel RFP seasons and what it means for 2025 budgets.",
      host: "SARAH JENKINS",
      hostAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVPF7mzK1UMkBD2ie0ccmez6uIPQ_TTw-WtF61b3RK7n_OaqGLfRsGp7gLokR1NQfwcYsp8YQngwQv-KTI66WNS-EH3MQZbdZvG8gPEHjKJa0im2q_XRfy-DB7DPaXA7pyWnTDGGBQL6Yc7G5rj5tpKnHkP9oG8kr4kf54FAcBQl2eQ29P96DNJbgActO8FYaU-fcVLdMmbGumFAVxoJ3ei9jptKf9_UokGvjEBRMTQ36RmJp53TCYVA",
      bullet1: "Predictive pricing models for Q1",
      bullet2: "Data sovereignty in cloud procurement"
    },
    {
      id: "ep-2",
      category: "esg",
      categoryLabel: "PROCUREMENT & ESG",
      date: "OCT 18, 2024",
      duration: "42 MINS",
      title: "The Carbon Tax Reality for Business Aviation",
      desc: "How new EU regulations are forcing a rethink of executive short-haul travel and private charter logistics.",
      host: "LEONARD VANCE",
      hostAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBt8_CQo-15oYmB3Ze4P6N5aMyzV--rwzSTQHFQYI1P32jhrcnUxw5AI8ywJQ45xmY3chjGNfzeeArK-1Y9mmnytjiZhxYjHMvOj_rKX_CpYDbSjRXEBh2FlsUqK1_ZChiRMFy4kGON4fIF2k-Q6agrRqi8OJurkO8MCXSnhL8Lqj8niPs_bZAqsdeQTPDUMpmx3ZTGd-OmlfiDMcYzXSYWMYiklT6iqtogyUd_Z2vbP98HTGtViSXmBw",
      bullet1: "SAF blending mandates vs. reality",
      bullet2: "Offset integrity audits"
    },
    {
      id: "ep-3",
      category: "procure",
      categoryLabel: "EXECUTIVE PROCUREMENT",
      date: "OCT 12, 2024",
      duration: "35 MINS",
      title: "Re-negotiating Dynamic Pricing in 2025",
      desc: "Why the traditional annual RFP is dead and how to move toward continuous negotiation with key partners.",
      host: "ANITA RAO",
      hostAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDfV6WAzvuFcS9AqtSuUWPQlHoDExtw1szaVqEBlovkvT63F_d4Y0CglkExDP6SCXhOCc5s2Z8Bsd9pcwLW7CzOTwGbOZds7uTaukCFekB8V1LSFA5Jy2dcAY82gIIkJASvsJMxo13g4-ILw6r1kZGx15MmUo8KmmzP37a8GFUoXpvibAGl2b174MGUEdX6Rf_hEtupoTiUrmR-CoFq_ZIIOT-jPV9MnB0FXQ1yt3TNLjraSm3sWiGuA",
      bullet1: "Index-based pricing strategies",
      bullet2: "Performance-based airline deals"
    }
  ];

  const filteredEpisodes = activeCategory === "all" 
    ? episodes 
    : episodes.filter(ep => ep.category === activeCategory);

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-secondary-container selection:text-on-secondary-container antialiased w-full relative">
      {/* Top Navigation Anchor */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center w-full px-6 md:px-12 py-4 z-40">
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-primary cursor-pointer active:scale-95 transition-all">menu</span>
          <div className="font-display-xl text-headline-lg tracking-tighter text-primary">IABTM</div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a className="text-on-surface-variant font-label-caps hover:text-secondary-container transition-colors duration-300" href="#" onClick={(e) => { e.preventDefault(); }}>Insights</a>
          <a className="text-primary font-bold font-label-caps hover:text-secondary-container transition-colors duration-300" href="#" onClick={(e) => { e.preventDefault(); }}>The Episode Vault</a>
          <a className="text-on-surface-variant font-label-caps hover:text-secondary-container transition-colors duration-300" href="#" onClick={(e) => { e.preventDefault(); onTabChange("creators"); }}>Storytelling Lab</a>
          <a className="text-on-surface-variant font-label-caps hover:text-secondary-container transition-colors duration-300" href="#" onClick={(e) => { e.preventDefault(); onTabChange("experts"); }}>Advisory Council</a>
          <span className="material-symbols-outlined text-primary cursor-pointer active:scale-95 transition-all">search</span>
        </div>
      </nav>

      {/* Main Container Layout */}
      <div className="flex w-full min-h-screen">
        {/* Side Navigation Drawer */}
        <aside className="hidden lg:flex flex-col py-8 space-y-4 bg-surface w-20 border-r border-outline-variant group hover:w-64 transition-all duration-300 ease-in-out">
          <div className="flex flex-col gap-4">
            <div 
              onClick={() => onTabChange("podcast")}
              className="flex items-center gap-4 bg-secondary-container text-on-secondary-container font-bold px-6 py-4 rounded-full mx-2 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined">podcasts</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">The Episode Vault</span>
            </div>
            <div 
              onClick={() => onTabChange("creators")}
              className="flex items-center gap-4 text-on-surface-variant font-body-lg px-6 py-4 mx-2 cursor-pointer hover:bg-surface-container-high transition-colors rounded-full"
            >
              <span className="material-symbols-outlined">brush</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">Storytelling Lab</span>
            </div>
            <div 
              onClick={() => onTabChange("experts")}
              className="flex items-center gap-4 text-on-surface-variant font-body-lg px-6 py-4 mx-2 cursor-pointer hover:bg-surface-container-high transition-colors rounded-full"
            >
              <span className="material-symbols-outlined">groups</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">Advisory Council</span>
            </div>
            <div 
              className="flex items-center gap-4 text-on-surface-variant font-body-lg px-6 py-4 mx-2 cursor-pointer hover:bg-surface-container-high transition-colors rounded-full"
              onClick={(e) => { e.preventDefault(); }}
            >
              <span className="material-symbols-outlined">public</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">Global Summits</span>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0">
          {/* Hero Section */}
          <section className="px-6 md:px-12 pt-16 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 relative overflow-hidden">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <span className="font-label-caps text-secondary font-bold mb-4 tracking-widest block">FEATURED EPISODE</span>
              <h1 className="font-display-xl text-[70px] lg:text-[100px] leading-[80px] lg:leading-[90px] mb-6 text-primary uppercase relative z-10">
                Unpacked<span className="text-secondary">:</span>
              </h1>
              <p className="font-headline-md text-on-surface-variant max-w-xl mb-8">
                Business Travel &amp; Events Unfiltered. Sharp insights from the minds redefining global mobility.
              </p>
              
              {/* Distribution Cluster */}
              <div className="flex flex-wrap gap-4 items-center">
                <span className="font-label-caps text-on-surface-variant mr-4">LISTEN ON</span>
                <a className="p-3 border border-outline-variant hover:border-primary transition-colors flex items-center gap-2 group text-xs font-semibold" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>podcasts</span>
                  <span className="font-label-caps text-[10px]">APPLE</span>
                </a>
                <a className="p-3 border border-outline-variant hover:border-primary transition-colors flex items-center gap-2 group text-xs font-semibold" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  <span className="font-label-caps text-[10px]">YOUTUBE</span>
                </a>
                <a className="p-3 border border-outline-variant hover:border-primary transition-colors flex items-center gap-2 group text-xs font-semibold" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>equalizer</span>
                  <span className="font-label-caps text-[10px]">SPOTIFY</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 lg:mt-8">
              {/* Interactive Mini-Player Mockup */}
              <div className="glass-panel p-6 shadow-2xl relative border border-white/40 overflow-hidden group rounded-xl">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-primary-container overflow-hidden rounded-md">
                      <img 
                        className="w-full h-full object-cover grayscale" 
                        alt="Marcus Thorne" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlqKyk3UYO2IU9dfTI1ZVexpxVKVSj7OXo_SqkX14uLN9XJ8ImF69WnQGH-cHOSXHhJoOMsGKAM4W4LOca8J9vKaLM1dWtEAOE0KZAKr9p5mdtINtaYk5SRlQwfa9HAHsciasWGvxnop7_Vi42aikOsBfveJgkznVPrVjzs1u4yA5TSG8Ik7CS22_hSblTzviDj221POQ3g4BBZqK6oaH1zsH5Bf9LvjKJopdQenI6bmXtTM5gyH7b9A"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-sm">Marcus Thorne</h4>
                      <p className="text-label-caps text-on-surface-variant text-[10px]">EX-AMEX GBT ADVISOR</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary/30">more_horiz</span>
                </div>
                <h3 className="font-headline-md text-lg lg:text-xl mb-4 leading-tight">The Future of Multi-Modal Procurement in EMEA</h3>
                
                {/* Player UI */}
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="h-1 bg-outline-variant/30 w-full rounded-full">
                      <div className="h-1 bg-primary rounded-full relative" style={{ width: `${percent}%` }}>
                        <div className="absolute -right-1 -top-1 w-3 h-3 bg-primary rounded-full shadow-lg"></div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-label-caps text-on-surface-variant">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Chapter Markers */}
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-label-caps text-on-surface-variant border border-outline-variant/20">04:12 - Ground Mobility</div>
                    <div className="px-3 py-1 bg-primary/5 rounded-full text-[10px] font-label-caps text-primary border border-primary/10">Active: Tech Shifts</div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <span 
                      className="material-symbols-outlined text-2xl hover:text-secondary cursor-pointer transition-colors"
                      onClick={() => setCurrentTime((prev) => Math.max(0, prev - 10))}
                    >
                      replay_10
                    </span>
                    <div 
                      onClick={togglePlay}
                      className={`w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl ${isPlaying ? "animate-pulse" : ""}`}
                    >
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isPlaying ? "pause" : "play_arrow"}
                      </span>
                    </div>
                    <span 
                      className="material-symbols-outlined text-2xl hover:text-secondary cursor-pointer transition-colors"
                      onClick={() => setCurrentTime((prev) => Math.min(duration, prev + 30))}
                    >
                      forward_30
                    </span>
                  </div>
                </div>

                {/* Play Full Episode Trigger */}
                <button 
                  onClick={togglePlay}
                  className="absolute -bottom-2 -right-2 bg-secondary-container text-on-secondary-container px-6 py-3 font-label-caps text-xs tracking-widest hover:-translate-y-0.5 transition-transform shadow-lg flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">podcasts</span>
                  {isPlaying ? "PAUSE EPISODE" : "PLAY FULL EPISODE"}
                </button>
              </div>
            </div>
          </section>

          {/* Episode Vault Section */}
          <section className="px-6 md:px-12 py-16 bg-surface-container-low border-t border-outline-variant/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <h2 className="font-display-xl text-3xl lg:text-4xl text-primary mb-2">The Episode Vault</h2>
                <p className="font-body-lg text-on-surface-variant max-w-lg text-sm">Access a comprehensive library of unfiltered conversations on global mobility strategy.</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar whitespace-nowrap w-full md:w-auto text-xs font-bold">
                {[
                  { id: "all", label: "ALL SESSIONS" },
                  { id: "tech", label: "GLOBAL TRAVEL TECH" },
                  { id: "procure", label: "EXECUTIVE PROCUREMENT" },
                  { id: "esg", label: "PROCUREMENT & ESG" }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`font-label-caps pb-1.5 transition-colors border-b-2 ${
                      activeCategory === tab.id 
                        ? "border-primary text-primary" 
                        : "border-transparent text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bento Grid Episode Vault */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEpisodes.map((ep) => (
                <div key={ep.id} className="group bg-white p-6 border border-outline-variant/30 hover:border-primary/40 transition-all flex flex-col h-full rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`font-label-caps text-[9px] px-2 py-1 rounded-sm ${
                      ep.category === "tech" ? "bg-secondary/10 text-secondary" :
                      ep.category === "esg" ? "bg-on-tertiary-container/10 text-on-tertiary-container" :
                      "bg-primary/10 text-primary"
                    }`}>
                      {ep.categoryLabel}
                    </span>
                    <div className="flex flex-col items-end text-[9px] font-label-caps text-on-surface-variant">
                      <span>{ep.date}</span>
                      <span>{ep.duration}</span>
                    </div>
                  </div>
                  <h3 
                    onClick={() => {
                      if (onPlayEpisode) onPlayEpisode(ep.title);
                      setIsPlaying(true);
                      setCurrentTime(0);
                    }}
                    className="font-headline-md text-md font-bold mb-3 group-hover:text-secondary transition-colors cursor-pointer"
                  >
                    {ep.title}
                  </h3>
                  <p className="text-on-surface-variant text-xs mb-6 flex-grow leading-relaxed">{ep.desc}</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 bg-surface-container-lowest p-2 border border-outline-variant/20 rounded-md">
                      <div className="w-6 h-6 rounded-full bg-outline-variant/40 overflow-hidden">
                        <img className="w-full h-full object-cover" alt={ep.host} src={ep.hostAvatar} />
                      </div>
                      <span className="font-label-caps text-[9px] text-primary">HOST: {ep.host}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-on-surface-variant">
                      <li className="flex gap-2 items-center">
                        <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span>
                        <span>{ep.bullet1}</span>
                      </li>
                      <li className="flex gap-2 items-center">
                        <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span>
                        <span>{ep.bullet2}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 mt-auto text-xs">
                    <div className="flex gap-3 text-secondaryText">
                      <span 
                        className="material-symbols-outlined cursor-pointer hover:text-primary text-[18px]"
                        onClick={() => {
                          if (onPlayEpisode) onPlayEpisode(ep.title);
                          setIsPlaying(true);
                          setCurrentTime(0);
                        }}
                      >
                        play_circle
                      </span>
                      <span className="material-symbols-outlined cursor-pointer hover:text-primary text-[18px]">share</span>
                    </div>
                    <a className="font-label-caps text-[9px] flex items-center gap-1 text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      EXEC SUMMARY PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Action */}
            <div className="mt-12 flex justify-center">
              <button className="font-label-caps text-xs border border-primary px-10 py-3.5 hover:bg-primary hover:text-white transition-all duration-300 tracking-widest font-bold rounded-sm">
                EXPLORE FULL ARCHIVE
              </button>
            </div>
          </section>

          {/* Footer Section */}
          <footer className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-12 py-12 bg-surface-container-low border-t border-outline-variant text-xs">
            <div className="space-y-4">
              <div className="font-headline-md text-md font-bold text-primary">IABTM</div>
              <p className="text-on-surface-variant max-w-xs leading-relaxed">The Intelligence Authority for Business Travel and Mobility Professionals globally.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-label-caps text-primary text-[9px] font-bold">RESOURCES</h4>
              <div className="flex flex-col gap-1.5 text-on-surface-variant">
                <a className="hover:text-primary transition-opacity" href="#" onClick={(e) => e.preventDefault()}>Stay Informed on Global Mobility</a>
                <a className="hover:text-primary transition-opacity" href="#" onClick={(e) => e.preventDefault()}>Event Calendar</a>
                <a className="hover:text-primary transition-opacity" href="#" onClick={(e) => e.preventDefault()}>Intelligence Reports</a>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-label-caps text-primary text-[9px] font-bold">LEGAL</h4>
              <div className="flex flex-col gap-1.5 text-on-surface-variant">
                <a className="hover:text-primary transition-opacity" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                <a className="hover:text-primary transition-opacity" href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
                <p className="text-on-surface-variant/60 text-[10px] mt-2">© 2024 IABTM. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
