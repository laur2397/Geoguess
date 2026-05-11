'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { DroneModel } from './DroneModel';
import { useSceneState } from './sceneState';
import { useDeviceCapability } from '@/lib/useDeviceCapability';

/** Smooth lerp utility (frame-rate independent) */
const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(current, target, lambda, dt);

/**
 * Camera + drone choreography keyed to scene `progress` (0..1).
 * Uses interpolation only — feels like ~10k frames without loading any.
 */
function Choreography({ tier }: { tier: ReturnType<typeof useDeviceCapability>['tier'] }) {
  const { camera } = useThree();
  const droneRef = useRef<THREE.Group>(null!);
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  const desiredCamPos = useRef(new THREE.Vector3(0, 0.4, 4.2));
  const desiredCamTarget = useRef(new THREE.Vector3(0, 0, 0));
  const desiredDroneRot = useRef(new THREE.Euler(0, 0, 0));
  const desiredDronePos = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, dt) => {
    const p = useSceneState.getState().progress;

    // ===== Camera path =====
    // Phase 1 (0.00–0.14): far, low key-light, slight downward angle
    // Phase 2 (0.14–0.30): approach + reveal
    // Phase 3 (0.30–0.50): inspection orbit
    // Phase 4 (0.50–0.66): drone shifts left, spec panel space on right
    // Phase 5 (0.66–0.80): three-quarter feature mapping
    // Phase 6 (0.80–0.92): pull back, drone smaller, command interface space
    // Phase 7 (0.92–1.00): centered final lockup

    let camX = 0,
      camY = 0.4,
      camZ = 4.2;
    let tgtX = 0,
      tgtY = 0,
      tgtZ = 0;
    let droneRotY = 0;
    let droneX = 0;
    let droneScale = 1;

    if (p < 0.14) {
      const k = p / 0.14;
      camZ = lerp(5.6, 3.6, ease(k));
      camY = lerp(0.1, 0.45, k);
      droneRotY = lerp(-0.3, -0.1, k);
    } else if (p < 0.3) {
      const k = (p - 0.14) / (0.3 - 0.14);
      camZ = lerp(3.6, 2.6, ease(k));
      camY = lerp(0.45, 0.5, k);
      droneRotY = lerp(-0.1, 0.2, k);
    } else if (p < 0.5) {
      const k = (p - 0.3) / (0.5 - 0.3);
      // Inspection orbit
      const angle = lerp(0, Math.PI * 1.2, k);
      camX = Math.sin(angle) * 2.6;
      camZ = Math.cos(angle) * 2.6;
      camY = lerp(0.5, 0.65, k);
      droneRotY = lerp(0.2, 0.6, k);
    } else if (p < 0.66) {
      const k = (p - 0.5) / (0.66 - 0.5);
      // Spec lock — drone shifts visually left so right column reads
      const angle = lerp(Math.PI * 1.2, Math.PI * 0.85, k);
      camX = Math.sin(angle) * 2.4;
      camZ = Math.cos(angle) * 2.4;
      camY = lerp(0.65, 0.4, k);
      droneRotY = lerp(0.6, 0.3, k);
      droneX = lerp(0, -0.5, k);
    } else if (p < 0.8) {
      const k = (p - 0.66) / (0.8 - 0.66);
      // Three-quarter feature mapping
      camX = lerp(2.0, 1.6, k);
      camZ = lerp(2.0, 2.4, k);
      camY = lerp(0.4, 0.45, k);
      droneRotY = lerp(0.3, 0.5, k);
      droneX = lerp(-0.5, 0, k);
    } else if (p < 0.92) {
      const k = (p - 0.8) / (0.92 - 0.8);
      // Command interface — pull back, drone smaller
      camX = lerp(1.6, 0.8, k);
      camZ = lerp(2.4, 4.4, k);
      camY = lerp(0.45, 0.7, k);
      droneRotY = lerp(0.5, 0.1, k);
      droneScale = lerp(1, 0.78, k);
    } else {
      const k = (p - 0.92) / (1 - 0.92);
      // Lockup
      camX = lerp(0.8, 0.2, k);
      camZ = lerp(4.4, 3.4, k);
      camY = lerp(0.7, 0.45, k);
      droneRotY = lerp(0.1, -0.05, k);
      droneScale = lerp(0.78, 1, k);
    }

    desiredCamPos.current.set(camX, camY, camZ);
    desiredCamTarget.current.set(tgtX, tgtY, tgtZ);
    desiredDroneRot.current.set(0, droneRotY, 0);
    desiredDronePos.current.set(droneX, 0, 0);

    const lambda = tier === 'low' ? 4.5 : 6.5;
    camera.position.x = damp(camera.position.x, desiredCamPos.current.x, lambda, dt);
    camera.position.y = damp(camera.position.y, desiredCamPos.current.y, lambda, dt);
    camera.position.z = damp(camera.position.z, desiredCamPos.current.z, lambda, dt);

    targetRef.current.x = damp(targetRef.current.x, desiredCamTarget.current.x, lambda, dt);
    targetRef.current.y = damp(targetRef.current.y, desiredCamTarget.current.y, lambda, dt);
    targetRef.current.z = damp(targetRef.current.z, desiredCamTarget.current.z, lambda, dt);
    camera.lookAt(targetRef.current);

    if (droneRef.current) {
      droneRef.current.rotation.y = damp(
        droneRef.current.rotation.y,
        desiredDroneRot.current.y,
        lambda,
        dt,
      );
      droneRef.current.position.x = damp(
        droneRef.current.position.x,
        desiredDronePos.current.x,
        lambda,
        dt,
      );
      const targetScale = droneScale;
      const cur = droneRef.current.scale.x;
      const ns = damp(cur, targetScale, lambda, dt);
      droneRef.current.scale.setScalar(ns);
    }

    // Idle subtle drift on camera so the scene never feels static
    const t = state.clock.elapsedTime;
    camera.position.x += Math.sin(t * 0.3) * 0.01;
    camera.position.y += Math.cos(t * 0.4) * 0.006;
  });

  return (
    <group ref={droneRef}>
      <DroneModel spinProps={tier !== 'low'} hover={tier !== 'low'} />
    </group>
  );
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function StudioLighting({ tier }: { tier: ReturnType<typeof useDeviceCapability>['tier'] }) {
  return (
    <>
      <ambientLight intensity={0.18} color="#1a2030" />
      {/* Key light */}
      <spotLight
        position={[3, 5, 4]}
        angle={0.55}
        penumbra={0.85}
        intensity={1.4}
        color="#dbe6ff"
        castShadow={tier === 'high'}
        shadow-mapSize-width={tier === 'high' ? 1024 : 512}
        shadow-mapSize-height={tier === 'high' ? 1024 : 512}
      />
      {/* Blue rim */}
      <directionalLight position={[-4, 2, -3]} intensity={0.9} color="#1d6fff" />
      {/* Subtle top accent */}
      <directionalLight position={[0, 6, 0]} intensity={0.35} color="#00aeef" />
      {/* Fill */}
      <pointLight position={[0, -2, 3]} intensity={0.25} color="#2b3a55" />
    </>
  );
}

interface DroneSceneProps {
  className?: string;
}

export function DroneScene({ className }: DroneSceneProps) {
  const cap = useDeviceCapability();
  const dpr = useMemo<[number, number]>(() => [1, Math.min(cap.dpr, cap.tier === 'low' ? 1.2 : 1.75)], [cap.dpr, cap.tier]);
  const setReady = useSceneState((s) => s.setReady);

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.4, 4.2], fov: 32, near: 0.1, far: 50 }}
        dpr={dpr}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
          stencil: false,
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.fog = new THREE.Fog(0x030508, 7, 18);
          setReady(true);
        }}
        shadows={cap.tier === 'high'}
      >
        <PerformanceMonitor />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        <Suspense fallback={null}>
          <StudioLighting tier={cap.tier} />
          {cap.tier !== 'low' && <Environment preset="warehouse" environmentIntensity={0.18} />}

          <Choreography tier={cap.tier} />

          {/* Soft contact shadow under the drone */}
          <ContactShadows
            position={[0, -0.42, 0]}
            opacity={0.55}
            scale={6}
            blur={2.4}
            far={2.6}
            color="#000000"
            resolution={cap.tier === 'high' ? 512 : 256}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
