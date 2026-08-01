# Threshold — Build Spec (for Antigravity)
### v2 — final. Source of truth for this hackathon build. Resolves ambiguity in the pitch PRD; do not guess where this doc is silent — ask.

---

## 0. What this is

Threshold is a diagnosis-before-curation growth agent. It does not recommend content. It diagnoses what state a person is in, then composes an *experience* (not a media list) that fits that state. Deliverable: one embeddable capability pluggable into IABTM's website — not a standalone app.

**Tagline:** "Threshold is an agentic identity curator that diagnoses your current growth moment, composes the next meaningful experience, and continuously adapts as you grow."

---

## 1. Naming — internal code vs. user-facing copy

Code, types, and API contracts use the **internal** names below. UI copy, pitch deck, and anything a judge reads uses the **user-facing** names. Do not rename identifiers in code to match UI copy — that's a copy-layer decision only.

| Internal (code/spec) | User-facing (UI/pitch) |
|---|---|
| Identity Model | Identity Map |
| Need Diagnosis | Growth Diagnosis |
| Experience Pathway | Growth Journey |
| Evidence Ledger | Proof of Growth |
| Longitudinal Snapshot | Identity Timeline |
| Reflection Engine | Reflection Loop |
| Commitment Engine | Action Commitment |
| Trajectory Prediction | Proactive Check-ins |
| Curation Layer / Transformation Layer | Experience Layer / Growth Layer |

**Pitch lines to use, verbatim:** "Diagnosis before curation." / "An itinerary, not a feed." / "Resources are ingredients. Experiences are the meal." / "We don't recommend content. We compose experiences." / "Evidence of change, not completion." / "Who you're becoming matters more than what you're consuming."

**Cut from the pitch** (fine as internal prep notes, not on stage): "Identity Operating System," "world's first," "Habitica with better branding," museum/military/monastery/archaeology analogies.

---

## 2. Tech stack (decided, do not re-derive)

- **Framework:** Next.js (App Router) + TypeScript, Tailwind
- **Runtime LLM:** [confirm provider — Anthropic/OpenAI/Gemini — swap SDK import only, architecture below is provider-agnostic]
- **No AutoGen, no LangChain** — hand-rolled agent loop using native tool-calling. Full control, no framework abstraction to debug live.
- **State:** two hardcoded seed users (Section 7) in `/data/*.json`; no external DB needed for the demo
- **No auth, no real IABTM API integration** — out of scope tonight (Section 9)
- **Deployment:** Vercel; final deliverable includes a `/app/embed/page.tsx` route with no nav/chrome, framed via `<iframe src="https://your-app.vercel.app/embed" width="400" height="700">`. Set headers in `next.config.js` to explicitly allow framing on that route.

---

## 3. Multi-agent architecture (this is what makes it agentic, not the API call alone)

Four distinct agents, each its own file, own system prompt, own tool set, own output contract. Each hands its output to the next. The full trace of what each agent did — which tools it called, in what order, and why — is rendered on screen. That trace, not the final answer alone, is the proof of agentic behavior.

```
Identity Agent
   → reads conversation, extracts real gap under the stated goal
   → output: { extracted_intent, gap_hypothesis }
        ↓
Diagnosis Agent
   → tools: get_evidence_ledger(user_id), get_reflection_history(user_id)
   → must call ≥1 tool before finalizing
   → forces final output via a submit_diagnosis tool call
   → output: full Diagnosis object (Section 4) + trace of tool calls made
        ↓
Constraints Filter
   → plain function, NOT an LLM call — filters/re-sizes ExperienceSteps by
     time_available (5min | 30min | open), location, resource limits
        ↓
Journey Composer Agent
   → input: Diagnosis (post-filter)
   → output: ExperienceStep[] (Section 5)

Longitudinal Snapshot (separate, on-demand)
   → reruns Identity Agent's reasoning against 2-3 seeded historical states
     per user (Section 7) — same logic, old data, rendered as a timeline

Reflection Agent (separate trigger, on reflection submit)
   → writes an EvidenceEntry (Section 6)
   → decides, on its own judgment, whether this is a lapse
   → if lapse: re-invokes Diagnosis Agent with the lapse folded into
     reflection history (this is Lapse → Re-diagnosis, Tier 2)

Trajectory Prediction Agent (separate trigger, runs on reflection stream) — TIER 2
   → tools: offer_checkin(reason) | no_action_needed()
   → decides independently whether drift is significant; never acts
     unilaterally, only offers
```

---

## 4. Diagnosis — resolved output shape (final, not ambiguous)

Both fields always present — quadrant is the *state* axis, capability_gap is the *domain-specific need* within that state. Not either/or.

```ts
type Diagnosis = {
  quadrant: "Commitment" | "Curiosity" | "Compassion" | "Rest";
  quadrant_reasoning: string;
  rejected_quadrants: { quadrant: string; reason_rejected: string }[]; // required, not optional
  capability_gap: string;      // e.g. "Communication Confidence, not UI Skill"
  gap_reasoning: string;
  journey: ExperienceStep[];
  trace: { agent: string; tool?: string; input?: any; result?: any }[]; // full multi-agent trace, rendered in UI
};
```

UI: "Why This?" renders `quadrant_reasoning` + `gap_reasoning`. "Why not X?" renders `rejected_quadrants`. Diagnosis Reveal screen renders `trace` as a step-by-step log, not just the final object.

---

## 5. Experience Composer — data shape

```ts
type ExperienceStep = {
  id: string;
  verb: "attend" | "ask" | "meet" | "apply" | "reflect" | "rest";
  label: string;
  requires_output: boolean; // true = output-to-unlock gate before next step is visible
};
```

Rule: if `requires_output` is true, the next step is locked (blurred/disabled) until the user submits a reflection tied to the current step. REST/Compassion-quadrant steps: `requires_output` always false (Guardrail 4).

---

## 6. Proof of Growth (Evidence Ledger) — minimal schema

```ts
type EvidenceEntry = {
  id: string;
  user_id: string;
  step_id: string;
  type: "behavioral" | "social" | "emotional" | "skill" | "reflective";
  content: string;
  timestamp: string;
};
```

Completion (`ExperienceStep` marked done) and evidence (an `EvidenceEntry` existing for it) are separate booleans — never merged into one status.

---

## 7. Demo data — hardcode these two users, do not generate them live

**User 1 — Aarav**
- stated_goal: "I want confidence during interviews."
- recent_reflections: ["Finished my third portfolio project", "Nervous every time someone asks me to explain my work out loud"]
- 2-3 seeded historical states for Identity Timeline: Month 1 "trying to become confident" → Month 3 "started mentoring a junior designer"
- Expected diagnosis: quadrant `Commitment`, capability_gap `Communication Confidence, not UI Skill`

**User 2 — Meera**
- stated_goal: "I want confidence during interviews... I've been rejected four times this month."
- recent_reflections: ["Another rejection today", "Maybe I'm just not good enough for this"]
- Expected diagnosis: quadrant `Compassion`, gap-equivalent: protect from external ask, low-stakes self-paced review only

Run both through the real multi-agent pipeline first. If live output doesn't land close to the above, hardcode a fallback diagnosis keyed to these two `user_id`s — reliability on stage beats live-inference purity.

---

## 8. Screens (build in this order)

1. **Identity Conversation** — single-turn chat input, triggers the agent chain
2. **Diagnosis Reveal** — full `trace` log + quadrant + capability_gap; "Why This?" and "Why not X?" affordances
3. **Growth Journey Screen** — `journey` as vertical sequence, locked/unlocked per `requires_output`
4. **Reflection Capture** — text input tied to a step, writes an `EvidenceEntry`, triggers Reflection Agent
5. **User Toggle** — Aarav/Meera switcher — **build early, not last**, both users share every component below it
6. **Identity Timeline** — renders Longitudinal Snapshot output, Tier 1

---

## 9. Explicitly out of scope tonight

- Real IABTM API integration, auth / real user accounts, voice reflections (text only unless spare time at the end)
- Society Loop / mentor matching / curator promotion — Tier 3, narrate only, not built
- Trajectory Prediction / Proactive Check-ins — Tier 2, build only if Tier 1 is solid early
- Any points, badges, streaks, XP, guild meters, public kudos mechanics — hard guardrail, never build regardless of engagement upside

---

## 10. Guardrails — hard constraints, not suggestions

1. No gamification mechanics of any kind (Section 9)
2. Diagnosis reasoning always shown, including rejected alternatives and the full agent trace — no black box
3. Completion and evidence always shown as separate signals, never merged
4. REST/Compassion-quadrant steps: no deadline, no `requires_output` gate — never force output from someone diagnosed as needing rest
5. Trajectory Prediction / Proactive Check-ins only ever offers, never unilaterally acts

---

## 11. Final Tier 1 — must build tonight (8 items, corrected)

1. Identity Conversation
2. Identity Map (Identity Agent)
3. Growth Diagnosis (Diagnosis Agent — 2x2 + Why This / Why not X + trace)
4. Constraints Filter (plain function)
5. Growth Journey (Experience Composer / Journey Composer Agent)
6. **Two-user demo (Aarav & Meera) — do not cut, this is the Demo North Star**
7. Proof of Growth (Evidence Ledger, completion≠evidence)
8. Identity Timeline (Longitudinal Snapshot)

Tier 2 (build if Tier 1 solid early): Lapse→re-diagnosis, Proactive Check-ins, full Reflection Loop panel, Society Loop entry screen.
Tier 3 (narrate only): curator promotion, mentor marketplace, sensor ingestion, community platform.
