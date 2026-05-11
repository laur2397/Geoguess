'use client';

export function LockupCopy() {
  return (
    <div className="absolute inset-0 flex items-end pb-20 md:pb-24">
      <div className="shell w-full text-center">
        <h2 className="font-display text-h3 md:text-h2 font-light text-text-primary leading-tight max-w-2xl mx-auto">
          Mission-ready aerial platform.
        </h2>
        <div className="mt-6 flex items-center justify-center gap-3 pointer-events-auto">
          <a href="#technical-brief" className="btn-primary">
            Request Technical Brief
          </a>
        </div>
      </div>
    </div>
  );
}
