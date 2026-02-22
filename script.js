/* ===============================
   V E R S E D   G L O B A L
   PREMIUM Advanced Site Script.js (2026)
   Enhanced Multi-Page Navigation
   Full Responsive Support
   Premium Performance Optimized
   Advanced Form Validation
   FIXED: Mobile Navigation Conflict Resolution
   FIXED: Service Card Read More Buttons (inline + delegated)
   FIXED: Double-tap issue on touch devices
   FIXED: Viewport units on mobile browsers
   =============================== */

// ---------- 0. UTILITIES ----------
const qs = (sel, ctx = document) => (ctx ? ctx.querySelector(sel) : null);
const qsa = (sel, ctx = document) =>
  ctx ? Array.from(ctx.querySelectorAll(sel)) : [];

const throttle = (fn, delay = 100) => {
  let last = 0;
  let queued = null;
  let timeoutId = null;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
      queued = null;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    } else {
      queued = args;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => {
          if (queued) {
            last = Date.now();
            fn(...queued);
            queued = null;
            timeoutId = null;
          }
        },
        delay - (now - last),
      );
    }
  };
};

const debounce = (fn, delay = 250) => {
  let timeoutId = null;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ========== PREMIUM DEVICE RESPONSIVE DETECTION ==========
function initDeviceDetection() {
  const detectDevice = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    let deviceType = "desktop";
    let deviceCategory = "desktop";

    if (width < 480) {
      deviceType = "mobile-sm";
      deviceCategory = "mobile";
    } else if (width < 768) {
      deviceType = "mobile-lg";
      deviceCategory = "mobile";
    } else if (width < 1024) {
      deviceType = "tablet";
      deviceCategory = "tablet";
    } else if (width < 1440) {
      deviceType = "desktop";
      deviceCategory = "desktop";
    } else {
      deviceType = "desktop-xl";
      deviceCategory = "desktop";
    }

    const orientation = width > height ? "landscape" : "portrait";

    document.documentElement.setAttribute("data-device", deviceType);
    document.documentElement.setAttribute("data-category", deviceCategory);
    document.documentElement.setAttribute("data-orientation", orientation);
    document.documentElement.setAttribute("data-viewport-width", width);
    document.documentElement.setAttribute("data-dpr", dpr);

    document.body.classList.remove(
      "mobile-sm",
      "mobile-lg",
      "tablet",
      "desktop",
      "desktop-xl",
      "landscape",
      "portrait",
    );
    document.body.classList.add(deviceType, orientation);

    if (
      CSS.supports &&
      CSS.supports("padding-top", "env(safe-area-inset-top)") &&
      CSS.supports("padding-left", "env(safe-area-inset-left)")
    ) {
      document.body.classList.add("has-notch");
    }

    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;

    document.body.classList.toggle("touch-device", isTouch);
    document.body.classList.toggle("no-touch", !isTouch);

    window.dispatchEvent(
      new CustomEvent("deviceDetected", {
        detail: {
          type: deviceType,
          category: deviceCategory,
          orientation,
          width,
          height,
          dpr,
          isTouch,
        },
      }),
    );
  };

  detectDevice();
  window.addEventListener("resize", throttle(detectDevice, 200));
  window.addEventListener("orientationchange", () => {
    setTimeout(detectDevice, 250);
  });
}

// ========== PREMIUM FORM VALIDATION ==========
class PremiumFormValidator {
  constructor(formSelector) {
    this.form = qs(formSelector);
    if (!this.form) return;

    this.fields = qsa("input, textarea, select", this.form);
    this.submitBtn = qs('button[type="submit"]', this.form);
    this.liveRegion = this.createLiveRegion();

    this.validators = {
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      phone: (value) =>
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value),
      url: (value) =>
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})(\/[\w \.-]*)*\/?$/.test(
          value,
        ),
      text: (value) => value.trim().length >= 2,
      textarea: (value) => value.trim().length >= 10,
      select: (value) => value !== "" && value !== "default",
    };

    this.init();
  }

  createLiveRegion() {
    let region = qs("#vg-live-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "vg-live-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "true");
      Object.assign(region.style, {
        position: "fixed",
        left: "-9999px",
        height: "1px",
        overflow: "hidden",
      });
      document.body.appendChild(region);
    }
    return region;
  }

  init() {
    this.fields.forEach((field) => {
      field.addEventListener(
        "input",
        debounce(() => {
          this.validateField(field);
          this.updateSubmitButton();
        }, 300),
      );

      field.addEventListener("blur", () => {
        this.validateField(field);
        this.updateSubmitButton();
      });

      field.addEventListener("focus", () => {
        this.clearFieldError(field);
      });
    });

    this.form.addEventListener("submit", (e) => {
      if (!this.validateForm()) {
        e.preventDefault();
        this.showValidationErrors();
      } else {
        this.showLoadingState();
      }
    });

    this.updateSubmitButton();
  }

  validateField(field) {
    const type = field.type || field.tagName.toLowerCase();
    const value = field.value;
    const isRequired = field.hasAttribute("required");

    if (!isRequired && value.trim() === "") {
      this.clearFieldError(field);
      return true;
    }

    let isValid = true;
    let errorMessage = "";

    if (type === "email") {
      isValid = this.validators.email(value);
      errorMessage = isValid ? "" : "Please enter a valid email address";
    } else if (type === "tel") {
      isValid = this.validators.phone(value);
      errorMessage = isValid ? "" : "Please enter a valid phone number";
    } else if (type === "url") {
      isValid = this.validators.url(value);
      errorMessage = isValid ? "" : "Please enter a valid URL";
    } else if (type === "textarea") {
      isValid = this.validators.textarea(value);
      errorMessage = isValid ? "" : "Please enter at least 10 characters";
    } else if (type === "select") {
      isValid = this.validators.select(value);
      errorMessage = isValid ? "" : "Please select an option";
    } else if (type === "text" && isRequired) {
      isValid = this.validators.text(value);
      errorMessage = isValid ? "" : "Please enter at least 2 characters";
    } else if (isRequired && value.trim() === "") {
      isValid = false;
      errorMessage = "This field is required";
    }

    if (isValid) {
      this.clearFieldError(field);
      this.showFieldSuccess(field);
    } else if (value.trim() !== "") {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  validateForm() {
    let isValid = true;
    const requiredFields = qsa("[required]", this.form);

    requiredFields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  showFieldError(field, message) {
    const wrapper = field.closest(".form-group") || field.parentElement;

    field.classList.add("field-error");
    field.classList.remove("field-success");
    field.setAttribute("aria-invalid", "true");

    const existingError = qs(".error-message", wrapper);
    if (existingError) existingError.remove();

    if (message) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = message;
      errorDiv.setAttribute("role", "alert");
      wrapper.appendChild(errorDiv);

      requestAnimationFrame(() => {
        errorDiv.style.opacity = "1";
        errorDiv.style.transform = "translateY(0)";
      });
    }
  }

  clearFieldError(field) {
    const wrapper = field.closest(".form-group") || field.parentElement;

    field.classList.remove("field-error");
    field.removeAttribute("aria-invalid");

    const errorDiv = qs(".error-message", wrapper);
    if (errorDiv) {
      errorDiv.style.opacity = "0";
      errorDiv.style.transform = "translateY(-5px)";
      setTimeout(() => errorDiv.remove(), 200);
    }
  }

  showFieldSuccess(field) {
    const value = field.value.trim();
    if (value === "") return;

    field.classList.add("field-success");
    field.classList.remove("field-error");
    field.removeAttribute("aria-invalid");
  }

  showValidationErrors() {
    const firstInvalid = qs(".field-error", this.form);
    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    showToast("Please complete all required fields correctly", "error");

    this.liveRegion.textContent =
      "Form validation failed. Please check your entries.";
  }

  updateSubmitButton() {
    if (!this.submitBtn) return;

    const requiredFields = qsa("[required]", this.form);
    const allValid = Array.from(requiredFields).every((field) =>
      this.validateField(field),
    );

    this.submitBtn.disabled = !allValid;
    this.submitBtn.classList.toggle("disabled", !allValid);
  }

  showLoadingState() {
    if (!this.submitBtn) return;

    this.submitBtn.disabled = true;
    this.submitBtn.classList.add("loading");

    const originalText = this.submitBtn.textContent;
    this.submitBtn.innerHTML = `
      <span class="spinner"></span>
      <span>Sending...</span>
    `;

    setTimeout(() => {
      this.submitBtn.disabled = false;
      this.submitBtn.classList.remove("loading");
      this.submitBtn.textContent = originalText;
    }, 3000);
  }
}

// ========== PREMIUM TOOLTIP SYSTEM ==========
function initPremiumTooltips() {
  const tooltipElements = qsa("[data-tooltip]");
  if (!tooltipElements.length) return;

  let tooltipInstance = null;

  tooltipElements.forEach((el) => {
    el.addEventListener("mouseenter", (e) => {
      const text = el.getAttribute("data-tooltip");
      if (!text) return;

      if (tooltipInstance) tooltipInstance.remove();

      tooltipInstance = document.createElement("div");
      tooltipInstance.className = "premium-tooltip";
      tooltipInstance.textContent = text;
      tooltipInstance.setAttribute("role", "tooltip");

      document.body.appendChild(tooltipInstance);

      const rect = el.getBoundingClientRect();
      const tooltipRect = tooltipInstance.getBoundingClientRect();

      let top = rect.top - tooltipRect.height - 10;
      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

      if (top < 10) {
        top = rect.bottom + 10;
        tooltipInstance.classList.add("bottom");
      }

      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }

      tooltipInstance.style.top = `${top}px`;
      tooltipInstance.style.left = `${left}px`;

      requestAnimationFrame(() => {
        tooltipInstance.classList.add("visible");
      });
    });

    el.addEventListener("mouseleave", () => {
      if (tooltipInstance) {
        tooltipInstance.classList.remove("visible");
        setTimeout(() => {
          if (tooltipInstance) tooltipInstance.remove();
          tooltipInstance = null;
        }, 200);
      }
    });
  });
}

// ========== PREMIUM LOADING ANIMATION ==========
function initPremiumLoader() {
  const loader = document.createElement("div");
  loader.className = "premium-loader";
  loader.innerHTML = `
    <div class="loader-content">
      <div class="loader-spinner"></div>
      <div class="loader-text">Loading...</div>
    </div>
  `;

  Object.assign(loader.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(255, 255, 255, 0.98)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "10000",
    opacity: "1",
    transition: "opacity 0.4s ease",
  });

  document.body.appendChild(loader);

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 400);
    }, 500);
  });
}

// ========== PREMIUM MODAL SYSTEM ==========
class PremiumModal {
  constructor() {
    this.activeModal = null;
    this.init();
  }

  init() {
    qsa("[data-modal]").forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute("data-modal");
        this.open(modalId);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.activeModal) {
        this.close();
      }
    });
  }

  open(modalId) {
    const modalContent = qs(`#${modalId}`);
    if (!modalContent) return;

    const overlay = document.createElement("div");
    overlay.className = "premium-modal-overlay";

    const modalWrapper = document.createElement("div");
    modalWrapper.className = "premium-modal";
    modalWrapper.setAttribute("role", "dialog");
    modalWrapper.setAttribute("aria-modal", "true");

    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.setAttribute("aria-label", "Close modal");
    closeBtn.addEventListener("click", () => this.close());

    const content = modalContent.cloneNode(true);
    content.style.display = "block";

    modalWrapper.appendChild(closeBtn);
    modalWrapper.appendChild(content);
    overlay.appendChild(modalWrapper);

    document.body.appendChild(overlay);
    document.body.classList.add("modal-open");

    this.activeModal = overlay;

    requestAnimationFrame(() => {
      overlay.classList.add("visible");
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    const focusableElements = qsa(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      modalWrapper,
    );
    if (focusableElements.length) {
      focusableElements[0].focus();
    }
  }

  close() {
    if (!this.activeModal) return;

    this.activeModal.classList.remove("visible");
    document.body.classList.remove("modal-open");

    setTimeout(() => {
      this.activeModal.remove();
      this.activeModal = null;
    }, 300);
  }
}

// ========== PREMIUM NOTIFICATION SYSTEM ==========
class NotificationCenter {
  constructor() {
    this.container = this.createContainer();
    this.queue = [];
    this.activeNotifications = new Set();
  }

  createContainer() {
    let container = qs(".notification-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "notification-container";
      Object.assign(container.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "10000",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: "400px",
      });
      document.body.appendChild(container);
    }
    return container;
  }

  show(message, type = "info", duration = 4000) {
    const notification = document.createElement("div");
    notification.className = `premium-notification ${type}`;
    notification.setAttribute("role", "alert");

    const icons = {
      success: "&#10003;",
      error: "&#10005;",
      warning: "&#9888;",
      info: "&#8505;",
    };

    notification.innerHTML = `
      <div class="notification-icon">${icons[type] || icons.info}</div>
      <div class="notification-content">${message}</div>
      <button class="notification-close" aria-label="Close">&times;</button>
    `;

    const closeBtn = qs(".notification-close", notification);
    closeBtn.addEventListener("click", () => this.dismiss(notification));

    this.container.appendChild(notification);
    this.activeNotifications.add(notification);

    requestAnimationFrame(() => {
      notification.classList.add("visible");
    });

    if (duration > 0) {
      setTimeout(() => this.dismiss(notification), duration);
    }

    return notification;
  }

  dismiss(notification) {
    if (!this.activeNotifications.has(notification)) return;

    notification.classList.remove("visible");
    notification.classList.add("dismissing");

    setTimeout(() => {
      notification.remove();
      this.activeNotifications.delete(notification);
    }, 300);
  }

  success(message, duration) {
    return this.show(message, "success", duration);
  }

  error(message, duration) {
    return this.show(message, "error", duration);
  }

  warning(message, duration) {
    return this.show(message, "warning", duration);
  }

  info(message, duration) {
    return this.show(message, "info", duration);
  }
}

// Initialize notification center
const notifications = new NotificationCenter();

// ========== MOBILE NAVIGATION WITH HAMBURGER MENU (ENHANCED & FIXED) ==========
// CRITICAL: This function is DISABLED on pages where inline script handles mobile nav
function initMobileNav() {
  // Skip if inline script has already set up mobile nav
  if (window.disableScriptJsMobileNav === true) {
    return;
  }

  const mobileMenuToggle = qs(".mobile-menu") || qs("#mobileMenuToggle");
  const navLinks = qs(".nav-links") || qs("#navLinks");

  if (!mobileMenuToggle || !navLinks) return;

  // Check if already initialized (prevents double-binding)
  if (navLinks.dataset.scriptjsInit === "true") return;
  navLinks.dataset.scriptjsInit = "true";

  let isMenuOpen = false;
  let touchHandled = false;

  const closeNav = () => {
    navLinks.classList.remove("active", "open");
    mobileMenuToggle.classList.remove("active", "open");
    document.body.classList.remove("no-scroll");
    mobileMenuToggle.setAttribute("aria-expanded", "false");
    mobileMenuToggle.innerHTML = "&#9776;";
    isMenuOpen = false;
  };

  const openNav = () => {
    navLinks.classList.add("active", "open");
    mobileMenuToggle.classList.add("active", "open");
    document.body.classList.add("no-scroll");
    mobileMenuToggle.setAttribute("aria-expanded", "true");
    mobileMenuToggle.innerHTML = "&times;";
    isMenuOpen = true;
  };

  const toggleNav = () => {
    isMenuOpen ? closeNav() : openNav();
  };

  // Set initial ARIA attributes
  mobileMenuToggle.setAttribute("aria-label", "Toggle navigation menu");
  mobileMenuToggle.setAttribute("aria-expanded", "false");
  mobileMenuToggle.setAttribute("aria-controls", "primary-navigation");
  if (!navLinks.id) navLinks.id = "primary-navigation";
  navLinks.setAttribute("role", "navigation");

  // Prevent double-fire on touch + click (critical for mobile)
  mobileMenuToggle.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      touchHandled = true;
      toggleNav();
    },
    { passive: false },
  );

  mobileMenuToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only handle click if touch didn't already fire
    if (touchHandled) {
      touchHandled = false;
      return;
    }
    toggleNav();
  });

  // Close menu when clicking navigation links
  qsa("a", navLinks).forEach((link) => {
    link.addEventListener("click", () => {
      if (isMenuOpen) {
        setTimeout(closeNav, 100);
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!isMenuOpen) return;

    const clickedInsideMenu = navLinks.contains(e.target);
    const clickedToggle = mobileMenuToggle.contains(e.target);

    if (!clickedInsideMenu && !clickedToggle) {
      closeNav();
    }
  });

  // Close menu on window resize to desktop
  window.addEventListener(
    "resize",
    throttle(() => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        closeNav();
      }
    }, 150),
  );

  // Close menu on orientation change
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        closeNav();
      }
    }, 250);
  });
}

// ---------- 2. ACTIVE NAVIGATION (URL-BASED) ----------
function setActiveNavigation() {
  if (typeof window === "undefined") return;

  let path = window.location.pathname.split("/").pop() || "index.html";
  path = path.split("?")[0].split("#")[0];

  if (path === "" || path === "/") {
    path = "index.html";
  }

  qsa(".nav-links a").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("?")[0].split("#")[0];
    const isInternal = href && !href.startsWith("http");

    let isActive = false;

    if (isInternal) {
      if (href === path) {
        isActive = true;
      } else if (
        path === "index.html" &&
        (href === "index.html" || href === "/" || href === "")
      ) {
        isActive = true;
      } else if (href.replace(".html", "") === path.replace(".html", "")) {
        isActive = true;
      }
    }

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
  if (typeof window === "undefined") return;

  const reduce = prefersReducedMotion();
  const header = qs(".header-bar") || qs(".site-header");

  qsa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener(
      "click",
      (e) => {
        const id = anchor.getAttribute("href");
        const target = id && id !== "#" ? qs(id) : null;
        if (!target) return;
        e.preventDefault();

        const offset = header ? header.offsetHeight + 16 : 0;
        const top =
          target.getBoundingClientRect().top + window.scrollY - offset;

        if (reduce) {
          window.scrollTo(0, top);
        } else if ("scrollBehavior" in document.documentElement.style) {
          window.scrollTo({ top, behavior: "smooth" });
        } else {
          window.scrollTo(0, top);
        }

        try {
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        } catch {
          target.focus();
        }
      },
      { passive: false },
    );
  });
}

// ---------- 4. STICKY HEADER + DYNAMIC BACKGROUND ----------
function initHeaderEffects() {
  if (typeof window === "undefined") return;
  const header = qs(".header-bar") || qs(".site-header");
  if (!header) return;

  const onScroll = throttle(() => {
    const y = window.scrollY || window.pageYOffset;

    if (y > 80) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }, 50);

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ---------- 5. PREMIUM CONTACT FORM ----------
function initContactForm() {
  const form = qs(".contact-form form") || qs("form.contact-form");
  if (!form) return;

  new PremiumFormValidator(".contact-form form");
}

// ---------- 6. INTERSECTION OBSERVER ANIMATIONS ----------
function initRevealAnimations() {
  const elements = qsa(
    ".card, .value, .section-title, .service-card, .case-card, .news-card, .website-card, .feature-card, .stat-card, .metric-card, .testimonial-card, .sector-card, .process-step, .data-item, .portal-img-card, .portal-mockup",
  );
  if (!elements.length) return;

  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
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
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );

  elements.forEach((el) => io.observe(el));
}

// ---------- 7. SCROLL PROGRESS BAR ----------
function initScrollIndicator() {
  if (prefersReducedMotion()) return;

  const existing = qs("#scroll-progress");
  const bar = existing || document.createElement("div");
  bar.id = "scroll-progress";

  Object.assign(bar.style, {
    position: "fixed",
    top: "0",
    left: "0",
    height: "3px",
    width: "0%",
    background: "linear-gradient(90deg, #0e7490, #0891b2, #06b6d4, #22d3ee)",
    zIndex: "9999",
    transition: "width 0.1s ease-out",
    pointerEvents: "none",
  });

  if (!existing) document.body.appendChild(bar);

  const update = throttle(() => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollHeight = docHeight - winHeight;

    if (scrollHeight <= 0) {
      bar.style.width = "0%";
      return;
    }

    const scrolled = Math.min((scrollTop / scrollHeight) * 100, 100);
    bar.style.width = `${scrolled}%`;
  }, 30);

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}

// ---------- 8. SMOOTH PAGE TRANSITIONS ----------
function initPageTransitions() {
  const enableTransitions = !prefersReducedMotion();

  qsa("a[href]").forEach((link) => {
    const target = link.getAttribute("href");
    if (!target || target.startsWith("#") || target.startsWith("mailto"))
      return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;

    const isInternal =
      !target.startsWith("http://") &&
      !target.startsWith("https://") &&
      !target.startsWith("tel:");

    if (!isInternal) return;

    link.addEventListener("click", (e) => {
      if (!enableTransitions) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

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
    .no-scroll { overflow: hidden; position: fixed; width: 100%; }

    .animate-fade-in {
      opacity: 0;
      transform: translateY(20px);
      animation: fadeInUp 0.6s ease forwards;
    }

    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .header-bar.scrolled {
      box-shadow: 0 4px 30px rgba(8, 145, 178, 0.18);
    }

    /* Premium Form Styles */
    .field-error {
      border-color: #ef4444 !important;
      animation: shake 0.3s ease;
    }

    .field-success {
      border-color: #10b981 !important;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      opacity: 0;
      transform: translateY(-5px);
      transition: all 0.2s ease;
    }

    .btn.loading {
      pointer-events: none;
      opacity: 0.7;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Premium Tooltip Styles */
    .premium-tooltip {
      position: fixed;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
      pointer-events: none;
      z-index: 10001;
      opacity: 0;
      transform: translateY(-5px);
      transition: all 0.2s ease;
      max-width: 250px;
    }

    .premium-tooltip.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .premium-tooltip.bottom {
      transform: translateY(5px);
    }

    .premium-tooltip.bottom.visible {
      transform: translateY(0);
    }

    /* Premium Notification Styles */
    .premium-notification {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      min-width: 300px;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .premium-notification.visible {
      opacity: 1;
      transform: translateX(0);
    }

    .premium-notification.dismissing {
      opacity: 0;
      transform: translateX(100%) scale(0.9);
    }

    .notification-icon {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: bold;
      font-size: 16px;
    }

    .premium-notification.success .notification-icon {
      background: #d1fae5;
      color: #059669;
    }

    .premium-notification.error .notification-icon {
      background: #fee2e2;
      color: #dc2626;
    }

    .premium-notification.warning .notification-icon {
      background: #fef3c7;
      color: #d97706;
    }

    .premium-notification.info .notification-icon {
      background: #dbeafe;
      color: #2563eb;
    }

    .notification-content {
      flex: 1;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: #1e293b;
    }

    .notification-close {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 20px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .notification-close:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    /* Premium Modal Styles */
    .premium-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
      padding: 20px;
    }

    .premium-modal-overlay.visible {
      opacity: 1;
    }

    .premium-modal {
      background: white;
      border-radius: 16px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      transform: scale(0.9) translateY(20px);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .premium-modal-overlay.visible .premium-modal {
      transform: scale(1) translateY(0);
    }

    .modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 36px;
      height: 36px;
      border: none;
      background: #f1f5f9;
      color: #475569;
      font-size: 24px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .modal-close:hover {
      background: #e2e8f0;
      color: #1e293b;
      transform: rotate(90deg);
    }

    body.modal-open {
      overflow: hidden;
    }

    /* Premium Loader Styles */
    .loader-content {
      text-align: center;
    }

    .loader-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(8, 145, 178, 0.2);
      border-top-color: #0891b2;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }

    .loader-text {
      font-size: 1.125rem;
      color: #0891b2;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    /* Service card expanded smooth transition */
    .service-card-full {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease, opacity 0.3s ease;
      opacity: 0;
    }

    .service-card.expanded .service-card-full {
      max-height: 500px;
      opacity: 1;
    }

    .service-card.expanded .service-card-preview {
      display: none;
    }

    /* Responsive Adjustments */
    @media (max-width: 768px) {
      .notification-container {
        top: 10px !important;
        right: 10px !important;
        left: 10px !important;
        max-width: none !important;
      }

      .premium-notification {
        min-width: auto;
      }

      .premium-modal {
        margin: 10px;
        max-height: calc(100vh - 20px);
      }
    }

    @media (max-width: 480px) {
      .premium-notification {
        padding: 12px;
        gap: 8px;
        min-width: 0;
      }

      .notification-icon {
        width: 24px;
        height: 24px;
        font-size: 14px;
      }

      .notification-content {
        font-size: 0.875rem;
      }
    }
  `;
  document.head.appendChild(style);

  window.addEventListener(
    "load",
    () => {
      document.body.classList.add("page-loaded");
      setActiveNavigation();
    },
    { once: true },
  );
}

// ---------- 10. KEYBOARD ESCAPE CLOSE ----------
function initEscClose() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" && e.key !== "Esc") return;

    const menu = qs(".nav-links");
    const toggle = qs(".mobile-menu");

    if (
      menu &&
      (menu.classList.contains("active") || menu.classList.contains("open"))
    ) {
      menu.classList.remove("active");
      menu.classList.remove("open");
      document.body.classList.remove("no-scroll");

      if (toggle) {
        toggle.classList.remove("active");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = "&#9776;";
        toggle.focus();
      }
    }
  });
}

// ---------- 11. ACCESSIBILITY FOCUS STYLES ----------
function initFocusStyles() {
  const focusStyle = document.createElement("style");
  focusStyle.textContent = `
    a:focus-visible,
    button:focus-visible,
    input:focus-visible,
    textarea:focus-visible,
    select:focus-visible {
      outline: 3px solid #0891b2;
      outline-offset: 3px;
      transition: outline .15s ease;
    }

    .mobile-menu:focus-visible {
      outline: 2px solid #0891b2;
      outline-offset: 2px;
    }

    /* Ensure read-more buttons are clearly tappable on touch devices */
    .touch-device .read-more-btn {
      min-height: 44px;
      min-width: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* Safe area insets for modern phones */
    .has-notch footer {
      padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
    }

    .has-notch .header-bar {
      padding-top: env(safe-area-inset-top);
    }
  `;
  document.head.appendChild(focusStyle);
}

// ---------- 12. DARK-MODE PREP ----------
function initDarkModeClass() {
  if (!window.matchMedia) return;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  const apply = (matches) => {
    document.body.classList.toggle("dark-mode", matches);
  };

  apply(mq.matches);
  if (mq.addEventListener) {
    mq.addEventListener("change", (e) => apply(e.matches));
  } else if (mq.addListener) {
    mq.addListener((e) => apply(e.matches));
  }
}

// ---------- 13. ORG SLIDER PAUSE ON FOCUS ----------
function initOrgSliderAccessibility() {
  const track = qs(".org-slide-track");
  if (!track) return;
  const slides = qsa(".org-slide", track);

  const pause = () => {
    track.style.animationPlayState = "paused";
  };
  const resume = () => {
    track.style.animationPlayState = "running";
  };

  slides.forEach((slide) => {
    slide.addEventListener("focus", pause);
    slide.addEventListener("blur", resume);
    slide.addEventListener("mouseenter", pause);
    slide.addEventListener("mouseleave", resume);
  });
}

// ---------- 14. SECTION SCROLL-SPY ----------
function initScrollSpy() {
  if (typeof IntersectionObserver === "undefined") return;

  const sections = qsa("section[id]");
  const navLinks = qsa(".nav-links a[href^='#']");
  if (!sections.length || !navLinks.length) return;

  const map = new Map();
  sections.forEach((sec) => {
    const id = `#${sec.id}`;
    const direct = navLinks.find((l) => l.getAttribute("href") === id);
    if (direct) map.set(sec.id, direct);
  });

  if (!map.size) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = map.get(id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("active-section"));
          link.classList.add("active-section");
        }
      });
    },
    {
      threshold: 0.4,
      rootMargin: "-64px 0px -40% 0px",
    },
  );

  sections.forEach((sec) => observer.observe(sec));
}

// ---------- 15. LAZY-LOAD IMAGES ----------
function initLazyImages() {
  const imgs = qsa("img[data-src]");
  if (!imgs.length) return;

  if ("loading" in HTMLImageElement.prototype) {
    imgs.forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
    return;
  }

  if (typeof IntersectionObserver === "undefined") {
    imgs.forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        obs.unobserve(img);
      });
    },
    { threshold: 0.1, rootMargin: "200px 0px" },
  );

  imgs.forEach((img) => io.observe(img));
}

// ---------- 16. RESIZE OBSERVER FOR LAYOUT TWEAKS ----------
function initResponsiveHelpers() {
  if (typeof window === "undefined" || !("ResizeObserver" in window)) return;

  const ro = new ResizeObserver(
    throttle(() => {
      const width = window.innerWidth;

      if (width >= 768) {
        const navLinks = qs(".nav-links");
        const toggle = qs(".mobile-menu");
        if (
          navLinks &&
          (navLinks.classList.contains("active") ||
            navLinks.classList.contains("open"))
        ) {
          navLinks.classList.remove("active");
          navLinks.classList.remove("open");
        }
        document.body.classList.remove("no-scroll");
        if (toggle) {
          toggle.classList.remove("active");
          toggle.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.innerHTML = "&#9776;";
        }
      }

      document.body.classList.toggle("is-small-device", width < 480);
    }, 150),
  );

  ro.observe(document.documentElement);
}

// ---------- 17. MOBILE VIEWPORT HEIGHT FIX ----------
function initViewportHeightFix() {
  if (typeof window === "undefined") return;

  const setVar = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  setVar();
  window.addEventListener("resize", throttle(setVar, 150));
  window.addEventListener("orientationchange", () => {
    setTimeout(setVar, 250);
  });
}

// ---------- 18. SERVICE CARD READ MORE (DELEGATED + GLOBAL FALLBACK) ----------
// This uses event delegation on the document so it works regardless of whether
// buttons use onclick="toggleServiceCard(this)" or are dynamically added.
function initServiceCards() {
  // Event delegation: catches ALL .read-more-btn clicks site-wide
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".read-more-btn");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const card = btn.closest(".service-card");
    if (!card) return;

    const isExpanded = card.classList.contains("expanded");

    if (isExpanded) {
      card.classList.remove("expanded");
      btn.textContent = "Read More";
      btn.setAttribute("aria-expanded", "false");
    } else {
      card.classList.add("expanded");
      btn.textContent = "Read Less";
      btn.setAttribute("aria-expanded", "true");
    }
  });

  // Set initial ARIA attributes on all read-more buttons
  qsa(".read-more-btn").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("role", "button");
    // Remove inline onclick to prevent double-firing
    btn.removeAttribute("onclick");
  });
}

// GLOBAL FALLBACK: Define toggleServiceCard on window so inline onclick still works
// if the delegated handler hasn't loaded yet (belt-and-braces approach)
window.toggleServiceCard = function (button) {
  if (!button) return;
  const card = button.closest(".service-card");
  if (!card) return;

  const isExpanded = card.classList.contains("expanded");

  if (isExpanded) {
    card.classList.remove("expanded");
    button.textContent = "Read More";
    button.setAttribute("aria-expanded", "false");
  } else {
    card.classList.add("expanded");
    button.textContent = "Read Less";
    button.setAttribute("aria-expanded", "true");
  }
};

// ---------- 19. EXPAND/COLLAPSE TOGGLE ----------
function initExpandToggles() {
  const toggleButtons = qsa(".expand-toggle");

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const fadeId = btn.getAttribute("data-fade");
      const block = targetId ? qs(`#${targetId}`) : null;
      const fade = fadeId ? qs(`#${fadeId}`) : null;

      if (!block) return;

      const isExpanded = block.classList.contains("expanded");

      if (isExpanded) {
        block.classList.remove("expanded");
        if (fade) fade.style.display = "block";
        btn.textContent = "Read more";
        btn.setAttribute("aria-expanded", "false");
      } else {
        block.classList.add("expanded");
        if (fade) fade.style.display = "none";
        btn.textContent = "Show less";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

// ---------- 20. WEBSITE PORTFOLIO FILTERING ----------
function initWebsiteFilter() {
  const filterButtons = qsa(".filter-btn");
  const websiteCards = qsa(".website-card");

  if (!filterButtons.length || !websiteCards.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");

      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      websiteCards.forEach((card) => {
        const category = card.getAttribute("data-category");

        if (filter === "all" || category === filter) {
          card.style.display = "block";
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "scale(1)";
          }, 10);
        } else {
          card.style.opacity = "0";
          card.style.transform = "scale(0.9)";
          setTimeout(() => {
            card.style.display = "none";
          }, 300);
        }
      });
    });
  });
}

// ---------- 21. TOAST NOTIFICATIONS ----------
function showToast(message, type = "success") {
  notifications.show(message, type, 4000);
}

// ---------- 22. BACK TO TOP BUTTON ----------
function initBackToTop() {
  if (prefersReducedMotion()) return;

  const existing = qs("#back-to-top");
  const btn = existing || document.createElement("button");
  btn.id = "back-to-top";
  btn.innerHTML = "&#8593;";
  btn.setAttribute("aria-label", "Back to top");
  btn.setAttribute("title", "Back to top");

  Object.assign(btn.style, {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0891b2, #0e7490)",
    color: "#fff",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(8, 145, 178, 0.35)",
    opacity: "0",
    visibility: "hidden",
    transition: "all 0.3s ease",
    zIndex: "9998",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  if (!existing) document.body.appendChild(btn);

  const onScroll = throttle(() => {
    if (window.scrollY > 300) {
      btn.style.opacity = "1";
      btn.style.visibility = "visible";
    } else {
      btn.style.opacity = "0";
      btn.style.visibility = "hidden";
    }
  }, 100);

  window.addEventListener("scroll", onScroll, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "translateY(-3px) scale(1.05)";
    btn.style.boxShadow = "0 6px 16px rgba(8, 145, 178, 0.45)";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translateY(0) scale(1)";
    btn.style.boxShadow = "0 4px 12px rgba(8, 145, 178, 0.35)";
  });

  onScroll();
}

// ---------- 23. SMOOTH PARALLAX SCROLL ----------
function initParallaxEffect() {
  if (prefersReducedMotion()) return;

  const parallaxElements = qsa("[data-parallax]");
  if (!parallaxElements.length) return;

  const handleScroll = throttle(() => {
    const scrolled = window.scrollY;

    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.getAttribute("data-parallax")) || 0.5;
      const offset = scrolled * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }, 16);

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

// ---------- 24. SVG DIAGRAM RESPONSIVE SCALING ----------
function initSVGResponsive() {
  const svgContainers = qsa(".data-visual");
  if (!svgContainers.length) return;

  const scaleSVGs = () => {
    svgContainers.forEach((container) => {
      const svg = qs("svg", container);
      if (!svg) return;

      const width = container.offsetWidth;

      // On very small screens, allow horizontal scroll or scale down
      if (width < 360) {
        svg.style.transform = "scale(0.85)";
        svg.style.transformOrigin = "center center";
      } else {
        svg.style.transform = "";
        svg.style.transformOrigin = "";
      }
    });
  };

  scaleSVGs();
  window.addEventListener("resize", throttle(scaleSVGs, 200));
}

// ---------- 25. TOUCH-FRIENDLY CARD INTERACTIONS ----------
function initTouchCardInteractions() {
  const isTouch =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  if (!isTouch) return;

  // Prevent :hover sticking on touch devices by adding active-touch class
  qsa(".service-card, .sector-card, .case-card, .card, .portal-img-card").forEach((card) => {
    card.addEventListener("touchstart", () => {
      card.classList.add("touch-active");
    }, { passive: true });

    card.addEventListener("touchend", () => {
      setTimeout(() => card.classList.remove("touch-active"), 300);
    }, { passive: true });
  });
}

// ---------- 26. PRINT-FRIENDLY PREPARATION ----------
function initPrintHandler() {
  window.addEventListener("beforeprint", () => {
    // Expand all service cards for print
    qsa(".service-card").forEach((card) => {
      card.classList.add("expanded");
    });

    // Show all expand toggles
    qsa(".expanded").forEach((el) => {
      el.style.maxHeight = "none";
    });
  });

  window.addEventListener("afterprint", () => {
    qsa(".service-card").forEach((card) => {
      card.classList.remove("expanded");
    });
  });
}

// ========== INIT ALL ==========
document.addEventListener("DOMContentLoaded", () => {
  // Premium Features
  initDeviceDetection();
  initPremiumTooltips();
  new PremiumModal();

  // Core navigation and functionality
  initMobileNav();
  initSmoothScroll();
  initHeaderEffects();
  initContactForm();
  initServiceCards();
  initExpandToggles();
  initWebsiteFilter();

  // Visual enhancements
  initRevealAnimations();
  initScrollIndicator();
  initPageTransitions();
  initBackToTop();
  initParallaxEffect();

  // Accessibility
  initEscClose();
  initFocusStyles();

  // Advanced features
  initDarkModeClass();
  initOrgSliderAccessibility();
  initScrollSpy();
  initLazyImages();
  initResponsiveHelpers();
  initViewportHeightFix();

  // Responsive helpers
  initSVGResponsive();
  initTouchCardInteractions();
  initPrintHandler();

  // Page load effects
  if (!prefersReducedMotion()) {
    initPageFade();
  } else {
    document.body.classList.add("page-loaded");
    setActiveNavigation();
  }

  // Set active navigation on load
  setTimeout(setActiveNavigation, 100);

  // Check for form submission success
  if (window.location.search.includes("submitted")) {
    notifications.success(
      "Thank you! Your message has been sent successfully. We'll respond within one working day.",
    );
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
});

// Backup: Set active navigation on any navigation event
window.addEventListener("popstate", setActiveNavigation);
window.addEventListener("hashchange", setActiveNavigation);

/* End of premium advanced script.js */
