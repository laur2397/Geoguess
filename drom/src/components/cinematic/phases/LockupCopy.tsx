'use client';

export function LockupCopy() {
  return (
    <div className="absolute inset-0 flex items-end pb-20 md:pb-28">
      <div className="shell w-full">
        <div className="max-w-3xl mx-auto text-center">
          <span className="eyebrow">PLATFORM CONCLUSION</span>
          <h2 className="mt-4 font-display text-h2 md:text-h1 font-light text-text-primary leading-[1.05]">
            Mission-ready aerial platform
            <span className="block text-text-secondary">for demanding operational environments.</span>
          </h2>
          <div className="mt-8 flex items-center justify-center gap-4 pointer-events-auto">
            <a href="#technical-brief" className="btn-primary">
              Request Technical Brief
            </a>
            <a href="#technical-brief" className="btn-ghost">
              Contact Product Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
