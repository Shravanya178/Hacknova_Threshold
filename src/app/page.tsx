import React from "react";
import { ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-primaryText flex flex-col justify-between font-sans selection:bg-primaryAccent selection:text-background">
      
      {/* 1. Navbar */}
      <header className="max-w-[1280px] w-full mx-auto px-6 py-8 flex justify-between items-center border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black uppercase tracking-widest text-primaryText font-mono">
            THRESHOLD
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#demo"
            className="text-xs uppercase tracking-wider font-semibold text-secondaryText hover:text-primaryText transition-normal"
          >
            Capabilities
          </a>
          <a
            href="/embed"
            className="text-xs uppercase tracking-wider font-semibold text-primaryText hover:text-primaryHover transition-normal border border-border px-3 py-1.5 rounded-btn"
          >
            Launch Raw Embed
          </a>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="max-w-[1280px] w-full mx-auto px-6 flex-1 flex flex-col justify-center items-center py-20 gap-16">
        
        {/* Editorial Text Blocks */}
        <div className="text-center flex flex-col gap-6 max-w-4xl">
          <h1 className="hero-headline text-primaryText tracking-tighter select-none font-bold">
            Become the self <br />
            <span className="text-secondaryText font-medium italic font-serif leading-none block mt-2 lowercase">you imagine.</span>
          </h1>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="font-script text-3xl text-primaryText/80 leading-none">
              Itinerary over feed.
            </span>
          </div>

          <p className="text-lg text-secondaryText font-normal max-w-2xl mx-auto mt-4 leading-relaxed">
            Threshold is an agentic identity curator that diagnoses your current growth moment, composes the next meaningful experience, and continuously adapts as you grow.
          </p>
        </div>

        {/* VERBATIM PITCH HIGHLIGHT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1000px] text-left">
          <div className="border border-border bg-secondaryBg p-8 flex flex-col gap-4 rounded-card shadow-subtle">
            <span className="text-[10px] uppercase tracking-widest text-primaryText font-bold font-mono">THE METHOD</span>
            <h3 className="text-md font-bold text-primaryText uppercase tracking-wider">Diagnosis before curation</h3>
            <p className="text-xs text-secondaryText leading-relaxed">
              We diagnose what developmental state a person is in, then compose an experience that fits that state. Resources are ingredients. Experiences are the meal.
            </p>
          </div>

          <div className="border border-border bg-secondaryBg p-8 flex flex-col gap-4 rounded-card shadow-subtle">
            <span className="text-[10px] uppercase tracking-widest text-primaryText font-bold font-mono">THE EXPERIENCE</span>
            <h3 className="text-md font-bold text-primaryText uppercase tracking-wider">An itinerary, not a feed</h3>
            <p className="text-xs text-secondaryText leading-relaxed">
              No endless streams. No algorithm optimization. Threshold structures a sequence of actions that unlock step-by-step, demanding proof of change, not completion.
            </p>
          </div>

          <div className="border border-border bg-secondaryBg p-8 flex flex-col gap-4 rounded-card shadow-subtle">
            <span className="text-[10px] uppercase tracking-widest text-primaryText font-bold font-mono">THE IDENTITY</span>
            <h3 className="text-md font-bold text-primaryText uppercase tracking-wider">Evidence of change</h3>
            <p className="text-xs text-secondaryText leading-relaxed">
              Who you're becoming matters more than what you're consuming. Interactive feedback gates ensure growth is recorded directly into the Evidence Ledger.
            </p>
          </div>
        </div>

        {/* DEMO ANCHOR CONTAINER */}
        <section id="demo" className="w-full flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-center py-16 border-t border-border mt-8">
          
          {/* Pitch column */}
          <div className="flex-1 max-w-[450px] flex flex-col gap-6 text-left">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest text-secondaryText font-bold font-mono">CAPABILITY SHIELD</span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-primaryText leading-none">
                Interactive Curation Frame
              </h2>
            </div>
            
            <p className="text-sm text-secondaryText leading-relaxed">
              Below is the raw capability container as it embeds directly into the main website. It operates a sequential multi-agent loop running on Gemini.
            </p>

            <div className="flex flex-col gap-3 bg-secondaryBg p-5 border border-border text-xs text-secondaryText leading-relaxed rounded-card">
              <div className="font-bold uppercase tracking-wider text-[10px] text-primaryText mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primaryText" />
                Live Guardrails Active
              </div>
              <ul className="list-disc pl-4 flex flex-col gap-1.5 text-[11px]">
                <li><strong>No Gamification:</strong> No points, badges, XP, or engagement-trap mechanisms are used.</li>
                <li><strong>Gated Progress:</strong> Active states block downstream tasks until proof is written.</li>
                <li><strong>Compassion-First:</strong> Burned-out users are spared from forced feedback inputs.</li>
              </ul>
            </div>

            <div className="text-center lg:text-left mt-2">
              <span className="font-script text-2xl text-primaryText leading-none block">
                "We don't recommend content."
              </span>
              <span className="text-xs text-mutedText block mt-1 uppercase tracking-widest font-mono">
                — threshold core thesis
              </span>
            </div>
          </div>

          {/* Pluggable Frame Display */}
          <div className="relative border border-border p-3 bg-secondaryBg shadow-subtle rounded-card">
            <span className="absolute -top-3 left-4 bg-background px-3 py-0.5 text-[9px] uppercase tracking-wider text-secondaryText font-bold border border-border rounded-full">
              IABTM Pluggable Iframe
            </span>
            <iframe
              src="/embed"
              className="w-[400px] h-[700px] border border-border bg-background rounded-card shadow-subtle"
              title="Threshold Live Embed"
            />
          </div>

        </section>

      </main>

      {/* 3. Footer */}
      <footer className="border-t border-border py-10 text-center">
        <div className="max-w-[1280px] w-full mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-secondaryText">
          <span className="uppercase tracking-widest font-bold font-mono">
            THRESHOLD © 2026 • DESIGNED FOR IABTM
          </span>
          <div className="flex gap-4">
            <a href="https://iambetterthanme.com" className="hover:text-primaryText uppercase tracking-wider font-bold transition-normal">
              iambetterthanme.com
            </a>
          </div>
        </div>
      </footer>

      {/* Font imports for visual preview */}
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    </div>
  );
}
