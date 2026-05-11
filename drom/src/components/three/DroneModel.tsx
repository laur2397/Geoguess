'use client';

import { forwardRef, useMemo, useRef, MutableRefObject } from 'react';
import { Group, MeshStandardMaterial, MeshPhysicalMaterial } from 'three';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

interface DroneModelProps {
  spinProps?: boolean;
  hover?: boolean;
  /** 0..1 — drives prop spin speed and accent intensity */
  propEnergyRef?: MutableRefObject<number>;
}

/**
 * Procedural tactical FPV-style drone.
 * Compact graphite frame, 4 arms with motors and props, central housing,
 * top dome antenna, front camera, and small whip antennas.
 * Built from primitives for performance — no external GLB required.
 */
export const DroneModel = forwardRef<Group, DroneModelProps>(function DroneModel(
  { spinProps = true, hover = true, propEnergyRef },
  ref,
) {
  const propRefs = useRef<Group[]>([]);
  const innerRef = useRef<Group>(null!);

  const matBody = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: 0x12161c,
        metalness: 0.55,
        roughness: 0.55,
        clearcoat: 0.25,
        clearcoatRoughness: 0.7,
        sheen: 0.05,
      }),
    [],
  );
  const matAccent = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x1d2230,
        metalness: 0.7,
        roughness: 0.4,
      }),
    [],
  );
  const matMetal = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x22262d,
        metalness: 0.95,
        roughness: 0.28,
      }),
    [],
  );
  const matCoil = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x6b3a1c,
        metalness: 0.85,
        roughness: 0.45,
      }),
    [],
  );
  const matLens = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: 0x05080d,
        metalness: 0.2,
        roughness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        transmission: 0.05,
      }),
    [],
  );
  const matDome = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x0d1118,
        metalness: 0.4,
        roughness: 0.65,
      }),
    [],
  );
  const matLED = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x1d6fff,
        emissive: 0x1d6fff,
        emissiveIntensity: 1.2,
        metalness: 0,
        roughness: 0.2,
      }),
    [],
  );
  const matProp = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x0a0d12,
        metalness: 0.1,
        roughness: 0.85,
        transparent: true,
        opacity: 0.95,
      }),
    [],
  );

  useFrame((_, delta) => {
    if (!spinProps) return;
    // Energy 0..1 → 6..70 rad/s. Idle = lazy spool, mid = combat-ready, high = blur.
    const energy = propEnergyRef?.current ?? 0.6;
    const speed = (6 + energy * 64) * delta;
    propRefs.current.forEach((p, i) => {
      if (p) p.rotation.y += i % 2 === 0 ? speed : -speed;
    });
  });

  // Arm endpoints (X-shape, slightly offset arms = compact tactical look)
  const arms = [
    { x: 1, z: 1 },
    { x: -1, z: 1 },
    { x: -1, z: -1 },
    { x: 1, z: -1 },
  ];
  const armReach = 0.95;

  return (
    <Float
      speed={hover ? 1.2 : 0}
      floatIntensity={hover ? 0.3 : 0}
      rotationIntensity={hover ? 0.05 : 0}
    >
      <group ref={ref}>
        <group ref={innerRef} rotation={[0, 0, 0]} scale={1}>
          {/* Lower belly plate */}
          <mesh position={[0, -0.15, 0]} castShadow receiveShadow material={matBody}>
            <boxGeometry args={[1.2, 0.06, 1.0]} />
          </mesh>

          {/* Mid carbon plate */}
          <mesh position={[0, 0.0, 0]} castShadow receiveShadow material={matAccent}>
            <boxGeometry args={[1.4, 0.04, 0.6]} />
          </mesh>

          {/* Central electronics housing */}
          <mesh position={[0, 0.18, 0]} castShadow receiveShadow material={matBody}>
            <boxGeometry args={[0.7, 0.32, 0.55]} />
          </mesh>
          {/* Housing top inset */}
          <mesh position={[0, 0.36, 0]} castShadow receiveShadow material={matAccent}>
            <boxGeometry args={[0.55, 0.04, 0.42]} />
          </mesh>
          {/* Heat-sink fins (subtle detail) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh
              key={i}
              position={[-0.32 + i * 0.13, 0.18, 0.29]}
              material={matMetal}
              castShadow
            >
              <boxGeometry args={[0.05, 0.22, 0.02]} />
            </mesh>
          ))}

          {/* Top dome antenna (signature element from product photo) */}
          <group position={[0, 0.55, -0.05]}>
            <mesh material={matMetal} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.22, 16]} />
            </mesh>
            <mesh position={[0, 0.18, 0]} material={matDome} castShadow>
              <sphereGeometry args={[0.32, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            {/* Dome inner rim */}
            <mesh position={[0, 0.18, 0]} material={matAccent}>
              <torusGeometry args={[0.32, 0.015, 8, 32]} />
            </mesh>
          </group>

          {/* Front camera turret */}
          <group position={[0, 0.18, 0.32]}>
            <mesh material={matBody} castShadow>
              <boxGeometry args={[0.22, 0.22, 0.18]} />
            </mesh>
            <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]} material={matMetal}>
              <cylinderGeometry args={[0.07, 0.08, 0.04, 24]} />
            </mesh>
            <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]} material={matLens}>
              <cylinderGeometry args={[0.055, 0.055, 0.02, 24]} />
            </mesh>
            {/* Status LED */}
            <mesh position={[0.08, 0.07, 0.1]} material={matLED}>
              <sphereGeometry args={[0.012, 8, 8]} />
            </mesh>
          </group>

          {/* Whip antennas */}
          {[
            { x: 0.4, z: -0.2, tilt: 0.25 },
            { x: -0.4, z: -0.2, tilt: -0.25 },
          ].map((a, i) => (
            <group key={i} position={[a.x, 0.32, a.z]} rotation={[0, 0, a.tilt]}>
              <mesh material={matMetal}>
                <cylinderGeometry args={[0.008, 0.012, 0.45, 8]} />
              </mesh>
              <mesh position={[0, 0.24, 0]} material={matAccent}>
                <sphereGeometry args={[0.018, 8, 8]} />
              </mesh>
            </group>
          ))}

          {/* Landing skids */}
          {[
            { x: 0.45, z: 0 },
            { x: -0.45, z: 0 },
          ].map((s, i) => (
            <group key={i} position={[s.x, -0.32, 0]}>
              <mesh material={matAccent}>
                <boxGeometry args={[0.02, 0.18, 0.5]} />
              </mesh>
              <mesh position={[0, -0.09, 0]} material={matAccent}>
                <boxGeometry args={[0.03, 0.02, 0.62]} />
              </mesh>
            </group>
          ))}

          {/* Arms + motors + propellers */}
          {arms.map((a, i) => {
            const ax = a.x * armReach;
            const az = a.z * armReach;
            const angle = Math.atan2(az, ax);
            return (
              <group key={i}>
                {/* Arm */}
                <group position={[ax / 2, -0.05, az / 2]} rotation={[0, -angle, 0]}>
                  <mesh material={matBody} castShadow>
                    <boxGeometry args={[Math.hypot(ax, az), 0.06, 0.12]} />
                  </mesh>
                  {/* arm fin underside */}
                  <mesh position={[0, -0.06, 0]} material={matAccent}>
                    <boxGeometry args={[Math.hypot(ax, az) * 0.7, 0.02, 0.06]} />
                  </mesh>
                </group>

                {/* Motor stack at arm tip */}
                <group position={[ax, 0.02, az]}>
                  <mesh position={[0, 0.05, 0]} material={matMetal} castShadow>
                    <cylinderGeometry args={[0.12, 0.12, 0.1, 24]} />
                  </mesh>
                  {/* coil ring (warm metallic accent) */}
                  <mesh position={[0, 0.085, 0]} material={matCoil}>
                    <torusGeometry args={[0.1, 0.018, 8, 24]} />
                  </mesh>
                  <mesh position={[0, 0.12, 0]} material={matMetal}>
                    <cylinderGeometry args={[0.05, 0.05, 0.05, 16]} />
                  </mesh>
                  {/* Bullnose prop guard nub */}
                  <mesh position={[0, 0.16, 0]} material={matAccent}>
                    <cylinderGeometry args={[0.02, 0.025, 0.04, 12]} />
                  </mesh>

                  {/* Propeller — 3 blades */}
                  <group ref={(el) => { if (el) propRefs.current[i] = el; }} position={[0, 0.18, 0]}>
                    {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((r, j) => (
                      <mesh
                        key={j}
                        rotation={[0, r, 0]}
                        position={[0, 0, 0]}
                        material={matProp}
                      >
                        <boxGeometry args={[0.42, 0.012, 0.05]} />
                      </mesh>
                    ))}
                    {/* Hub */}
                    <mesh material={matAccent}>
                      <cylinderGeometry args={[0.035, 0.035, 0.025, 12]} />
                    </mesh>
                  </group>
                </group>
              </group>
            );
          })}

          {/* Subtle bottom rim LEDs */}
          {arms.map((a, i) => (
            <mesh key={i} position={[a.x * 0.5, -0.18, a.z * 0.5]} material={matLED}>
              <sphereGeometry args={[0.012, 8, 8]} />
            </mesh>
          ))}
        </group>
      </group>
    </Float>
  );
});
