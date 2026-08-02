"use client";

import React, { useState } from "react";

interface CreatorsPageProps {
  onTabChange: (tab: "podcast" | "creators" | "experts") => void;
  onViewCreatorKit?: (name: string) => void;
}

// Static creators data moved outside component to simplify body parsing
const creators = [
  {
    name: "Aria Vane",
    category: "photo",
    categoryLabel: "Editorial Photographer",
    locations: "London / Singapore",
    clients: "Google, SAP, IATA",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYycLDA5kZSoJxcAR_IXk5vUjGrl2wfxaJrDklUJFptupezYVzLuFlP-9FLZpsR-Y-FG84bO0A5tXgYy33mHTlYlFGxeSnFKyd1DIFF9fF3LtH7g0RIARAiUnfChq4nnlJG9zm0JogVKMz3tpbRsQWGDuTeqdYZGWmUn5earO_euT3o7XarUL_qhY1BlbYPRLLUEyq-_UvV7GDfV_CDmB4eS4320TLChCDERfS7GcJPZlPY1ZRd7F93Q",
    featuredImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYycLDA5kZSoJxcAR_IXk5vUjGrl2wfxaJrDklUJFptupezYVzLuFlP-9FLZpsR-Y-FG84bO0A5tXgYy33mHTlYlFGxeSnFKyd1DIFF9fF3LtH7g0RIARAiUnfChq4nnlJG9zm0JogVKMz3tpbRsQWGDuTeqdYZGWmUn5earO_euT3o7XarUL_qhY1BlbYPRLLUEyq-_UvV7GDfV_CDmB4eS4320TLChCDERfS7GcJPZlPY1ZRd7F93Q",
    bio: "Aria specializes in high-contrast editorial photography focusing on modern corporate lifestyles and high-end workspaces in financial hubs globally.",
    colSpan: "md:col-span-8"
  },
  {
    name: "Kaito Chen",
    category: "immersive",
    categoryLabel: "Immersive Tech Specialist",
    locations: "Tokyo / Zurich",
    clients: "Emirates, Lufthansa, BMW",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA47tIPigxDwQ9acdHqbaP3PYus4DRFpAsK0aNssKEXJetMQV-up5XFPJb7PKLjJPCnExE4WSXHNZ4e4jfsy6jVGQhYnLzAKpcLxr6nHqWN9Er_uaLVEToPIVMuZDWjGhFxVCK4j9KhM_Fl-DoHaCBwP2kl_NUJHYw0gnFwZLfQPG6-S_549K0pb_1ais2KLjQiJ_FrV3zXVSfwNRwMAZvNHH9zmbLQxHlpvVBFJ4L01wjdkwvR3jxZhw",
    featuredImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuA47tIPigxDwQ9acdHqbaP3PYus4DRFpAsK0aNssKEXJetMQV-up5XFPJb7PKLjJPCnExE4WSXHNZ4e4jfsy6jVGQhYnLzAKpcLxr6nHqWN9Er_uaLVEToPIVMuZDWjGhFxVCK4j9KhM_Fl-DoHaCBwP2kl_NUJHYw0gnFwZLfQPG6-S_549K0pb_1ais2KLjQiJ_FrV3zXVSfwNRwMAZvNHH9zmbLQxHlpvVBFJ4L01wjdkwvR3jxZhw",
    bio: "Kaito bridges the gap between hardware engineering and generative visual art, building complex spatial experiences for global travel lounges.",
    colSpan: "md:col-span-4"
  },
  {
    name: "Elena Rostova",
    category: "cine",
    categoryLabel: "Event Cinematographer",
    locations: "Berlin / Lisbon",
    clients: "IABTM, Web Summit, UEFA",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdMr0Amtf0Gi3Plqhf6Vldhx31dK-mKJB85DFqQicLYOnAJI-CqNoHvzjkwEr1xYQ9_L4E5qNQ6krJG5vgfS3EeeQZqvOoJtWL2aG-lRTDDYiI8QV5MfnrT6Wasy3KdldPq01Z16uaVRX1WbSKm88pFZ_ew0NC3hBFwvWewlV6XrjaXkai8C3iyIJfMUgsojLnRIPLVBOp4D_Portb86solZ8S2vFY5oS0NKG4UFyDhliL5lP-aO_87w",
    featuredImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdMr0Amtf0Gi3Plqhf6Vldhx31dK-mKJB85DFqQicLYOnAJI-CqNoHvzjkwEr1xYQ9_L4E5qNQ6krJG5vgfS3EeeQZqvOoJtWL2aG-lRTDDYiI8QV5MfnrT6Wasy3KdldPq01Z16uaVRX1WbSKm88pFZ_ew0NC3hBFwvWewlV6XrjaXkai8C3iyIJfMUgsojLnRIPLVBOp4D_Portb86solZ8S2vFY5oS0NKG4UFyDhliL5lP-aO_87w",
    bio: "Elena operates high-speed camera rigs and spatial trackers to capture dynamic event narratives with an ink-on-paper editorial coloring grade.",
    colSpan: "md:col-span-4"
  },
  {
    name: "Jean-Paul Gautier",
    category: "design",
    categoryLabel: "Corporate Brand Designer",
    locations: "Paris / New York",
    clients: "Hermes, IATA, Delta",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4YAt2rKKdKcy_ibIy1xTQIpVsgjGq0vEljeK9ADqj_IMR2kY2TfM3AdHjqih9kwCDcsO8OblUqOrB0g6RAKSZobO3IvA9-HG5O3c5Y7DtchgT-jzP_o9ls6PBdZR6DHM4dtijv4tI2l4_wNq9XuDuHP647Apn7JyTxwOlpITX8HuhEGtnujrF_GdqKUC6GPgMYfsEzPGYhXwjTfRmgQcWIiGeHeIsBPsujB2b57Y4BjIDWFnDns_zFQ",
    featuredImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4YAt2rKKdKcy_ibIy1xTQIpVsgjGq0vEljeK9ADqj_IMR2kY2TfM3AdHjqih9kwCDcsO8OblUqOrB0g6RAKSZobO3IvA9-HG5O3c5Y7DtchgT-jzP_o9ls6PBdZR6DHM4dtijv4tI2l4_wNq9XuDuHP647Apn7JyTxwOlpITX8HuhEGtnujrF_GdqKUC6GPgMYfsEzPGYhXwjTfRmgQcWIiGeHeIsBPsujB2b57Y4BjIDWFnDns_zFQ",
    bio: "Jean-Paul specializes in minimal typographic design, identity layouts, and brand books with massive whitespace borders.",
    colSpan: "md:col-span-8"
  }
];

export default function CreatorsPage({ onTabChange, onViewCreatorKit }: CreatorsPageProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedCreatorKit, setSelectedCreatorKit] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredCreators = activeCategory === "all" 
    ? creators 
    : creators.filter(c => c.category === activeCategory);

  const handleOpenKit = (name: string) => {
    setSelectedCreatorKit(name);
    if (onViewCreatorKit) {
      onViewCreatorKit(name);
    }
  };

  const selectedCreator = creators.find(c => c.name === selectedCreatorKit);

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-secondary-container selection:text-on-secondary-container overflow-x-hidden w-full relative">
      {/* TopAppBar */}
      <header className="bg-white/70 backdrop-blur-md shadow-sm border-b border-outline-variant/30 flex justify-between items-center w-full px-6 md:px-12 py-4 z-40">
        <div className="flex items-center gap-4">
          <span 
            className="material-symbols-outlined cursor-pointer transition-all active:scale-95 text-primary" 
            onClick={() => setDrawerOpen(true)}
          >
            menu
          </span>
          <h1 className="font-display-xl text-headline-lg tracking-tighter text-primary">IABTM</h1>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <a className="text-on-surface-variant font-label-caps hover:text-secondary-container transition-colors duration-300" href="#" onClick={(e) => { e.preventDefault(); onTabChange("podcast"); }}>The Episode Vault</a>
          <a className="text-primary font-bold font-label-caps hover:text-secondary-container transition-colors duration-300" href="#" onClick={(e) => e.preventDefault()}>Storytelling Lab</a>
          <a className="text-on-surface-variant font-label-caps hover:text-secondary-container transition-colors duration-300" href="#" onClick={(e) => { e.preventDefault(); onTabChange("experts"); }}>Advisory Council</a>
          <span className="material-symbols-outlined cursor-pointer transition-all active:scale-95 text-primary">search</span>
        </nav>
      </header>

      {/* Navigation Drawer Overlay */}
      {drawerOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300"
          onClick={() => setDrawerOpen(false)}
        ></div>
      )}

      {/* NavigationDrawer */}
      <aside 
        className={`bg-surface h-full w-80 fixed left-0 top-0 border-r border-outline-variant shadow-2xl z-[70] transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full py-8 space-y-4">
          <div className="px-6 mb-8 flex justify-between items-center">
            <h2 className="font-display-xl text-headline-md text-primary">IABTM Intelligence</h2>
            <span className="material-symbols-outlined cursor-pointer" onClick={() => setDrawerOpen(false)}>close</span>
          </div>
          <nav className="flex flex-col">
            <a 
              className="text-on-surface-variant font-body-lg px-6 py-4 hover:bg-surface-container-high transition-colors flex items-center gap-4" 
              href="#"
              onClick={(e) => { e.preventDefault(); onTabChange("podcast"); setDrawerOpen(false); }}
            >
              <span className="material-symbols-outlined">podcasts</span> The Episode Vault
            </a>
            <a 
              className="bg-secondary-container text-on-secondary-container font-bold px-6 py-4 rounded-full mx-4 flex items-center gap-4" 
              href="#"
              onClick={(e) => { e.preventDefault(); setDrawerOpen(false); }}
            >
              <span className="material-symbols-outlined">brush</span> Storytelling Lab
            </a>
            <a 
              className="text-on-surface-variant font-body-lg px-6 py-4 hover:bg-surface-container-high transition-colors flex items-center gap-4" 
              href="#"
              onClick={(e) => { e.preventDefault(); onTabChange("experts"); setDrawerOpen(false); }}
            >
              <span className="material-symbols-outlined">groups</span> Advisory Council
            </a>
            <a 
              className="text-on-surface-variant font-body-lg px-6 py-4 hover:bg-surface-container-high transition-colors flex items-center gap-4" 
              href="#"
              onClick={(e) => { e.preventDefault(); setDrawerOpen(false); }}
            >
              <span className="material-symbols-outlined">public</span> Global Summits
            </a>
          </nav>
        </div>
      </aside>

      <main className="relative w-full">
        {/* Hero Section: Magazine Style */}
        <section className="pt-12 px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 relative overflow-hidden">
          {/* Manifesto Column */}
          <div className="md:col-span-5 flex flex-col justify-center z-10">
            <div className="space-y-6">
              <span className="font-label-caps text-secondary uppercase tracking-[0.2em] font-bold">Storytelling Lab</span>
              <h2 className="font-display-xl text-3xl lg:text-[60px] leading-[36px] lg:leading-[65px] text-primary uppercase">
                Translating complex <span className="italic font-light text-secondary">corporate mobility</span> into captivating visual media.
              </h2>
              <p className="font-body-lg text-on-surface-variant text-sm">
                We bridge the gap between technical enterprise logistics and high-end editorial artistry, curated for the modern executive.
              </p>
              <div className="pt-4">
                <button className="bg-primary text-on-primary px-8 py-4 font-body-md flex items-center gap-3 hover:translate-x-1 transition-transform group text-xs font-bold rounded-sm">
                  Explore the Collective
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Creator Mosaic Column */}
          <div className="md:col-span-7 relative h-[400px] md:h-[500px] mt-12 md:mt-0">
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-4">
              {/* Image 1 */}
              <div className="col-span-4 row-span-4 rounded-xl overflow-hidden shadow-sm relative group">
                <img 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  alt="Film Director" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaVTbFU18ozol6ZgtJ-2rRxnOTvrTuJsDw6Y46Je_Rv4ul0FXwfr84QEtQK_kY3mqzi0ATUXxKj5NnWVUDeFVDnf5nzTmnHzHNOfYOKjtHKi-2hbjay5K3GRMf6NkFhllZL-3yld8U0XpXXzrJ5JaPEAlTVXQ0iMfH6iVcvXUvIAR1fViTNJVfHXwLOhKu4qoHY75WdHwb7wdfa8sBoCUZXDNSt3gVbsfc8p2usZr_UX2cin6zWYPiEA"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end text-white">
                  <p className="font-label-caps text-[10px]">Director Spotlight</p>
                  <h3 className="font-headline-md text-md">Marcus Thorne</h3>
                </div>
              </div>
              {/* Image 2 */}
              <div className="col-start-5 col-end-7 row-start-1 row-end-3 rounded-xl overflow-hidden float-element">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Abstract Art" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA47tIPigxDwQ9acdHqbaP3PYus4DRFpAsK0aNssKEXJetMQV-up5XFPJb7PKLjJPCnExE4WSXHNZ4e4jfsy6jVGQhYnLzAKpcLxr6nHqWN9Er_uaLVEToPIVMuZDWjGhFxVCK4j9KhM_Fl-DoHaCBwP2kl_NUJHYw0gnFwZLfQPG6-S_549K0pb_1ais2KLjQiJ_FrV3zXVSfwNRwMAZvNHH9zmbLQxHlpvVBFJ4L01wjdkwvR3jxZhw"
                />
              </div>
              {/* Image 3 */}
              <div className="col-start-5 col-end-7 row-start-3 row-end-6 rounded-xl overflow-hidden shadow-lg translate-y-8">
                <img 
                  className="w-full h-full object-cover animate-pulse" 
                  alt="Photographer Silhouette" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1XeYbuYsR3feQkBiS2WtjJ26S6xztpjGsUVPmUsv3qyTRE0XqW8Km7H_UxizrukFaNAaDK9Z7Rs66Idspoz26z6EwrMPylFP8OdkeCh4NiNfj0BK_6qWCdbIhOVMNGbBTEG8EPvdEBLaxpvsERaedqfhy0l6hMBn399aOaRRFU6TWn-HxjyQrPycHEXv8UHK8bqNncKtJmAPkzE-SidcbAa8I-lpnepxBJCKZ_aCZlE161JW_0ODhvg"
                />
              </div>
              {/* Image 4 */}
              <div className="col-start-1 col-end-3 row-start-5 row-end-7 rounded-xl overflow-hidden -translate-y-4">
                <img 
                  className="w-full h-full object-cover" 
                  alt="High Tech Gear" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4YAt2rKKdKcy_ibIy1xTQIpVsgjGq0vEljeK9ADqj_IMR2kY2TfM3AdHjqih9kwCDcsO8OblUqOrB0g6RAKSZobO3IvA9-HG5O3c5Y7DtchgT-jzP_o9ls6PBdZR6DHM4dtijv4tI2l4_wNq9XuDuHP647Apn7JyTxwOlpITX8HuhEGtnujrF_GdqKUC6GPgMYfsEzPGYhXwjTfRmgQcWIiGeHeIsBPsujB2b57Y4BjIDWFnDns_zFQ"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Residency Spotlight: Large Horizontal Feature */}
        <section className="px-6 md:px-12 py-16 bg-surface-container-low mt-8">
          <div className="flex flex-col lg:flex-row items-stretch bg-white rounded-xl overflow-hidden shadow-sm border border-outline-variant/20">
            <div className="lg:w-1/2 relative min-h-[300px]">
              <img 
                className="absolute inset-0 w-full h-full object-cover" 
                alt="Lisbon Summit Summit" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1Tr0dEIXyaOHYQZbzLSIG1ZVVInJ9SvqZoALp69TNtEF7MmMNiWKxIdNM6MjI7Qri_NgrwitdsPfETYEg7_8MunYozbNQcR5pgI3wcbeFlFx-wrpBz7XjNd-asBEtAo6tjK5IwEToDrwXRGgCPorr5-tHpTTYZycksYrSda8QMLmvMRLKBFerfotGuoqU-kquZdHFlYxZfiwusblC8AyDXD-H7xBvVMQzkhc_6c7ydN0E_CCoB070Vg"
              />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full font-label-caps text-primary text-[10px] font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span> CURRENT RESIDENCY
              </div>
            </div>
            <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h3 className="font-label-caps text-on-surface-variant text-[11px] mb-2 font-bold">Behind the Scenes</h3>
              <h2 className="font-headline-lg text-2xl lg:text-3xl text-primary mb-4 leading-tight">Documenting the 2024 Global Summit in Lisbon</h2>
              <p className="font-body-lg text-on-surface-variant text-xs mb-6 leading-relaxed">
                Our immersive tech specialists utilized real-time data visualization and 8K cinematography to turn a corporate conference into a narrative journey through the future of mobility.
              </p>
              <div className="flex gap-4 text-xs font-bold">
                <button className="border border-primary text-primary px-6 py-2.5 hover:bg-primary hover:text-on-primary transition-colors rounded-sm">Watch Film</button>
                <button className="text-primary flex items-center gap-1 group">
                  Process Gallery <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Creator Directory */}
        <section className="px-6 md:px-12 py-16">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="font-display-xl text-2xl lg:text-3xl text-primary mb-2">The Collective</h2>
              <p className="font-body-lg text-on-surface-variant text-xs leading-relaxed">A curated roster of global artists specializing in the intersection of enterprise tech and lifestyle media.</p>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar text-[10px] font-bold">
              {[
                { id: "all", label: "All Creators" },
                { id: "cine", label: "Event Cinematography" },
                { id: "design", label: "Corporate Brand Designers" },
                { id: "immersive", label: "Immersive Tech Specialists" },
                { id: "photo", label: "Editorial Photographers" }
              ].map((filter) => (
                <button 
                  key={filter.id}
                  onClick={() => setActiveCategory(filter.id)}
                  className={`px-4 py-1.5 rounded-full font-label-caps transition-all ${
                    activeCategory === filter.id 
                      ? "bg-primary text-on-primary" 
                      : "border border-outline-variant text-on-surface-variant hover:border-primary"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Creator Grid (Bento Style) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {filteredCreators.map((creator) => (
              <div key={creator.name} className={`${creator.colSpan} group relative overflow-hidden rounded-xl bg-white border border-outline-variant/30 transition-all hover:shadow-xl flex flex-col justify-between`}>
                <div className="aspect-[16/10] md:aspect-auto md:h-64 overflow-hidden relative">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0" 
                    alt={creator.name} 
                    src={creator.featuredImg} 
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                </div>
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-headline-md text-md font-bold text-primary">{creator.name}</h3>
                      <span className="bg-surface-container-highest px-3 py-0.5 rounded-full text-[9px] font-label-caps text-on-surface-variant font-semibold">
                        {creator.categoryLabel}
                      </span>
                    </div>
                    <div className="flex gap-4 text-on-surface-variant font-label-caps text-[10px] mb-3">
                      <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">location_on</span> {creator.locations}</span>
                      <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">work</span> {creator.clients}</span>
                    </div>
                    <p className="text-on-surface-variant text-[11px] leading-relaxed mb-6 font-normal line-clamp-2">{creator.bio}</p>
                  </div>
                  <button 
                    className="self-start bg-primary text-on-primary px-5 py-2.5 font-label-caps text-[10px] font-bold rounded-sm active:scale-95 transition-transform" 
                    onClick={() => handleOpenKit(creator.name)}
                  >
                    View Media Kit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Creator Media Kit Lightbox Modal */}
      {selectedCreatorKit && selectedCreator && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 fade-in-up"
          onClick={() => setSelectedCreatorKit(null)}
        >
          <div 
            className="bg-surface max-w-2xl w-full border border-border rounded-2xl overflow-hidden shadow-2xl p-6 relative flex flex-col md:flex-row gap-6 creative-hub-scope"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-primary/40 hover:text-primary active:scale-95 transition-all"
              onClick={() => setSelectedCreatorKit(null)}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
            
            {/* Visual Column */}
            <div className="md:w-1/2 h-56 md:h-auto rounded-lg overflow-hidden relative font-sans">
              <img 
                className="w-full h-full object-cover" 
                alt={selectedCreatorKit} 
                src={selectedCreator.avatar} 
              />
            </div>
            
            {/* Details Column */}
            <div className="md:w-1/2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold font-label-caps text-secondary tracking-widest uppercase">
                  {selectedCreator.categoryLabel}
                </span>
                <h2 className="font-display-xl text-xl lg:text-2xl text-primary font-bold mt-1 mb-2">
                  {selectedCreatorKit}
                </h2>
                <div className="flex flex-col gap-1 text-[11px] font-label-caps text-on-surface-variant font-medium mb-4">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {selectedCreator.locations}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">work</span> key clients: {selectedCreator.clients}</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {selectedCreator.bio}
                </p>
              </div>
              <button 
                className="mt-6 w-full bg-primary text-on-primary py-3 rounded-md font-label-caps font-bold text-xs uppercase tracking-wider active:scale-98 transition-transform"
                onClick={() => {
                  alert(`Request filed to connect with ${selectedCreatorKit}!`);
                  setSelectedCreatorKit(null);
                }}
              >
                Schedule Introduction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
