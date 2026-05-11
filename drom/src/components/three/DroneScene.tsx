'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  ContactShadows,
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';
import { DroneModel } from './DroneModel';
import { useSceneState } from './sceneState';
import { useDeviceCapability } from '@/lib/useDeviceCapability';

const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(current, target, lambda, dt);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Phase choreography — keyframes for camera and drone.
 * All values interpolate continuously; transitions are dramatic but never disorienting.
 */
interface Pose {
  cam: THREE.Vector3;
  tgt: THREE.Vector3;
  /** drone yaw, pitch, bank (radians) */
  rot: THREE.Vector3;
  pos: THREE.Vector3;
  scale: number;
  /** 0..1, used to drive prop spin speed and key-light intensity */
  energy: number;
  fov: number;
}

function pose(
  cam: [number, number, number],
  tgt: [number, number, number],
  rot: [number, number, number],
  pos: [number, number, number],
  scale: number,
  energy: number,
  fov: number,
): Pose {
  return {
    cam: new THREE.Vector3(...cam),
    tgt: new THREE.Vector3(...tgt),
    rot: new THREE.Vector3(...rot),
    pos: new THREE.Vector3(...pos),
    scale,
    energy,
    fov,
  };
}

function Choreography({ tier }: { tier: ReturnType<typeof useDeviceCapability>['tier'] }) {
  const { camera } = useThree();
  const droneRef = useRef<THREE.Group>(null!);
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const energyRef = useRef(0);
  const propEnergyRef = useRef(0);

  // Working pose (mutated each frame) and tmp pose for orbit math
  const working = useMemo<Pose>(
    () => pose([0, 0, 8], [0, 0, 0], [0, 0, 0], [0, 0, 0], 1, 0, 32),
    [],
  );

  useFrame((state, dt) => {
    const p = useSceneState.getState().progress;
    const t = state.clock.elapsedTime;

    // ===== Build target pose for current scroll =====
    let camX = 0, camY = 0, camZ = 8;
    let tgtX = 0, tgtY = 0, tgtZ = 0;
    let yaw = 0, pitch = 0, bank = 0;
    let dx = 0, dy = 0, dz = 0;
    let scale = 1;
    let energy = 0;
    let fov = 30;

    if (p < 0.10) {
      // PHASE 1 — WAKE: deep darkness, drone barely visible, slowly emerges
      const k = p / 0.10;
      camZ = lerp(9, 6.5, easeOut(k));
      camY = lerp(-0.2, 0.1, k);
      camX = lerp(-0.3, 0.1, k);
      pitch = lerp(0.18, 0.05, k); // slight upward look (drone seen from below)
      energy = lerp(0, 0.15, k);
      fov = lerp(38, 34, k);
    } else if (p < 0.22) {
      // PHASE 2 — IGNITION: dolly forward, drone tilts forward, props ramp up
      const k = (p - 0.10) / (0.22 - 0.10);
      camZ = lerp(6.5, 3.6, easeOut(k));
      camY = lerp(0.1, 0.45, k);
      camX = lerp(0.1, 0, k);
      pitch = lerp(0.05, -0.18, k); // pitch FORWARD as if powering up
      bank = Math.sin(t * 0.8) * 0.04;
      energy = lerp(0.15, 0.85, k);
      fov = lerp(34, 30, k);
    } else if (p < 0.45) {
      // PHASE 3 — FULL ORBIT: 720° around drone, with vertical wave
      const k = (p - 0.22) / (0.45 - 0.22);
      const angle = lerp(0, Math.PI * 2.0, ease(k)); // 720° — really wraps around
      const radius = lerp(3.6, 2.6, k);
      camX = Math.sin(angle) * radius;
      camZ = Math.cos(angle) * radius;
      camY = lerp(0.45, 0.65, k) + Math.sin(k * Math.PI) * 0.4; // dip + rise
      pitch = lerp(-0.18, -0.06, k);
      bank = Math.sin(angle) * 0.12; // drone banks INTO the orbit
      yaw = -angle * 0.15; // counter-rotate slightly
      energy = 0.95;
      fov = lerp(30, 28, k);
    } else if (p < 0.55) {
      // PHASE 4 — MACRO: dive close to camera turret, see the lens
      const k = (p - 0.45) / (0.55 - 0.45);
      camX = lerp(0, 0.4, easeOut(k));
      camY = lerp(0.65, 0.25, k);
      camZ = lerp(2.6, 1.4, easeOut(k));
      tgtZ = lerp(0, 0.25, k); // look at the front of the drone
      tgtY = lerp(0, 0.18, k);
      pitch = lerp(-0.06, 0, k);
      bank = 0;
      yaw = lerp(0, 0.15, k);
      energy = 0.9;
      fov = lerp(28, 24, k); // tighter focal length for macro
    } else if (p < 0.66) {
      // PHASE 5 — SPECIFICATION LOCK: profile shot, drone shifts left
      const k = (p - 0.55) / (0.66 - 0.55);
      camX = lerp(0.4, 2.4, ease(k));
      camY = lerp(0.25, 0.45, k);
      camZ = lerp(1.4, 1.8, k);
      tgtX = lerp(0.25, 0, k);
      tgtY = lerp(0.18, 0.05, k);
      tgtZ = lerp(0.25, 0, k);
      yaw = lerp(0.15, 0.5, k);
      pitch = lerp(0, -0.04, k);
      dx = lerp(0, -0.55, ease(k)); // shift LEFT
      energy = 0.85;
      fov = lerp(24, 30, k);
    } else if (p < 0.78) {
      // PHASE 6 — FEATURE STUDY: wide three-quarter, drone centered
      const k = (p - 0.66) / (0.78 - 0.66);
      camX = lerp(2.4, 1.8, k);
      camY = lerp(0.45, 0.5, k);
      camZ = lerp(1.8, 3.2, ease(k));
      tgtX = lerp(0, 0, k);
      tgtY = 0;
      tgtZ = 0;
      yaw = lerp(0.5, 0.25, k);
      pitch = lerp(-0.04, -0.02, k);
      bank = 0;
      dx = lerp(-0.55, 0, ease(k));
      energy = 0.8;
      fov = lerp(30, 32, k);
    } else if (p < 0.90) {
      // PHASE 7 — COMMAND TRANSITION: pull WAY back, drone shrinks, drifts up-right
      const k = (p - 0.78) / (0.90 - 0.78);
      camX = lerp(1.8, 0.4, k);
      camY = lerp(0.5, 1.0, ease(k));
      camZ = lerp(3.2, 6.5, ease(k));
      yaw = lerp(0.25, 0.05, k);
      pitch = lerp(-0.02, -0.08, k);
      scale = lerp(1, 0.55, ease(k));
      dx = lerp(0, 0.7, k);
      dy = lerp(0, 0.4, k);
      energy = lerp(0.8, 0.55, k);
      fov = lerp(32, 36, k);
    } else {
      // PHASE 8 — LOCKUP: fly-forward, drone returns to centered hero pose
      const k = (p - 0.90) / (1.0 - 0.90);
      camX = lerp(0.4, 0, ease(k));
      camY = lerp(1.0, 0.4, ease(k));
      camZ = lerp(6.5, 3.4, ease(k));
      yaw = lerp(0.05, -0.25, k); // turn to slight 3/4
      pitch = lerp(-0.08, -0.06, k);
      scale = lerp(0.55, 1.05, ease(k));
      dx = lerp(0.7, 0, ease(k));
      dy = lerp(0.4, 0, ease(k));
      energy = lerp(0.55, 0.9, k);
      fov = lerp(36, 30, k);
    }

    // Idle micro-drift so static moments still feel alive
    const breathe = Math.sin(t * 0.6) * 0.012;
    const sway = Math.sin(t * 0.45 + 1.3) * 0.018;

    working.cam.set(camX + sway, camY + breathe, camZ);
    working.tgt.set(tgtX, tgtY + breathe * 0.5, tgtZ);
    working.rot.set(pitch, yaw, bank);
    working.pos.set(dx, dy, dz);
    working.scale = scale;
    working.energy = energy;
    working.fov = fov;

    // ===== Damp toward target =====
    const lambda = tier === 'low' ? 5 : 7;
    camera.position.x = damp(camera.position.x, working.cam.x, lambda, dt);
    camera.position.y = damp(camera.position.y, working.cam.y, lambda, dt);
    camera.position.z = damp(camera.position.z, working.cam.z, lambda, dt);

    lookAtRef.current.x = damp(lookAtRef.current.x, working.tgt.x, lambda, dt);
    lookAtRef.current.y = damp(lookAtRef.current.y, working.tgt.y, lambda, dt);
    lookAtRef.current.z = damp(lookAtRef.current.z, working.tgt.z, lambda, dt);
    camera.lookAt(lookAtRef.current);

    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const persp = camera as THREE.PerspectiveCamera;
      persp.fov = damp(persp.fov, working.fov, lambda, dt);
      persp.updateProjectionMatrix();
    }

    if (droneRef.current) {
      droneRef.current.rotation.x = damp(droneRef.current.rotation.x, working.rot.x, lambda, dt);
      droneRef.current.rotation.y = damp(droneRef.current.rotation.y, working.rot.y, lambda, dt);
      droneRef.current.rotation.z = damp(droneRef.current.rotation.z, working.rot.z, lambda, dt);
      droneRef.current.position.x = damp(droneRef.current.position.x, working.pos.x, lambda, dt);
      droneRef.current.position.y = damp(droneRef.current.position.y, working.pos.y, lambda, dt);
      droneRef.current.position.z = damp(droneRef.current.position.z, working.pos.z, lambda, dt);
      const ns = damp(droneRef.current.scale.x, working.scale, lambda, dt);
      droneRef.current.scale.setScalar(ns);
    }

    energyRef.current = damp(energyRef.current, working.energy, 4, dt);
    propEnergyRef.current = damp(propEnergyRef.current, working.energy, 3, dt);
  });

  // Pass live energy refs into the model so prop speed reacts
  return (
    <group ref={droneRef}>
      <DroneModel propEnergyRef={propEnergyRef} hover={tier !== 'low'} />
    </group>
  );
}

function DynamicLighting({ tier }: { tier: ReturnType<typeof useDeviceCapability>['tier'] }) {
  const keyRef = useRef<THREE.SpotLight>(null!);
  const rimRef = useRef<THREE.DirectionalLight>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (keyRef.current) {
      keyRef.current.intensity = 1.2 + Math.sin(t * 0.3) * 0.15;
    }
    if (rimRef.current) {
      rimRef.current.intensity = 1.4 + Math.sin(t * 0.5 + 1) * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.16} color="#1a2030" />
      <spotLight
        ref={keyRef}
        position={[3.2, 5.5, 4]}
        angle={0.55}
        penumbra={0.92}
        intensity={1.3}
        color="#dde7ff"
        castShadow={tier === 'high'}
        shadow-mapSize-width={tier === 'high' ? 1024 : 512}
        shadow-mapSize-height={tier === 'high' ? 1024 : 512}
        shadow-bias={-0.0005}
      />
      <directionalLight ref={rimRef} position={[-4.5, 1.8, -3]} intensity={1.4} color="#1d6fff" />
      <directionalLight position={[2, -1, -2]} intensity={0.6} color="#00aeef" />
      <pointLight position={[0, -1.2, 2.5]} intensity={0.35} color="#1a2540" />
      {/* Subtle warm kicker on the camera side of the drone */}
      <pointLight position={[1.5, 1.2, 2]} intensity={0.25} color="#ffb27a" />
    </>
  );
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#05070b" roughness={0.95} metalness={0.1} />
    </mesh>
  );
}

interface DroneSceneProps {
  className?: string;
}

export function DroneScene({ className }: DroneSceneProps) {
  const cap = useDeviceCapability();
  const dpr = useMemo<[number, number]>(
    () => [1, Math.min(cap.dpr, cap.tier === 'low' ? 1.2 : 1.75)],
    [cap.dpr, cap.tier],
  );
  const setReady = useSceneState((s) => s.setReady);

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 32, near: 0.1, far: 60 }}
        dpr={dpr}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
          stencil: false,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.fog = new THREE.Fog(0x030508, 6, 22);
          gl.toneMappingExposure = 1.05;
          setReady(true);
        }}
        shadows={cap.tier === 'high'}
      >
        <PerformanceMonitor />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        <Suspense fallback={null}>
          <DynamicLighting tier={cap.tier} />
          {cap.tier !== 'low' && (
            <Environment preset="warehouse" environmentIntensity={0.22} />
          )}

          <GroundPlane />

          <Choreography tier={cap.tier} />

          {/* Floating dust particles — gives the air "weight" */}
          {cap.tier !== 'low' && (
            <Sparkles
              count={cap.tier === 'high' ? 60 : 30}
              scale={[6, 3, 6] as unknown as number}
              size={1.2}
              speed={0.25}
              opacity={0.4}
              color="#9bb6ff"
            />
          )}

          <ContactShadows
            position={[0, -0.42, 0]}
            opacity={0.7}
            scale={6}
            blur={2.8}
            far={3}
            color="#000000"
            resolution={cap.tier === 'high' ? 512 : 256}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
