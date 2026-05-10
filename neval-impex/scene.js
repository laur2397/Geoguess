// ============================================================================
// SC Neval Impex SRL — 3D background scene
// Stylized globe (low-poly wireframe) + arc trajectories Romania -> US bases
// + particle starfield + subtle nebula. Tuned to be "serious-WOW": premium,
// not gimmicky.
// ============================================================================

import * as THREE from "three";

const reduceMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const canvas = document.getElementById("bg-canvas");
if (canvas && THREE) initScene();

function initScene() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04070d, 0.018);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // ------- Globe group ----------------------------------------------------
  const globe = new THREE.Group();
  globe.position.set(5.5, -0.5, 0);
  scene.add(globe);

  const RADIUS = 4.2;

  // Inner solid sphere — barely visible, gives the globe body
  const sphereGeom = new THREE.SphereGeometry(RADIUS * 0.985, 48, 48);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x0a1a36,
    transparent: true,
    opacity: 0.55,
  });
  globe.add(new THREE.Mesh(sphereGeom, sphereMat));

  // Wireframe — main visual
  const wireGeom = new THREE.SphereGeometry(RADIUS, 28, 22);
  const wireMat = new THREE.LineBasicMaterial({
    color: 0xd4af37,
    transparent: true,
    opacity: 0.22,
  });
  globe.add(new THREE.LineSegments(new THREE.WireframeGeometry(wireGeom), wireMat));

  // Equator + tropics rings
  for (const tilt of [0, Math.PI / 6, -Math.PI / 6]) {
    const ringGeo = new THREE.RingGeometry(RADIUS * 1.001, RADIUS * 1.001, 96);
    // Build a proper ring (line) instead of disc
    const pts = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * RADIUS, 0, Math.sin(a) * RADIUS));
    }
    const ring = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: tilt === 0 ? 0.45 : 0.18 })
    );
    ring.rotation.x = tilt;
    globe.add(ring);
  }

  // Outer glow halo (additive shader-like via sprite)
  const haloGeom = new THREE.SphereGeometry(RADIUS * 1.08, 40, 32);
  const haloMat = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: { c: { value: new THREE.Color(0x4a7cff) } },
    vertexShader: `
      varying vec3 vN;
      void main() {
        vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 c;
      varying vec3 vN;
      void main() {
        float rim = pow(1.0 - abs(vN.z), 3.2);
        gl_FragColor = vec4(c, rim * 0.55);
      }
    `,
    side: THREE.BackSide,
  });
  globe.add(new THREE.Mesh(haloGeom, haloMat));

  // ------- Markers + arcs -------------------------------------------------
  // Lat/lon points: NSF Deveselu (44.36, 24.31), Caracal RO (44.11, 24.34),
  // Tyndall AFB FL (30.09, -85.58), Colorado Springs (38.83, -104.82),
  // Sigonella (37.40, 14.92)
  const points = [
    { name: "Caracal RO",        lat: 44.11, lon: 24.34, primary: true  },
    { name: "Deveselu RO",       lat: 44.36, lon: 24.31, primary: true  },
    { name: "Câmpia Turzii RO",  lat: 46.55, lon: 23.88, primary: false },
    { name: "Tyndall AFB FL",    lat: 30.09, lon: -85.58, primary: true  },
    { name: "Colorado Springs",  lat: 38.83, lon: -104.82, primary: false },
    { name: "Sigonella IT",      lat: 37.40, lon: 14.92, primary: false },
  ];

  function latLonToVec3(lat, lon, r) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  const markers = [];
  for (const p of points) {
    const pos = latLonToVec3(p.lat, p.lon, RADIUS * 1.008);
    const dotGeom = new THREE.SphereGeometry(p.primary ? 0.07 : 0.05, 12, 12);
    const dotMat = new THREE.MeshBasicMaterial({
      color: p.primary ? 0xf1d27a : 0x88a4d8,
    });
    const dot = new THREE.Mesh(dotGeom, dotMat);
    dot.position.copy(pos);
    globe.add(dot);

    // Halo
    const haloSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeRingTexture(),
        color: p.primary ? 0xd4af37 : 0x88a4d8,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    haloSprite.position.copy(pos);
    haloSprite.scale.setScalar(p.primary ? 0.7 : 0.5);
    globe.add(haloSprite);
    markers.push({ mesh: dot, halo: haloSprite, phase: Math.random() * Math.PI * 2 });
  }

  // Arcs from Caracal (idx 0) to other points
  const origin = points[0];
  const arcs = [];
  for (let i = 1; i < points.length; i++) {
    const dest = points[i];
    const arc = makeArc(origin, dest, RADIUS, dest.primary ? 0xd4af37 : 0x6e8ec9);
    globe.add(arc.line);
    arcs.push(arc);
  }

  // Travelling pulses along arcs
  const pulses = arcs.map((arc) => {
    const geom = new THREE.SphereGeometry(0.06, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfff0c2 });
    const mesh = new THREE.Mesh(geom, mat);
    globe.add(mesh);
    return { mesh, arc, t: Math.random() };
  });

  // ------- Starfield ------------------------------------------------------
  const starGroup = new THREE.Group();
  scene.add(starGroup);
  const starCount = 1400;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starCol = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 28 + Math.random() * 60;
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    starPos[i * 3 + 0] = r * Math.sin(b) * Math.cos(a);
    starPos[i * 3 + 1] = r * Math.cos(b) * 0.5;
    starPos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
    const tint = Math.random();
    if (tint > 0.94) { starCol.set([1, 0.85, 0.45], i * 3); }
    else if (tint > 0.88) { starCol.set([0.65, 0.78, 1], i * 3); }
    else { const v = 0.55 + Math.random() * 0.45; starCol.set([v, v, v], i * 3); }
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  starGroup.add(new THREE.Points(starGeo, starMat));

  // Distant nebula plane
  const nebulaTex = makeNebulaTexture();
  const nebulaMat = new THREE.MeshBasicMaterial({
    map: nebulaTex,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const nebula = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), nebulaMat);
  nebula.position.set(-10, 4, -40);
  scene.add(nebula);

  // ------- Interaction ---------------------------------------------------
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener(
    "mousemove",
    (e) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );

  // Scroll-driven globe rotation/zoom
  const onScroll = () => {
    const s = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
    globe.userData.scroll = s;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  globe.userData.scroll = 0;

  // ------- Resize --------------------------------------------------------
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    // shift globe off-screen on small viewports
    if (w < 900) {
      globe.position.x = 0;
      globe.position.y = -1.5;
      globe.scale.setScalar(0.7);
    } else {
      globe.position.x = 5.5;
      globe.position.y = -0.5;
      globe.scale.setScalar(1);
    }
  }
  window.addEventListener("resize", onResize);
  onResize();

  // ------- Animate -------------------------------------------------------
  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();
    const dt = clock.getDelta() || 0.016;

    // Easing mouse
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    if (!reduceMotion) {
      globe.rotation.y += dt * 0.07;
    }
    globe.rotation.x = -0.18 + mouse.y * 0.1 + (globe.userData.scroll || 0) * 0.35;
    globe.rotation.z = mouse.x * 0.05;

    // Camera parallax
    camera.position.x = mouse.x * 0.6;
    camera.position.y = -mouse.y * 0.4 - (globe.userData.scroll || 0) * 1.5;
    camera.lookAt(globe.position.x * 0.4, 0, 0);

    // Marker halo pulse
    for (const m of markers) {
      const s = 1 + Math.sin(t * 1.8 + m.phase) * 0.25;
      m.halo.scale.setScalar((m.halo.userData?.base || 0.6) * s);
    }

    // Pulse along arc
    for (const p of pulses) {
      p.t += dt * 0.16;
      if (p.t > 1) p.t -= 1;
      const pos = p.arc.curve.getPoint(p.t);
      p.mesh.position.copy(pos);
      const tail = p.arc.curve.getPoint(Math.max(0, p.t - 0.02));
      const dist = pos.distanceTo(tail);
      p.mesh.scale.setScalar(0.6 + dist * 8);
    }

    // Stars subtle drift
    starGroup.rotation.y += dt * 0.005;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  // ----------------------------------------------------------------------
  function makeArc(a, b, r, color) {
    const v1 = latLonToVec3(a.lat, a.lon, r);
    const v2 = latLonToVec3(b.lat, b.lon, r);
    const mid = v1.clone().add(v2).multiplyScalar(0.5);
    const distance = v1.distanceTo(v2);
    mid.normalize().multiplyScalar(r + 0.4 + distance * 0.45);

    const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
    const pts = curve.getPoints(64);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);

    // Per-vertex alpha via custom shader for fade
    const positions = geo.attributes.position.array;
    const alphas = new Float32Array(pts.length);
    for (let i = 0; i < pts.length; i++) {
      const u = i / (pts.length - 1);
      alphas[i] = Math.sin(u * Math.PI); // bell-shaped fade
    }
    geo.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color(color) } },
      vertexShader: `
        attribute float alpha;
        varying float vA;
        void main() {
          vA = alpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vA;
        void main() { gl_FragColor = vec4(uColor, vA * 0.85); }
      `,
    });

    const line = new THREE.Line(geo, mat);
    return { line, curve };
  }

  function makeRingTexture() {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.55, "rgba(255,255,255,0.9)");
    g.addColorStop(0.78, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  function makeNebulaTexture() {
    const size = 512;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");

    const grad = ctx.createRadialGradient(size / 2, size / 2, 30, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(74, 124, 255, 0.25)");
    grad.addColorStop(0.35, "rgba(212, 175, 55, 0.10)");
    grad.addColorStop(0.7, "rgba(40, 16, 60, 0.05)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // sprinkle noise
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    }
    return new THREE.CanvasTexture(c);
  }
}
