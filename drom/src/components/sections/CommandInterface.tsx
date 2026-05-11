import { SectionHeader } from './SectionHeader';
import { RadarGraphic } from '@/components/ui/RadarGraphic';
import { HUDLine } from '@/components/ui/HUDLine';

const MODULES = [
  'SYSTEM READINESS',
  'DEVICE PROFILE',
  'MISSION STATUS',
  'SIGNAL STATUS',
  'TELEMETRY',
  'MAP GRID',
  'OPERATIONAL NOTES',
  'ACCESS STATUS',
];

export function CommandInterface() {
  return (
    <section id="interface" className="relative py-28 md:py-36 bg-ink-900/60">
      <div className="absolute inset-0 grid-overlay opacity-[0.10] pointer-events-none" aria-hidden />
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Copy */}
          <div className="lg:col-span-5">
            <SectionHeader
              index="06 / INTERFACE"
              eyebrow="COMMAND INTERFACE LAYER"
              title={
                <>
                  Structured for
                  <span className="block text-text-secondary">situational clarity.</span>
                </>
              }
              intro={
                <>
                  A structured command interface concept designed to support situational
                  awareness, device monitoring and operational clarity. This section presents
                  the interface as a conceptual layer; specific software functionality is
                  validated under the technical brief.
                </>
              }
            />

            <ul className="mt-10 grid grid-cols-2 gap-px bg-border-subtle border border-border-blue/30 rounded-sm overflow-hidden">
              {MODULES.map((m) => (
                <li key={m} className="bg-ink-900/80 px-4 py-3 micro text-text-secondary">
                  {m}
                </li>
              ))}
            </ul>
          </div>

          {/* Dashboard visual */}
          <div className="lg:col-span-7">
            <div className="panel hud-corner relative p-5 md:p-6 overflow-hidden">
              <div className="absolute inset-0 grid-overlay-fine opacity-[0.10] pointer-events-none" aria-hidden />

              <div className="relative grid gap-4 md:grid-cols-3">
                {/* Status block */}
                <div className="md:col-span-1 space-y-3">
                  <Block label="DEVICE PROFILE" value="DROM PLATFORM" />
                  <Block label="SYSTEM READINESS" value="ONLINE" tone="cyan" />
                  <Block label="MISSION STATUS" value="STANDBY" />
                  <Block label="SIGNAL STATUS" value="LINK CHECK" tone="amber" />
                </div>

                {/* Radar / map */}
                <div className="md:col-span-1 panel-deep p-4 flex flex-col items-center">
                  <div className="flex w-full items-center justify-between">
                    <span className="micro text-text-muted">MAP GRID</span>
                    <span className="micro text-text-secondary">CONCEPT</span>
                  </div>
                  <RadarGraphic className="my-3" size={180} />
                  <div className="w-full mt-2 flex items-center justify-between">
                    <span className="micro text-text-muted">SECTOR</span>
                    <span className="font-mono text-micro text-text-secondary">A · 04</span>
                  </div>
                </div>

                {/* Telemetry */}
                <div className="md:col-span-1 panel-deep p-4">
                  <span className="micro text-text-muted">TELEMETRY · SIMULATED UI</span>
                  <div className="mt-3 space-y-2">
                    {['ATTITUDE', 'VECTOR', 'BUS', 'I/O'].map((row) => (
                      <div key={row}>
                        <div className="flex items-center justify-between">
                          <span className="micro text-text-muted">{row}</span>
                          <span className="font-mono text-micro text-text-secondary">—</span>
                        </div>
                        <div className="mt-1 h-px bg-border-blue/40" />
                      </div>
                    ))}
                  </div>
                  <HUDLine className="my-4" />
                  <div className="flex items-center justify-between">
                    <span className="micro text-text-muted">CONTROL MODE</span>
                    <span className="font-mono text-label text-text-primary">OPERATOR REVIEW</span>
                  </div>
                </div>
              </div>

              <div className="relative mt-5 flex items-center justify-between">
                <span className="micro text-text-muted">SECURE ACCESS LABEL · CONCEPTUAL UI</span>
                <span className="micro text-text-muted">DROM / INTERFACE PREVIEW</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Block({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'cyan' | 'amber';
}) {
  const tones: Record<string, string> = {
    neutral: 'text-text-primary',
    cyan: 'text-signal-cyan',
    amber: 'text-signal-amber',
  };
  return (
    <div className="panel-deep p-4">
      <span className="micro text-text-muted">{label}</span>
      <div className={`mt-2 font-mono text-label uppercase ${tones[tone]}`}>{value}</div>
    </div>
  );
}
