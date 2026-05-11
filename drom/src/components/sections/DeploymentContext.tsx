import { SectionHeader } from './SectionHeader';

const CONTEXTS = [
  'Security Operations',
  'Infrastructure Monitoring',
  'Field Evaluation',
  'Tactical Workflow Integration',
  'Technical Demonstration',
  'Institutional Procurement Review',
];

export function DeploymentContext() {
  return (
    <section id="deployment" className="relative py-28 md:py-36 bg-ink-900/60">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeader
            index="08 / DEPLOYMENT"
            eyebrow="DEPLOYMENT CONTEXT"
            title={
              <>
                Built for evaluation by
                <span className="block text-text-secondary">institutional stakeholders.</span>
              </>
            }
            intro={
              <>
                DROM is positioned for professional environments where compact aerial mobility,
                structured control and rapid integration are important evaluation criteria. The
                platform presentation is designed for stakeholders assessing portability,
                operational workflow fit and technical integration requirements.
              </>
            }
          />
        </div>

        <div className="lg:col-span-7">
          <div className="panel hud-corner p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="label">CONTEXT MATRIX</span>
              <span className="micro text-text-muted">EVALUATION SCOPE</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-subtle border border-border-blue/30 rounded-sm overflow-hidden">
              {CONTEXTS.map((ctx, i) => (
                <li key={ctx} className="bg-ink-900/80 p-5">
                  <div className="flex items-center justify-between">
                    <span className="micro text-text-muted">CTX-{String(i + 1).padStart(2, '0')}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-signal-cyan/80" />
                  </div>
                  <div className="mt-3 font-display text-h6 text-text-primary">{ctx}</div>
                </li>
              ))}
            </ul>
            <p className="mt-6 micro text-text-muted">
              CONTEXT LABELS DESCRIBE EVALUATION DOMAINS. THEY DO NOT CONSTITUTE OPERATIONAL CLAIMS.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
