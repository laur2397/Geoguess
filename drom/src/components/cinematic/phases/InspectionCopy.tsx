'use client';

/**
 * Phase 3 — full orbit. Intentionally wordless: let the drone breathe.
 * A single corner tag in the bottom-right reinforces context without crowding.
 */
export function InspectionCopy() {
  return (
    <div className="absolute inset-0 flex items-end justify-end pb-20 pr-8">
      <div className="text-right">
        <div className="font-mono text-micro uppercase tracking-widest text-text-muted">
          FULL ROTATION · 720°
        </div>
        <div className="font-mono text-micro uppercase tracking-widest text-signal-cyan/80 mt-1">
          STRUCTURED INSPECTION
        </div>
      </div>
    </div>
  );
}
