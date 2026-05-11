// ============================================================================
// SC Neval Impex SRL — UI behaviours
// - Smooth scroll (Lenis)
// - GSAP ScrollTrigger reveals
// - Animated stat counters
// - Card tilt
// - i18n RO/EN toggle
// ============================================================================

const reduceMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ----------------------------------------------------------------------------
// Smooth scroll + GSAP integration
// ----------------------------------------------------------------------------
let lenis = null;
if (!reduceMotion && window.Lenis) {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
  }
}

// ----------------------------------------------------------------------------
// Nav stuck state + back-to-top
// ----------------------------------------------------------------------------
const nav = document.getElementById("nav");
const toTop = document.getElementById("to-top");
toTop?.removeAttribute("hidden");
const onScroll = () => {
  const y = window.scrollY;
  if (y > 24) nav.classList.add("is-stuck");
  else nav.classList.remove("is-stuck");
  if (toTop) {
    if (y > 600) toTop.classList.add("is-visible");
    else toTop.classList.remove("is-visible");
  }
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

toTop?.addEventListener("click", () => {
  if (lenis) lenis.scrollTo(0, { duration: 1.2 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
});

// ----------------------------------------------------------------------------
// Mobile menu toggle
// ----------------------------------------------------------------------------
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
function closeMenu() {
  menuBtn?.setAttribute("aria-expanded", "false");
  navLinks?.classList.remove("is-open");
  document.body.style.overflow = "";
}
function openMenu() {
  menuBtn?.setAttribute("aria-expanded", "true");
  navLinks?.classList.add("is-open");
  document.body.style.overflow = "hidden";
}
menuBtn?.addEventListener("click", () => {
  const open = menuBtn.getAttribute("aria-expanded") === "true";
  if (open) closeMenu(); else openMenu();
});
navLinks?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// ----------------------------------------------------------------------------
// Scrollspy — highlight active section in nav
// ----------------------------------------------------------------------------
const navLinkMap = new Map();
document.querySelectorAll(".nav-links a[href^='#']").forEach((a) => {
  const id = a.getAttribute("href").slice(1);
  if (id) navLinkMap.set(id, a);
});
const spyObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const link = navLinkMap.get(e.target.id);
      if (!link) continue;
      if (e.isIntersecting) {
        navLinkMap.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
      }
    }
  },
  { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
);
navLinkMap.forEach((_, id) => {
  const sec = document.getElementById(id);
  if (sec) spyObserver.observe(sec);
});

// ----------------------------------------------------------------------------
// Reveals (IntersectionObserver — works even without gsap)
// ----------------------------------------------------------------------------
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    }
  },
  { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ----------------------------------------------------------------------------
// Stat counters
// ----------------------------------------------------------------------------
const counters = document.querySelectorAll("[data-count]");
const fmtCount = (target, v) =>
  Number.isInteger(target) ? Math.round(v).toString() : v.toFixed(1);

// If a counter is offscreen at load, reset it to zero so the animation has
// somewhere to count up from. If already in view, leave the final value
// shown so the user doesn't see a jarring flicker.
counters.forEach((el) => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const r = el.getBoundingClientRect();
  const inView = r.top < window.innerHeight && r.bottom > 0;
  if (!inView) el.textContent = fmtCount(target, 0) + suffix;
  el.dataset.final = fmtCount(target, target) + suffix;
});

const countObserver = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const finalText = el.dataset.final;
      // If already showing final value, skip the count-up.
      if (el.textContent === finalText) {
        countObserver.unobserve(el);
        continue;
      }
      const duration = 1600;
      const start = performance.now();
      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = fmtCount(target, target * eased) + suffix;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = finalText;
      }
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    }
  },
  { threshold: 0.4 }
);
counters.forEach((c) => countObserver.observe(c));

// ----------------------------------------------------------------------------
// Card tilt (subtle 3D on hover)
// ----------------------------------------------------------------------------
if (!reduceMotion) {
  document.querySelectorAll("[data-tilt]").forEach((el) => {
    const max = 6; // deg
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateY(-4px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

// ----------------------------------------------------------------------------
// Smooth anchor links via Lenis
// ----------------------------------------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: -60, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ----------------------------------------------------------------------------
// i18n — RO / EN
// ----------------------------------------------------------------------------
const dict = {
  ro: {
    "brand.sub": "Defense Supply · NATO Partner",
    "nav.about": "Despre",
    "nav.values": "Misiune",
    "nav.products": "Produse",
    "nav.clients": "Clienți",
    "nav.timeline": "Istoric",
    "nav.partners": "Parteneri",
    "nav.portfolio": "Portofoliu",
    "nav.contact": "Contact",
    "nav.cta": "Contactați-ne",

    "cin.hint": "Scrolează pentru a porni",
    "cin.approach": "→ Drum spre certificare NATO",
    "cin.continue": "Continuă",

    "hero.eyebrow": "Furnizor certificat NATO · Din 2018",
    "hero.t1": "Parteneri de încredere",
    "hero.t2": "pentru forțele militare",
    "hero.t3": "SUA și NATO.",
    "hero.sub":
      "SC Neval Impex SRL — 22+ ani de aprovizionare industrială și militară, cu parteneriate directe cu producători globali și contracte directe cu US Navy, Vectrus/V2X și IAP-ECC LLC.",
    "hero.cta1": "Vezi portofoliul",
    "hero.cta2": "Devino partener",
    "hero.badge.nato": "Partener din 2018",
    "hero.scroll": "Derulează",

    "stat.years": "Ani de activitate",
    "stat.mil": "Clienți militari SUA",
    "stat.value": "Valoare contracte",
    "stat.tx": "Tranzacții militare",
    "stat.latest": "Ultimul contract",

    "about.kicker": "01 · Despre noi",
    "about.title": "O companie românească, cu standarde militare.",
    "about.lead":
      "Înființată în 2002, SC Neval Impex SRL operează la intersecția dintre logistica industrială și aprovizionarea militară — cu proceduri conforme FAR/DFARS, certificare CAGE/NCAGE și înregistrare activă în SAM.gov.",
    "about.c1.t": "Certificată de Guvernul SUA",
    "about.c1.b":
      "Înregistrare activă SAM.gov · CAGE 1HAZL · Eligibilă pentru contracte directe cu Departamentul Apărării SUA și forțele NATO.",
    "about.c2.t": "Partener NATO din 2018",
    "about.c2.b":
      "7+ ani de contracte militare neîntrerupte, 500+ tranzacții finalizate la baze active din România și SUA.",
    "about.c3.t": "Producători globali de top",
    "about.c3.b":
      "Parteneriate directe cu Philips, Schneider Electric, ABB și Schrack Technik — acces la cele mai cerute echipamente industriale.",
    "about.c4.t": "Logistică internațională",
    "about.c4.b":
      "Partener strategic DP World Romania. Livrări door-to-door verificate până la Tyndall AFB (Florida) și Colorado Springs.",

    "mv.kicker": "01b · Misiune & Valori",
    "mv.title": "Misiunea noastră. Valorile pe care le respectăm.",
    "mv.lead":
      "Construim relații pe termen lung bazate pe încredere, livrăm la timp și sourcing-ul vine întotdeauna de la producători certificați.",
    "mv.mTag": "Misiune",
    "mv.mission":
      "Să fim furnizorul preferat de materiale industriale și soluții pentru forțele armate aliate și clienții industriali — cu livrare rapidă, conformitate FAR/DFARS și un nivel de suport adaptat fiecărui contract.",
    "mv.v1.t": "Încredere",
    "mv.v1.b": "Practici transparente, comunicare directă, contracte respectate.",
    "mv.v2.t": "Fiabilitate",
    "mv.v2.b": "Performanță constantă pe parcursul a 22+ ani de activitate, fără întreruperi nici în COVID.",
    "mv.v3.t": "Focus pe Client",
    "mv.v3.b": "Înțelegem cerințele unice ale fiecărui contract și depășim așteptările.",
    "mv.v4.t": "Inovație",
    "mv.v4.b": "Adoptăm noi tehnologii și soluții pentru a livra mai eficient.",
    "mv.v5.t": "Sustenabilitate",
    "mv.v5.b": "Practici prietenoase cu mediul, ambalaje reciclabile, reducerea amprentei logistice.",
    "mv.qaTag": "Asigurarea Calității",
    "mv.qa1": "Sourcing direct de la producători certificați (Philips, Schneider Electric, ABB, Schrack, Daikin, Atlas Copco)",
    "mv.qa2": "Proceduri riguroase de control al calității pe fiecare comandă",
    "mv.qa3": "Produse și servicii certificate · conformitate FAR/DFARS · prioritate DPAS DO-C9",
    "mv.qa4": "Lanț logistic verificat România → baze active SUA (Tyndall AFB, Colorado Springs)",

    "prod.kicker": "02 · Produse & Servicii",
    "prod.title": "Gama completă pentru operațiuni militare, civile și industriale.",
    "prod.lead":
      "Opt categorii operaționale acoperă HVAC, infrastructură critică, materiale de aviație, tratarea apelor, HoReCa, mentenanță, securitate și logistică.",
    "prod.1.t": "HVAC & Refrigerare",
    "prod.1.a": "Agenți frigorifici R410A, R134a",
    "prod.1.b": "Pompe de căldură Daikin",
    "prod.1.c": "Compresoare & plăci PCB",
    "prod.1.d": "Încărcătoare freon industrial",
    "prod.2.t": "Echipamente Industriale",
    "prod.2.a": "Sisteme filtrare Atlas Copco",
    "prod.2.b": "Boilere industriale de apă",
    "prod.2.c": "Rezistențe & protecție anodică",
    "prod.2.d": "Filtre industriale, filtre plisate",
    "prod.3.t": "Materiale Aviație",
    "prod.3.a": "Fluid degivrare aeronave Tip I",
    "prod.3.b": "Specificații compatibile NATO",
    "prod.3.c": "Livrat la baze aeriene active",
    "prod.3.d": "Grad aviație — certificat",
    "prod.4.t": "Tratarea Apelor",
    "prod.4.a": "Soluții purificare & tratare",
    "prod.4.b": "Filtrare / osmoză inversă",
    "prod.4.c": "Sisteme de dedurizare",
    "prod.4.d": "Reactivi & consumabile specifice",
    "prod.5.t": "Securitate & Infrastructură",
    "prod.5.a": "Baricade portabile de securitate",
    "prod.5.b": "Sisteme UPS 2000VA / 1600W",
    "prod.5.c": "Echipamente EOC — misiune critică",
    "prod.5.d": "Sisteme ambalare & depozitare",
    "prod.6.t": "HoReCa & Igienă",
    "prod.6.a": "Echipamente & consumabile HoReCa",
    "prod.6.b": "Articole de igienă profesională",
    "prod.6.c": "Produse curățenie profesionale",
    "prod.6.d": "Materiale sanitare & dezinfectanți",
    "prod.7.t": "Întreținere & Consumabile",
    "prod.7.a": "Piese echipamente gazon",
    "prod.7.b": "Rulmenți, lubrifianți, filtre",
    "prod.7.c": "Azot tehnic și industrial",
    "prod.7.d": "Consumabile generale mentenanță",
    "prod.8.t": "Logistică & Transport",
    "prod.8.a": "Închirieri vehicule (microbuze)",
    "prod.8.b": "Livrare internațională SUA",
    "prod.8.c": "Partener DP World Romania",
    "prod.8.d": "Lanț logistic door-to-door",

    "cli.kicker": "03 · Clienții noștri militari SUA",
    "cli.title": "Parteneriate verificate cu contractori principali ai DoD.",
    "cli.v2x.tag": "Contractor principal · DoD",
    "cli.v2x.p":
      "Furnizor premium de servicii de apărare globală. Ca subcontractor, Neval Impex a livrat piese industriale, HVAC, fluid degivrare aeronave și vehicule pe parcursul a 7+ ani de colaborare continuă.",
    "cli.v2x.dates": "2019 – 2026 · Activ",
    "cli.iap.tag": "Servicii globale de contingență",
    "cli.iap.p":
      "~135 tranzacții în valoare de $387.356,71 finalizate în 2,5 ani. Recomandare oficială semnată de Marvin C. Frazier — Logistics Manager.",
    "cli.iap.dates": "2017 – 2020 · Finalizat",
    "cli.usn.tag": "US Navy · Contract direct",
    "cli.usn.p":
      "Contract direct N68171-24-P-2063 pentru 55 unități UPS destinate Centrului de Operațiuni de Urgență (EOC). Scrisoare de Laudă pentru 3 ani de suport alimentar la Dacian Wolf Cafe.",
    "cli.usn.dates": "2024 · Atribuire directă",

    "tl.kicker": "04 · Istoric",
    "tl.title": "Două decenii de aprovizionare strategică.",
    "tl.2002.t": "Înființare",
    "tl.2002.b": "SC Neval Impex SRL este înființată în Caracal, jud. Olt.",
    "tl.2017.t": "Parteneriat IAP-ECC",
    "tl.2017.b": "Începe colaborarea cu IAP Worldwide Services — primul contract militar SUA.",
    "tl.2018.t": "Partener NATO certificat",
    "tl.2018.b": "Obținerea statutului de furnizor compatibil NATO — CAGE/NCAGE 1HAZL.",
    "tl.2019.t": "Parteneriat Vectrus / V2X",
    "tl.2019.b":
      "Începe relația de subcontractare cu Vectrus — astăzi V2X — pe HVAC, aviație și logistică.",
    "tl.2020.t": "Laudă US Navy (COVID)",
    "tl.2020.b": "Continuitate completă a aprovizionării pe perioada pandemiei la NSF Deveselu.",
    "tl.2022.t": "Livrare Tyndall AFB",
    "tl.2022.b":
      "Inchirieri microbuze livrate la Tyndall AFB, Florida — capacitate logistică internațională.",
    "tl.2024.t": "Contract direct US Navy",
    "tl.2024.b":
      "N68171-24-P-2063 · 55 unități UPS pentru EOC — atribuire directă fără intermediar.",
    "tl.2026.t": "Misiune activă",
    "tl.2026.b": "Contracte în derulare cu V2X — agenți frigorifici R410A & azot pentru NSF Deveselu.",

    "par.kicker": "05 · Parteneri Strategici",
    "par.title": "Acces direct la producători globali de top.",
    "par.lead":
      "Parteneriate directe cu cele mai cerute branduri industriale din lume — garanție de calitate, disponibilitate și conformitate tehnică.",
    "par.philips": "Echipamente Electrice & Iluminat",
    "par.schneider": "Automatizări & Distribuție Electrică",
    "par.abb": "Motoare, Invertoare & Automatizări",
    "par.schrack": "Aparataj & Distribuție Electrică",
    "par.dp": "Transport & Logistică · 170+ țări",

    "po.kicker": "06 · Portofoliu de Contracte",
    "po.title": "Selecție de comenzi documentate — toate verificabile.",
    "po.h1": "Contract / PO",
    "po.h2": "Client",
    "po.h3": "Dată",
    "po.h4": "Valoare",
    "po.h5": "Descriere",
    "po.usn": "Marina SUA — Direct",
    "po.r1": "Filtre aer Atlas Copco + kit schimb ATSL 1651",
    "po.r2": "Sisteme de ambalare și depozitare",
    "po.r3": "Boiler industrial, filtre (Solareks)",
    "po.r4": "Încărcător freon ZELL — R134a",
    "po.r5": "Închiriere microbuze 9 locuri — Tyndall AFB, FL",
    "po.r6": "Piese echipamente gazon & consumabile",
    "po.r7": "Piese cositoare, rulmenți, lubrifianți, filtre",
    "po.r8": "Fluid degivrare aeronave Tip I — Câmpia Turzii",
    "po.r9": "55 unități UPS — EOC, NSF Deveselu",
    "po.r10": "Compresor Daikin + plăci PCB",
    "po.r11": "7 baricade portabile de securitate",
    "po.r12": "Agent frigorific R410A + Azot — NSF Deveselu",

    "d.jan20": "Ian 2020",
    "d.may19": "Mai 2019",
    "d.nov21": "Noi 2021",
    "d.jun22": "Iun 2022",
    "d.may22": "Mai 2022",
    "d.apr23": "Apr 2023",
    "d.mar24": "Mar 2024",
    "d.aug24": "Aug 2024",
    "d.sep24": "Sep 2024",
    "d.apr25": "Apr 2025",
    "d.jun25": "Iun 2025",
    "d.jan26": "Ian 2026",

    "rec.kicker": "07 · Recomandări Oficiale",
    "rec.title": "Recunoaștere semnată de partenerii noștri.",
    "rec.iap.q":
      "„SC Neval Impex SRL a finalizat aproximativ 135 de tranzacții cu o valoare combinată de $387.356,71 pe o perioadă de aproximativ 2,5 ani. SC Neval Impex SRL a demonstrat o capacitate unică de a procura articole greu de găsit, atunci când alți furnizori nu au putut face acest lucru. IAP-ECC LLC recomandă SC Neval Impex SRL fără nicio rezervă.”",
    "rec.iap.role": "Manager Logistică · IAP-ECC LLC",
    "rec.usn.date": "SCRISOARE DE LAUDĂ",
    "rec.usn.q":
      "„SC Neval Impex SRL a oferit suport excepțional pentru Dacian Wolf Cafe de la NSF Deveselu pe o perioadă de aproximativ 3 ani. Angajamentul lor a rămas ferm chiar și în perioada provocărilor generate de pandemia COVID-19. Profesionalismul și fiabilitatea companiei SC Neval Impex SRL sunt remarcabile și profund apreciate de comanda noastră.”",
    "rec.usn.role": "Ofițer Servicii Alimentare · US Naval Support Facility Deveselu",

    "ct.kicker": "08 · Contact",
    "ct.title": "Gata să colaborăm.",
    "ct.lead":
      "Pentru cereri de ofertă, parteneriate sau înregistrare ca furnizor:",
    "ct.email": "Email",
    "ct.phone": "Telefon",
    "ct.admin": "Administrator",
    "ct.addr": "Adresă",
    "ct.naics": "Coduri NAICS",
    "ct.founded": "Înființată",
    "ct.years": "ani",
    "ct.nato": "Status NATO",
    "ct.natoVal": "Partener certificat din 2018",
    "ct.footnote":
      "✓ Partener NATO certificat din 2018 · ✓ SAM.gov verificat · ✓ Scrisori de recomandare disponibile la cerere",

    "foot.nato": "Partener NATO din 2018",
  },
  en: {
    "brand.sub": "Defense Supply · NATO Partner",
    "nav.about": "About",
    "nav.values": "Mission",
    "nav.products": "Products",
    "nav.clients": "Clients",
    "nav.timeline": "Timeline",
    "nav.partners": "Partners",
    "nav.portfolio": "Portfolio",
    "nav.contact": "Contact",
    "nav.cta": "Get in touch",

    "cin.hint": "Scroll to begin",
    "cin.approach": "→ Road to NATO certification",
    "cin.continue": "Continue",

    "hero.eyebrow": "NATO-certified supplier · Since 2018",
    "hero.t1": "Trusted partners",
    "hero.t2": "for US and NATO",
    "hero.t3": "armed forces.",
    "hero.sub":
      "SC Neval Impex SRL — 22+ years of industrial and military supply, with direct partnerships with global manufacturers and direct contracts with the US Navy, Vectrus/V2X and IAP-ECC LLC.",
    "hero.cta1": "View portfolio",
    "hero.cta2": "Become a partner",
    "hero.badge.nato": "Partner since 2018",
    "hero.scroll": "Scroll",

    "stat.years": "Years of activity",
    "stat.mil": "US military clients",
    "stat.value": "Contract value",
    "stat.tx": "Military transactions",
    "stat.latest": "Latest contract",

    "about.kicker": "01 · About us",
    "about.title": "A Romanian company built to military standards.",
    "about.lead":
      "Founded in 2002, SC Neval Impex SRL operates at the intersection of industrial logistics and military supply — with FAR/DFARS-compliant procedures, CAGE/NCAGE certification and active SAM.gov registration.",
    "about.c1.t": "US Government certified",
    "about.c1.b":
      "Active SAM.gov registration · CAGE 1HAZL · Eligible for direct contracts with the US DoD and NATO forces.",
    "about.c2.t": "NATO partner since 2018",
    "about.c2.b":
      "7+ years of uninterrupted military contracts, 500+ transactions completed at active bases in Romania and the USA.",
    "about.c3.t": "Top global manufacturers",
    "about.c3.b":
      "Direct partnerships with Philips, Schneider Electric, ABB and Schrack Technik — access to the most in-demand industrial equipment.",
    "about.c4.t": "International logistics",
    "about.c4.b":
      "Strategic partner DP World Romania. Verified door-to-door deliveries to Tyndall AFB (Florida) and Colorado Springs.",

    "mv.kicker": "01b · Mission & Values",
    "mv.title": "Our mission. The values we live by.",
    "mv.lead":
      "We build long-term relationships built on trust, deliver on schedule, and source exclusively from certified manufacturers.",
    "mv.mTag": "Mission",
    "mv.mission":
      "To be the preferred supplier of industrial materials and solutions for allied armed forces and industrial customers — with fast delivery, FAR/DFARS compliance, and a level of support tailored to every contract.",
    "mv.v1.t": "Trust",
    "mv.v1.b": "Transparent practices, direct communication, contracts honoured.",
    "mv.v2.t": "Reliability",
    "mv.v2.b": "Consistent performance across 22+ years of activity, with zero supply interruptions even through COVID.",
    "mv.v3.t": "Customer Focus",
    "mv.v3.b": "We understand each contract's unique requirements and exceed expectations.",
    "mv.v4.t": "Innovation",
    "mv.v4.b": "We adopt new technologies and solutions to deliver more efficiently.",
    "mv.v5.t": "Sustainability",
    "mv.v5.b": "Environmentally-conscious practices, recyclable packaging, reduced logistics footprint.",
    "mv.qaTag": "Quality Assurance",
    "mv.qa1": "Direct sourcing from certified manufacturers (Philips, Schneider Electric, ABB, Schrack, Daikin, Atlas Copco)",
    "mv.qa2": "Rigorous quality control procedures on every order",
    "mv.qa3": "Certified products and services · FAR/DFARS compliance · DPAS DO-C9 priority",
    "mv.qa4": "Verified logistics chain Romania → active US bases (Tyndall AFB, Colorado Springs)",

    "prod.kicker": "02 · Products & Services",
    "prod.title": "Full range for military, civil and industrial operations.",
    "prod.lead":
      "Eight operational categories covering HVAC, critical infrastructure, aviation materials, water treatment, HoReCa, maintenance, security and logistics.",
    "prod.1.t": "HVAC & Refrigeration",
    "prod.1.a": "Refrigerants R410A, R134a",
    "prod.1.b": "Daikin heat pumps",
    "prod.1.c": "Compressors & PCB boards",
    "prod.1.d": "Industrial freon chargers",
    "prod.2.t": "Industrial Equipment",
    "prod.2.a": "Atlas Copco filtration systems",
    "prod.2.b": "Industrial water boilers",
    "prod.2.c": "Anodic resistors & protection",
    "prod.2.d": "Industrial & pleated filters",
    "prod.3.t": "Aviation Materials",
    "prod.3.a": "Aircraft de-icing fluid Type I",
    "prod.3.b": "NATO-compatible specifications",
    "prod.3.c": "Delivered to active airbases",
    "prod.3.d": "Aviation grade — certified",
    "prod.4.t": "Water Treatment",
    "prod.4.a": "Treatment & purification solutions",
    "prod.4.b": "Filtration / reverse osmosis",
    "prod.4.c": "Water softening systems",
    "prod.4.d": "Reagents & specific consumables",
    "prod.5.t": "Security & Infrastructure",
    "prod.5.a": "Portable security barriers",
    "prod.5.b": "UPS systems 2000VA / 1600W",
    "prod.5.c": "EOC equipment — mission critical",
    "prod.5.d": "Packaging & storage systems",
    "prod.6.t": "HoReCa & Hygiene",
    "prod.6.a": "HoReCa equipment & consumables",
    "prod.6.b": "Professional hygiene articles",
    "prod.6.c": "Professional cleaning products",
    "prod.6.d": "Sanitary & disinfectant materials",
    "prod.7.t": "Maintenance & Consumables",
    "prod.7.a": "Lawn equipment parts",
    "prod.7.b": "Bearings, lubricants, filters",
    "prod.7.c": "Technical & industrial nitrogen",
    "prod.7.d": "General maintenance consumables",
    "prod.8.t": "Logistics & Transport",
    "prod.8.a": "Vehicle rental (minibuses)",
    "prod.8.b": "International delivery to the USA",
    "prod.8.c": "DP World Romania partner",
    "prod.8.d": "Door-to-door logistics chain",

    "cli.kicker": "03 · Our US military clients",
    "cli.title": "Verified partnerships with DoD prime contractors.",
    "cli.v2x.tag": "Prime contractor · DoD",
    "cli.v2x.p":
      "A premier provider of global defense services. As a subcontractor, Neval Impex has delivered industrial parts, HVAC, aircraft de-icing fluid and vehicles over 7+ years of continuous collaboration.",
    "cli.v2x.dates": "2019 – 2026 · Active",
    "cli.iap.tag": "Global contingency services",
    "cli.iap.p":
      "~135 transactions worth $387,356.71 completed in 2.5 years. Official recommendation signed by Marvin C. Frazier — Logistics Manager.",
    "cli.iap.dates": "2017 – 2020 · Completed",
    "cli.usn.tag": "US Navy · Direct contract",
    "cli.usn.p":
      "Direct contract N68171-24-P-2063 for 55 UPS units destined for the Emergency Operations Center (EOC). Letter of Commendation for 3 years of food service support at Dacian Wolf Cafe.",
    "cli.usn.dates": "2024 · Direct award",

    "tl.kicker": "04 · Timeline",
    "tl.title": "Two decades of strategic supply.",
    "tl.2002.t": "Founding",
    "tl.2002.b": "SC Neval Impex SRL is founded in Caracal, Olt County.",
    "tl.2017.t": "IAP-ECC partnership",
    "tl.2017.b": "Collaboration with IAP Worldwide Services begins — first US military contract.",
    "tl.2018.t": "NATO-certified partner",
    "tl.2018.b": "Achieves NATO-compatible supplier status — CAGE/NCAGE 1HAZL.",
    "tl.2019.t": "Vectrus / V2X partnership",
    "tl.2019.b":
      "Subcontracting relationship with Vectrus — now V2X — begins on HVAC, aviation and logistics.",
    "tl.2020.t": "US Navy commendation (COVID)",
    "tl.2020.b": "Full supply continuity through the pandemic at NSF Deveselu.",
    "tl.2022.t": "Tyndall AFB delivery",
    "tl.2022.b":
      "Minibus rentals delivered to Tyndall AFB, Florida — international logistics capability.",
    "tl.2024.t": "Direct US Navy contract",
    "tl.2024.b":
      "N68171-24-P-2063 · 55 UPS units for EOC — direct award without intermediary.",
    "tl.2026.t": "Active mission",
    "tl.2026.b": "Ongoing contracts with V2X — R410A refrigerants & nitrogen for NSF Deveselu.",

    "par.kicker": "05 · Strategic Partners",
    "par.title": "Direct access to top global manufacturers.",
    "par.lead":
      "Direct partnerships with the world's most-requested industrial brands — guarantee of quality, availability and technical compliance.",
    "par.philips": "Electrical Equipment & Lighting",
    "par.schneider": "Automation & Electrical Distribution",
    "par.abb": "Motors, Inverters & Automation",
    "par.schrack": "Switchgear & Electrical Distribution",
    "par.dp": "Transport & Logistics · 170+ countries",

    "po.kicker": "06 · Contract portfolio",
    "po.title": "Selection of documented orders — all verifiable.",
    "po.h1": "Contract / PO",
    "po.h2": "Client",
    "po.h3": "Date",
    "po.h4": "Value",
    "po.h5": "Description",
    "po.usn": "US Navy — Direct",
    "po.r1": "Atlas Copco air filters + ATSL 1651 exchange kit",
    "po.r2": "Packaging & storage systems",
    "po.r3": "Industrial boiler, filters (Solareks)",
    "po.r4": "ZELL freon charger — R134a",
    "po.r5": "9-seat minibus rental — Tyndall AFB, FL",
    "po.r6": "Lawn equipment parts & consumables",
    "po.r7": "Mower parts, bearings, lubricants, filters",
    "po.r8": "Aircraft de-icing fluid Type I — Câmpia Turzii",
    "po.r9": "55 UPS units — EOC, NSF Deveselu",
    "po.r10": "Daikin compressor + PCB boards",
    "po.r11": "7 portable security barriers",
    "po.r12": "R410A refrigerant + Nitrogen — NSF Deveselu",

    "d.jan20": "Jan 2020",
    "d.may19": "May 2019",
    "d.nov21": "Nov 2021",
    "d.jun22": "Jun 2022",
    "d.may22": "May 2022",
    "d.apr23": "Apr 2023",
    "d.mar24": "Mar 2024",
    "d.aug24": "Aug 2024",
    "d.sep24": "Sep 2024",
    "d.apr25": "Apr 2025",
    "d.jun25": "Jun 2025",
    "d.jan26": "Jan 2026",

    "rec.kicker": "07 · Official Recommendations",
    "rec.title": "Recognition signed by our partners.",
    "rec.iap.q":
      "\"SC Neval Impex SRL has completed approximately 135 transactions with a combined value of $387,356.71 over a period of approximately 2.5 years. SC Neval Impex SRL has demonstrated a unique ability to procure hard-to-find items when other suppliers could not. IAP-ECC LLC recommends SC Neval Impex SRL without reservation.\"",
    "rec.iap.role": "Logistics Manager · IAP-ECC LLC",
    "rec.usn.date": "LETTER OF COMMENDATION",
    "rec.usn.q":
      "\"SC Neval Impex SRL provided exceptional support for the Dacian Wolf Cafe at NSF Deveselu over a period of approximately 3 years. Their commitment remained firm even through the challenges generated by the COVID-19 pandemic. The professionalism and reliability of SC Neval Impex SRL are remarkable and deeply appreciated by our command.\"",
    "rec.usn.role": "Food Service Officer · US Naval Support Facility Deveselu",

    "ct.kicker": "08 · Contact",
    "ct.title": "Ready to work together.",
    "ct.lead": "For quote requests, partnerships or supplier registration:",
    "ct.email": "Email",
    "ct.phone": "Phone",
    "ct.admin": "Administrator",
    "ct.addr": "Address",
    "ct.naics": "NAICS Codes",
    "ct.founded": "Founded",
    "ct.years": "years",
    "ct.nato": "NATO Status",
    "ct.natoVal": "Certified partner since 2018",
    "ct.footnote":
      "✓ NATO-certified partner since 2018 · ✓ SAM.gov verified · ✓ Recommendation letters available on request",

    "foot.nato": "NATO partner since 2018",
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
  toggle.querySelector(".lang.ro").classList.toggle("is-active", lang === "ro");
  toggle.querySelector(".lang.en").classList.toggle("is-active", lang === "en");
  try { localStorage.setItem("neval.lang", lang); } catch (e) {}
}

const stored = (() => { try { return localStorage.getItem("neval.lang"); } catch (e) { return null; } })();
// Default to English (user request). User can switch to RO via the toggle;
// their choice is then persisted in localStorage.
const initialLang = stored || "en";
applyLang(initialLang);

document.getElementById("lang-toggle").addEventListener("click", () => {
  const current = document.documentElement.lang === "ro" ? "ro" : "en";
  applyLang(current === "ro" ? "en" : "ro");
});

// ----------------------------------------------------------------------------
// GSAP-powered hero entrance (subtle stagger)
// ----------------------------------------------------------------------------
if (window.gsap && !reduceMotion) {
  gsap.fromTo(
    ".hero .reveal",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.08,
      ease: "power3.out",
      delay: 0.15,
      onStart: () => document.querySelectorAll(".hero .reveal").forEach((el) => el.classList.add("is-in")),
    }
  );

  gsap.fromTo(
    ".hero-bars span",
    { scaleX: 0, transformOrigin: "left center" },
    { scaleX: 1, duration: 0.6, stagger: 0.08, ease: "power2.out", delay: 0.6 }
  );

  // Subtle floating on hero target
  gsap.to(".globe-target", {
    y: -8,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}
