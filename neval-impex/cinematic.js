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
  scene.background = new THREE.Color(0x04070d);
  scene.fog = new THREE.FogExp2(0x04070d, 0.014);

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
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ===== Lighting ==========================================================
  scene.add(new THREE.HemisphereLight(0x4a78b8, 0x0a0a14, 0.45));
  scene.add(new THREE.AmbientLight(0xffffff, 0.16));

  const sun = new THREE.DirectionalLight(0xffeedd, 0.7);
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
  // Ground (large dark plane)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 600),
    new THREE.MeshStandardMaterial({ color: 0x080810, roughness: 0.95, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = !isMobile;
  scene.add(ground);

  // Road
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 400),
    new THREE.MeshStandardMaterial({ color: 0x14141a, roughness: 0.88, metalness: 0.08 })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.01, -100);
  road.receiveShadow = !isMobile;
  scene.add(road);

  // Road edge lines
  for (const x of [-4.5, 4.5]) {
    const edge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 400),
      new THREE.MeshStandardMaterial({ color: 0xfff5d8, roughness: 0.6, emissive: 0x554400, emissiveIntensity: 0.18 })
    );
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(x, 0.02, -100);
    scene.add(edge);
  }

  // Road dashes (center, dashed)
  for (let z = -260; z < 20; z += 7) {
    const dash = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 3.2),
      new THREE.MeshStandardMaterial({ color: 0xfff5d8, roughness: 0.6, emissive: 0x554400, emissiveIntensity: 0.25 })
    );
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.025, z);
    scene.add(dash);
  }

  // Reflective roadside posts
  for (let z = -250; z < 10; z += 11) {
    for (const x of [-5.8, 5.8]) {
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
  truck.position.set(0, 0, -90);
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
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
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
      const truckP = Math.min(1, p / 0.78);
      truck.position.z = THREE.MathUtils.lerp(-90, -4.5, easeOutCubic(truckP));
      truck.position.x = Math.sin(p * 8) * 0.18;
      truck.rotation.y = Math.sin(p * 5.5) * 0.022;

      // Wheels — spin faster early, slow at approach
      const speed = 13 - 9 * truckP;
      for (const w of truck.userData.wheels) w.rotation.x -= dt * speed;

      // ----- Camera choreography -------------------------------------------
      if (p < 0.16) {
        // Establishing wide overhead
        const k = p / 0.16;
        camera.position.set(
          THREE.MathUtils.lerp(16, 10, k),
          THREE.MathUtils.lerp(11, 5.5, k),
          THREE.MathUtils.lerp(-72, truck.position.z - 7, k)
        );
        camera.lookAt(truck.position.x, 2.0, truck.position.z + 5);
      } else if (p < 0.52) {
        // Tight side-rear tracking
        const k = (p - 0.16) / 0.36;
        camera.position.set(
          THREE.MathUtils.lerp(10, 6.5, k),
          THREE.MathUtils.lerp(5.5, 3.6, k),
          truck.position.z - 7
        );
        camera.lookAt(truck.position.x, 2.2, truck.position.z + 8);
      } else if (p < 0.74) {
        // Sweep around to front
        const k = (p - 0.52) / 0.22;
        const ang = THREE.MathUtils.lerp(Math.PI * 0.16, -Math.PI * 0.05, easeInOut(k));
        const dist = 16;
        camera.position.set(
          Math.sin(ang) * dist,
          THREE.MathUtils.lerp(3.6, 4.6, k),
          truck.position.z + Math.cos(ang) * dist + 4
        );
        camera.lookAt(0, 3, truck.position.z + 4);
      } else if (p < 0.84) {
        // Approach climax — head-on with shield
        const k = (p - 0.74) / 0.10;
        camera.position.set(
          THREE.MathUtils.lerp(0, 0, k),
          THREE.MathUtils.lerp(4.6, 5.0, k),
          THREE.MathUtils.lerp(15, 20, k)
        );
        camera.lookAt(0, 3.8, 0);
      } else {
        // Aftermath — pull back to reveal
        const k = (p - 0.84) / 0.16;
        camera.position.set(
          THREE.MathUtils.lerp(0, 14, easeOutCubic(k)),
          THREE.MathUtils.lerp(5.0, 9, k),
          THREE.MathUtils.lerp(20, 30, k)
        );
        camera.lookAt(0, 4, -2);
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
// Easing helpers
// ============================================================================
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
