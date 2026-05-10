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
