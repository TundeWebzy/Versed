/* ===============================
   V E R S E D   G L O B A L
   Enhanced Site Script.js (2025)
   =============================== */

// ---------- 1. MOBILE NAVIGATION ----------
document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const navLinks = document.querySelector(".nav-links");

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("mobile-open");
      mobileMenuToggle.classList.toggle("open");
      document.body.classList.toggle("no-scroll");
    });
  }

  // Close mobile nav on link click
  const navItems = document.querySelectorAll(".nav-links a");
  navItems.forEach((l) =>
    l.addEventListener("click", () => {
      navLinks.classList.remove("mobile-open");
      mobileMenuToggle.classList.remove("open");
      document.body.classList.remove("no-scroll");
    })
  );

  // Smooth scrolling inside page
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      const section = document.querySelector(id);
      if (section) {
        e.preventDefault();
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});

// ---------- 2. ACTIVE NAVIGATION ----------
function setActiveNavigation() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === path);
  });
}
window.addEventListener("load", setActiveNavigation);
window.addEventListener("popstate", setActiveNavigation);

// ---------- 3. STICKY HEADER + DYNAMIC BACKGROUND ----------
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header-bar");
  if (!header) return;

  const alpha = Math.min(window.scrollY / 400, 0.95);
  header.style.background = `rgba(255,255,255,${0.8 + alpha * 0.2})`;
  header.style.boxShadow =
    window.scrollY > 80
      ? "0 4px 30px rgba(0,0,0,.08)"
      : "0 1px 6px rgba(0,0,0,.03)";
});

// ---------- 4. FORM VALIDATION + FRIENDLY FEEDBACK ----------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = form.querySelectorAll("[required]");
    let valid = true;

    fields.forEach((f) => {
      f.style.borderColor = f.value.trim() ? "#d1d5db" : "#ef4444";
      if (!f.value.trim()) valid = false;
    });

    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    const text = btn.textContent;
    btn.textContent = "Sending...";
    btn.disabled = true;

    setTimeout(() => {
      const toast = document.createElement("div");
      toast.textContent =
        "Thank you! Your message has been received — we'll reply within 24h.";
      Object.assign(toast.style, {
        position: "fixed",
        bottom: "30px",
        right: "30px",
        background: "linear-gradient(135deg,#10b981,#059669)",
        color: "#fff",
        padding: "1rem 1.25rem",
        borderRadius: "10px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        zIndex: 9999,
        opacity: "0",
        transition: "opacity .4s ease",
      });
      document.body.appendChild(toast);
      requestAnimationFrame(() => (toast.style.opacity = "1"));

      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
      }, 4000);

      form.reset();
      btn.textContent = text;
      btn.disabled = false;
    }, 1500);
  });
});

// ---------- 5. INTERSECTION OBSERVER ANIMATIONS ----------
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-fade-in");
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".card, .value, .section-title")
    .forEach((el) => io.observe(el));
});

// ---------- 6. SCROLL PROGRESS BAR ----------
(function addScrollIndicator() {
  const bar = document.createElement("div");
  bar.id = "scroll-progress";
  Object.assign(bar.style, {
    position: "fixed",
    top: "0",
    left: "0",
    height: "3px",
    width: "0%",
    background: "linear-gradient(90deg,#3b5bdb,#14b8a6,#ec4899)",
    zIndex: "9999",
    transition: "width 0.15s ease-out",
  });
  document.body.appendChild(bar);

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    const scrolled = (scrollTop / scrollHeight) * 100;
    bar.style.width = `${scrolled}%`;
  });
})();

// ---------- 7. SMOOTH PAGE TRANSITIONS ----------
document.querySelectorAll("a[href]").forEach((link) => {
  const target = link.getAttribute("href");
  if (!target || target.startsWith("#") || target.startsWith("mailto")) return;
  link.addEventListener("click", (e) => {
    if (link.target === "_blank") return;
    document.body.classList.add("page-exit");
    setTimeout(() => {
      window.location.href = target;
    }, 200);
    e.preventDefault();
  });
});

// ---------- 8. PAGE LOAD FADE-IN ----------
window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});
const style = document.createElement("style");
style.textContent = `
  body { opacity: 0; transition: opacity .6s ease-in-out; }
  body.page-loaded { opacity: 1; }
  body.page-exit { opacity: 0; transition: opacity .25s ease-in; }
`;
document.head.appendChild(style);

// ---------- 9. KEYBOARD ESCAPE CLOSE ----------
document.addEventListener("keydown", (e) => {
  const menu = document.querySelector(".nav-links");
  if (e.key === "Escape" && menu && menu.classList.contains("mobile-open")) {
    menu.classList.remove("mobile-open");
    document.body.classList.remove("no-scroll");
  }
});

// ---------- 10. ACCESSIBILITY IMPROVEMENTS ----------
window.addEventListener("load", () => {
  const focusStyle = document.createElement("style");
  focusStyle.textContent = `
    a:focus-visible, button:focus-visible, input:focus-visible {
      outline: 3px solid #3b5bdb;
      outline-offset: 2px;
      transition: outline .2s ease;
    }
  `;
  document.head.appendChild(focusStyle);
});

// ---------- 11. DARK-MODE DETECTION ----------
function applyDarkMode() {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark-mode");
  }
}
applyDarkMode();

/* End of upgraded script.js */
