'use client';

export function InspectionCopy() {
  return (
    <div className="absolute inset-0 flex items-end pb-24 md:items-center md:pb-0">
      <div className="shell w-full">
        <div className="flex flex-col gap-3 max-w-md">
          <span className="eyebrow">PRODUCT INSPECTION</span>
          <h2 className="font-display text-h3 md:text-h2 font-light text-text-primary leading-tight">
            Structured rotation.
            <span className="block text-text-secondary">Mechanical clarity.</span>
          </h2>
          <p className="text-body text-text-secondary max-w-prose">
            DROM is presented through a controlled inspection sequence, designed to reveal
            structural geometry, material discipline and the deliberate restraint of its
            tactical form factor.
          </p>
        </div>
      </div>

      {/* Measurement overlays */}
      <div className="pointer-events-none absolute inset-0">
        <Measurement label="395 mm" position="top" />
        <Measurement label="190 mm" position="right" />
      </div>
    </div>
  );
}

function Measurement({ label, position }: { label: string; position: 'top' | 'right' | 'bottom' | 'left' }) {
  const styles: Record<string, string> = {
    top: 'top-[20%] left-1/2 -translate-x-1/2 flex-row',
    right: 'top-1/2 right-[8%] -translate-y-1/2 flex-col',
    bottom: 'bottom-[20%] left-1/2 -translate-x-1/2 flex-row',
    left: 'top-1/2 left-[8%] -translate-y-1/2 flex-col',
  };
  return (
    <div className={`absolute hidden md:flex items-center gap-2 ${styles[position]}`}>
      {position === 'top' || position === 'bottom' ? (
        <>
          <span className="h-px w-16 bg-signal-blue/50" />
          <span className="font-mono text-micro uppercase text-signal-cyan/80 tracking-widest">{label}</span>
          <span className="h-px w-16 bg-signal-blue/50" />
        </>
      ) : (
        <>
          <span className="w-px h-12 bg-signal-blue/50" />
          <span className="font-mono text-micro uppercase text-signal-cyan/80 tracking-widest">{label}</span>
          <span className="w-px h-12 bg-signal-blue/50" />
        </>
      )}
    </div>
  );
}
