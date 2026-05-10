/* ============== Loader ============== */
const loader = document.getElementById("loader");
const fill = document.getElementById("loader-fill");
let progress = 0;
const loaderTick = setInterval(() => {
  progress = Math.min(100, progress + 6 + Math.random() * 14);
  fill.style.width = progress + "%";
  if (progress >= 100) {
    clearInterval(loaderTick);
    setTimeout(() => loader.classList.add("is-done"), 400);
  }
}, 110);

window.addEventListener("load", () => {
  setTimeout(() => {
    progress = 100;
    fill.style.width = "100%";
    setTimeout(() => loader.classList.add("is-done"), 350);
  }, 600);
});

/* ============== Year ============== */
document.getElementById("year").textContent = new Date().getFullYear();

/* ============== Cursor ============== */
const cursor = document.getElementById("cursor");
const trail = document.getElementById("cursor-trail");
let cx = 0, cy = 0, tx = 0, ty = 0;

window.addEventListener("pointermove", (e) => {
  cx = e.clientX;
  cy = e.clientY;
  cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
});

(function trailLoop() {
  tx += (cx - tx) * 0.18;
  ty += (cy - ty) * 0.18;
  trail.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
  requestAnimationFrame(trailLoop);
})();

document.querySelectorAll("a, button, [data-tilt], input, textarea, select").forEach((el) => {
  el.addEventListener("pointerenter", () => {
    cursor.classList.add("is-hover");
    trail.classList.add("is-hover");
  });
  el.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-hover");
    trail.classList.remove("is-hover");
  });
});

/* ============== Nav state ============== */
const nav = document.getElementById("nav");
const burger = document.getElementById("nav-burger");
window.addEventListener(
  "scroll",
  () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 30);
  },
  { passive: true }
);

burger.addEventListener("click", () => {
  nav.classList.toggle("is-open");
});
document.querySelectorAll(".nav-links a").forEach((a) =>
  a.addEventListener("click", () => nav.classList.remove("is-open"))
);

/* ============== Smooth scroll ============== */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ============== Reveal on scroll ============== */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 80 + "ms";
  io.observe(el);
});

/* ============== Tilt cards ============== */
const tiltEls = document.querySelectorAll("[data-tilt]");
tiltEls.forEach((el) => {
  let raf;
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      el.style.transform = `perspective(900px) rotateX(${-py * 8}deg) rotateY(${px * 10}deg) translateY(-4px)`;
    });
  });
  el.addEventListener("pointerleave", () => {
    el.style.transform = "";
  });
});

/* ============== Polaroid mouse parallax (hero) ============== */
const polaroidContainer = document.getElementById("polaroids");
if (polaroidContainer) {
  const items = polaroidContainer.querySelectorAll(".polaroid");
  polaroidContainer.addEventListener("pointermove", (e) => {
    const r = polaroidContainer.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    items.forEach((item, i) => {
      const depth = (i + 1) * 6;
      item.style.setProperty(
        "transform",
        `translate3d(${px * depth}px, ${py * depth}px, 0) rotate(${item.dataset.r || 0}deg)`
      );
    });
  });
}

/* ============== Camera flash + confetti + printer ============== */
const flashEl = document.getElementById("flash");
const printerEl = document.getElementById("printer");
const fxCanvas = document.getElementById("fx-canvas");
const fxCtx = fxCanvas.getContext("2d");

function resizeFx() {
  fxCanvas.width = window.innerWidth * (window.devicePixelRatio || 1);
  fxCanvas.height = window.innerHeight * (window.devicePixelRatio || 1);
  fxCanvas.style.width = window.innerWidth + "px";
  fxCanvas.style.height = window.innerHeight + "px";
  fxCtx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
}
resizeFx();
window.addEventListener("resize", resizeFx);

const confetti = [];
const palette = ["#ff6ec7", "#7873f5", "#ffe27a", "#9af0ff", "#ffffff", "#ff3d77"];

function burstConfetti(x, y, count = 60, power = 1) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = (3 + Math.random() * 7) * power;
    confetti.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 2,
      g: 0.18,
      life: 1,
      decay: 0.008 + Math.random() * 0.01,
      size: 2 + Math.random() * 4,
      color: palette[(Math.random() * palette.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      shape: Math.random() < 0.5 ? "rect" : "circle",
    });
  }
}

(function fxLoop() {
  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  for (let i = confetti.length - 1; i >= 0; i--) {
    const p = confetti[i];
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.99;
    p.rot += p.vr;
    p.life -= p.decay;
    if (p.life <= 0) {
      confetti.splice(i, 1);
      continue;
    }
    fxCtx.save();
    fxCtx.globalAlpha = Math.max(0, p.life);
    fxCtx.translate(p.x, p.y);
    fxCtx.rotate(p.rot);
    fxCtx.fillStyle = p.color;
    if (p.shape === "rect") {
      fxCtx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
    } else {
      fxCtx.beginPath();
      fxCtx.arc(0, 0, p.size, 0, Math.PI * 2);
      fxCtx.fill();
    }
    fxCtx.restore();
  }
  requestAnimationFrame(fxLoop);
})();

/* polaroid printer */
const captionPool = [
  "Mihai & Ana",
  "Botez Sofia",
  "Gala 2026",
  "Andreea & David",
  "Petrecere VIP",
  "Lansare Brand",
  "Best Friends",
  "Aniversare 30",
  "Mireasă & Mire",
  "Corporate Night",
  "Studio ME",
];
const gradPool = [
  ["#ff6ec7", "#7873f5"],
  ["#ffe27a", "#ff6ec7"],
  ["#9af0ff", "#7873f5"],
  ["#ffb37a", "#ff3d77"],
  ["#a78bfa", "#ec4899"],
  ["#c4ff7a", "#22d3ee"],
];

function printPolaroid() {
  const [c1, c2] = gradPool[(Math.random() * gradPool.length) | 0];
  const cap = captionPool[(Math.random() * captionPool.length) | 0];
  const rot = (Math.random() * 14 - 7).toFixed(1) + "deg";
  const el = document.createElement("div");
  el.className = "printed";
  el.style.setProperty("--c1", c1);
  el.style.setProperty("--c2", c2);
  el.style.setProperty("--rot", rot);
  el.innerHTML = `<div class="pp"></div><div class="cap">${cap}</div>`;
  printerEl.appendChild(el);
  setTimeout(() => el.remove(), 8500);
}

/* the flash itself */
let flashTimer;
function triggerFlash(opts = {}) {
  flashEl.classList.remove("is-firing");
  // force reflow so animation restarts
  // eslint-disable-next-line no-unused-expressions
  void flashEl.offsetWidth;
  flashEl.classList.add("is-firing");

  document.body.classList.add("is-flashing");
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => document.body.classList.remove("is-flashing"), 220);

  // shake
  const shake = (intensity = 6) => {
    const x = (Math.random() - 0.5) * intensity;
    const y = (Math.random() - 0.5) * intensity;
    document.documentElement.style.setProperty("--shake-x", x + "px");
    document.documentElement.style.setProperty("--shake-y", y + "px");
    document.body.style.transform = `translate(${x}px, ${y}px)`;
  };
  shake();
  setTimeout(shake, 80);
  setTimeout(() => (document.body.style.transform = ""), 180);

  // printer
  printPolaroid();

  // confetti at center / at point of click
  const cx = opts.x ?? window.innerWidth / 2;
  const cy = opts.y ?? window.innerHeight / 2;
  burstConfetti(cx, cy, opts.heavy ? 100 : 50, opts.heavy ? 1.3 : 0.9);

  // notify 3D scene
  window.dispatchEvent(new CustomEvent("memory:flash", { detail: { heavy: !!opts.heavy } }));
}

/* auto-flash on a loop */
function scheduleNextFlash() {
  const delay = 5500 + Math.random() * 3500;
  setTimeout(() => {
    if (!document.hidden) triggerFlash();
    scheduleNextFlash();
  }, delay);
}
// first flash shortly after load
setTimeout(() => {
  triggerFlash();
  scheduleNextFlash();
}, 2200);

/* click anywhere = manual flash */
document.addEventListener("pointerdown", (e) => {
  // skip clicks on form fields & nav so user can interact normally
  if (e.target.closest("input, select, textarea, button, a")) return;
  triggerFlash({ x: e.clientX, y: e.clientY, heavy: true });
});

/* ============== Count-up stats ============== */
function animateCountUp(el) {
  const text = el.textContent.trim();
  const match = text.match(/^([\d.]+)(.*)$/);
  if (!match) return;
  const target = parseFloat(match[1].replace(",", "."));
  const suffix = match[2];
  const isDecimal = match[1].includes(".");
  const isK = suffix.toLowerCase().includes("k");
  const duration = 1600;
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const v = target * eased;
    el.textContent = (isDecimal ? v.toFixed(1) : Math.round(v)) + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCountUp(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll(".hero-meta b, .plan-price b").forEach((b) => statObserver.observe(b));

/* ============== Text scramble for hero title ============== */
function scrambleText(el, finalText, duration = 900) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*";
  const len = finalText.length;
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    let out = "";
    for (let i = 0; i < len; i++) {
      const reveal = i / len;
      if (t > reveal) out += finalText[i];
      else if (finalText[i] === " ") out += " ";
      else out += chars[(Math.random() * chars.length) | 0];
    }
    el.textContent = out;
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = finalText;
  }
  requestAnimationFrame(frame);
}
// Apply scramble to hero title's prominent words after load
window.addEventListener("load", () => {
  setTimeout(() => {
    const grad = document.querySelector(".hero-title .grad");
    const grad2 = document.querySelector(".hero-title .grad-2");
    if (grad) scrambleText(grad, grad.textContent, 800);
    if (grad2) setTimeout(() => scrambleText(grad2, grad2.textContent, 900), 400);
  }, 1200);
});

/* ============== Contact form ============== */
const form = document.getElementById("contact-form");
const note = document.getElementById("form-note");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  if (!data.get("name") || !data.get("contact")) {
    note.textContent = "Te rugăm completează numele și un mod de contact.";
    note.style.color = "#ff6ec7";
    return;
  }
  note.textContent =
    "Mulțumim! Cererea ta a fost înregistrată — te contactăm în maxim 4 ore.";
  note.style.color = "#ffe27a";
  form.reset();
});
