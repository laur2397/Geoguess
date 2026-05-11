# DROM — Advanced Aerial System

Premium institutional product website for **DROM**, a compact aerial platform for defense and security applications.

Designed for executive briefings, institutional procurement and technical partner evaluation. Built around a real-time WebGL drone inspection sequence that gives the impression of a 10,000-frame cinematic — without loading 10,000 images.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** with custom dark institutional design tokens
- **Three.js** + **@react-three/fiber** + **@react-three/drei** (procedural drone, no GLB needed)
- **GSAP** + **ScrollTrigger** (scroll-bound cinematic timeline)
- **Lenis** (smooth scroll)
- **Zustand** (minimal scene state)

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
```

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # Fonts, metadata, smooth scroll, skip link, noscript
│   ├── page.tsx            # Composes all sections
│   ├── globals.css         # Design tokens, panel/HUD utilities
│   └── icon.svg            # Favicon
├── components/
│   ├── layout/             # Header, Footer
│   ├── system/             # SmoothScroll, NoScriptFallback
│   ├── ui/                 # Logo, HUDFrame, HUDLine, RadarGraphic, TechnicalCard, Icons, LoadingState
│   ├── three/
│   │   ├── DroneModel.tsx        # Procedural tactical drone (primitives only)
│   │   ├── DroneScene.tsx        # R3F canvas, lighting, scroll-bound choreography
│   │   ├── CinematicStage.tsx    # 7VH pinned section, ScrollTrigger → scene state
│   │   ├── StaticDronePoster.tsx # SVG fallback (reduced motion / no WebGL)
│   │   └── sceneState.ts         # zustand store: progress, phase
│   ├── cinematic/
│   │   ├── CinematicHUD.tsx      # Always-on telemetry chrome
│   │   ├── CinematicOverlay.tsx  # Phase-driven copy crossfade
│   │   └── phases/               # HeroCopy, InspectionCopy, SpecLock, FeatureCallouts, CommandLayer, LockupCopy
│   └── sections/                  # PlatformOverview, Specifications, Capabilities,
│                                  # CommandInterface, EngineeringFocus,
│                                  # DeploymentContext, TechnicalBriefCTA
└── lib/                            # cn, useReducedMotion, useDeviceCapability
```

## Cinematic phases

| # | Range (scroll progress) | Phase           | What happens                                   |
|---|-------------------------|-----------------|------------------------------------------------|
| 1 | 0.00 – 0.14             | System wake     | Drone silhouette, key light fades in           |
| 2 | 0.14 – 0.30             | Hero reveal     | Camera approaches, hero copy + CTAs visible    |
| 3 | 0.30 – 0.50             | Inspection orbit| Camera orbits 0 → 216° around drone            |
| 4 | 0.50 – 0.66             | Specification lock | Drone shifts left, spec datasheet on right  |
| 5 | 0.66 – 0.80             | Feature mapping | Three-quarter pose with four corner callouts   |
| 6 | 0.80 – 0.92             | Command layer   | Drone scales down, dashboard concept reveals   |
| 7 | 0.92 – 1.00             | Final lockup    | Centered front-facing pose, mission-ready CTA  |

All camera and drone transforms are **interpolated in real time** with frame-rate-independent damping — no frame sequences are loaded.

## Performance

- Procedural geometry only (no GLB to download)
- Adaptive DPR + adaptive events
- Shadows only on `tier === 'high'`
- Environment maps disabled on `tier === 'low'`
- ScrollTrigger scrub adapts (0.6 on low-power, 0.8 elsewhere)
- Static SVG poster swap on `prefers-reduced-motion` or missing WebGL
- Lenis disabled on `prefers-reduced-motion`

## Content governance

This site uses **only the verified specifications** provided in the brief:

- Dimensions: `395 × 395 × 190 mm`
- Weight: `1180 g`
- Application: Defense and security operations
- System role: Compact tactical aerial platform
- Operational focus: Mobility, control and rapid integration

It does **not** invent: flight time, range, speed, altitude, payload, communication protocols, encryption, autonomy, AI, sensor specifications, or environmental ratings. The command interface section is explicitly framed as a **conceptual UI**.

## Drone model

A photorealistic GLB was not supplied with the brief. To stay shippable, the drone is built from primitives in `DroneModel.tsx` (frame, arms, motors, three-blade props, top dome antenna, front camera turret, whip antennas, landing skids). When a real GLB becomes available, drop it in `public/models/drom.glb` and replace the procedural geometry with `useGLTF` — the choreography rig will continue to work unchanged.

## Accessibility

- Skip-to-content link
- Semantic landmarks (`header`, `main`, `section`, `footer`, `nav`, `article`)
- Visible keyboard focus rings (signal-blue)
- Decorative motion respects `prefers-reduced-motion`
- WebGL absence is detected; static schematic shown
- Color is never the sole signal — labels accompany every status chip

## SEO

`<head>` ships with title template, description, Open Graph, Twitter card, theme color, and color scheme. Add a real OG image at `public/og.png` before launch.
