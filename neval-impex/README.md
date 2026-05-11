# SC Neval Impex SRL — One-page Site

Premium single-page website for **SC Neval Impex SRL** — NATO-certified defense
& military supplier (since 2002, NATO partner since 2018).

## Tech

- **Pure HTML / CSS / JS** — no build step required.
- **Three.js** (loaded via importmap) — 3D background: low-poly wireframe globe
  + arc trajectories from Romania to US bases (Tyndall AFB, Colorado Springs,
  Sigonella) + animated travelling pulses + starfield + nebula.
- **GSAP + ScrollTrigger** — hero entrance, micro-animations.
- **Lenis** — smooth scroll.
- **IntersectionObserver** — scroll reveals + animated stat counters.
- **Bilingual** RO / EN toggle (preference stored in `localStorage`).

## Run locally

The site is fully static — open `index.html` directly, or serve the folder
with any static server, e.g.:

```bash
cd neval-impex
python3 -m http.server 8080
# then open http://localhost:8080
```

A server is recommended (rather than `file://`) so the ES module imports for
Three.js work cleanly.

## File layout

```
neval-impex/
├── index.html       — markup, bilingual (data-i18n keys)
├── styles.css       — design system (dark navy + gold tokens)
├── scene.js         — Three.js background scene
├── app.js           — i18n, reveals, counters, tilt, smooth scroll
├── assets/
│   └── favicon.svg
└── README.md
```

## Content

All copy and data points are sourced directly from the official PDFs:

- `Neval_Impex_ENG.pdf` / `Neval_Impex_Prezentare_RO.pdf`
- `IAP_Recommendation_Letter_SC_Neval_Impex_SRL.pdf`
- `US_NAVY_Recommendation_Letter_SC_Neval_Impex_SRL.pdf`
- `PREZENTATION_OF_SC_NEVAL_IMPEX_SRL.pdf`

## Accessibility

- Respects `prefers-reduced-motion` — disables Lenis, GSAP entrance, globe
  rotation and reveal motion.
- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
- Sufficient contrast for body text & gold accents on dark navy background.

## Performance

- All third-party scripts via CDN with `defer` ordering (modules + classic).
- Pixel ratio capped at 2× for the WebGL canvas.
- ~1400-point starfield, single 64-segment quadratic arcs — runs at 60fps on
  modern hardware. Mobile globe is auto-shrunk and re-centered.
