import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CinematicStage } from '@/components/three/CinematicStage';
import { PlatformOverview } from '@/components/sections/PlatformOverview';
import { Specifications } from '@/components/sections/Specifications';
import { Capabilities } from '@/components/sections/Capabilities';
import { CommandInterface } from '@/components/sections/CommandInterface';
import { EngineeringFocus } from '@/components/sections/EngineeringFocus';
import { DeploymentContext } from '@/components/sections/DeploymentContext';
import { TechnicalBriefCTA } from '@/components/sections/TechnicalBriefCTA';
import { InspectionAnchor } from '@/components/sections/InspectionAnchor';

export default function Home() {
  return (
    <main id="top">
      <Header />

      {/* SECTION 1 + 3 — Hero + Cinematic Inspection (one continuous pinned stage) */}
      <InspectionAnchor>
        <CinematicStage />
      </InspectionAnchor>

      {/* SECTION 2 — Platform Overview */}
      <PlatformOverview />

      {/* SECTION 4 — Key Specifications */}
      <Specifications />

      {/* SECTION 5 — Operational Capabilities */}
      <Capabilities />

      {/* SECTION 6 — Interface / Command Layer */}
      <CommandInterface />

      {/* SECTION 7 — Engineering Focus */}
      <EngineeringFocus />

      {/* SECTION 8 — Deployment Context */}
      <DeploymentContext />

      {/* SECTION 9 — Technical Brief CTA */}
      <TechnicalBriefCTA />

      {/* SECTION 10 — Footer */}
      <Footer />
    </main>
  );
}
