"use client";

import React, { useState } from "react";

interface ExpertsPageProps {
  onTabChange: (tab: "podcast" | "creators" | "experts") => void;
  onSelectExpert?: (name: string) => void;
}

export default function ExpertsPage({ onTabChange, onSelectExpert }: ExpertsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Board of Governors data
  const governors = [
    {
      name: "Dr. Elena Rostova",
      role: "CHAIRPERSON, GLOBAL SUSTAINABILITY FELLOW",
      org: "FORMER DIRECTIVE LEAD, EU MOBILITY BOARD",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBt8_CQo-15oYmB3Ze4P6N5aMyzV--rwzSTQHFQYI1P32jhrcnUxw5AI8ywJQ45xmY3chjGNfzeeArK-1Y9mmnytjiZhxYjHMvOj_rKX_CpYDbSjRXEBh2FlsUqK1_ZChiRMFy4kGON4fIF2k-Q6agrRqi8OJurkO8MCXSnhL8Lqj8niPs_bZAqsdeQTPDUMpmx3ZTGd-OmlfiDMcYzXSYWMYiklT6iqtogyUd_Z2vbP98HTGtViSXmBw",
      tags: ["#Decarbonization", "#SAFBlending", "#EUMobilityDirectives"],
      bio: "Elena advises EMEA ministries on dynamic carbon taxation models and sustainable aviation fuel blending mandates for corporate aviation procurement."
    },
    {
      name: "Marcus Thorne",
      role: "FELLOW, CORPORATE PROCUREMENT SYSTEMS",
      org: "FORMER VP EXECUTIVE PROCUREMENT, AMEX GBT",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlqKyk3UYO2IU9dfTI1ZVexpxVKVSj7OXo_SqkX14uLN9XJ8ImF69WnQGH-cHOSXHhJoOMsGKAM4W4LOca8J9vKaLM1dWtEAOE0KZAKr9p5mdtINtaYk5SRlQwfa9HAHsciasWGvxnop7_Vi42aikOsBfveJgkznVPrVjzs1u4yA5TSG8Ik7CS22_hSblTzviDj221POQ3g4BBZqK6oaH1zsH5Bf9LvjKJopdQenI6bmXtTM5gyH7b9A",
      tags: ["#TravelPolicyAI", "#NDCIntegration", "#DynamicPricing"],
      bio: "Marcus lead global negotiation frameworks for dynamic hotel and air RFP programs. His current research focuses on index-based pricing algorithms."
    },
    {
      name: "Sarah Jenkins",
      role: "FELLOW, DATA SOVEREIGNTY & TECH STRATEGY",
      org: "CHIEF INFORMATION SECURITY OFFICER, TRAVELPORT",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVPF7mzK1UMkBD2ie0ccmez6uIPQ_TTw-WtF61b3RK7n_OaqGLfRsGp7gLokR1NQfwcYsp8YQngwQv-KTI66WNS-EH3MQZbdZvG8gPEHjKJa0im2q_XRfy-DB7DPaXA7pyWnTDGGBQL6Yc7G5rj5tpKnHkP9oG8kr4kf54FAcBQl2eQ29P96DNJbgActO8FYaU-fcVLdMmbGumFAVxoJ3ei9jptKf9_UokGvjEBRMTQ36RmJp53TCYVA",
      tags: ["#DataSovereignty", "#TravelPolicyAI", "#PredictivePricing"],
      bio: "Sarah studies the intersection of predictive pricing data pipelines and cross-border sovereignty regulations under GDPR and sovereign cloud initiatives."
    },
    {
      name: "Anita Rao",
      role: "FELLOW, MICE & LOGISTICAL RESILIENCY",
      org: "FORMER GLOBAL DIRECTOR OF EVENTS, ACCENTURE",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDfV6WAzvuFcS9AqtSuUWPQlHoDExtw1szaVqEBlovkvT63F_d4Y0CglkExDP6SCXhOCc5s2Z8Bsd9pcwLW7CzOTwGbOZds7uTaukCFekB8V1LSFA5Jy2dcAY82gIIkJASvsJMxo13g4-ILw6r1kZGx15MmUo8KmmzP37a8GFUoXpvibAGl2b174MGUEdX6Rf_hEtupoTiUrmR-CoFq_ZIIOT-jPV9MnB0FXQ1yt3TNLjraSm3sWiGuA",
      tags: ["#LogisticalResilience", "#NDCIntegration", "#Decarbonization"],
      bio: "Anita establishes evaluation matrices for event portfolio consolidation, dynamic venue pricing models, and zero-carbon meeting guidelines."
    }
  ];

  // Filtering logic
  const filteredGovernors = governors.filter((gov) => {
    const matchesSearch =
      gov.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gov.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gov.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gov.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = activeTag ? gov.tags.includes(activeTag) : true;

    return matchesSearch && matchesTag;
  });

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null); // Clear tag filter
    } else {
      setActiveTag(tag);
      setSearchQuery(""); // Clear text search to avoid confusion
    }
  };

  const handleSelectGovernor = (name: string) => {
    if (onSelectExpert) {
      onSelectExpert(name);
    }
    alert(`Connected with ${name}. A secure brief has been initiated.`);
  };

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-secondary-fixed selection:text-on-secondary-fixed w-full relative">
      {/* TopAppBar */}
      <header className="bg-surface/70 backdrop-blur-xl text-primary font-display-xl docked full-width top-0 sticky border-b border-outline-variant/30 shadow-sm z-50 flex justify-between items-center w-full px-6 md:px-12 py-4">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined cursor-pointer transition-all active:scale-95 text-on-surface">menu</span>
          <h1 className="font-display-xl text-headline-lg tracking-tighter text-primary">IABTM</h1>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <a className="text-on-surface-variant font-label-caps hover:text-secondary-container transition-colors duration-300 relative hover-underline" href="#" onClick={(e) => { e.preventDefault(); onTabChange("podcast"); }}>RESEARCH</a>
          <a className="text-primary font-bold font-label-caps hover:text-secondary-container transition-colors duration-300 relative hover-underline" href="#" onClick={(e) => { e.preventDefault(); }}>ADVISORY COUNCIL</a>
          <a className="text-on-surface-variant font-label-caps hover:text-secondary-container transition-colors duration-300 relative hover-underline" href="#" onClick={(e) => { e.preventDefault(); onTabChange("creators"); }}>Storytelling Lab</a>
        </nav>
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined cursor-pointer transition-all active:scale-95 text-on-surface">search</span>
          <button className="hidden lg:block bg-primary text-on-primary px-6 py-2 font-label-caps text-label-sm tracking-widest hover:bg-primary/90 transition-all text-xs rounded-sm">MEMBER LOGIN</button>
        </div>
      </header>

      <main className="min-h-screen w-full">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 overflow-hidden px-6 md:px-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-12 h-[1px] bg-primary"></span>
              <span className="font-label-caps text-primary tracking-widest text-[10px] font-bold">ESTABLISHED 2012</span>
            </div>
            <h2 className="font-display-xl text-3xl lg:text-[70px] leading-[36px] lg:leading-[75px] text-primary mb-12 uppercase">
              The IABTM Global Advisory Council.
            </h2>
            
            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Counter Widget */}
              <div className="glass p-8 border border-outline-variant/30 rounded-xl shadow-sm flex flex-col gap-4 min-w-[300px]">
                <div className="flex items-baseline gap-2">
                  <span className="font-display-xl text-[60px] text-primary leading-none font-black">42</span>
                  <span className="font-headline-md text-headline-md text-on-surface-variant text-lg font-bold">Senior Fellows</span>
                </div>
                <div className="h-[1px] bg-outline-variant/30 w-full"></div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="material-symbols-outlined text-secondary-container">public</span>
                  <span className="font-body-lg text-body-lg">Across 18 Global Hubs</span>
                </div>
              </div>

              {/* Search Box */}
              <div className="flex-1 w-full space-y-6">
                <div className="relative group">
                  <input 
                    className="w-full bg-transparent border-b-2 border-outline focus:border-secondary transition-all py-4 px-2 text-lg lg:text-xl font-headline-md outline-none placeholder:text-outline-variant/50" 
                    placeholder="Search council expertise..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setActiveTag(null); }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">travel_explore</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  {["#TravelPolicyAI", "#Decarbonization", "#NDCIntegration", "#DataSovereignty", "#SAFBlending"].map((tag) => (
                    <span 
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-4 py-1.5 rounded-full font-label-caps text-on-surface-variant border cursor-pointer transition-colors ${
                        activeTag === tag 
                          ? "bg-secondary text-white border-secondary" 
                          : "bg-surface-container-high border-outline-variant/20 hover:border-secondary"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Expert Grid Section */}
        <section className="bg-white py-16 px-6 md:px-12 border-t border-outline-variant/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
            <div>
              <h3 className="font-headline-lg text-2xl lg:text-3xl text-primary font-bold mb-3">Board of Governors</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant text-sm max-w-xl">
                Our experts represent the synthesis of regulatory precision and forward-leaning enterprise strategy in global mobility.
              </p>
            </div>
          </div>

          {/* Expert Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGovernors.map((gov) => (
              <div 
                key={gov.name} 
                className="group border border-outline-variant/30 hover:border-primary/45 p-8 flex flex-col md:flex-row gap-6 bg-surface hover:shadow-lg transition-all rounded-xl cursor-pointer"
                onClick={() => handleSelectGovernor(gov.name)}
              >
                {/* Profile Portrait */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high relative">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" 
                    alt={gov.name} 
                    src={gov.avatar} 
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                </div>
                
                {/* Profile Bio details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-headline-md text-base lg:text-lg font-bold text-primary mb-1 group-hover:text-secondary transition-colors">
                      {gov.name}
                    </h4>
                    <p className="text-[10px] font-label-caps text-secondary font-bold tracking-wider mb-1 leading-snug">
                      {gov.role}
                    </p>
                    <p className="text-[9px] font-label-caps text-on-surface-variant tracking-wider font-semibold mb-3 leading-snug">
                      {gov.org}
                    </p>
                    <p className="text-on-surface-variant text-[11px] leading-relaxed mb-4 line-clamp-2">
                      {gov.bio}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[8px] font-bold font-mono">
                    {gov.tags.map((t) => (
                      <span 
                        key={t}
                        onClick={(e) => { e.stopPropagation(); handleTagClick(t); }}
                        className={`px-2 py-0.5 border rounded-sm transition-colors ${
                          activeTag === t 
                            ? "bg-secondary text-white border-secondary" 
                            : "border-outline-variant/30 text-secondaryText hover:border-secondary hover:text-secondary"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredGovernors.length === 0 && (
              <div className="col-span-2 py-16 text-center text-secondaryText text-sm border border-dashed border-border rounded-xl">
                No advisors found matching your criteria. Try resetting tags or search fields.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
