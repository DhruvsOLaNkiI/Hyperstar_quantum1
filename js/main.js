/* ═══════════ QUANTUM 1 — motion & interaction ═══════════ */

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─── Smooth scroll (Lenis) ─── */
let lenis = null;
if (!prefersReducedMotion && typeof Lenis !== "undefined") {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      }
    });
  });
}

/* ─── Starfield ─── */
(function starfield() {
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let w, h, stars;

  function init() {
    w = canvas.width = window.innerWidth * devicePixelRatio;
    h = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    const count = Math.min(320, Math.floor((window.innerWidth * window.innerHeight) / 4200));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.3 + 0.25) * devicePixelRatio,
      tw: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.35 + 0.08,
      warm: Math.random() < 0.28,
    }));
  }

  let scrollVel = 0;
  if (lenis) lenis.on("scroll", (e) => (scrollVel = e.velocity || 0));

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    const drift = prefersReducedMotion ? 0 : Math.min(Math.abs(scrollVel) * 0.4, 6);
    for (const s of stars) {
      s.y += (s.speed + drift) * devicePixelRatio * (scrollVel < 0 ? -1 : 1) * (drift ? 1 : 0) + s.speed * 0.15;
      if (s.y > h) s.y = 0;
      if (s.y < 0) s.y = h;
      const twinkle = 0.55 + 0.45 * Math.sin(t / 700 + s.tw);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.warm
        ? `rgba(255, 201, 138, ${0.5 * twinkle})`
        : `rgba(210, 222, 255, ${0.6 * twinkle})`;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  init();
  window.addEventListener("resize", init);
  requestAnimationFrame(frame);
})();

/* ─── Split headings into animatable lines ─── */
function splitLines(el) {
  const words = el.innerHTML.split(/(<[^>]+>[^<]*<\/[^>]+>|\S+)/g).filter((s) => s && s.trim());
  el.innerHTML = words.map((wd) => `<span class="w">${wd}</span>`).join(" ");
  const spans = [...el.querySelectorAll(":scope > .w")];
  const lines = [];
  let lastTop = null;
  spans.forEach((sp) => {
    const top = sp.offsetTop;
    if (top !== lastTop) { lines.push([]); lastTop = top; }
    lines[lines.length - 1].push(sp);
  });
  el.innerHTML = lines
    .map((ln) => `<span class="line"><span>${ln.map((s) => s.innerHTML).join(" ")}</span></span>`)
    .join("");
  return [...el.querySelectorAll(".line > span")];
}

/* ─── Preloader → hero intro ─── */
window.addEventListener("load", () => {
  const pre = document.getElementById("preloader");
  const tl = gsap.timeline();

  tl.to(pre, { opacity: 0, duration: 0.7, delay: 0.6, ease: "power2.out" })
    .set(pre, { display: "none" })
    .from(".nav", { y: -40, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.2")
    .from(".hero__eyebrow", { opacity: 0, y: 20, duration: 0.8, ease: "power3.out" }, "-=0.5")
    .from(".hero__word", { opacity: 0, y: 60, duration: 1.1, ease: "power4.out" }, "-=0.55")
    .from(".hero__one", { opacity: 0, scale: 0.3, rotate: -20, duration: 1.2, ease: "elastic.out(1, 0.5)" }, "-=0.7")
    .from(".hero__tagline", { opacity: 0, y: 24, duration: 0.9, ease: "power3.out" }, "-=0.8")
    .from(".hero__actions .btn", { opacity: 0, y: 24, stagger: 0.12, duration: 0.7, ease: "power3.out" }, "-=0.6")
    .from(".hero__scrollcue", { opacity: 0, duration: 0.8 }, "-=0.3");

  initScrollAnimations();
});

/* ─── Scroll-driven animations ─── */
function initScrollAnimations() {
  /* Hero drifts and fades as you scroll away */
  gsap.to(".hero__content", {
    yPercent: -22,
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 35%", scrub: true },
  });
  gsap.to(".hero__glow", {
    opacity: 0.25,
    scale: 1.25,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* Split-line headline reveals */
  document.querySelectorAll(".split-lines").forEach((el) => {
    const targets = splitLines(el);
    gsap.to(targets, {
      y: 0,
      duration: 1.15,
      stagger: 0.09,
      ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 82%" },
    });
  });

  /* Generic fade-ups */
  document.querySelectorAll(".fade-up").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  /* Showcase — pinned zoom reveal */
  const frame = document.querySelector(".showcase__frame");
  gsap.fromTo(
    frame,
    { scale: 0.72, rotateX: 10, opacity: 0.35 },
    {
      scale: 1,
      rotateX: 0,
      opacity: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".showcase",
        start: "top bottom",
        end: "center center",
        scrub: 0.6,
      },
    }
  );
  gsap.fromTo(
    ".showcase__caption",
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      ease: "none",
      scrollTrigger: { trigger: ".showcase", start: "top 30%", end: "center center", scrub: 0.6 },
    }
  );

  /* Parallax inside duo image */
  gsap.fromTo(
    ".parallax-img img",
    { yPercent: -9 },
    {
      yPercent: 9,
      ease: "none",
      scrollTrigger: { trigger: ".parallax-img", start: "top bottom", end: "bottom top", scrub: true },
    }
  );

  /* Brochure — pinned horizontal scroll gallery */
  const track = document.querySelector(".brochure__track");
  if (track) {
    const scrollAmount = () => -(track.scrollWidth - window.innerWidth);
    gsap.to(track, {
      x: scrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: ".brochure",
        start: "top top",
        end: () => "+=" + Math.abs(scrollAmount()),
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    gsap.from(".brochure__card", {
      opacity: 0,
      y: 60,
      stagger: 0.07,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".brochure", start: "top 70%" },
    });
  }

  /* Feature cards stagger in as a group */
  ScrollTrigger.batch(".features__grid .card", {
    start: "top 88%",
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.9, ease: "power3.out" }),
  });

  /* Floating brochure pill — appears once the hero is scrolled past */
  const floatBtn = document.getElementById("floatBrochure");
  if (floatBtn) {
    ScrollTrigger.create({
      trigger: "#hero",
      start: "bottom 70%",
      onEnter: () => floatBtn.classList.add("is-visible"),
      onLeaveBack: () => floatBtn.classList.remove("is-visible"),
    });
  }

  /* Residences gallery reveal */
  ScrollTrigger.batch(".residences__grid .rcard", {
    start: "top 90%",
    onEnter: (batch) =>
      gsap.fromTo(batch, { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.09, duration: 0.9, ease: "power3.out" }),
  });

  /* Stats counters */
  document.querySelectorAll(".stat__num").forEach((num) => {
    const end = +num.dataset.count;
    ScrollTrigger.create({
      trigger: num,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.fromTo(
          num,
          { innerText: 0 },
          {
            innerText: end,
            duration: 1.8,
            ease: "power2.out",
            snap: { innerText: 1 },
          }
        );
      },
    });
  });

  ScrollTrigger.refresh();
}

/* ─── Brochure request modal ─── */
(function brochureModal() {
  const modal = document.getElementById("brochureModal");
  const form = document.getElementById("brochureForm");
  const errorEl = document.getElementById("bf-error");
  const stepForm = modal.querySelector('[data-step="form"]');
  const stepSuccess = modal.querySelector('[data-step="success"]');

  function open() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    if (lenis) lenis.stop();
  }

  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lenis) lenis.start();
  }

  document.querySelectorAll(".js-open-brochure").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    });
  });

  modal.querySelectorAll("[data-close-modal]").forEach((el) => el.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) close();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();

    form.querySelectorAll("input").forEach((i) => i.classList.remove("is-invalid"));
    const problems = [];
    if (name.length < 2) { problems.push("name"); form.name.classList.add("is-invalid"); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { problems.push("email"); form.email.classList.add("is-invalid"); }
    if (phone.replace(/\D/g, "").length < 8) { problems.push("phone"); form.phone.classList.add("is-invalid"); }
    if (problems.length) {
      errorEl.textContent = "Please check the highlighted field" + (problems.length > 1 ? "s" : "") + ".";
      return;
    }

    /* Store the lead locally until a backend/CRM endpoint is connected */
    const leads = JSON.parse(localStorage.getItem("q1BrochureLeads") || "[]");
    leads.push({ name, email, phone, interest: form.interest.value, at: new Date().toISOString() });
    localStorage.setItem("q1BrochureLeads", JSON.stringify(leads));

    stepForm.hidden = true;
    stepSuccess.hidden = false;
    document.getElementById("brochureDownload").click();
  });
})();

/* ─── Contact form (above footer) ─── */
(function contactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const errorEl = document.getElementById("cf-error");
  const successEl = document.getElementById("contactSuccess");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const message = form.message.value.trim();

    form.querySelectorAll("input").forEach((i) => i.classList.remove("is-invalid"));
    const problems = [];
    if (name.length < 2) { problems.push("name"); form.name.classList.add("is-invalid"); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { problems.push("email"); form.email.classList.add("is-invalid"); }
    if (phone.replace(/\D/g, "").length < 8) { problems.push("phone"); form.phone.classList.add("is-invalid"); }
    if (problems.length) {
      errorEl.textContent = "Please check the highlighted field" + (problems.length > 1 ? "s" : "") + ".";
      return;
    }

    const leads = JSON.parse(localStorage.getItem("q1ContactLeads") || "[]");
    leads.push({
      name, email, phone,
      interest: form.interest.value,
      message,
      at: new Date().toISOString(),
    });
    localStorage.setItem("q1ContactLeads", JSON.stringify(leads));

    successEl.hidden = false;
  });

  /* When Contact Us / Enquire / Get in Touch lands on #contact, focus the form */
  function focusContactForm() {
    if (location.hash !== "#contact") return;
    const nameInput = document.getElementById("cf-name");
    if (!nameInput) return;
    setTimeout(() => nameInput.focus({ preventScroll: true }), 700);
  }
  window.addEventListener("hashchange", focusContactForm);
  document.querySelectorAll('a[href="#contact"]').forEach((a) => {
    a.addEventListener("click", () => setTimeout(focusContactForm, 50));
  });
})();

/* ─── Residences: filters + lightbox ─── */
(function residences() {
  const grid = document.querySelector(".residences__grid");
  if (!grid) return;

  /* Filters */
  const chips = document.querySelectorAll(".residences__filters .chip");
  const cards = [...grid.querySelectorAll(".rcard")];
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const f = chip.dataset.filter;
      cards.forEach((card) => {
        card.classList.toggle("is-hidden", f !== "all" && card.dataset.cat !== f);
      });
      ScrollTrigger.refresh();
    });
  });

  /* Lightbox */
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbCaption = document.getElementById("lightboxCaption");
  let current = 0;

  const visibleCards = () => cards.filter((c) => !c.classList.contains("is-hidden"));

  function show(index) {
    const list = visibleCards();
    current = (index + list.length) % list.length;
    const card = list[current];
    const img = card.querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = card.querySelector("figcaption").textContent;
  }

  function openLightbox(card) {
    show(visibleCards().indexOf(card));
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    if (lenis) lenis.stop();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lenis) lenis.start();
  }

  cards.forEach((card) => card.addEventListener("click", () => openLightbox(card)));
  lightbox.querySelectorAll("[data-close-lightbox]").forEach((el) => el.addEventListener("click", closeLightbox));
  lightbox.querySelector(".lightbox__prev").addEventListener("click", () => show(current - 1));
  lightbox.querySelector(".lightbox__next").addEventListener("click", () => show(current + 1));
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
})();

/* ─── Card cursor glow ─── */
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});
