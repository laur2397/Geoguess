// ============================================================================
// SC Neval Impex SRL — minimal UI logic
// - Nav stuck-state on scroll
// - RO / EN i18n toggle (persisted in localStorage)
// All heavy lifting happens in cinematic.js.
// ============================================================================

// ----------------------------------------------------------------------------
// Nav: add `.is-stuck` after 24px scroll
// ----------------------------------------------------------------------------
const nav = document.getElementById("nav");
const onScroll = () => {
  if (!nav) return;
  if (window.scrollY > 24) nav.classList.add("is-stuck");
  else nav.classList.remove("is-stuck");
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// ----------------------------------------------------------------------------
// Hero video — plays once, fades out on (a) ended event,
// (b) scroll past threshold, or (c) skip button click. If the source MP4
// is missing, hide the element entirely so the 3D canvas takes over.
// ----------------------------------------------------------------------------
const heroVideo = document.getElementById("hero-video");
const videoSkip = document.getElementById("video-skip");
let videoFaded = false;

function fadeOutVideo() {
  if (videoFaded || !heroVideo) return;
  videoFaded = true;
  heroVideo.classList.add("is-fading");
  videoSkip?.classList.add("is-hidden");
  setTimeout(() => {
    heroVideo.classList.add("is-hidden");
    try { heroVideo.pause(); } catch (e) {}
  }, 1300);
}

if (heroVideo) {
  heroVideo.addEventListener("ended", fadeOutVideo);

  // If the source can't load (file missing, network error, decoder issue),
  // hide both the video and the skip button so the user sees the 3D scene.
  heroVideo.addEventListener("error", () => {
    heroVideo.classList.add("is-hidden");
    videoSkip?.classList.add("is-hidden");
  });
  heroVideo.querySelector("source")?.addEventListener("error", () => {
    heroVideo.classList.add("is-hidden");
    videoSkip?.classList.add("is-hidden");
  });

  // If autoplay is blocked, also fade so the user isn't stuck.
  const playPromise = heroVideo.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Autoplay rejected — let the 3D scene take over after a short delay.
      setTimeout(fadeOutVideo, 600);
    });
  }

  // Fade if the user starts scrolling (signals they want to engage).
  window.addEventListener("scroll", () => {
    if (window.scrollY > window.innerHeight * 0.12) fadeOutVideo();
  }, { passive: true });

  videoSkip?.addEventListener("click", fadeOutVideo);

  // Hard timeout: if video never ends (looping or stuck), fade after 14s.
  setTimeout(fadeOutVideo, 14000);
} else if (videoSkip) {
  videoSkip.classList.add("is-hidden");
}

// ----------------------------------------------------------------------------
// i18n — RO / EN
// ----------------------------------------------------------------------------
const dict = {
  ro: {
    "brand.sub": "Defense Supply · NATO Partner",
    "nav.cta": "Contactați-ne",

    "cin.hint": "Scrolează pentru a porni",
    "cin.approach": "→ Drum spre certificare NATO",
    "cin.sign": "NSF Deveselu — bază militară SUA · partener NATO",
    "cin.radar": "Radar activ · contract direct US Navy N68171-24-P-2063",
    "cin.email": "Contactează-ne",
    "cin.address": "Str. Lotrului 27, Caracal, RO",
    "video.skip": "Sari peste intro",

    "hero.eyebrow": "Furnizor certificat NATO · Din 2018",
    "hero.t1": "Parteneri de încredere",
    "hero.t2": "pentru forțele militare",
    "hero.t3": "SUA și NATO.",
    "hero.sub":
      "SC Neval Impex SRL — 22+ ani de aprovizionare industrială și militară, cu parteneriate directe cu producători globali și contracte directe cu US Navy, Vectrus/V2X și IAP-ECC LLC.",

    "stat.years": "Ani de activitate",
    "stat.mil": "Clienți militari SUA",
    "stat.value": "Valoare contracte",
    "stat.tx": "Tranzacții militare",
  },
  en: {
    "brand.sub": "Defense Supply · NATO Partner",
    "nav.cta": "Contact us",

    "cin.hint": "Scroll to begin",
    "cin.approach": "→ Road to NATO certification",
    "cin.sign": "NSF Deveselu — US military base · NATO partner",
    "cin.radar": "Radar active · direct US Navy contract N68171-24-P-2063",
    "cin.email": "Contact us",
    "cin.address": "Str. Lotrului 27, Caracal, Romania",
    "video.skip": "Skip intro",

    "hero.eyebrow": "NATO-certified supplier · Since 2018",
    "hero.t1": "Trusted partners",
    "hero.t2": "for US and NATO",
    "hero.t3": "armed forces.",
    "hero.sub":
      "SC Neval Impex SRL — 22+ years of industrial and military supply, with direct partnerships with global manufacturers and direct contracts with the US Navy, Vectrus/V2X and IAP-ECC LLC.",

    "stat.years": "Years of activity",
    "stat.mil": "US military clients",
    "stat.value": "Contract value",
    "stat.tx": "Military transactions",
  },
};

function applyLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const v = dict[lang]?.[key];
    if (v !== undefined) el.textContent = v;
  });
  const toggle = document.getElementById("lang-toggle");
  if (toggle) {
    toggle.querySelector(".lang.ro").classList.toggle("is-active", lang === "ro");
    toggle.querySelector(".lang.en").classList.toggle("is-active", lang === "en");
  }
  try { localStorage.setItem("neval.lang", lang); } catch (e) {}
}

const stored = (() => { try { return localStorage.getItem("neval.lang"); } catch (e) { return null; } })();
const initialLang = stored || (navigator.language?.toLowerCase().startsWith("ro") ? "ro" : "en");
applyLang(initialLang);

document.getElementById("lang-toggle")?.addEventListener("click", () => {
  const current = document.documentElement.lang === "ro" ? "ro" : "en";
  applyLang(current === "ro" ? "en" : "ro");
});
