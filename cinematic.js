// ============================================================================
// SC Neval Impex SRL — Scroll-driven cinematic
// Camion brandat NEVAL IMPEX -> scut NATO -> explozie de 10.000 particule.
// Toată secvența este controlată de scroll-progress [0,1] peste un container
// de 500vh înălțime, cu o etapă "sticky" pin-uită la 100vh.
// ============================================================================

import * as THREE from "three";

const reduceMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cinematicEl = document.getElementById("cinematic");
const canvas = document.getElementById("cinematic-canvas");
const overlayBefore = document.getElementById("cinematic-before");
const overlayReveal = document.getElementById("cinematic-reveal");
const scrollHint = document.getElementById("cinematic-hint");

if (!canvas || !cinematicEl) {
  // Nothing to do
} else if (reduceMotion) {
  // Reduced-motion users: skip animation, show reveal statically
  if (overlayReveal) overlayReveal.classList.add("is-visible");
  cinematicEl.classList.add("is-static");
} else {
  initCinematic();
}

function initCinematic() {
  const isMobile = window.innerWidth < 760;
  const PARTICLE_COUNT = isMobile ? 4500 : 10000;

  // ===== Renderer ==========================================================
  const scene = new THREE.Scene();
  // Brighter base — was 0x04070d. Now closer to a deep dusk blue/grey.
  scene.background = new THREE.Color(0x14223a);
  // Fog density was 0.014 (too dim). 0.0065 lets the skyline + base read clearly.
  scene.fog = new THREE.FogExp2(0x14223a, 0.0065);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 600);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // Boost exposure for an overall brighter image (was 1.05).
  renderer.toneMappingExposure = 1.55;
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ===== Lighting ==========================================================
  // Hemisphere sky light: was 0.45. Now 1.05 — much more ambient blue/gold.
  scene.add(new THREE.HemisphereLight(0x88aadd, 0x1a1f30, 1.05));
  // Ambient floor: was 0.16. Now 0.45.
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));

  // Directional sun: was 0.7. Now 1.6.
  const sun = new THREE.DirectionalLight(0xfff2d8, 1.6);
  sun.position.set(-22, 28, 16);
  if (!isMobile) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 90;
    sun.shadow.camera.left = -22;
    sun.shadow.camera.right = 22;
    sun.shadow.camera.top = 22;
    sun.shadow.camera.bottom = -22;
    sun.shadow.bias = -0.0005;
  }
  scene.add(sun);

  // Subtle key-fill light from shield direction (gold tint)
  const shieldLight = new THREE.PointLight(0xffcd66, 0, 60, 1.4);
  shieldLight.position.set(0, 5, 4);
  scene.add(shieldLight);

  // ===== Environment =======================================================
  // Ground (was very dark 0x080810 — now a lighter dusk asphalt).
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 600),
    new THREE.MeshStandardMaterial({ color: 0x222630, roughness: 0.95, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = !isMobile;
  scene.add(ground);

  // Road (was 0x14141a, lifted to 0x282c34 so it reads against the brighter ground).
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 600),
    new THREE.MeshStandardMaterial({ color: 0x282c34, roughness: 0.88, metalness: 0.08 })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.01, -150);
  road.receiveShadow = !isMobile;
  scene.add(road);

  // Road edge lines
  for (const x of [-5.0, 5.0]) {
    const edge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 600),
      new THREE.MeshStandardMaterial({ color: 0xfff5d8, roughness: 0.6, emissive: 0x554400, emissiveIntensity: 0.18 })
    );
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(x, 0.02, -150);
    scene.add(edge);
  }

  // Road dashes (center, dashed) — span full journey
  for (let z = -440; z < 20; z += 7) {
    const dash = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 3.2),
      new THREE.MeshStandardMaterial({ color: 0xfff5d8, roughness: 0.6, emissive: 0x554400, emissiveIntensity: 0.25 })
    );
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.025, z);
    scene.add(dash);
  }

  // Reflective roadside posts
  for (let z = -420; z < 10; z += 11) {
    for (const x of [-6.3, 6.3]) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8),
        new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.7 })
      );
      post.position.set(x, 0.5, z);
      scene.add(post);
      const ref = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, emissive: 0xd4af37, emissiveIntensity: 0.9 })
      );
      ref.position.set(x, 0.95, z);
      scene.add(ref);
    }
  }

  // ===== ROAD SIGN — DEVESELU ============================================
  const sign = buildHighwaySign("→  NSF DEVESELU", "2 KM   ·   NATO");
  sign.position.set(7.5, 0, -110);
  sign.rotation.y = -Math.PI / 9;
  scene.add(sign);

  // ===== MILITARY BASE ===================================================
  // Apron — the asphalt platform that the base sits on (extends past the road)
  const apron = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 70),
    new THREE.MeshStandardMaterial({ color: 0x2c303a, roughness: 0.92, metalness: 0.05 })
  );
  apron.rotation.x = -Math.PI / 2;
  apron.position.set(0, 0.005, -30);
  apron.receiveShadow = !isMobile;
  scene.add(apron);

  // Paint lines on the apron (parking grid)
  for (let z = -55; z <= -10; z += 6) {
    for (let xi = -3; xi <= 3; xi++) {
      if (xi >= -1 && xi <= 1) continue; // skip center where road is
      const ln = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, 4),
        new THREE.MeshStandardMaterial({ color: 0xd9c98a, roughness: 0.7, emissive: 0x332200, emissiveIntensity: 0.1 })
      );
      ln.rotation.x = -Math.PI / 2;
      ln.position.set(xi * 5, 0.015, z);
      scene.add(ln);
    }
  }

  // ----- Main gate ---------------------------------------------------------
  const gate = buildMilitaryGate();
  gate.position.set(0, 0, -58);
  scene.add(gate);

  // Watchtowers flanking the gate
  const tower1 = buildWatchtower();
  tower1.position.set(-13, 0, -52);
  scene.add(tower1);
  const tower2 = buildWatchtower();
  tower2.position.set(13, 0, -52);
  tower2.rotation.y = Math.PI;
  scene.add(tower2);

  // Guard cabin to one side of the gate (small kiosk)
  const guardCabin = buildGuardCabin();
  guardCabin.position.set(8.5, 0, -56);
  scene.add(guardCabin);

  // ----- Perimeter fence (long stretches on both sides) -------------------
  for (let z = -90; z < -8; z += 3.5) {
    for (const x of [-9, 9]) {
      const fence = buildFenceSegment();
      fence.position.set(x, 0, z);
      scene.add(fence);
    }
  }
  // Perpendicular fence at the back of the base (closing the perimeter)
  for (let x = -28; x <= 28; x += 3.5) {
    const fence = buildFenceSegment();
    fence.rotation.y = Math.PI / 2;
    fence.position.set(x, 0, 5);
    scene.add(fence);
  }
  // Side perimeter fences (deep stretches running off into the distance)
  for (let z = 5; z < 30; z += 3.5) {
    for (const x of [-28, 28]) {
      const fence = buildFenceSegment();
      fence.position.set(x, 0, z);
      scene.add(fence);
    }
  }

  // ----- Buildings (warehouses + admin block) -----------------------------
  // Big warehouse — left side, behind the radar
  const warehouseL = buildWarehouse(18, 8, 22, 0x404249);
  warehouseL.position.set(-22, 0, -10);
  scene.add(warehouseL);
  // Smaller warehouse — right side, behind the antenna
  const warehouseR = buildWarehouse(14, 7, 18, 0x444a52);
  warehouseR.position.set(22, 0, -5);
  scene.add(warehouseR);
  // Admin block — three-story office, gold trim, lots of windows
  const admin = buildAdminBlock();
  admin.position.set(-22, 0, 12);
  scene.add(admin);
  // Storage shed — small utility building near road
  const shed = buildWarehouse(6, 4, 8, 0x2a2c32);
  shed.position.set(20, 0, 14);
  scene.add(shed);

  // ----- Shipping containers (stacks of 4 colored containers) -------------
  const containerColors = [0xa12727, 0x276ba1, 0x2b7a45, 0xa17827, 0x6b6b6b, 0x274aa1];
  // Stack near warehouse on the left
  for (let row = 0; row < 3; row++) {
    for (let level = 0; level < 2; level++) {
      const c = buildContainer(containerColors[(row * 2 + level) % containerColors.length]);
      c.position.set(-12 + row * 3.05, level * 2.6, 18);
      scene.add(c);
    }
  }
  // Stack on the right
  for (let row = 0; row < 4; row++) {
    const c = buildContainer(containerColors[(row + 2) % containerColors.length]);
    c.position.set(8 + row * 3.05, 0, 22);
    scene.add(c);
  }
  for (let row = 0; row < 2; row++) {
    const c = buildContainer(containerColors[(row + 1) % containerColors.length]);
    c.position.set(8 + row * 3.05, 2.6, 22);
    scene.add(c);
  }

  // ----- Tall light masts illuminating the base ---------------------------
  const lightPositions = [
    [-18, -45], [18, -45],
    [-18, -20], [18, -20],
    [-18,   5], [18,   5],
    [  0, -40], [  0, -10],
  ];
  for (const [x, z] of lightPositions) {
    const mast = buildLightMast();
    mast.position.set(x, 0, z);
    scene.add(mast);
  }

  // ----- Fuel/utility tanks (cylindrical, by warehouse) -------------------
  for (let i = 0; i < 3; i++) {
    const tank = buildFuelTank();
    tank.position.set(-30 - (i % 2) * 3, 0, -2 + i * 4);
    scene.add(tank);
  }

  // ----- Background helipad circle ----------------------------------------
  const helipad = new THREE.Mesh(
    new THREE.CircleGeometry(5, 48),
    new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.9 })
  );
  helipad.rotation.x = -Math.PI / 2;
  helipad.position.set(28, 0.02, -15);
  scene.add(helipad);
  // H painted on helipad
  const helipadH = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xfff5d8, roughness: 0.6, emissive: 0x332200, emissiveIntensity: 0.2 })
  );
  helipadH.rotation.x = -Math.PI / 2;
  helipadH.position.set(28, 0.03, -15);
  scene.add(helipadH);
  const helipadH2 = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 1.8),
    new THREE.MeshStandardMaterial({ color: 0xfff5d8, roughness: 0.6 })
  );
  helipadH2.rotation.x = -Math.PI / 2;
  helipadH2.position.set(28, 0.03, -15);
  scene.add(helipadH2);
  for (let dx of [-1.0, 1.0]) {
    const vBar = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 1.8),
      new THREE.MeshStandardMaterial({ color: 0xfff5d8, roughness: 0.6 })
    );
    vBar.rotation.x = -Math.PI / 2;
    vBar.position.set(28 + dx, 0.03, -15);
    scene.add(vBar);
  }

  // ----- Distant industrial buildings (silhouettes for depth) -------------
  for (const [x, z, w, h, d] of [
    [-45, 25, 14, 9, 16],
    [-30, 35, 10, 6, 12],
    [ 30, 40, 18, 11, 14],
    [ 50, 28, 12, 7, 10],
    [-58,  5, 8, 5, 8],
  ]) {
    const b = buildWarehouse(w, h, d, 0x282a32);
    b.position.set(x, 0, z);
    scene.add(b);
  }

  // ----- Far-distance city skyline (skyscrapers flanking the road journey) -
  // Procedurally seeded so the same skyline appears every time the page loads.
  const skylineSeed = 73;
  const rand = mulberry32(skylineSeed);
  // Layout: rows on both sides at z = -200..-50, x = ±(45..90).
  // Two rows per side for layered depth.
  const skylinePlacements = [];
  for (let z = -210; z <= -45; z += 9 + Math.floor(rand() * 4)) {
    for (const side of [-1, 1]) {
      // Front row of tall buildings (closer to road)
      skylinePlacements.push({
        x: side * (42 + rand() * 14),
        z: z + (rand() - 0.5) * 6,
        h: 22 + rand() * 38,        // 22-60m height
        w: 4 + rand() * 5,
        d: 4 + rand() * 5,
        tint: 0x14 + Math.floor(rand() * 0x12),
      });
      // Back row — taller, further away
      if (rand() > 0.35) {
        skylinePlacements.push({
          x: side * (62 + rand() * 22),
          z: z + (rand() - 0.5) * 8,
          h: 28 + rand() * 42,      // 28-70m height
          w: 5 + rand() * 6,
          d: 5 + rand() * 6,
          tint: 0x10 + Math.floor(rand() * 0x10),
        });
      }
    }
  }
  for (const p of skylinePlacements) {
    const sky = buildSkyscraper(p.w, p.h, p.d, p.tint, rand);
    sky.position.set(p.x, 0, p.z);
    scene.add(sky);
  }

  // Aircraft warning blink lights at the very tops of the tallest skyscrapers
  // (purely decorative red dots that pulse gently)
  for (const p of skylinePlacements) {
    if (p.h < 50) continue;
    const blink = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff3030, emissive: 0xff3030, emissiveIntensity: 1.8,
      })
    );
    blink.position.set(p.x, p.h + 0.4, p.z);
    scene.add(blink);
  }

  // ===== RADAR (large, complex installation) ==============================
  const radar = buildRadar();
  radar.position.set(-16, 0, -28);
  scene.add(radar);

  // Secondary phased-array radar (rectangular flat panel on a tower)
  const phasedArray = buildPhasedArray();
  phasedArray.position.set(15, 0, -22);
  scene.add(phasedArray);

  // Tertiary tall antenna mast
  const antenna = buildAntenna();
  antenna.position.set(-30, 0, -38);
  scene.add(antenna);
  const antenna2 = buildAntenna();
  antenna2.position.set(26, 0, 5);
  scene.add(antenna2);

  // Distant stars
  const starsGeo = new THREE.BufferGeometry();
  const sc = 700;
  const sp = new Float32Array(sc * 3);
  for (let i = 0; i < sc; i++) {
    const r = 80 + Math.random() * 120;
    const a = Math.random() * Math.PI * 2;
    const h = 0.1 + Math.random() * 0.75;
    sp[i * 3]     = Math.cos(a) * r;
    sp[i * 3 + 1] = r * h;
    sp[i * 3 + 2] = Math.sin(a) * r - 30;
  }
  starsGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  scene.add(
    new THREE.Points(
      starsGeo,
      new THREE.PointsMaterial({
        size: 0.45,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      })
    )
  );

  // ===== TRUCK =============================================================
  const truck = buildTruck(isMobile);
  truck.position.set(0, 0, -150);
  scene.add(truck);

  // Exhaust smoke particles (continuous, subtle)
  const smoke = buildSmokeSystem();
  truck.add(smoke.mesh);
  smoke.mesh.position.set(0, 3.4, 2.6); // attached to truck cab top

  // ===== SHIELD ============================================================
  const shield = buildShield();
  shield.position.set(0, 4.4, 0);
  shield.lookAt(0, 4.4, 30);
  scene.add(shield);

  // ===== EXPLOSION PARTICLES ==============================================
  const particles = createParticleSystem(PARTICLE_COUNT);
  scene.add(particles.mesh);

  // Shockwave ring on ground
  const shock = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 0.55, 96),
    new THREE.MeshBasicMaterial({
      color: 0xffeeaa,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  shock.rotation.x = -Math.PI / 2;
  shock.position.y = 0.08;
  scene.add(shock);

  // Secondary spherical shockwave (in 3D, expands outward)
  const sphereShock = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffd88a,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    })
  );
  sphereShock.position.set(0, 3.5, -1);
  scene.add(sphereShock);

  // ===== ANIMATION =========================================================
  const clock = new THREE.Clock();
  let impacted = false;
  let impactT = 0;

  function resize() {
    // Use the stage's actual rendered size — avoids the dynamic-viewport
    // gap on iOS/macOS Safari where window.innerHeight lies about chrome bars.
    const stage = canvas.parentElement;
    const w = stage?.clientWidth || window.innerWidth;
    const h = stage?.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => resize());
    if (canvas.parentElement) ro.observe(canvas.parentElement);
  }
  resize();

  function progress() {
    const r = cinematicEl.getBoundingClientRect();
    const total = Math.max(1, cinematicEl.offsetHeight - window.innerHeight);
    return Math.max(0, Math.min(1, -r.top / total));
  }

  // Pause when offscreen or hidden
  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) {
      clock.getDelta();
      requestAnimationFrame(tick);
    }
  });
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    running = false;
  });
  canvas.addEventListener("webglcontextrestored", () => {
    running = true;
    clock.getDelta();
    requestAnimationFrame(tick);
  });

  function tick() {
    if (!running) return;
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.getElapsedTime();
    const p = progress();

    // Skip rendering if cinematic is fully off-screen (perf)
    const r = cinematicEl.getBoundingClientRect();
    const onScreen = r.bottom > -50 && r.top < window.innerHeight + 50;

    if (onScreen) {
      // ----- Truck motion --------------------------------------------------
      const truckP = Math.min(1, p / 0.80);
      truck.position.z = THREE.MathUtils.lerp(-150, -4.5, easeOutCubic(truckP));
      truck.position.x = Math.sin(p * 9) * 0.2;
      truck.rotation.y = Math.sin(p * 6) * 0.022;

      // Wheels — spin faster early, slow at approach
      const speed = 14 - 10 * truckP;
      for (const w of truck.userData.wheels) w.rotation.x -= dt * speed;

      // ----- Radar — continuous rotation + blink --------------------------
      radar.userData.dishGroup.rotation.y += dt * 0.55;
      radar.userData.blink.material.emissiveIntensity = 1.6 + Math.sin(t * 7) * 1.4;
      // Lock head-on detection when truck is near (z > -35 means inside base)
      const inBase = truck.position.z > -45;
      radar.userData.sweepLight.intensity = inBase ? 2.5 : 1.4;
      antenna.userData.blink.material.emissiveIntensity = 0.8 + Math.sin(t * 4 + 1) * 0.7;

      // ----- Camera choreography ------------------------------------------
      // Phase 1: 0–13% wide establishing
      // Phase 2: 13–32% side-rear tracking on open road
      // Phase 3: 32–46% slow-down + DEVESELU sign reveal (camera tilts toward sign)
      // Phase 4: 46–60% truck approaches base gate (low-angle hero shot)
      // Phase 5: 60–75% inside base — wide shot showing truck + radar
      // Phase 6: 75–84% head-on climax with shield
      // Phase 7: 84–100% aftermath pull-back
      if (p < 0.13) {
        const k = p / 0.13;
        camera.position.set(
          THREE.MathUtils.lerp(18, 11, k),
          THREE.MathUtils.lerp(13, 6, k),
          THREE.MathUtils.lerp(-130, truck.position.z - 8, k)
        );
        camera.lookAt(truck.position.x, 2.0, truck.position.z + 5);
      } else if (p < 0.32) {
        const k = (p - 0.13) / 0.19;
        camera.position.set(
          THREE.MathUtils.lerp(11, 8, k),
          THREE.MathUtils.lerp(6, 4, k),
          truck.position.z - 7
        );
        camera.lookAt(truck.position.x, 2.2, truck.position.z + 8);
      } else if (p < 0.46) {
        // Sign reveal — camera slows + pans toward sign briefly
        const k = (p - 0.32) / 0.14;
        const signZ = -110;
        const lookZ = THREE.MathUtils.lerp(truck.position.z + 8, signZ, easeInOut(k * 0.6));
        camera.position.set(
          THREE.MathUtils.lerp(8, 9.5, k),
          THREE.MathUtils.lerp(4, 4.5, k),
          THREE.MathUtils.lerp(truck.position.z - 7, truck.position.z - 5, k)
        );
        camera.lookAt(THREE.MathUtils.lerp(0, 6, k * 0.5), 3, lookZ);
      } else if (p < 0.60) {
        // Approaching base — low-angle hero shot framing truck + gate
        const k = (p - 0.46) / 0.14;
        camera.position.set(
          THREE.MathUtils.lerp(9.5, 7, k),
          THREE.MathUtils.lerp(4.5, 2.6, k),
          THREE.MathUtils.lerp(truck.position.z - 5, -40, k)
        );
        camera.lookAt(0, 3, THREE.MathUtils.lerp(-30, -55, k));
      } else if (p < 0.75) {
        // Inside the base — wide shot with radar prominent on the left
        const k = (p - 0.60) / 0.15;
        camera.position.set(
          THREE.MathUtils.lerp(12, 15, k),
          THREE.MathUtils.lerp(5, 6.5, k),
          THREE.MathUtils.lerp(-35, -15, k)
        );
        camera.lookAt(THREE.MathUtils.lerp(-2, -6, k), 4, THREE.MathUtils.lerp(-25, -18, k));
      } else if (p < 0.84) {
        // Head-on climax with shield
        const k = (p - 0.75) / 0.09;
        camera.position.set(
          THREE.MathUtils.lerp(15, 0, k),
          THREE.MathUtils.lerp(6.5, 5.0, k),
          THREE.MathUtils.lerp(-15, 20, k)
        );
        camera.lookAt(THREE.MathUtils.lerp(-6, 0, k), 4, THREE.MathUtils.lerp(-18, 0, k));
      } else {
        // Aftermath pull-back
        const k = (p - 0.84) / 0.16;
        camera.position.set(
          THREE.MathUtils.lerp(0, 16, easeOutCubic(k)),
          THREE.MathUtils.lerp(5.0, 10, k),
          THREE.MathUtils.lerp(20, 32, k)
        );
        camera.lookAt(0, 4, -4);
      }

      // ----- Shield --------------------------------------------------------
      shield.rotation.y += dt * 0.35;
      const glow = 0.4 + Math.pow(truckP, 1.8) * 1.6;
      shield.userData.rim.material.emissiveIntensity = glow;
      shield.userData.star.material.emissiveIntensity = glow * 0.7;
      shield.userData.halo.material.uniforms.intensity.value = 0.4 + truckP * 2.0;
      shieldLight.intensity = truckP * 4;

      // ----- Impact trigger -----------------------------------------------
      if (p > 0.80 && !impacted) {
        impacted = true;
        impactT = t;
        fireParticles(particles, new THREE.Vector3(0, 3.8, -2));
        shock.material.opacity = 1;
        shock.scale.setScalar(1);
        sphereShock.material.opacity = 0.9;
        sphereShock.scale.setScalar(1);
      }
      if (impacted) {
        const age = t - impactT;
        // Ground shockwave
        shock.scale.setScalar(1 + age * 32);
        shock.material.opacity = Math.max(0, 1 - age * 0.7);
        // 3D shockwave sphere
        sphereShock.scale.setScalar(1 + age * 20);
        sphereShock.material.opacity = Math.max(0, 0.9 - age * 1.2);
        // Particles
        updateParticles(particles, dt);
        // Shake
        if (age < 0.45) {
          const k = (0.45 - age) * 0.8;
          camera.position.x += (Math.random() - 0.5) * k;
          camera.position.y += (Math.random() - 0.5) * k * 0.7;
        }
      }

      // ----- Headlights ----------------------------------------------------
      const hlBase = 2 + Math.pow(truckP, 2.5) * 9;
      truck.userData.headlights[0].intensity = hlBase;
      truck.userData.headlights[1].intensity = hlBase;

      // ----- Smoke ---------------------------------------------------------
      updateSmoke(smoke, dt, truckP);

      // ----- Overlay opacities --------------------------------------------
      if (overlayBefore) {
        const fadeIn = Math.min(1, p * 6);
        const fadeOut = Math.max(0, 1 - Math.max(0, (p - 0.55) / 0.15));
        overlayBefore.style.opacity = fadeIn * fadeOut;
      }
      if (overlayReveal) {
        const rp = p < 0.84 ? 0 : Math.min(1, (p - 0.84) / 0.10);
        overlayReveal.style.opacity = rp;
        overlayReveal.style.transform = `translateY(${(1 - rp) * 26}px) scale(${0.985 + rp * 0.015})`;
        overlayReveal.classList.toggle("is-visible", rp > 0.05);
      }
      if (scrollHint) {
        scrollHint.style.opacity = p < 0.05 ? 1 : Math.max(0, 1 - p * 12);
      }

      renderer.render(scene, camera);
    }

    requestAnimationFrame(tick);
  }
  tick();
}

// ============================================================================
// Truck builder — procedural semi-truck with NEVAL IMPEX branding
// ============================================================================
function buildTruck(isMobile) {
  const g = new THREE.Group();

  // ----- Trailer (white box with gold trim) -------------------------------
  const trailerMat = new THREE.MeshStandardMaterial({
    color: 0xe8eaee, roughness: 0.34, metalness: 0.28,
  });
  const trailer = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 7), trailerMat);
  trailer.position.set(0, 1.95, -2.0);
  trailer.castShadow = !isMobile;
  trailer.receiveShadow = !isMobile;
  g.add(trailer);

  // Trailer gold trim (top and bottom bands)
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, metalness: 0.85, roughness: 0.25,
    emissive: 0x4a3a10, emissiveIntensity: 0.45,
  });
  const trimTop = new THREE.Mesh(new THREE.BoxGeometry(2.66, 0.06, 7.05), trimMat);
  trimTop.position.set(0, 3.28, -2.0);
  g.add(trimTop);
  const trimBot = trimTop.clone();
  trimBot.position.y = 0.6;
  g.add(trimBot);

  // Side decals — "NEVAL IMPEX · NATO Partner"
  const decalTex = makeDecalTexture();
  const decalMat = new THREE.MeshStandardMaterial({
    map: decalTex, roughness: 0.4, metalness: 0.1,
    emissive: 0x080808, emissiveIntensity: 0.04,
  });
  const decalGeo = new THREE.PlaneGeometry(6.6, 2.5);
  const decalL = new THREE.Mesh(decalGeo, decalMat);
  decalL.position.set(-1.31, 1.95, -2.0);
  decalL.rotation.y = -Math.PI / 2;
  g.add(decalL);
  const decalR = decalL.clone();
  decalR.position.x = 1.31;
  decalR.rotation.y = Math.PI / 2;
  g.add(decalR);

  // Rear door details
  const rearDoor = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 2.7),
    new THREE.MeshStandardMaterial({ color: 0xdddee2, roughness: 0.4, metalness: 0.15 })
  );
  rearDoor.position.set(0, 1.95, -5.51);
  rearDoor.rotation.y = Math.PI;
  g.add(rearDoor);
  // Door split line
  const split = new THREE.Mesh(
    new THREE.PlaneGeometry(0.04, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.8 })
  );
  split.position.set(0, 1.95, -5.515);
  split.rotation.y = Math.PI;
  g.add(split);
  // Door handle
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x999, metalness: 0.9, roughness: 0.2 })
  );
  handle.position.set(-0.6, 1.95, -5.52);
  g.add(handle);
  const handle2 = handle.clone();
  handle2.position.x = 0.6;
  g.add(handle2);

  // ----- Cab --------------------------------------------------------------
  const cabMat = new THREE.MeshStandardMaterial({
    color: 0x14223e, roughness: 0.3, metalness: 0.45,
  });
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.45, 2.1), cabMat);
  cab.position.set(0, 1.75, 2.4);
  cab.castShadow = !isMobile;
  g.add(cab);

  // Cab roof (slimmer)
  const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.35, 1.95), cabMat);
  cabRoof.position.set(0, 3.13, 2.4);
  g.add(cabRoof);

  // Roof aerodynamic spoiler
  const spoiler = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.6, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x1d2c4a, roughness: 0.3, metalness: 0.4 })
  );
  spoiler.position.set(0, 3.5, 2.0);
  g.add(spoiler);

  // Roof marker lights
  for (let i = 0; i < 3; i++) {
    const ml = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffdd88, emissive: 0xffdd88, emissiveIntensity: 1.4 })
    );
    ml.position.set(-0.6 + i * 0.6, 3.85, 2.2);
    g.add(ml);
  }

  // Windshield (physical material for nice reflection)
  const winMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a1830, roughness: 0.04, metalness: 0.85,
    transmission: 0.25, transparent: true, opacity: 0.78, ior: 1.45,
  });
  const win = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.05, 0.08), winMat);
  win.position.set(0, 2.32, 3.46);
  g.add(win);

  // Side windows
  for (const sx of [-1.26, 1.26]) {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.85, 1.45), winMat);
    sw.position.set(sx, 2.25, 2.4);
    g.add(sw);
  }

  // Hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.05, 1.5), cabMat);
  hood.position.set(0, 1.05, 3.65);
  hood.castShadow = !isMobile;
  g.add(hood);

  // Grille
  const grilleBox = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.75, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.3, metalness: 0.6 })
  );
  grilleBox.position.set(0, 0.95, 4.43);
  g.add(grilleBox);

  // Horizontal grille bars (gold)
  for (let i = -2; i <= 2; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 0.06, 0.13),
      new THREE.MeshStandardMaterial({
        color: 0xd4af37, metalness: 0.85, roughness: 0.25,
        emissive: 0x3a2a08, emissiveIntensity: 0.3,
      })
    );
    bar.position.set(0, 0.95 + i * 0.15, 4.44);
    g.add(bar);
  }

  // Bumper
  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(2.55, 0.42, 0.38),
    new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.4, metalness: 0.5 })
  );
  bumper.position.set(0, 0.42, 4.52);
  g.add(bumper);

  // Headlights (bright emissive blocks)
  const hlMat = new THREE.MeshStandardMaterial({
    color: 0xfff5d8, emissive: 0xffeebb, emissiveIntensity: 5.5, roughness: 0.18,
  });
  const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.32, 0.14), hlMat);
  hl1.position.set(-0.78, 1.08, 4.42);
  const hl2 = hl1.clone();
  hl2.position.x = 0.78;
  g.add(hl1, hl2);

  // Headlight spotlights (light cones)
  const sl1 = new THREE.SpotLight(0xffeebb, 3, 38, Math.PI / 7, 0.55, 1.2);
  sl1.position.set(-0.7, 1.0, 4.7);
  sl1.target.position.set(-1.4, 0.2, 22);
  g.add(sl1, sl1.target);
  const sl2 = new THREE.SpotLight(0xffeebb, 3, 38, Math.PI / 7, 0.55, 1.2);
  sl2.position.set(0.7, 1.0, 4.7);
  sl2.target.position.set(1.4, 0.2, 22);
  g.add(sl2, sl2.target);

  // Exhaust stacks (chrome cylinders)
  for (const ex of [-1.05, 1.05]) {
    const stk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 1.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x999, metalness: 0.92, roughness: 0.25 })
    );
    stk.position.set(ex, 3.55, 2.7);
    g.add(stk);
    // Cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0x444, metalness: 0.7, roughness: 0.4 })
    );
    cap.position.set(ex, 4.4, 2.7);
    g.add(cap);
  }

  // Side mirrors
  for (const sx of [-1.55, 1.55]) {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.05, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x444 })
    );
    arm.position.set(sx, 2.3, 3.3);
    g.add(arm);
    const mirror = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.55, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.2 })
    );
    mirror.position.set(sx + Math.sign(sx) * 0.3, 2.3, 3.3);
    g.add(mirror);
  }

  // Front license plate slot
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.28),
    new THREE.MeshStandardMaterial({ color: 0xfff5d8, roughness: 0.5 })
  );
  plate.position.set(0, 0.62, 4.541);
  g.add(plate);

  // ----- Wheels (8 — front + 6 trailer/drive) ----------------------------
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.85 });
  const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.46, 24);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xb8b8c0, metalness: 0.75, roughness: 0.3,
  });
  const rimGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.48, 16);
  const wheels = [];
  const zPositions = [3.6, 0.6, -1.5, -3.8];
  for (const z of zPositions) {
    for (const x of [-1.3, 1.3]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.6, z);
      w.castShadow = !isMobile;
      g.add(w);
      wheels.push(w);
      // Rim (separate so it spins with wheel)
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      rim.position.copy(w.position);
      g.add(rim);
      // Lug bolts (simple)
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const lug = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 6, 6),
          new THREE.MeshStandardMaterial({ color: 0x666, metalness: 0.8 })
        );
        lug.position.set(x + Math.sign(x) * 0.005, 0.6 + Math.sin(a) * 0.15, z + Math.cos(a) * 0.15);
        g.add(lug);
      }
    }
  }

  g.userData.wheels = wheels;
  g.userData.headlights = [sl1, sl2];
  return g;
}

// ============================================================================
// Exhaust smoke (continuous trail of grey particles from stacks)
// ============================================================================
function buildSmokeSystem() {
  const count = 90;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const life = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    life[i] = Math.random();
    positions[i * 3 + 1] = Math.random() * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.6,
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    map: makeSmokeTexture(),
    blending: THREE.NormalBlending,
  });
  const mesh = new THREE.Points(geo, mat);
  return { mesh, geo, positions, velocities, life, count };
}
function updateSmoke(s, dt, intensity) {
  for (let i = 0; i < s.count; i++) {
    s.life[i] -= dt * 0.55;
    if (s.life[i] <= 0) {
      // Reset particle near stack
      s.life[i] = 1.0 + Math.random() * 0.5;
      const side = Math.random() < 0.5 ? -1.05 : 1.05;
      s.positions[i * 3]     = side + (Math.random() - 0.5) * 0.1;
      s.positions[i * 3 + 1] = 1.0;
      s.positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      s.velocities[i * 3]     = (Math.random() - 0.5) * 0.3;
      s.velocities[i * 3 + 1] = 1.5 + Math.random() * 0.6;
      s.velocities[i * 3 + 2] = -0.4 - Math.random() * 0.3;
    }
    s.positions[i * 3]     += s.velocities[i * 3]     * dt;
    s.positions[i * 3 + 1] += s.velocities[i * 3 + 1] * dt;
    s.positions[i * 3 + 2] += s.velocities[i * 3 + 2] * dt;
    s.velocities[i * 3 + 1] *= 0.99;
  }
  s.geo.attributes.position.needsUpdate = true;
  s.mesh.material.opacity = 0.35 * (1 - intensity * 0.6);
}

// ============================================================================
// NATO shield builder
// ============================================================================
function buildShield() {
  const g = new THREE.Group();

  // Base disc (dark navy)
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x142a52, roughness: 0.35, metalness: 0.55,
    emissive: 0x0a1838, emissiveIntensity: 0.4,
  });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 0.4, 96), baseMat);
  disc.rotation.x = Math.PI / 2;
  disc.castShadow = true;
  g.add(disc);

  // Gold rim torus
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, roughness: 0.18, metalness: 0.95,
    emissive: 0xd4af37, emissiveIntensity: 0.6,
  });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.22, 16, 96), rimMat);
  g.add(rim);

  // Inner blue disc
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(3.35, 3.35, 0.12, 80),
    new THREE.MeshStandardMaterial({
      color: 0x3a6cf0, emissive: 0x1c3ea0, emissiveIntensity: 0.55,
      roughness: 0.45, metalness: 0.3,
    })
  );
  inner.rotation.x = Math.PI / 2;
  inner.position.z = 0.12;
  g.add(inner);

  // NATO 4-point compass star
  const r1 = 2.7, r2 = 0.72;
  const sh = new THREE.Shape();
  for (let i = 0; i < 4; i++) {
    const a1 = (i / 4) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 0.5) / 4) * Math.PI * 2 - Math.PI / 2;
    const x1 = Math.cos(a1) * r1, y1 = Math.sin(a1) * r1;
    const x2 = Math.cos(a2) * r2, y2 = Math.sin(a2) * r2;
    if (i === 0) sh.moveTo(x1, y1);
    else sh.lineTo(x1, y1);
    sh.lineTo(x2, y2);
  }
  sh.closePath();
  const starGeo = new THREE.ExtrudeGeometry(sh, {
    depth: 0.2, bevelEnabled: true, bevelThickness: 0.06,
    bevelSegments: 2, bevelSize: 0.06, curveSegments: 4,
  });
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xfff8e8, roughness: 0.22, metalness: 0.7,
    emissive: 0xd4af37, emissiveIntensity: 0.4,
  });
  const star = new THREE.Mesh(starGeo, starMat);
  star.position.z = 0.2;
  g.add(star);

  // Compass lines from center (4 thin radial lines connecting to star)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 })
    );
    line.position.set(Math.cos(a) * 1.4, Math.sin(a) * 1.4, 0.21);
    line.rotation.z = a + Math.PI / 2;
    g.add(line);
  }

  // NATO text ring around rim
  const ringTex = makeNatoRingTexture();
  const textRing = new THREE.Mesh(
    new THREE.RingGeometry(3.0, 3.7, 64),
    new THREE.MeshBasicMaterial({
      map: ringTex, transparent: true, side: THREE.DoubleSide, depthWrite: false,
    })
  );
  textRing.position.z = 0.22;
  g.add(textRing);

  // Halo glow plane behind
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: { intensity: { value: 0.4 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float intensity;
        void main() {
          float d = distance(vUv, vec2(0.5));
          float a = smoothstep(0.5, 0.07, d) * intensity;
          gl_FragColor = vec4(1.0, 0.78, 0.32, a);
        }
      `,
    })
  );
  halo.position.z = -0.4;
  g.add(halo);

  g.userData.rim = rim;
  g.userData.star = star;
  g.userData.halo = halo;
  return g;
}

// ============================================================================
// Explosion particle system
// ============================================================================
function createParticleSystem(count) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const life = new Float32Array(count);
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setDrawRange(0, 0);
  const mat = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.24,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: makeParticleTexture(),
    sizeAttenuation: true,
  });
  const mesh = new THREE.Points(geo, mat);
  mesh.frustumCulled = false;
  return { mesh, geo, positions, velocities, colors, life, count };
}
function fireParticles(p, c) {
  for (let i = 0; i < p.count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const speed = 6 + Math.random() * 26;
    p.positions[i * 3]     = c.x + (Math.random() - 0.5) * 0.7;
    p.positions[i * 3 + 1] = c.y + (Math.random() - 0.5) * 0.7;
    p.positions[i * 3 + 2] = c.z + (Math.random() - 0.5) * 0.7;
    p.velocities[i * 3]     = Math.sin(phi) * Math.cos(theta) * speed;
    p.velocities[i * 3 + 1] = Math.cos(phi) * speed + 5 + Math.random() * 4;
    p.velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed * 0.7;
    p.life[i] = 1.1 + Math.random() * 0.6;
    const v = Math.random();
    if (v < 0.62) {
      // Warm gold core
      p.colors[i * 3]     = 1;
      p.colors[i * 3 + 1] = 0.78 + Math.random() * 0.22;
      p.colors[i * 3 + 2] = 0.22 + Math.random() * 0.3;
    } else if (v < 0.88) {
      // White-hot spark
      p.colors[i * 3]     = 1;
      p.colors[i * 3 + 1] = 1;
      p.colors[i * 3 + 2] = 0.92;
    } else {
      // Red ember
      p.colors[i * 3]     = 1;
      p.colors[i * 3 + 1] = 0.4;
      p.colors[i * 3 + 2] = 0.15;
    }
  }
  p.geo.attributes.position.needsUpdate = true;
  p.geo.attributes.color.needsUpdate = true;
  p.geo.setDrawRange(0, p.count);
}
function updateParticles(p, dt) {
  for (let i = 0; i < p.count; i++) {
    if (p.life[i] <= 0) continue;
    p.positions[i * 3]     += p.velocities[i * 3]     * dt;
    p.positions[i * 3 + 1] += p.velocities[i * 3 + 1] * dt;
    p.positions[i * 3 + 2] += p.velocities[i * 3 + 2] * dt;
    // Gravity
    p.velocities[i * 3 + 1] -= 14 * dt;
    // Drag
    p.velocities[i * 3]     *= 0.985;
    p.velocities[i * 3 + 1] *= 0.99;
    p.velocities[i * 3 + 2] *= 0.985;
    p.life[i] -= dt * 0.45;
    // Ground bounce
    if (p.positions[i * 3 + 1] < 0.06) {
      p.positions[i * 3 + 1] = 0.06;
      p.velocities[i * 3 + 1] *= -0.25;
      p.velocities[i * 3]     *= 0.55;
      p.velocities[i * 3 + 2] *= 0.55;
    }
    // Cool color over life
    p.colors[i * 3 + 2] *= 0.99;
    p.colors[i * 3 + 1] *= 0.998;
  }
  p.geo.attributes.position.needsUpdate = true;
  p.geo.attributes.color.needsUpdate = true;
}

// ============================================================================
// Texture helpers (CanvasTextures generated at init)
// ============================================================================
function makeDecalTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 384;
  const ctx = c.getContext("2d");
  // Bg
  const bg = ctx.createLinearGradient(0, 0, 0, 384);
  bg.addColorStop(0, "#f1f2f6");
  bg.addColorStop(1, "#cdd0d8");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 384);
  // Gold bands
  ctx.fillStyle = "#d4af37";
  ctx.fillRect(0, 0, 1024, 10);
  ctx.fillRect(0, 374, 1024, 10);
  // Brand mark
  ctx.fillStyle = "#04070d";
  ctx.font = "bold 130px Space Grotesk, Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NEVAL IMPEX", 512, 130);
  // Subtitle gold
  ctx.fillStyle = "#a07c10";
  ctx.font = "600 46px Inter, Arial, sans-serif";
  ctx.fillText("DEFENSE SUPPLY  ·  NATO PARTNER", 512, 210);
  // Codes mono
  ctx.fillStyle = "#444";
  ctx.font = "500 34px JetBrains Mono, Consolas, monospace";
  ctx.fillText("SAM.gov  YY8LMLPTE4C5   ·   CAGE 1HAZL", 512, 290);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function makeNatoRingTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const ctx = c.getContext("2d");
  const n = 16;
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.translate(512, 512);
    ctx.rotate((i / n) * Math.PI * 2);
    ctx.font = "bold 52px Space Grotesk, sans-serif";
    ctx.fillStyle = "#fff8e0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★  NATO", 0, -440);
    ctx.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeParticleTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,225,120,0.9)");
  g.addColorStop(0.6, "rgba(255,140,30,0.4)");
  g.addColorStop(1, "rgba(255,80,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeSmokeTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(180,180,180,0.5)");
  g.addColorStop(0.5, "rgba(140,140,140,0.2)");
  g.addColorStop(1, "rgba(100,100,100,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// ============================================================================
// Highway sign — pole + blue panel with white text
// ============================================================================
function buildHighwaySign(line1, line2) {
  const g = new THREE.Group();
  // Pole
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x6a6a6e, metalness: 0.7, roughness: 0.4 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 5, 12), poleMat);
  pole.position.y = 2.5;
  pole.castShadow = true;
  g.add(pole);
  // Reflective stripe near bottom of pole
  const stripe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.6, 12),
    new THREE.MeshStandardMaterial({ color: 0xfff0c2, emissive: 0xd4af37, emissiveIntensity: 0.5 })
  );
  stripe.position.y = 0.6;
  g.add(stripe);
  // Sign panel (front face — blue with text)
  const tex = makeRoadSignTexture(line1, line2);
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 1.7),
    new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.6, metalness: 0.05,
      emissive: 0x223380, emissiveIntensity: 0.15,
    })
  );
  panel.position.set(0, 4.2, 0);
  panel.castShadow = true;
  g.add(panel);
  // Back face (gray steel)
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 1.7),
    new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.7 })
  );
  back.position.set(0, 4.2, -0.02);
  back.rotation.y = Math.PI;
  g.add(back);
  // Frame border
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x222 });
  const fTop = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.08, 0.06), frameMat);
  fTop.position.set(0, 5.06, 0); g.add(fTop);
  const fBot = fTop.clone(); fBot.position.y = 3.34; g.add(fBot);
  return g;
}

function makeRoadSignTexture(line1, line2) {
  const c = document.createElement("canvas");
  c.width = 760; c.height = 340;
  const ctx = c.getContext("2d");
  // Blue background (highway sign blue)
  ctx.fillStyle = "#0d3a8a"; ctx.fillRect(0, 0, 760, 340);
  // White inner border
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, 732, 312);
  // Line 1 — destination (white, big)
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 76px Space Grotesk, Arial Black, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(line1, 380, 140);
  // Line 2 — secondary info (smaller)
  ctx.font = "600 50px Inter, Arial, sans-serif";
  ctx.fillStyle = "#d8e3ff";
  ctx.fillText(line2, 380, 230);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ============================================================================
// Military base gate — two pillars + crossbar + warning sign + lights
// ============================================================================
function buildMilitaryGate() {
  const g = new THREE.Group();
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8a8a92, roughness: 0.9 });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, metalness: 0.8, roughness: 0.3,
    emissive: 0x3a2a08, emissiveIntensity: 0.3,
  });
  for (const x of [-5.5, 5.5]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 6.5, 1.3), pillarMat);
    pillar.position.set(x, 3.25, 0);
    pillar.castShadow = true;
    g.add(pillar);
    // Gold trim band on pillar
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.18, 1.36), trimMat);
    band.position.set(x, 6, 0); g.add(band);
    const band2 = band.clone(); band2.position.y = 0.6; g.add(band2);
    // Light fixture on top
    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.45, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xfff5d8, emissive: 0xffcc66, emissiveIntensity: 2.2 })
    );
    lamp.position.set(x, 6.7, 0); g.add(lamp);
    // Point light spilling onto road
    const pl = new THREE.PointLight(0xffcc66, 1.4, 14, 1.6);
    pl.position.set(x, 6.5, 0); g.add(pl);
  }
  // Crossbar
  const crossbar = new THREE.Mesh(new THREE.BoxGeometry(12, 0.9, 1.3), pillarMat);
  crossbar.position.set(0, 6.95, 0);
  crossbar.castShadow = true;
  g.add(crossbar);
  // Gold trim on crossbar bottom
  const cTrim = new THREE.Mesh(new THREE.BoxGeometry(11.9, 0.1, 1.35), trimMat);
  cTrim.position.set(0, 6.46, 0); g.add(cTrim);
  // Warning sign on the crossbar
  const signTex = makeGateSignTexture();
  const signPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(9.5, 0.75),
    new THREE.MeshStandardMaterial({
      map: signTex,
      emissive: 0x222200, emissiveIntensity: 0.25,
    })
  );
  signPanel.position.set(0, 6.95, 0.66);
  g.add(signPanel);
  return g;
}

function makeGateSignTexture() {
  const c = document.createElement("canvas");
  c.width = 1400; c.height = 130;
  const ctx = c.getContext("2d");
  // Dark background
  ctx.fillStyle = "#15151a"; ctx.fillRect(0, 0, 1400, 130);
  // Gold border
  ctx.strokeStyle = "#d4af37"; ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 1392, 122);
  // Text
  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 58px Space Grotesk, Arial, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("⚠   RESTRICTED   ·   NATO PARTNER FACILITY   ·   NSF DEVESELU   ⚠", 700, 65);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ============================================================================
// Watchtower — legs + platform + cabin + glowing window
// ============================================================================
function buildWatchtower() {
  const g = new THREE.Group();
  const legMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5e, roughness: 0.8 });
  for (const x of [-1.1, 1.1]) {
    for (const z of [-1.1, 1.1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5.5, 0.18), legMat);
      leg.position.set(x, 2.75, z);
      g.add(leg);
    }
  }
  // Cross-braces (X pattern on one face)
  const brace = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.08, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x444 })
  );
  brace.position.set(0, 2, 1.1);
  brace.rotation.z = Math.PI / 6;
  g.add(brace);
  const brace2 = brace.clone();
  brace2.rotation.z = -Math.PI / 6;
  g.add(brace2);
  // Platform
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 0.22, 2.9),
    new THREE.MeshStandardMaterial({ color: 0x404045, roughness: 0.9 })
  );
  platform.position.y = 5.6;
  platform.castShadow = true;
  g.add(platform);
  // Cabin
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.8, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x14223e, roughness: 0.4, metalness: 0.2 })
  );
  cabin.position.y = 6.6;
  cabin.castShadow = true;
  g.add(cabin);
  // Roof (pyramidal)
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.7, 0.9, 4),
    new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.8 })
  );
  roof.position.y = 7.95;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  // Glowing window facing the road
  const win = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.65),
    new THREE.MeshStandardMaterial({
      color: 0xfff5d8, emissive: 0xffcc66, emissiveIntensity: 1.9,
    })
  );
  win.position.set(0, 6.7, 1.11);
  g.add(win);
  // Soft light spilling from window
  const winLight = new THREE.PointLight(0xffcc66, 0.7, 10, 2);
  winLight.position.set(0, 6.7, 1.5);
  g.add(winLight);
  return g;
}

// ============================================================================
// Fence segment — post + 3 horizontal cables
// ============================================================================
function buildFenceSegment() {
  const g = new THREE.Group();
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x444, roughness: 0.7 })
  );
  post.position.y = 1.3;
  g.add(post);
  for (let i = 0; i < 4; i++) {
    const cable = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.025, 0.025),
      new THREE.MeshStandardMaterial({ color: 0x666 })
    );
    cable.position.set(-1.75, 0.4 + i * 0.65, 0);
    g.add(cable);
  }
  return g;
}

// ============================================================================
// Radar — concrete base, steel tower, rotating parabolic dish + sweep light
// ============================================================================
function buildRadar() {
  const g = new THREE.Group();

  // ---- Concrete foundation pad (wide, two-tier) -------------------------
  const padOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(3.6, 3.8, 0.3, 32),
    new THREE.MeshStandardMaterial({ color: 0x4a4a52, roughness: 0.95 })
  );
  padOuter.position.y = 0.15;
  padOuter.receiveShadow = true;
  g.add(padOuter);

  const padInner = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.5, 0.6, 24),
    new THREE.MeshStandardMaterial({ color: 0x5a5a62, roughness: 0.92 })
  );
  padInner.position.y = 0.4;
  padInner.castShadow = true;
  g.add(padInner);

  // Concrete bollards around the pad
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const bollard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.7, 12),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.5, emissive: 0x3a2a08, emissiveIntensity: 0.2 })
    );
    bollard.position.set(Math.cos(a) * 3.5, 0.35, Math.sin(a) * 3.5);
    g.add(bollard);
  }

  // ---- Lattice tower (4 vertical legs + diagonal bracing) ----------------
  const towerHeight = 7.5;
  const towerBaseR = 0.85;
  const towerTopR = 0.55;
  const legMat = new THREE.MeshStandardMaterial({
    color: 0x8c8c92, metalness: 0.55, roughness: 0.45,
  });
  // Cylindrical core (so the lattice looks like it has a hub)
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.25, towerHeight, 12),
    legMat
  );
  core.position.y = 0.7 + towerHeight / 2;
  core.castShadow = true;
  g.add(core);

  // 4 lattice legs (tapering inward toward top)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const xBot = Math.cos(a) * towerBaseR;
    const zBot = Math.sin(a) * towerBaseR;
    const xTop = Math.cos(a) * towerTopR;
    const zTop = Math.sin(a) * towerTopR;
    const dx = xTop - xBot, dz = zTop - zBot;
    const legLen = Math.sqrt(dx * dx + dz * dz + towerHeight * towerHeight);
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.10, legLen, 8),
      legMat
    );
    leg.position.set((xBot + xTop) / 2, 0.7 + towerHeight / 2, (zBot + zTop) / 2);
    // Rotate the cylinder to align with leg direction
    leg.lookAt(new THREE.Vector3(xTop, 0.7 + towerHeight, zTop));
    leg.rotateX(Math.PI / 2);
    leg.castShadow = true;
    g.add(leg);

    // Horizontal cross-bars between adjacent legs at 4 heights
    const nextA = ((i + 1) / 4) * Math.PI * 2 + Math.PI / 4;
    for (let h = 0; h < 5; h++) {
      const t = h / 4;
      const rr = towerBaseR + (towerTopR - towerBaseR) * t;
      const y = 0.7 + towerHeight * t;
      const x1 = Math.cos(a) * rr;
      const z1 = Math.sin(a) * rr;
      const x2 = Math.cos(nextA) * rr;
      const z2 = Math.sin(nextA) * rr;
      const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
      const cross = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, len, 6),
        legMat
      );
      cross.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      cross.lookAt(new THREE.Vector3(x2, y, z2));
      cross.rotateX(Math.PI / 2);
      g.add(cross);
    }
    // Diagonal bracing per face
    for (let h = 0; h < 4; h++) {
      const t1 = h / 4, t2 = (h + 1) / 4;
      const rr1 = towerBaseR + (towerTopR - towerBaseR) * t1;
      const rr2 = towerBaseR + (towerTopR - towerBaseR) * t2;
      const y1 = 0.7 + towerHeight * t1;
      const y2 = 0.7 + towerHeight * t2;
      const x1 = Math.cos(a) * rr1;
      const z1 = Math.sin(a) * rr1;
      const x2 = Math.cos(nextA) * rr2;
      const z2 = Math.sin(nextA) * rr2;
      const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
      const diag = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, len, 6),
        legMat
      );
      diag.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
      diag.lookAt(new THREE.Vector3(x2, y2, z2));
      diag.rotateX(Math.PI / 2);
      g.add(diag);
    }
  }

  // ---- Maintenance platforms (2 levels) ---------------------------------
  for (const y of [3.5, 6.5]) {
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.3, 0.08, 24),
      new THREE.MeshStandardMaterial({ color: 0x666, metalness: 0.5, roughness: 0.6 })
    );
    platform.position.y = y;
    platform.castShadow = true;
    g.add(platform);
    // Railing around platform
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x999 })
      );
      post.position.set(Math.cos(a) * 1.28, y + 0.44, Math.sin(a) * 1.28);
      g.add(post);
    }
    // Top railing (torus)
    const rail = new THREE.Mesh(
      new THREE.TorusGeometry(1.28, 0.025, 6, 32),
      new THREE.MeshStandardMaterial({ color: 0x999 })
    );
    rail.rotation.x = Math.PI / 2;
    rail.position.y = y + 0.84;
    g.add(rail);
  }

  // ---- Service ladder running up the tower ------------------------------
  for (let h = 0; h < 14; h++) {
    const rung = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.04, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x777 })
    );
    rung.position.set(0, 0.9 + h * 0.55, towerBaseR + 0.1);
    g.add(rung);
  }
  // Ladder rails
  for (const dx of [-0.25, 0.25]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 8.5, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x777 })
    );
    rail.position.set(dx, 4.5, towerBaseR + 0.1);
    g.add(rail);
  }

  // ---- Cable trays running from tower base to ground -------------------
  for (let i = 0; i < 3; i++) {
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x222 })
    );
    cable.position.set(-0.5 + i * 0.5, 0.4, towerBaseR + 0.2);
    cable.rotation.x = Math.PI / 2;
    g.add(cable);
  }
  // Junction box at the base
  const jBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.4, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.5, roughness: 0.4 })
  );
  jBox.position.set(0, 1.0, towerBaseR + 0.5);
  g.add(jBox);

  // ---- Yoke / pedestal at the top (the rotating-azimuth mount) ----------
  const yokeBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.7, 0.4, 16),
    new THREE.MeshStandardMaterial({ color: 0x444, metalness: 0.5 })
  );
  yokeBase.position.y = 8.45;
  g.add(yokeBase);

  // ---- Rotating dish assembly -------------------------------------------
  const dishGroup = new THREE.Group();
  dishGroup.position.y = 8.85;
  g.add(dishGroup);

  // Yoke arms (two side arms holding the dish at elevation pivot)
  for (const dx of [-1.1, 1.1]) {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 1.5, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x6e6e76, metalness: 0.55, roughness: 0.4 })
    );
    arm.position.set(dx, 0.6, 0);
    arm.castShadow = true;
    dishGroup.add(arm);
  }
  // Elevation pivot cross-bar between arms
  const pivot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 2.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x888, metalness: 0.7, roughness: 0.3 })
  );
  pivot.rotation.z = Math.PI / 2;
  pivot.position.y = 1.2;
  dishGroup.add(pivot);

  // Parabolic dish (lathe geometry, deeper curve, bigger)
  const dishPoints = [];
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    const x = t * 2.4;
    const y = t * t * 0.7;
    dishPoints.push(new THREE.Vector2(x, y));
  }
  const dishGeo = new THREE.LatheGeometry(dishPoints, 48);
  const dish = new THREE.Mesh(
    dishGeo,
    new THREE.MeshStandardMaterial({
      color: 0xe4e6ea, metalness: 0.45, roughness: 0.3,
      side: THREE.DoubleSide,
    })
  );
  dish.rotation.x = -Math.PI / 2.4;
  dish.position.y = 1.2;
  dish.castShadow = true;
  dishGroup.add(dish);

  // Concentric rings on the back of the dish (structural ribs)
  for (let r = 0.6; r < 2.2; r += 0.5) {
    const rib = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.04, 6, 32),
      new THREE.MeshStandardMaterial({ color: 0xb0b2b8, metalness: 0.6, roughness: 0.4 })
    );
    rib.rotation.x = -Math.PI / 2.4;
    rib.position.y = 1.2 + 0.7 * (r / 2.4) * (r / 2.4);
    dishGroup.add(rib);
  }

  // Radial bracing struts behind the dish
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const strut = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.04, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xb0b2b8, metalness: 0.5 })
    );
    strut.position.set(0, 1.2 - 0.2, 0);
    strut.rotation.z = a;
    strut.rotation.x = -Math.PI / 2.4;
    dishGroup.add(strut);
  }

  // Antenna feed assembly (tripod + waveguide horn at focal point)
  const feedTripodMat = new THREE.MeshStandardMaterial({ color: 0xaaa, metalness: 0.6, roughness: 0.4 });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6),
      feedTripodMat
    );
    arm.position.set(Math.cos(a) * 0.8, 1.6, Math.sin(a) * 0.8 + 0.7);
    arm.lookAt(0, 1.2 + 1.4, 1.6);
    arm.rotateX(Math.PI / 2);
    dishGroup.add(arm);
  }
  // Waveguide horn (rectangular)
  const horn = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.35, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x999, metalness: 0.7, roughness: 0.3 })
  );
  horn.position.set(0, 1.2 + 1.3, 1.4);
  dishGroup.add(horn);
  const hornFlare = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.4, 4, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x666, metalness: 0.7, side: THREE.DoubleSide })
  );
  hornFlare.position.set(0, 1.2 + 1.3, 1.85);
  hornFlare.rotation.x = -Math.PI / 2;
  hornFlare.rotation.y = Math.PI / 4;
  dishGroup.add(hornFlare);

  // Cabling from feed back to base of dish
  for (let i = 0; i < 3; i++) {
    const cab = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x222 })
    );
    cab.position.set(-0.05 + i * 0.05, 1.2 + 0.9, 1.0);
    cab.lookAt(0, 1.2 + 0.2, 0);
    cab.rotateX(Math.PI / 2);
    dishGroup.add(cab);
  }

  // Red aviation warning lights (on dish edge + tower)
  const blink = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xff3030, emissive: 0xff3030, emissiveIntensity: 2.5,
    })
  );
  blink.position.set(2.1, 1.2 - 0.4, 0.5);
  dishGroup.add(blink);
  const blink2 = blink.clone();
  blink2.position.set(-2.1, 1.2 - 0.4, 0.5);
  dishGroup.add(blink2);

  // Tower-mounted red aviation warning lights at 3 heights
  for (const h of [2.5, 5.5]) {
    const tl = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xff3030, emissive: 0xff3030, emissiveIntensity: 1.4 })
    );
    tl.position.set(towerBaseR + 0.1, h, 0);
    g.add(tl);
  }

  // (No volumetric sweep cone — removed per user feedback. Dish still
  // rotates and the red aviation lights still pulse.)

  g.userData.dishGroup = dishGroup;
  g.userData.blink = blink;
  // sweepLight kept as a no-op object so the existing tick() reference
  // (`radar.userData.sweepLight.intensity = ...`) doesn't crash.
  g.userData.sweepLight = { intensity: 0 };
  return g;
}

// ============================================================================
// Warehouse — boxy industrial building with roof + windows + bay door
// ============================================================================
function buildWarehouse(w, h, d, color) {
  const g = new THREE.Group();
  // Main box
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.1 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);
  // Slightly pitched roof line (a darker top band)
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(w * 1.02, 0.4, d * 1.02),
    new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.9 })
  );
  roof.position.y = h + 0.1;
  g.add(roof);
  // Vertical corrugated stripes (panels) on front and back faces
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.85 });
  for (let x = -w / 2 + 0.6; x < w / 2; x += 1.2) {
    for (const dz of [d / 2 + 0.01, -d / 2 - 0.01]) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, h - 0.4, 0.06),
        stripeMat
      );
      stripe.position.set(x, h / 2 - 0.2, dz);
      g.add(stripe);
    }
  }
  // Roll-up bay door on front
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(Math.min(4, w * 0.5), Math.min(h * 0.7, 4)),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.5, metalness: 0.3, emissive: 0x3a2a08, emissiveIntensity: 0.15 })
  );
  door.position.set(0, Math.min(h * 0.7, 4) / 2, d / 2 + 0.011);
  g.add(door);
  // Door horizontal lines
  for (let yy = 0.4; yy < Math.min(h * 0.7, 4); yy += 0.4) {
    const dl = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.min(4, w * 0.5) - 0.1, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x8a6a1a, roughness: 0.6 })
    );
    dl.position.set(0, yy, d / 2 + 0.012);
    g.add(dl);
  }
  // Small window strip near roof
  if (h > 5) {
    const winStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.85, 0.6),
      new THREE.MeshStandardMaterial({
        color: 0xffeebb, emissive: 0xffcc66, emissiveIntensity: 1.0,
        transparent: true, opacity: 0.9,
      })
    );
    winStrip.position.set(0, h - 0.9, d / 2 + 0.012);
    g.add(winStrip);
  }
  return g;
}

// ============================================================================
// Shipping container — colored 20ft container with corrugated sides
// ============================================================================
function buildContainer(color) {
  const g = new THREE.Group();
  // Body (2.4m x 2.6m x 6m approx)
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 2.55, 5.9),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.3 })
  );
  body.position.y = 1.275;
  body.castShadow = true;
  g.add(body);
  // Corrugated stripes on long sides
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0x000, roughness: 0.8 });
  for (let z = -2.7; z < 2.7; z += 0.3) {
    for (const dx of [1.451, -1.451]) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 2.4, 0.04),
        stripeMat
      );
      stripe.position.set(dx, 1.275, z);
      g.add(stripe);
    }
  }
  // Top edge band (darker)
  const topBand = new THREE.Mesh(
    new THREE.BoxGeometry(2.92, 0.1, 5.92),
    new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.7 })
  );
  topBand.position.y = 2.55;
  g.add(topBand);
  // Bottom rails (corner casts)
  const botBand = topBand.clone();
  botBand.position.y = 0.0;
  g.add(botBand);
  // Door details on one end
  const doorPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(2.7, 2.3),
    new THREE.MeshStandardMaterial({ color: color * 0.85, roughness: 0.5 })
  );
  doorPanel.position.set(0, 1.275, 2.961);
  g.add(doorPanel);
  // Door rods (2 vertical handles)
  for (const dx of [-0.7, 0.7]) {
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 2.0, 8),
      new THREE.MeshStandardMaterial({ color: 0x222, metalness: 0.6 })
    );
    rod.position.set(dx, 1.275, 2.972);
    g.add(rod);
  }
  return g;
}

// ============================================================================
// Tall stadium-style light mast — pole + crossbar + 4 LED panels
// ============================================================================
function buildLightMast() {
  const g = new THREE.Group();
  // Concrete base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.3, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x55555c, roughness: 0.9 })
  );
  base.position.y = 0.15;
  g.add(base);
  // Tapered pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.2, 9, 12),
    new THREE.MeshStandardMaterial({ color: 0x7a7a82, metalness: 0.5, roughness: 0.5 })
  );
  pole.position.y = 4.8;
  pole.castShadow = true;
  g.add(pole);
  // Crossbar at the top
  const crossbar = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.16, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x6a6a72, metalness: 0.5, roughness: 0.5 })
  );
  crossbar.position.y = 9.2;
  g.add(crossbar);
  // 4 LED light panels on crossbar
  for (let i = -1; i <= 1; i++) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.35, 0.18),
      new THREE.MeshStandardMaterial({
        color: 0xfff5d8, emissive: 0xffeebb, emissiveIntensity: 2.5,
        roughness: 0.2,
      })
    );
    panel.position.set(i * 0.65, 9.0, 0);
    panel.rotation.x = -Math.PI / 5;
    g.add(panel);
  }
  // Point light spilling onto the apron
  const pl = new THREE.PointLight(0xffcc88, 0.6, 22, 1.6);
  pl.position.y = 9.0;
  g.add(pl);
  return g;
}

// ============================================================================
// Fuel/utility tank — horizontal cylindrical tank on supports
// ============================================================================
function buildFuelTank() {
  const g = new THREE.Group();
  // Tank body
  const tankMat = new THREE.MeshStandardMaterial({
    color: 0x9aa6bd, metalness: 0.6, roughness: 0.45,
  });
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 3.0, 24), tankMat);
  tank.rotation.z = Math.PI / 2;
  tank.position.y = 1.2;
  tank.castShadow = true;
  g.add(tank);
  // End caps (slightly darker)
  for (const dx of [-1.5, 1.5]) {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 16, 12, 0, Math.PI, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0x7a8696, metalness: 0.55, roughness: 0.5 })
    );
    cap.position.set(dx, 1.2, 0);
    cap.rotation.y = dx > 0 ? -Math.PI / 2 : Math.PI / 2;
    g.add(cap);
  }
  // Saddle supports
  for (const dx of [-1.0, 1.0]) {
    const saddle = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 1.0, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x55555c, roughness: 0.9 })
    );
    saddle.position.set(dx, 0.5, 0);
    g.add(saddle);
  }
  // Hazard stripe band around the tank
  const stripe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.91, 0.91, 0.3, 24),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.5, emissive: 0x3a2a08, emissiveIntensity: 0.2 })
  );
  stripe.rotation.z = Math.PI / 2;
  stripe.position.y = 1.2;
  g.add(stripe);
  // Pressure gauge / valve on top
  const valve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.3, 12),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6 })
  );
  valve.position.y = 2.25;
  g.add(valve);
  return g;
}

// ============================================================================
// Admin block — three-story office building with rows of windows
// ============================================================================
function buildAdminBlock() {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x34363c, roughness: 0.7, metalness: 0.15 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(10, 9, 14), bodyMat);
  body.position.y = 4.5;
  body.castShadow = true;
  g.add(body);
  // Gold trim band at top
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(10.1, 0.25, 14.1),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.4, emissive: 0x3a2a08, emissiveIntensity: 0.25 })
  );
  trim.position.y = 8.85;
  g.add(trim);
  // Window grid — 3 rows × multiple columns on each side face
  const winMat = new THREE.MeshStandardMaterial({
    color: 0xffeebb, emissive: 0xffcc66, emissiveIntensity: 1.2,
    roughness: 0.2,
  });
  const winDimMat = new THREE.MeshStandardMaterial({
    color: 0x222, roughness: 0.3, metalness: 0.5,
  });
  // Front face (z = +7.01)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 6; col++) {
      const lit = Math.random() > 0.4;
      const w = new THREE.Mesh(
        new THREE.PlaneGeometry(1.0, 1.2),
        lit ? winMat : winDimMat
      );
      w.position.set(-3.7 + col * 1.5, 2.0 + row * 2.5, 7.011);
      g.add(w);
    }
  }
  // Side face — narrower
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const lit = Math.random() > 0.5;
      const w = new THREE.Mesh(
        new THREE.PlaneGeometry(1.0, 1.2),
        lit ? winMat : winDimMat
      );
      w.position.set(5.011, 2.0 + row * 2.5, -3.5 + col * 2.3);
      w.rotation.y = Math.PI / 2;
      g.add(w);
    }
  }
  // Entrance canopy
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.18, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6 })
  );
  canopy.position.set(0, 1.6, 7.6);
  g.add(canopy);
  // Entrance door (golden glow)
  const entrance = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xffd88a, emissive: 0xffaa44, emissiveIntensity: 0.8 })
  );
  entrance.position.set(0, 1.2, 7.012);
  g.add(entrance);
  return g;
}

// ============================================================================
// Guard cabin — small security kiosk near the gate
// ============================================================================
function buildGuardCabin() {
  const g = new THREE.Group();
  // Concrete plinth
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.3, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x44444a, roughness: 0.9 })
  );
  plinth.position.y = 0.15;
  g.add(plinth);
  // Cabin body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.4, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x14223e, roughness: 0.5, metalness: 0.2 })
  );
  body.position.y = 1.5;
  body.castShadow = true;
  g.add(body);
  // Roof overhang
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.16, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.8 })
  );
  roof.position.y = 2.75;
  g.add(roof);
  // Window (large glowing pane)
  const win = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 1.0),
    new THREE.MeshStandardMaterial({
      color: 0xffeebb, emissive: 0xffcc66, emissiveIntensity: 1.5,
      roughness: 0.2,
    })
  );
  win.position.set(0, 1.7, 1.011);
  g.add(win);
  // Door (side)
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x2a2c32, roughness: 0.6 })
  );
  door.position.set(1.111, 1.1, 0);
  door.rotation.y = Math.PI / 2;
  g.add(door);
  // Light spilling
  const pl = new THREE.PointLight(0xffcc88, 0.6, 8, 1.8);
  pl.position.set(0, 1.7, 1.3);
  g.add(pl);
  return g;
}

// ============================================================================
// Phased-array radar — flat panel mounted on a stout tower (modern style)
// ============================================================================
function buildPhasedArray() {
  const g = new THREE.Group();
  // Concrete base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.4, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x4a4a52, roughness: 0.95 })
  );
  base.position.y = 0.2;
  g.add(base);
  // Stout pyramidal pedestal
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 1.2, 3.0, 4),
    new THREE.MeshStandardMaterial({ color: 0x6e6e76, metalness: 0.4, roughness: 0.6 })
  );
  pedestal.position.y = 1.9;
  pedestal.rotation.y = Math.PI / 4;
  pedestal.castShadow = true;
  g.add(pedestal);
  // Pivot block
  const pivot = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.6, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x444, metalness: 0.55 })
  );
  pivot.position.y = 3.7;
  g.add(pivot);
  // Flat panel array face
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 4.4, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.5, metalness: 0.3 })
  );
  panel.position.set(0, 5.7, 0);
  panel.rotation.x = -Math.PI / 9;
  panel.castShadow = true;
  g.add(panel);
  // Panel face — gold accent grid (visible array elements)
  const arrayFace = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 4.0),
    new THREE.MeshStandardMaterial({
      color: 0x1a1c20, roughness: 0.6, metalness: 0.4,
      emissive: 0x1a3060, emissiveIntensity: 0.2,
    })
  );
  arrayFace.position.set(0, 5.7, 0.176);
  arrayFace.rotation.x = -Math.PI / 9;
  g.add(arrayFace);
  // Grid of small bright dots (array elements)
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      const dot = new THREE.Mesh(
        new THREE.CircleGeometry(0.08, 8),
        new THREE.MeshStandardMaterial({
          color: 0xd4af37, emissive: 0xd4af37, emissiveIntensity: 0.6,
        })
      );
      // Place on the slanted panel face (approx)
      const lx = -1.4 + col * 0.7;
      const ly = -1.7 + row * 0.6;
      dot.position.set(lx, 5.7 + ly * Math.cos(-Math.PI / 9), 0.18 + ly * Math.sin(Math.PI / 9));
      dot.rotation.x = -Math.PI / 9;
      g.add(dot);
    }
  }
  // Frame around panel (gold trim)
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(3.7, 4.5, 0.4),
    new THREE.MeshStandardMaterial({
      color: 0xd4af37, metalness: 0.7, roughness: 0.35,
      emissive: 0x3a2a08, emissiveIntensity: 0.2,
    })
  );
  frame.position.set(0, 5.7, -0.05);
  frame.rotation.x = -Math.PI / 9;
  g.add(frame);
  // Mounted at top: small omnidirectional antenna
  const omni = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8),
    new THREE.MeshStandardMaterial({ color: 0xaaa })
  );
  omni.position.set(0, 8.5, 0);
  g.add(omni);
  const omniTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xff3030, emissive: 0xff3030, emissiveIntensity: 1.5 })
  );
  omniTip.position.set(0, 9.2, 0);
  g.add(omniTip);
  // Cable run from base to pivot
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 3.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x222 })
    );
    c.position.set(-0.3 + i * 0.18, 2.0, 0.55);
    g.add(c);
  }
  // Maintenance ladder on the back
  for (let h = 0; h < 7; h++) {
    const rung = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.03, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x999 })
    );
    rung.position.set(0, 0.6 + h * 0.45, -0.7);
    g.add(rung);
  }
  return g;
}

// ============================================================================
// Small antenna — companion tower with blinking light
// ============================================================================
function buildAntenna() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.5, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x5a5a60, roughness: 0.9 })
  );
  base.position.y = 0.25;
  g.add(base);
  // Lattice tower (3 stacked pyramids)
  for (let i = 0; i < 3; i++) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18 - i * 0.04, 0.26 - i * 0.04, 2, 6),
      new THREE.MeshStandardMaterial({ color: 0x888, metalness: 0.4, roughness: 0.5 })
    );
    seg.position.y = 1.5 + i * 2;
    g.add(seg);
  }
  // Antenna rods
  for (let j = 0; j < 4; j++) {
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.6, 6),
      new THREE.MeshStandardMaterial({ color: 0xaaa })
    );
    rod.position.y = 7.5;
    rod.position.x = Math.sin(j) * 0.1;
    g.add(rod);
  }
  // Red blink at top
  const blink = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xff3030, emissive: 0xff3030, emissiveIntensity: 1.4,
    })
  );
  blink.position.y = 8.3;
  g.add(blink);
  g.userData.blink = blink;
  return g;
}

// ============================================================================
// Easing helpers
// ============================================================================
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Seeded PRNG so the skyline layout is identical on every load.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================================
// Skyscraper — tall building with random window pattern (city silhouette)
// ============================================================================
function buildSkyscraper(w, h, d, tint, rand) {
  const g = new THREE.Group();

  // Concrete plinth at the base (slightly wider)
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.3, 0.6, d + 0.3),
    new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.92 })
  );
  plinth.position.y = 0.3;
  g.add(plinth);

  // Main tower body (dark — silhouette feel)
  const bodyColor = new THREE.Color(tint, tint, tint + 4).convertLinearToSRGB();
  // Build a colour from tint byte (e.g. 0x1c -> #1c1c20)
  const c = tint;
  const bodyHex = (c << 16) | (c << 8) | (c + 4);
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({
      color: bodyHex,
      roughness: 0.78,
      metalness: 0.18,
    })
  );
  body.position.y = h / 2 + 0.6;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Window grid — small bright dots representing lit windows.
  // Use random sparseness so each building looks unique. Group all the
  // lit windows of one building into a single Points mesh for performance.
  const winCols = Math.max(3, Math.floor(w * 1.7));
  const winRows = Math.max(8, Math.floor(h * 0.6));
  const winSpacingX = w * 0.85 / winCols;
  const winSpacingY = (h - 1.2) / winRows;
  const litPositions = [];
  const litColors = [];

  // Lit windows on the two long faces
  for (const face of [-1, 1]) {
    for (let row = 0; row < winRows; row++) {
      for (let col = 0; col < winCols; col++) {
        if (rand() > 0.55) continue;          // only ~45% of windows are lit
        const px = -w * 0.4 + col * winSpacingX + winSpacingX / 2;
        const py = 0.9 + row * winSpacingY + winSpacingY / 2;
        const pz = face * (d / 2 + 0.02);
        litPositions.push(px, py, pz);
        // Mostly warm yellow, occasionally cool white
        if (rand() > 0.85) {
          litColors.push(0.85, 0.9, 1.0);
        } else {
          litColors.push(1.0, 0.85 + rand() * 0.1, 0.5 + rand() * 0.2);
        }
      }
    }
  }
  // Lit windows on the two short faces
  for (const face of [-1, 1]) {
    const cols2 = Math.max(2, Math.floor(d * 1.7));
    const spacing2 = d * 0.85 / cols2;
    for (let row = 0; row < winRows; row++) {
      for (let col = 0; col < cols2; col++) {
        if (rand() > 0.5) continue;
        const px = face * (w / 2 + 0.02);
        const py = 0.9 + row * winSpacingY + winSpacingY / 2;
        const pz = -d * 0.4 + col * spacing2 + spacing2 / 2;
        litPositions.push(px, py, pz);
        if (rand() > 0.85) {
          litColors.push(0.85, 0.9, 1.0);
        } else {
          litColors.push(1.0, 0.85 + rand() * 0.1, 0.5 + rand() * 0.2);
        }
      }
    }
  }

  if (litPositions.length > 0) {
    const winGeo = new THREE.BufferGeometry();
    winGeo.setAttribute("position", new THREE.Float32BufferAttribute(litPositions, 3));
    winGeo.setAttribute("color", new THREE.Float32BufferAttribute(litColors, 3));
    const winMat = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    g.add(new THREE.Points(winGeo, winMat));
  }

  // Subtle gold trim band at the top (corporate skyscraper feel)
  if (h > 30) {
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(w * 1.04, 0.2, d * 1.04),
      new THREE.MeshStandardMaterial({
        color: 0xd4af37, metalness: 0.7, roughness: 0.4,
        emissive: 0x3a2a08, emissiveIntensity: 0.25,
      })
    );
    trim.position.y = h - 0.6;
    g.add(trim);
  }

  // Roof structure — antenna or HVAC box for variety
  const roofChoice = rand();
  if (roofChoice > 0.6 && h > 35) {
    // Antenna on top
    const ant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 4 + rand() * 4, 6),
      new THREE.MeshStandardMaterial({ color: 0xaaa })
    );
    ant.position.y = h + 2.5;
    g.add(ant);
  } else if (roofChoice > 0.3) {
    // HVAC box
    const hvac = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.5, 0.8, d * 0.5),
      new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.8 })
    );
    hvac.position.y = h + 0.7;
    g.add(hvac);
  }

  return g;
}
