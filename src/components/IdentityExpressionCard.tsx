import React from "react";
import { RegistryMapping } from "@/lib/identityRegistry";
import { ArrowRight, ShoppingBag } from "lucide-react";

interface IdentityExpressionCardProps {
  mapping: RegistryMapping;
}

export default function IdentityExpressionCard({ mapping }: IdentityExpressionCardProps) {
  // Map asset type to calm action text
  const getActionText = (type: string) => {
    switch (type) {
      case "Podcast":
        return "Listen";
      case "Shop Product":
      case "Shop":
        return "View Collection";
      case "Expert":
        return "Meet Guide";
      case "Artist":
        return "Explore Story";
      case "Community":
        return "Join Conversation";
      default:
        return "View Asset";
    }
  };

  return (
    <div className="mt-8 p-6 bg-surface border border-border rounded-card hover:border-champagneGold/60 transition-normal shadow-subtle flex flex-col gap-6 select-none font-sans text-primaryText text-left relative overflow-hidden">
      
      {/* Background subtle design touch */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-champagneGold/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col gap-1.5 border-b border-border/60 pb-4">
        <span className="text-[9px] uppercase tracking-widest text-secondaryText font-mono font-bold flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-champagneGold" />
          Identity Recognition Expression
        </span>
        <h4 className="text-xs font-bold uppercase tracking-wider text-primaryText leading-relaxed max-w-xl">
          {mapping.recognitionMoment}
        </h4>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Product Image - Defined prominent border (hight border) */}
        {mapping.image && (
          <div className="w-full md:w-36 h-36 bg-white border-2 border-champagneGold/35 hover:border-champagneGold rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center p-2.5 transition-normal shadow-sm">
            <img 
              src={mapping.image} 
              alt={mapping.title} 
              className="w-full h-full object-contain filter hover:scale-105 transition-transform duration-500" 
            />
          </div>
        )}

        {/* Product Details Column */}
        <div className="flex-1 flex flex-col justify-between h-full min-h-[144px]">
          <div>
            <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
              <span className="text-[10px] font-bold font-label-caps text-champagneGold uppercase tracking-widest block font-mono">
                "{mapping.uiCopy || mapping.expressionText}"
              </span>
              {mapping.price && (
                <span className="text-[10px] font-mono font-bold text-mutedText">
                  ({mapping.price})
                </span>
              )}
            </div>
            
            <h3 className="text-md font-bold leading-tight text-primaryText mb-2">
              {mapping.title}
            </h3>
            
            <p className="text-xs text-secondaryText leading-relaxed">
              {mapping.description}
            </p>
          </div>

          {/* Bottom row actions & rationales */}
          <div className="mt-4 pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/40">
            <span className="text-[10px] text-mutedText italic max-w-sm font-serif leading-normal">
              Rationale: {mapping.rationale}
            </span>
            <a
              href={mapping.destination}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primaryText hover:bg-champagneGold text-background hover:text-primaryText font-mono text-[9px] uppercase font-bold py-2.5 px-5 rounded-btn flex items-center justify-center gap-1.5 transition-all shadow-subtle hover:scale-[1.01] active:scale-98"
            >
              {getActionText(mapping.assetType)}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
