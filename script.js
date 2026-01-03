/* ===============================
   V E R S E D   G L O B A L
   Advanced Site Script.js (2025)
   =============================== */

// ---------- 0. UTILITIES ----------
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const throttle = (fn, delay = 100) => {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
};

const prefersReducedMotion = () =>
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- 1. MOBILE NAVIGATION ----------
function initMobileNav() {
  const mobileMenuToggle = qs("#mobileMenuToggle");
  const navLinks = qs(".nav-links");
  if (!mobileMenuToggle || !navLinks) return;

  const toggleNav = () => {
    navLinks.classList.toggle("mobile-open");
    mobileMenuToggle.classList.toggle("open");
    document.body.classList.toggle("no-scroll");
    mobileMenuToggle.setAttribute(
      "aria-expanded",
      navLinks.classList.contains("mobile-open")
    );
  };

  mobileMenuToggle.setAttribute("aria-label", "Toggle navigation");
  mobileMenuToggle.setAttribute("aria-expanded", "false");
  mobileMenuToggle.setAttribute("aria-controls", "primary-navigation");
  navLinks.id = "primary-navigation";

  mobileMenuToggle.addEventListener("click", toggleNav);

  // Close on nav link click
  qsa(".nav-links a").forEach((link) =>
    link.addEventListener("click", () => {
      navLinks.classList.remove("mobile-open");
      mobileMenuToggle.classList.remove("open");
      document.body.classList.remove("no-scroll");
      mobileMenuToggle.setAttribute("aria-expanded", "false");
    })
  );
}

// ---------- 2. ACTIVE NAVIGATION ----------
function setActiveNavigation() {
  const path = (window.location.pathname.split("/").pop() || "index.html")
    .split("?")[0]
    .split("#")[0];

  qsa(".nav-links a").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("?")[0].split("#")[0];
    const isActive = href === path || (path === "" && href === "index.html");
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

// ---------- 3. SMOOTH IN-PAGE SCROLLING ----------
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      const target = id && id !== "#" ? qs(id) : null;
      if (!target) return;
      e.preventDefault();

      const prefersReduce = prefersReducedMotion();
      const header = qs(".header-bar");
      const offset = header ? header.offsetHeight + 16 : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      if (prefersReduce) {
        window.scrollTo(0, top);
      } else {
        window.scrollTo({ top, behavior: "smooth" });
      }

      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
}

// ---------- 4. STICKY HEADER + DYNAMIC BACKGROUND ----------
function initHeaderEffects() {
  const header = qs(".header-bar");
  if (!header) return;

  const onScroll = throttle(() => {
    const y = window.scrollY || window.pageYOffset;
    const alpha = Math.min(y / 400, 0.95);
    header.style.background = `rgba(255,255,255,${0.85 + alpha * 0.15})`;
    header.style.boxShadow =
      y > 80 ? "0 4px 30px rgba(15,23,42,.12)" : "0 1px 8px rgba(15,23,42,.04)";
  }, 50);

  window.addEventListener("scroll", onScroll, { passive: true });
}

// ---------- 5. FORM VALIDATION + ACCESSIBLE FEEDBACK ----------
function initContactForm() {
  const form = qs(".contact-form");
  if (!form) return;

  // aria-live toast region
  let liveRegion = qs("#vg-live-region");
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "vg-live-region";
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.style.position = "fixed";
    liveRegion.style.left = "-9999px";
    liveRegion.style.height = "1px";
    liveRegion.style.overflow = "hidden";
    document.body.appendChild(liveRegion);
  }

  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.textContent = message;
    const bg =
      type === "error"
        ? "linear-gradient(135deg,#ef4444,#b91c1c)"
        : "linear-gradient(135deg,#16a34a,#0f766e)";

    Object.assign(toast.style, {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      background: bg,
      color: "#fff",
      padding: "1rem 1.25rem",
      borderRadius: "10px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
      zIndex: 9999,
      opacity: "0",
      transition: "opacity .3s ease",
      maxWidth: "320px",
      fontSize: "0.95rem",
    });
    document.body.appendChild(toast);
    liveRegion.textContent = message;

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  };

  const requiredFields = qsa("[required]", form);

  requiredFields.forEach((field) => {
    field.addEventListener("blur", () => {
      if (!field.value.trim()) {
        field.style.borderColor = "#ef4444";
        field.setAttribute("aria-invalid", "true");
      } else {
        field.style.borderColor = "#d1d5db";
        field.removeAttribute("aria-invalid");
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;
    requiredFields.forEach((field) => {
      const value = field.value.trim();
      if (!value) {
        field.style.borderColor = "#ef4444";
        field.setAttribute("aria-invalid", "true");
        valid = false;
      }
    });

    if (!valid) {
      showToast(
        "Please complete all required fields before submitting.",
        "error"
      );
      const firstInvalid = requiredFields.find(
        (f) => f.getAttribute("aria-invalid") === "true"
      );
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;

    const originalText = btn.textContent;
    btn.textContent = "Sending…";
    btn.disabled = true;

    // Let the external handler (FormSubmit) process the form
    form.submit();

    // Fallback UI feedback if redirect is blocked/slow
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      form.reset();
      showToast(
        "Thank you. Your message has been sent and a response will be provided within one working day."
      );
    }, 1800);
  });
}

// ---------- 6. INTERSECTION OBSERVER ANIMATIONS ----------
function initRevealAnimations() {
  const elements = qsa(".card, .value, .section-title");
  if (!elements.length) return;
  if (prefersReducedMotion()) {
    elements.forEach((el) => el.classList.add("animate-fade-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  elements.forEach((el) => io.observe(el));
}

// ---------- 7. SCROLL PROGRESS BAR ----------
function initScrollIndicator() {
  if (prefersReducedMotion()) return;

  const bar = document.createElement("div");
  bar.id = "scroll-progress";
  Object.assign(bar.style, {
    position: "fixed",
    top: "0",
    left: "0",
    height: "3px",
    width: "0%",
    background: "linear-gradient(90deg,#1d4ed8,#0ea5e9,#16a34a)",
    zIndex: "9999",
    transition: "width 0.12s ease-out",
  });
  document.body.appendChild(bar);

  const update = throttle(() => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    const scrolled = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = `${scrolled}%`;
  }, 30);

  window.addEventListener("scroll", update, { passive: true });
}

// ---------- 8. SMOOTH PAGE TRANSITIONS ----------
function initPageTransitions() {
  const enableTransitions = !prefersReducedMotion();

  qsa("a[href]").forEach((link) => {
    const target = link.getAttribute("href");
    if (!target || target.startsWith("#") || target.startsWith("mailto"))
      return;

    link.addEventListener("click", (e) => {
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      if (!enableTransitions) return;

      e.preventDefault();
      document.body.classList.add("page-exit");
      setTimeout(() => {
        window.location.href = target;
      }, 200);
    });
  });
}

// ---------- 9. PAGE LOAD FADE-IN ----------
function initPageFade() {
  const style = document.createElement("style");
  style.textContent = `
    body { opacity: 0; transition: opacity .6s ease-in-out; }
    body.page-loaded { opacity: 1; }
    body.page-exit { opacity: 0; transition: opacity .25s ease-in; }
  `;
  document.head.appendChild(style);

  window.addEventListener("load", () => {
    document.body.classList.add("page-loaded");
    setActiveNavigation();
  });
}

// ---------- 10. KEYBOARD ESCAPE CLOSE ----------
function initEscClose() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const menu = qs(".nav-links");
    const toggle = qs("#mobileMenuToggle");
    if (menu && menu.classList.contains("mobile-open")) {
      menu.classList.remove("mobile-open");
      document.body.classList.remove("no-scroll");
      if (toggle) {
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    }
  });
}

// ---------- 11. ACCESSIBILITY FOCUS STYLES ----------
function initFocusStyles() {
  const focusStyle = document.createElement("style");
  focusStyle.textContent = `
    a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible {
      outline: 3px solid #1d4ed8;
      outline-offset: 3px;
      transition: outline .15s ease;
    }
  `;
  document.head.appendChild(focusStyle);
}

// ---------- 12. DARK-MODE PREP ----------
function initDarkModeClass() {
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    document.body.classList.add("dark-mode");
  }
  // Optional: listen to changes
  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        document.body.classList.toggle("dark-mode", e.matches);
      });
  }
}

// ---------- INIT ALL ----------
document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initSmoothScroll();
  initHeaderEffects();
  initContactForm();
  initRevealAnimations();
  initScrollIndicator();
  initPageTransitions();
  initEscClose();
  initFocusStyles();
  initDarkModeClass();

  // Only run fade-in transitions if user has not requested reduced motion
  if (!prefersReducedMotion()) {
    initPageFade();
  } else {
    // If reduced motion is preferred, still ensure content is visible and nav is active
    document.body.classList.add("page-loaded");
    setActiveNavigation();
  }
});

/* End of advanced script.js */
