'use client';

export function HeroCopy() {
  return (
    <div className="absolute inset-0 flex items-end pb-20 md:pb-28">
      <div className="shell w-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-signal-blue/70" />
          <span className="font-mono text-micro uppercase tracking-widest text-text-muted">
            COMPACT AERIAL PLATFORM
          </span>
        </div>

        <h1 className="font-display font-light text-[12vw] md:text-[7vw] lg:text-[6.5rem] leading-[0.9] text-text-primary tracking-tight">
          DROM
        </h1>

        <p className="mt-5 max-w-[28ch] text-lead text-text-secondary">
          Advanced aerial system for defense applications.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3 pointer-events-auto">
          <a href="#inspection" className="btn-primary">
            Explore Platform
          </a>
          <a href="#technical-brief" className="btn-ghost">
            Request Brief
          </a>
        </div>
      </div>
    </div>
  );
}
