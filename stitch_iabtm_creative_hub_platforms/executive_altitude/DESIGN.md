---
name: Executive Altitude
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2a1700'
  on-tertiary-container: '#b87500'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-xl:
    fontFamily: Chivo
    fontSize: 72px
    fontWeight: '800'
    lineHeight: 80px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Chivo
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Chivo
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Chivo
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 32px
  margin-page: 64px
  section-gap: 128px
  asymmetric-offset: 80px
---

## Brand & Style
The design system embodies the intersection of high-end editorial publishing and precision enterprise technology. It targets global business travel executives who demand both aesthetic beauty and functional clarity. 

The visual style is **Editorial Minimalism** with a **Technical Edge**. It balances expansive whitespace and disciplined typography (the "Kinfolk" influence) with high-fidelity glassmorphism and rigorous grid systems (the "Stripe" influence). The result is an environment that feels authoritative, premium, and calm—evoking the quiet luxury of a first-class lounge combined with the efficiency of a mission-control dashboard.

## Colors
The palette is architectural and restrained, designed to let high-quality photography and data-dense content take center stage.

- **Foundations:** Pure White (#FFFFFF) is used for primary surfaces to maintain an editorial feel. Slate-50 (#F8FAFC) provides subtle depth for secondary background sections and "well" containers.
- **Typography:** Midnight Slate (#0F172A) is the singular choice for all text, ensuring maximum contrast and a high-end, ink-on-paper quality.
- **Accents:** "Traveler Blue" (#2563EB) is used strictly for primary actions and interactive states. "Summit Gold" (#F59E0B) is reserved for status highlights, premium tier indicators, and subtle visual milestones.
- **Borders:** A warm Slate-200 (#E2E8F0) is used for thin, 1px structural lines to define the layout without creating visual clutter.

## Typography
The typography system uses a tiered approach to differentiate between "Editorial Insight" and "Technical Precision."

- **Headlines (Chivo):** A sharp, high-confidence grotesque. Display sizes should use tight letter spacing to mimic premium magazine mastheads.
- **Body (Geist):** Selected for its geometric clarity and developer-grade precision. It maintains legibility in long-form reports and travel itineraries.
- **Technical Labels (JetBrains Mono):** Used for flight numbers, timestamps, coordinates, and secondary metadata to reinforce the "sophisticated logistics" narrative.
- **Vertical Rhythm:** Maintain generous line heights for body text (up to 1.8x) to ensure a breezy, high-end reading experience.

## Layout & Spacing
The layout philosophy favors **Asymmetric Sophistication**. Avoid perfect symmetry; instead, use staggered column starts to create visual tension and interest.

- **Grid:** A 12-column fluid grid for desktop with wide 32px gutters. 
- **Margins:** Generous page margins (64px+) ensure content never feels "trapped" by the screen edges.
- **Asymmetry:** Key elements (like hero images or featured quotes) should be offset by one or two columns to break the standard corporate "stack."
- **Mobile:** Transition to a single-column layout with 24px margins, maintaining the vertical "Section Gap" to preserve the feeling of premium space.

## Elevation & Depth
Depth is created through transparency and blur rather than heavy shadows, maintaining a lightweight "Glassmorphic" aesthetic.

- **Surfaces:** Use "Glass" containers for floating navigation and modal overlays—White (#FFFFFF) at 70% opacity with a 20px backdrop blur.
- **Shadows:** When necessary, use extremely diffused "Ambient" shadows: `0 20px 50px rgba(15, 23, 42, 0.05)`. The shadow should be barely perceptible, serving only to lift the element off the page.
- **Layering:** High-priority cards (e.g., "Boarding Now" or "VIP Access") use a subtle Slate-200 border to define their shape against the Pure White background, avoiding the "heavy" look of traditional shadows.

## Shapes
The shape language is disciplined and professional. 

- **Primary Corners:** Use "Soft" (0.25rem / 4px) corners for buttons and input fields to provide just enough approachability without losing the corporate edge.
- **Container Corners:** Larger cards and editorial sections may use "Sharp" (0px) corners to emphasize the architectural, grid-based nature of the design.
- **Iconography:** Use 2pt stroke weight with sharp miters. Icons should be functional and "logistical" in nature (arrows, maps, clocks).

## Components
- **Buttons:** Primary buttons are Midnight Slate (#0F172A) with white Geist Medium text. The hover state adds a 4px horizontal offset to the text and a subtle Traveler Blue glow.
- **Input Fields:** Minimalist design—only a bottom border (Slate-200) until focused. Upon focus, the border transitions to Traveler Blue with a 1px solid weight.
- **Editorial Cards:** Large-scale components for articles. They feature high-resolution imagery with headlines overlapping the image container using the "Asymmetric Offset."
- **Data Tables:** High-density logistics tables using JetBrains Mono for all numeric values. Rows are separated by the 1px Slate-200 warm border. No vertical grid lines.
- **Status Chips:** Small, pill-shaped indicators using Summit Gold backgrounds at 10% opacity with 100% opacity Summit Gold text for a refined, non-aggressive highlight.
- **Global Navigation:** A fixed-top glassmorphic bar. Links use the "Label-Caps" typography style with an animated underline on hover.