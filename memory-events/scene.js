import * as THREE from "three";

/**
 * Background 3D scene for Memory Events.
 * – A slowly rotating low-poly camera lens at the center
 * – Floating animated polaroid planes orbiting it
 * – Particle "flash" field & soft volumetric lights
 * The scene reacts to mouse + scroll.
 */

const canvas = document.getElementById("bg-canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0014, 0.025);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 9);

/* ---------------- Lighting ---------------- */
scene.add(new THREE.AmbientLight(0x6a4a9a, 0.6));

const keyLight = new THREE.PointLight(0xff6ec7, 4, 30);
keyLight.position.set(-6, 4, 6);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x7873f5, 3.2, 30);
fillLight.position.set(7, -3, 5);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xffe27a, 2, 25);
rimLight.position.set(0, 6, -4);
scene.add(rimLight);

/* ---------------- Hero "camera lens" centerpiece ---------------- */
const lensGroup = new THREE.Group();
scene.add(lensGroup);

const bodyMat = new THREE.MeshStandardMaterial({
  color: 0x1a0a3a,
  roughness: 0.35,
  metalness: 0.8,
  emissive: 0x220044,
  emissiveIntensity: 0.3,
});

const ringMat = new THREE.MeshStandardMaterial({
  color: 0xff6ec7,
  roughness: 0.2,
  metalness: 0.95,
  emissive: 0xff6ec7,
  emissiveIntensity: 0.45,
});

const glassMat = new THREE.MeshStandardMaterial({
  color: 0x7873f5,
  roughness: 0.05,
  metalness: 0.95,
  emissive: 0x7873f5,
  emissiveIntensity: 0.5,
  transparent: true,
  opacity: 0.85,
});

// Big outer ring (camera body silhouette)
const outerRing = new THREE.Mesh(
  new THREE.TorusGeometry(2.4, 0.18, 16, 80),
  ringMat
);
lensGroup.add(outerRing);

// Inner body torus
const innerBody = new THREE.Mesh(
  new THREE.TorusGeometry(2.0, 0.45, 24, 60),
  bodyMat
);
lensGroup.add(innerBody);

// Lens glass disc
const lens = new THREE.Mesh(
  new THREE.CircleGeometry(1.7, 64),
  glassMat
);
lensGroup.add(lens);

// Aperture blades
const aperture = new THREE.Group();
for (let i = 0; i < 6; i++) {
  const blade = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.6),
    new THREE.MeshStandardMaterial({
      color: 0x150028,
      roughness: 0.6,
      metalness: 0.6,
      side: THREE.DoubleSide,
    })
  );
  const a = (i / 6) * Math.PI * 2;
  blade.position.set(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.02);
  blade.rotation.z = a + Math.PI / 2;
  aperture.add(blade);
}
lensGroup.add(aperture);

// Center highlight ball
const highlight = new THREE.Mesh(
  new THREE.SphereGeometry(0.22, 24, 24),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1.6,
    roughness: 0,
    metalness: 1,
  })
);
highlight.position.set(0.7, 0.6, 0.4);
lensGroup.add(highlight);

lensGroup.position.set(0, 0, 0);
lensGroup.scale.set(0.9, 0.9, 0.9);

/* ---------------- Orbiting polaroids ---------------- */
const polaroidGroup = new THREE.Group();
scene.add(polaroidGroup);

const polaroidColors = [
  [0xff6ec7, 0x7873f5],
  [0xffe27a, 0xff6ec7],
  [0x9af0ff, 0x7873f5],
  [0xffb37a, 0xff3d77],
  [0xa78bfa, 0xec4899],
  [0xc4ff7a, 0x22d3ee],
];

function makeGradientTexture(c1, c2) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 256, 256);
  g.addColorStop(0, "#" + c1.toString(16).padStart(6, "0"));
  g.addColorStop(1, "#" + c2.toString(16).padStart(6, "0"));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  // soft white vignette
  const rg = ctx.createRadialGradient(80, 80, 8, 128, 128, 200);
  rg.addColorStop(0, "rgba(255,255,255,0.45)");
  rg.addColorStop(1, "rgba(0,0,0,0.15)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

const polaroids = [];
for (let i = 0; i < 6; i++) {
  const [c1, c2] = polaroidColors[i];
  const tex = makeGradientTexture(c1, c2);

  // White frame
  const frame = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 1.7),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0,
      side: THREE.DoubleSide,
    })
  );

  // Photo inside
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.2),
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.5,
      side: THREE.DoubleSide,
    })
  );
  photo.position.y = 0.15;
  photo.position.z = 0.005;
  frame.add(photo);

  const radius = 4.5 + Math.random() * 1.2;
  const angle = (i / 6) * Math.PI * 2;
  frame.position.set(
    Math.cos(angle) * radius,
    (Math.random() - 0.5) * 2.5,
    Math.sin(angle) * radius - 2
  );
  frame.rotation.z = (Math.random() - 0.5) * 0.4;
  frame.userData = {
    baseAngle: angle,
    radius,
    speed: 0.06 + Math.random() * 0.04,
    bobSpeed: 0.5 + Math.random() * 0.6,
    bobAmount: 0.3 + Math.random() * 0.4,
    rotOffset: Math.random() * Math.PI * 2,
    baseY: frame.position.y,
  };

  polaroids.push(frame);
  polaroidGroup.add(frame);
}

/* ---------------- Particle "flash" field ---------------- */
const PARTICLE_COUNT = 1400;
const particleGeo = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);
const sizes = new Float32Array(PARTICLE_COUNT);
const seeds = new Float32Array(PARTICLE_COUNT);

const palette = [
  new THREE.Color(0xff6ec7),
  new THREE.Color(0x7873f5),
  new THREE.Color(0xffe27a),
  new THREE.Color(0x9af0ff),
  new THREE.Color(0xffffff),
];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const r = 8 + Math.random() * 18;
  const t = Math.random() * Math.PI * 2;
  const p = Math.acos(2 * Math.random() - 1);
  positions[i * 3 + 0] = r * Math.sin(p) * Math.cos(t);
  positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
  positions[i * 3 + 2] = r * Math.cos(p) - 6;

  const col = palette[Math.floor(Math.random() * palette.length)];
  colors[i * 3 + 0] = col.r;
  colors[i * 3 + 1] = col.g;
  colors[i * 3 + 2] = col.b;

  sizes[i] = Math.random() * 0.05 + 0.015;
  seeds[i] = Math.random() * 100;
}

particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
particleGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
particleGeo.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));

const particleMat = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  },
  vertexShader: `
    attribute float size;
    attribute float seed;
    varying vec3 vColor;
    varying float vAlpha;
    uniform float uTime;
    uniform float uPixelRatio;
    void main() {
      vColor = color;
      vec3 p = position;
      p.y += sin(uTime * 0.6 + seed) * 0.4;
      p.x += cos(uTime * 0.5 + seed * 1.3) * 0.3;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float twinkle = 0.55 + 0.45 * sin(uTime * 2.0 + seed * 4.0);
      vAlpha = twinkle;
      gl_PointSize = size * 380.0 * uPixelRatio / -mv.z;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
      gl_FragColor = vec4(vColor, alpha);
    }
  `,
  vertexColors: true,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

/* ---------------- Mouse + scroll ---------------- */
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener("pointermove", (e) => {
  mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
});

let scrollY = 0;
window.addEventListener(
  "scroll",
  () => {
    scrollY = window.scrollY;
  },
  { passive: true }
);

/* ---------------- Resize ---------------- */
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  particleMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
});

/* ---------------- Animate ---------------- */
const clock = new THREE.Clock();

function tick() {
  const t = clock.getElapsedTime();
  const dt = Math.min(clock.getDelta() + 0.016, 0.05);

  mouse.x += (mouse.tx - mouse.x) * 0.06;
  mouse.y += (mouse.ty - mouse.y) * 0.06;

  // Lens
  lensGroup.rotation.y = mouse.x * 0.4 + t * 0.15;
  lensGroup.rotation.x = -mouse.y * 0.3 + Math.sin(t * 0.4) * 0.05;
  aperture.rotation.z = t * 0.4;
  highlight.position.x = 0.7 + Math.cos(t * 1.2) * 0.15;
  highlight.position.y = 0.6 + Math.sin(t * 1.5) * 0.1;

  // Polaroids
  polaroids.forEach((p) => {
    const u = p.userData;
    const a = u.baseAngle + t * u.speed;
    p.position.x = Math.cos(a) * u.radius;
    p.position.z = Math.sin(a) * u.radius - 2;
    p.position.y = u.baseY + Math.sin(t * u.bobSpeed + u.rotOffset) * u.bobAmount;
    p.rotation.y = -a + Math.PI / 2 + Math.sin(t * 0.5) * 0.1;
    p.rotation.z = Math.sin(t * 0.7 + u.rotOffset) * 0.15;
  });

  // Particles
  particleMat.uniforms.uTime.value = t;
  particles.rotation.y = t * 0.02;

  // Scroll: push camera slightly back
  const scrollNorm = scrollY / (document.body.scrollHeight - window.innerHeight || 1);
  camera.position.z = 9 + scrollNorm * 6;
  camera.position.y = -scrollNorm * 2.5;
  camera.lookAt(0, -scrollNorm * 1.5, 0);

  // Lights movement
  keyLight.position.x = -6 + Math.sin(t * 0.4) * 1.5;
  fillLight.position.y = -3 + Math.cos(t * 0.3) * 1.5;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
