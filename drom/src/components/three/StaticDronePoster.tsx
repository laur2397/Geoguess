'use client';

/**
 * Performant fallback shown when WebGL is unavailable or prefers-reduced-motion is set.
 * Pure SVG schematic of the drone in three-quarter perspective — no canvas, no animation.
 */
export function StaticDronePoster() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-0 grid-overlay-fine opacity-30" aria-hidden />
      <svg
        viewBox="0 0 600 480"
        className="relative w-[88%] max-w-[760px] text-text-primary"
        aria-label="DROM compact aerial platform — schematic"
        role="img"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1c2330" />
            <stop offset="1" stopColor="#0a0d13" />
          </linearGradient>
          <linearGradient id="armGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0e131c" />
            <stop offset="1" stopColor="#1a2230" />
          </linearGradient>
        </defs>

        {/* Center frame */}
        <rect x="240" y="220" width="120" height="60" rx="2" fill="url(#bodyGrad)" stroke="rgba(80,140,255,0.4)" />
        {/* Dome */}
        <ellipse cx="300" cy="200" rx="44" ry="22" fill="#0d1118" stroke="rgba(80,140,255,0.45)" />
        <line x1="300" y1="220" x2="300" y2="222" stroke="#22262d" strokeWidth="3" />
        {/* Camera */}
        <rect x="290" y="265" width="20" height="20" fill="#12161c" stroke="rgba(80,140,255,0.4)" />
        <circle cx="300" cy="288" r="5" fill="#05080d" stroke="rgba(80,140,255,0.6)" />

        {/* Arms */}
        {[
          { x1: 260, y1: 240, x2: 130, y2: 170 },
          { x1: 340, y1: 240, x2: 470, y2: 170 },
          { x1: 260, y1: 270, x2: 130, y2: 330 },
          { x1: 340, y1: 270, x2: 470, y2: 330 },
        ].map((a, i) => (
          <line key={i} {...a} stroke="url(#armGrad)" strokeWidth="14" strokeLinecap="square" />
        ))}

        {/* Motors + props */}
        {[
          { x: 130, y: 170 },
          { x: 470, y: 170 },
          { x: 130, y: 330 },
          { x: 470, y: 330 },
        ].map((m, i) => (
          <g key={i}>
            <circle cx={m.x} cy={m.y} r="14" fill="#22262d" stroke="rgba(80,140,255,0.4)" />
            <circle cx={m.x} cy={m.y} r="9" fill="#6b3a1c" opacity="0.65" />
            <ellipse cx={m.x} cy={m.y} rx="50" ry="3" fill="#0a0d12" opacity="0.85" />
            <ellipse cx={m.x} cy={m.y} rx="50" ry="3" fill="#0a0d12" opacity="0.85" transform={`rotate(60 ${m.x} ${m.y})`} />
            <ellipse cx={m.x} cy={m.y} rx="50" ry="3" fill="#0a0d12" opacity="0.85" transform={`rotate(120 ${m.x} ${m.y})`} />
          </g>
        ))}

        {/* Whip antennas */}
        <line x1="334" y1="222" x2="370" y2="170" stroke="#22262d" strokeWidth="2" />
        <line x1="266" y1="222" x2="230" y2="170" stroke="#22262d" strokeWidth="2" />

        {/* Schematic labels */}
        <g fontFamily="ui-monospace, monospace" fontSize="10" fill="#6F7A89" letterSpacing="2">
          <text x="40" y="170">M-01</text>
          <text x="540" y="170">M-02</text>
          <text x="40" y="345">M-03</text>
          <text x="540" y="345">M-04</text>
          <text x="270" y="180" fill="#9AA4B2">DOME · ANT</text>
          <text x="278" y="320" fill="#9AA4B2">OPTIC</text>
        </g>

        {/* Crosshair */}
        <g stroke="rgba(80,140,255,0.25)" strokeWidth="1">
          <line x1="0" y1="240" x2="600" y2="240" />
          <line x1="300" y1="40" x2="300" y2="440" />
        </g>
      </svg>
    </div>
  );
}
