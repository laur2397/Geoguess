'use client';

import { useSceneState } from '@/components/three/sceneState';
import { HeroCopy } from './phases/HeroCopy';
import { InspectionCopy } from './phases/InspectionCopy';
import { SpecLock } from './phases/SpecLock';
import { FeatureCallouts } from './phases/FeatureCallouts';
import { CommandLayer } from './phases/CommandLayer';
import { LockupCopy } from './phases/LockupCopy';

const range = (p: number, a: number, b: number, fadeIn = 0.05, fadeOut = 0.05) => {
  if (p < a - fadeIn) return 0;
  if (p > b + fadeOut) return 0;
  if (p < a) return (p - (a - fadeIn)) / fadeIn;
  if (p > b) return 1 - (p - b) / fadeOut;
  return 1;
};

export function CinematicOverlay() {
  const p = useSceneState((s) => s.progress);

  const opacities = {
    hero: range(p, 0.0, 0.28, 0.0, 0.05),
    inspection: range(p, 0.30, 0.48, 0.04, 0.05),
    spec: range(p, 0.50, 0.64, 0.04, 0.05),
    features: range(p, 0.66, 0.78, 0.04, 0.05),
    command: range(p, 0.80, 0.90, 0.04, 0.05),
    lockup: range(p, 0.92, 1.0, 0.04, 0.0),
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <Layer opacity={opacities.hero}>
        <HeroCopy />
      </Layer>
      <Layer opacity={opacities.inspection}>
        <InspectionCopy />
      </Layer>
      <Layer opacity={opacities.spec}>
        <SpecLock />
      </Layer>
      <Layer opacity={opacities.features}>
        <FeatureCallouts />
      </Layer>
      <Layer opacity={opacities.command}>
        <CommandLayer />
      </Layer>
      <Layer opacity={opacities.lockup}>
        <LockupCopy />
      </Layer>
    </div>
  );
}

function Layer({ opacity, children }: { opacity: number; children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 transition-opacity duration-300"
      style={{
        opacity,
        visibility: opacity < 0.02 ? 'hidden' : 'visible',
        pointerEvents: opacity > 0.4 ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
}
