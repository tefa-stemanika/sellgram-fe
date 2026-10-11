---
name: Signal Charcoal
colors:
  primary: "#5B7029"
  secondary: "#F0F1EE"
  success: "#31725C"
  warning: "#87591C"
  danger: "#B73834"
  surface: "#FDFDFC"
  text: "#1D1F19"
  neutral: "#F7F7F5"
colorsDark:
  primary: "#B8D86E"
  secondary: "#252622"
  success: "#67C1A3"
  warning: "#DAA658"
  danger: "#DC6E6A"
  surface: "#151613"
  text: "#F3F3F1"
  neutral: "#0D0E0C"
typography:
  h1:
    fontFamily: "Space Grotesk"
    fontSize: 2rem
  body-md:
    fontFamily: "Space Grotesk"
    fontSize: 1rem
  data-mono:
    fontFamily: "IBM Plex Mono"
    fontSize: 0.875rem
  sourceScale: "13/14/15/17/20/24/32/hero"
  weights: "300, 400, 500, 600, 700 (hard ceiling — no 800/900 exist)"
rounded:
  sm: 6px
  md: 8px
  lg: 10px
  xl: 14px
  2xl: 18px
spacing:
  sm: 4px
  md: 8px
  sourceScale: "4/8/12/16/24/32"
---

## Overview

Dark-first operational SaaS identity: near-black charcoal, one restrained "signal" accent, and mono type reserved strictly for data. Calm, confident, terminal-grade craft — not consumer candy. Named **Signal Charcoal**.

## Style Foundations

- **Visual style:** dark-first, achromatic-dominant, hairline borders, tinted elevation
- **Typography:** Space Grotesk = language (headings, UI, body). IBM Plex Mono = data (IDs, amounts, dates, counters, template content) with `tabular-nums`. Weights 300–700 only; `font-black` is banned.
- **Color discipline:** one accent hue (78° citron) plus a status family, over a hue-78-tinted neutral ramp in both modes.
- **Elevation:** opaque token surfaces + tinted shadows (`shadow-l1/l2/l3`). Frosted glass (`backdrop-blur`) is permitted on exactly two surfaces: the mobile sticky bar and the storefront navbar.
- **Texture:** fixed film-grain overlay (`body::after`, ~2.5% opacity). Graph paper survives only as a local background inside the auth split panel.

## Colors

- **Primary (#5B7029 light / #B8D86E dark):** Signal citron, hue 78. Chosen because messaging's core affordance is the *presence dot*; 78° sits far from both warning (34°) and success (160°) so it can never be mistaken for a status. Same hue in both modes, two lightness positions — one identity, no split.
- **Secondary:** demoted to a neutral surface token, not a second brand hue.
- **Status family (#31725C / #87591C / #B73834 / #336184 / #644983 / #32687B / #5C6670):** one desaturated band, AA-verified against card surfaces in both modes. Color is never the sole signal — status is always label text (plus optional dot).
- **Surfaces:** off-black `#0D0E0C` (never `#FFF00`) / warm-paper neutrals (never pure white). All neutrals carry hue 78 undertone.

## The Accent Rule

The accent appears **only** as: primary CTA fill, active nav indicator bar, focus ring, link hover, `chart-1`, and the squircle brand glyph. It is never a gradient stop, never a decorative blob, never a badge fill, never an icon tint on metric cards. A reviewer who finds a citron badge fill has found a bug.

## Typography Scale

Semantic Tailwind names (values restyled): `page-title` 32/600 · `section-header` 24 · `subsection-header` 20 · `card-title` 17 · `small-header` 15 · `body` 16 · `body-sm` 14 · `caption` 13 · `label` 13/600 · `mono-data` 14/500 · `display-hero` clamp(36–56) for landing only.

## Do / Don't

- **Don't** use raw Tailwind palette colors (`emerald-*`, `gray-*`, `slate-*`…) in `app/` — always tokens.
- **Don't** use decorative `bg-gradient-to-*`. Single-tone only.
- **Don't** center everything / three equal feature cards on the landing — asymmetric bento.
- **Do** keep shadows pointing from one light source (top), tinted via `--shadow-color`.
- **Do** honor `prefers-reduced-motion` (global kill-switch exists in globals.css).
