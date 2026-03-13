/* ===============================
   V E R S E D   G L O B A L
   PREMIUM Advanced Site Script.js (2026)
   Enhanced Multi-Page Navigation
   Full Responsive Support
   Premium Performance Optimized
   Advanced Form Validation
   FAQ Accordion Fixes and Enhancements
   =============================== */

// ---------- 0. UTILITIES ----------
const qs = (sel, ctx = document) => (ctx ? ctx.querySelector(sel) : null);
const qsa = (sel, ctx = document) =>
  ctx ? Array.from(ctx.querySelectorAll(sel)) : [];

const throttle = (fn, delay = 100) => {
  let last = 0,
    queued = null,
    timeoutId = null;
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

// ========== 1. PREMIUM DEVICE RESPONSIVE DETECTION ==========
function initDeviceDetection() {
  const detectDevice = () => {
    const width = window.innerWidth,
      height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    let deviceType = "desktop",
      deviceCategory = "desktop";
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

    // Safe-area and notch detection
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

// ========== 2. ACTIVE NAVIGATION (URL-BASED) ==========
function setActiveNavigation() {
  if (typeof window === "undefined") return;
  let path = window.location.pathname.split("/").pop() || "index.html";
  path = path.split("?")[0].split("#")[0];
  if (path === "" || path === "/") path = "index.html";

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

// ---------- 5. PREMIUM CONTACT FORM VALIDATION ----------
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
        /^(https?:\/\/)?([a-z\d\.-]+)\.([a-z\.]{2,6})(\/[\w \.-]*)*\/?$/.test(
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
      if (!this.validateField(field)) isValid = false;
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
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
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

// ========== 6. PREMIUM TOOLTIP SYSTEM ==========
function initPremiumTooltips() {
  const tooltipElements = qsa("[data-tooltip]");
  if (!tooltipElements.length) return;
  let tooltipInstance = null;

  tooltipElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
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

// ========== 7. PREMIUM LOADING ANIMATION ==========
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

// ========== 8. PREMIUM MODAL SYSTEM ==========
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
      if ((e.key === "Escape" || e.key === "Esc") && this.activeModal) {
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

    requestAnimationFrame(() => overlay.classList.add("visible"));

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.close();
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

// ========== 9. PREMIUM NOTIFICATION SYSTEM ==========
class NotificationCenter {
  constructor() {
    this.container = this.createContainer();
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

// ---------- 10. MOBILE NAVIGATION WITH HAMBURGER MENU (ENHANCED & FIXED) ----------
function initMobileNav() {
  if (window.disableScriptJsMobileNav === true) return;
  const mobileMenuToggle = qs(".mobile-menu") || qs("#mobileMenuToggle");
  const navLinks = qs(".nav-links") || qs("#navLinks");
  if (!mobileMenuToggle || !navLinks) return;
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

  mobileMenuToggle.setAttribute("aria-label", "Toggle navigation menu");
  mobileMenuToggle.setAttribute("aria-expanded", "false");
  mobileMenuToggle.setAttribute("aria-controls", "primary-navigation");
  if (!navLinks.id) navLinks.id = "primary-navigation";
  navLinks.setAttribute("role", "navigation");

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
    if (touchHandled) {
      touchHandled = false;
      return;
    }
    toggleNav();
  });

  qsa("a", navLinks).forEach((link) => {
    link.addEventListener("click", () => {
      if (isMenuOpen) {
        setTimeout(closeNav, 100);
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!isMenuOpen) return;
    const clickedInsideMenu = navLinks.contains(e.target);
    const clickedToggle = mobileMenuToggle.contains(e.target);
    if (!clickedInsideMenu && !clickedToggle) {
      closeNav();
    }
  });

  window.addEventListener(
    "resize",
    throttle(() => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        closeNav();
      }
    }, 150),
  );
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        closeNav();
      }
    }, 250);
  });
}

// ---------- 11. SMOOTH PAGE TRANSITIONS ----------
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

// ---------- 12. PAGE LOAD FADE-IN ==========
function initPageFade() {
  const style = document.createElement("style");
  style.textContent = `
    body { opacity: 0; transition: opacity .6s ease-in-out; }
    body.page-loaded { opacity: 1; }
    body.page-exit { opacity: 0; transition: opacity .25s ease-in; }
    .no-scroll { overflow: hidden; position: fixed; width: 100%; }

    /* Form validation styles (not in styles.css) */
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

    /* Tooltip styles (not in styles.css) */
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
    .premium-tooltip.bottom { transform: translateY(5px); }
    .premium-tooltip.bottom.visible { transform: translateY(0); }

    /* Notification styles (not in styles.css) */
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
      background: #d1fae5; color: #059669;
    }
    .premium-notification.error .notification-icon {
      background: #fee2e2; color: #dc2626;
    }
    .premium-notification.warning .notification-icon {
      background: #fef3c7; color: #d97706;
    }
    .premium-notification.info .notification-icon {
      background: #dbeafe; color: #2563eb;
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

    /* Modal styles (not in styles.css) */
    .premium-modal-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      zIndex: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
      padding: 20px;
    }
    .premium-modal-overlay.visible { opacity: 1; }
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
      top: 16px; right: 16px;
      width: 36px; height: 36px;
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
    body.modal-open { overflow: hidden; }

    /* Loader styles (not in styles.css) */
    .loader-content { text-align: center; }
    .loader-spinner {
      width: 60px; height: 60px;
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

    /* Responsive notification adjustments */
    @media (max-width: 768px) {
      .notification-container {
        top: 10px !important;
        right: 10px !important;
        left: 10px !important;
        max-width: none !important;
      }
      .premium-notification { min-width: auto; }
      .premium-modal { margin: 10px; max-height: calc(100vh - 20px); }
    }
    @media (max-width: 480px) {
      .premium-notification { padding: 12px; gap: 8px; min-width: 0; }
      .notification-icon { width: 24px; height: 24px; font-size: 14px; }
      .notification-content { font-size: 0.875rem; }
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

// ---------- 13. KEYBOARD ESCAPE CLOSE ----------
function initEscClose() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" && e.key !== "Esc") return;
    const menu = qs(".nav-links");
    const toggle = qs(".mobile-menu");
    if (
      menu &&
      (menu.classList.contains("active") || menu.classList.contains("open"))
    ) {
      menu.classList.remove("active", "open");
      document.body.classList.remove("no-scroll");
      if (toggle) {
        toggle.classList.remove("active", "open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = "&#9776;";
        toggle.focus();
      }
    }
  });
}

// ---------- 14. ACCESSIBILITY FOCUS STYLES ----------
function initFocusStyles() {
  const focusStyle = document.createElement("style");
  focusStyle.textContent = `
    .touch-device .read-more-btn {
      min-height: 44px;
      min-width: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .has-notch footer {
      padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
    }
    .has-notch .header-bar {
      padding-top: env(safe-area-inset-top);
    }
  `;
  document.head.appendChild(focusStyle);
}

// ---------- 15. DARK-MODE PREPAREDNESS ----------
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

// ---------- 16. ORG SLIDER PAUSE ON FOCUS ----------
function initOrgSliderAccessibility() {
  const track = qs(".org-slide-track");
  if (!track) return;
  const slides = qsa(".org-slide", track);
  const pause = () => (track.style.animationPlayState = "paused");
  const resume = () => (track.style.animationPlayState = "running");
  slides.forEach((slide) => {
    slide.addEventListener("focus", pause);
    slide.addEventListener("blur", resume);
    slide.addEventListener("mouseenter", pause);
    slide.addEventListener("mouseleave", resume);
  });
}

// ---------- 17. SECTION SCROLL-SPY ----------
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
    { threshold: 0.4, rootMargin: "-64px 0px -40% 0px" },
  );

  sections.forEach((sec) => observer.observe(sec));
}

// ---------- 18. LAZY-LOAD IMAGES (with IntersectionObserver) ----------
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

// ---------- 19. RESIZE OBSERVER FOR LAYOUT TWEAKS ----------
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
          navLinks.classList.remove("active", "open");
        }
        document.body.classList.remove("no-scroll");
        if (toggle) {
          toggle.classList.remove("active", "open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.innerHTML = "&#9776;";
        }
      }
      document.body.classList.toggle("is-small-device", width < 480);
    }, 150),
  );

  ro.observe(document.documentElement);
}

// ---------- 20. MOBILE VIEWPORT HEIGHT FIX ----------
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

// ---------- 21. SERVICE CARD READ MORE (DELEGATED + GLOBAL FALLBACK) ----------
function initServiceCards() {
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

  qsa(".read-more-btn").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("role", "button");
    btn.removeAttribute("onclick");
  });
}

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

// ---------- 22. EXPAND/COLLAPSE TOGGLE BUTTONS ----------
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

// ---------- 23. WEBSITE PORTFOLIO FILTERING ----------
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

// ---------- 24. TOAST NOTIFICATIONS ----------
function showToast(message, type = "success") {
  notifications.show(message, type, 4000);
}

// ---------- 25. BACK TO TOP BUTTON ----------
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

// ---------- 26. SMOOTH PARALLAX SCROLL ----------
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

// ---------- 27. SVG DIAGRAM RESPONSIVE SCALING ----------
function initSVGResponsive() {
  const svgContainers = qsa(".data-visual");
  if (!svgContainers.length) return;
  const scaleSVGs = () => {
    svgContainers.forEach((container) => {
      const svg = qs("svg", container);
      if (!svg) return;
      const width = container.offsetWidth;
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

// ---------- 28. TOUCH-FRIENDLY CARD INTERACTIONS ----------
function initTouchCardInteractions() {
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (!isTouch) return;
  qsa(
    ".service-card, .sector-card, .case-card, .card, .portal-img-card, .news-card, .capability-pill, .pricing-card, .integration-card",
  ).forEach((card) => {
    card.addEventListener(
      "touchstart",
      () => {
        card.classList.add("touch-active");
      },
      { passive: true },
    );
    card.addEventListener(
      "touchend",
      () => {
        setTimeout(() => card.classList.remove("touch-active"), 300);
      },
      { passive: true },
    );
  });
}

// ---------- 29. PRINT-FRIENDLY PREPARATION ----------
function initPrintHandler() {
  window.addEventListener("beforeprint", () => {
    qsa(".service-card").forEach((card) => card.classList.add("expanded"));
    qsa(".expandable").forEach((el) => el.classList.add("expanded"));
    qsa(".faq-item").forEach((item) => item.classList.add("active"));
  });
  window.addEventListener("afterprint", () => {
    qsa(".service-card").forEach((card) => card.classList.remove("expanded"));
    qsa(".expandable").forEach((el) => el.classList.remove("expanded"));
    qsa(".faq-item").forEach((item) => item.classList.remove("active"));
  });
}

// ---------- 30. HERO STAT COUNTER ANIMATION (Website Page) ----------
function initHeroStatCounters() {
  const statValues = qsa(".hero-stat-value");
  if (!statValues.length) return;
  if (prefersReducedMotion()) return;
  const animateValue = (el) => {
    const text = el.textContent.trim();
    const numMatch = text.match(/^(\d+)/);
    if (!numMatch) return;
    const target = parseInt(numMatch[1], 10);
    const suffix = text.replace(/^\d+/, "");
    const duration = 1500;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + suffix;
      }
    };
    requestAnimationFrame(update);
  };

  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const vals = qsa(".hero-stat-value", entry.target);
            vals.forEach(animateValue);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );

    const grid = qs(".hero-stats-grid");
    if (grid) observer.observe(grid);
  }
}

// ---------- 31. TRAINING PAGE IMAGE HOVER ENHANCEMENT ----------
function initTrainingHeroEffects() {
  const media = qs(".hero-training-media");
  if (!media || prefersReducedMotion()) return;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouch) return;

  media.addEventListener("mousemove", (e) => {
    const rect = media.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    media.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
  });

  media.addEventListener("mouseleave", () => {
    media.style.transform = "";
    media.style.transition = "transform 0.4s ease";
    setTimeout(() => {
      media.style.transition = "";
    }, 400);
  });
}

// ---------- 32. ABOUT PAGE COUNTER ANIMATION ----------
function initAboutCounters() {
  const counters = qsa(".counter");
  if (!counters.length) return;
  let isAnimated = false;

  function animateCounters() {
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-target"), 10);
      if (isNaN(target)) return;
      const duration = 2000;
      const increment = target / (duration / 30);
      let current = 0;
      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };
      updateCounter();
    });
  }

  const statsSection = qs(".stats-section");
  if (statsSection && typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isAnimated) {
          isAnimated = true;
          animateCounters();
          observer.unobserve(statsSection);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(statsSection);
  }
}

// ---------- 33. PORTAL MOCKUP PROGRESS BAR ANIMATION ----------
function initPortalMockupAnimation() {
  const progressBar = qs(".portal-mockup-progress-bar");
  if (!progressBar || prefersReducedMotion()) return;
  const targetWidth = progressBar.style.width || "65%";
  progressBar.style.width = "0%";

  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              progressBar.style.width = targetWidth;
            }, 300);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );

    const mockup = qs(".portal-mockup");
    if (mockup) observer.observe(mockup);
  }
}

// ---------- 34. FAQ ACCORDION (Show/Hide Answers) ----------
function initFAQAccordion() {
  const faqItems = qsa(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = qs(".faq-question", item);
    if (!question) return;

    // Set ARIA attributes and toggle button role
    const answer = qs(".faq-answer", item);
    if (answer) {
      const answerId =
        answer.id || `faq-answer-${Math.random().toString(36).substr(2, 9)}`;
      answer.id = answerId;
      question.setAttribute("role", "button");
      question.setAttribute("aria-controls", answerId);
      question.setAttribute(
        "aria-expanded",
        item.classList.contains("active") ? "true" : "false",
      );
      question.setAttribute("tabindex", "0");
    }

    const toggleIcon = qs(".faq-toggle", item);
    if (toggleIcon) {
      // Initialize icon for collapsed items
      if (!item.classList.contains("active")) {
        toggleIcon.textContent = "+";
      } else {
        toggleIcon.textContent = "-";
      }
    }

    const toggleItem = () => {
      const isActive = item.classList.contains("active");
      if (isActive) {
        // Collapse this item
        item.classList.remove("active");
        question.setAttribute("aria-expanded", "false");
        if (toggleIcon) toggleIcon.textContent = "+";
      } else {
        // Collapse any other open item (accordion behavior)
        faqItems.forEach((other) => {
          if (other !== item && other.classList.contains("active")) {
            other.classList.remove("active");
            const otherQuestion = qs(".faq-question", other);
            const otherToggle = qs(".faq-toggle", other);
            if (otherQuestion)
              otherQuestion.setAttribute("aria-expanded", "false");
            if (otherToggle) otherToggle.textContent = "+";
          }
        });
        // Expand this item
        item.classList.add("active");
        question.setAttribute("aria-expanded", "true");
        if (toggleIcon) toggleIcon.textContent = "-";
      }
    };

    question.addEventListener("click", toggleItem);
    question.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleItem();
      }
    });
  });
}

// ========== 35. CURSOR GLOW EFFECT ==========
// Renders a radial glow that follows the mouse cursor.
// Activate on any element by adding the attribute: data-cursor-glow
// Optional: data-cursor-glow-color="#0891b2"  data-cursor-glow-size="300"
// Or enable site-wide by calling initCursorGlow() with no arguments.
function initCursorGlow(options = {}) {
  // Skip on touch-only devices
  const isTouch = "ontouchstart" in window && navigator.maxTouchPoints > 0;
  if (isTouch) return;
  if (prefersReducedMotion()) return;

  const {
    selector = "[data-cursor-glow], body",
    color = null, // falls back to element's data-cursor-glow-color or default
    size = null, // falls back to data-cursor-glow-size or 280
    opacity = 0.18,
    zIndex = 0,
    blend = "normal",
  } = options;

  // Inject shared styles once
  if (!qs("#vg-cursor-glow-styles")) {
    const style = document.createElement("style");
    style.id = "vg-cursor-glow-styles";
    style.textContent = `
      .vg-cursor-glow-host { position: relative; overflow: hidden; }
      .vg-cursor-glow-orb {
        pointer-events: none;
        position: absolute;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease, width 0.15s ease, height 0.15s ease;
        will-change: transform, opacity;
        mix-blend-mode: normal;
        z-index: 0;
        opacity: 0;
      }
      .vg-cursor-glow-orb.visible { opacity: 1; }
    `;
    document.head.appendChild(style);
  }

  const targets = qsa(selector);
  // If selector matched nothing meaningful, try body
  const els = targets.length ? targets : [document.body];

  els.forEach((el) => {
    if (el.dataset.cursorGlowInit === "true") return;
    el.dataset.cursorGlowInit = "true";

    const glowColor = color || el.dataset.cursorGlowColor || "#0891b2";
    const glowSize = parseInt(size || el.dataset.cursorGlowSize || "280", 10);

    // Make sure the host is positioned
    const pos = getComputedStyle(el).position;
    if (pos === "static") el.style.position = "relative";
    el.classList.add("vg-cursor-glow-host");

    const orb = document.createElement("div");
    orb.className = "vg-cursor-glow-orb";
    orb.style.cssText = `
      width: ${glowSize}px;
      height: ${glowSize}px;
      background: radial-gradient(circle, ${glowColor} 0%, transparent 70%);
      opacity: 0;
      mix-blend-mode: ${blend};
      z-index: ${zIndex};
    `;
    el.appendChild(orb);

    const onMove = throttle((e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      orb.style.left = `${x}px`;
      orb.style.top = `${y}px`;
      orb.style.opacity = String(opacity);
      orb.classList.add("visible");
    }, 16);

    const onLeave = () => {
      orb.style.opacity = "0";
      orb.classList.remove("visible");
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave, { passive: true });
  });
}

// ========== 36. TEXT SCRAMBLE EFFECT ==========
// Animates text with a randomised character scramble before revealing final text.
// Usage (HTML): <span data-scramble>Your Text Here</span>
// Options via data attributes:
//   data-scramble-chars  — custom character pool (default: alphanumeric + symbols)
//   data-scramble-speed  — frame interval in ms (default: 40)
//   data-scramble-cycles — scramble iterations per character (default: 8)
// Or call: scrambleText(element, "New text", { speed, cycles, chars })
class TextScrambler {
  constructor(el, options = {}) {
    this.el = el;
    this.chars =
      options.chars ||
      el.dataset.scrambleChars ||
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>[]{}";
    this.speed = parseInt(
      options.speed || el.dataset.scrambleSpeed || "40",
      10,
    );
    this.cycles = parseInt(
      options.cycles || el.dataset.scrambleCycles || "8",
      10,
    );
    this._raf = null;
  }

  scramble(newText) {
    const finalText = newText !== undefined ? newText : this.el.textContent;
    const length = finalText.length;
    let frame = 0;
    // How many total frames until each position resolves
    const resolveAt = Array.from({ length }, (_, i) =>
      Math.floor((i / length) * length * this.cycles + this.cycles),
    );
    const totalFrames = resolveAt[length - 1] + 1;

    if (this._raf) clearInterval(this._raf);

    this._raf = setInterval(() => {
      let output = "";
      for (let i = 0; i < length; i++) {
        if (frame >= resolveAt[i]) {
          output += finalText[i];
        } else {
          output += this.chars[Math.floor(Math.random() * this.chars.length)];
        }
      }
      this.el.textContent = output;
      frame++;
      if (frame > totalFrames) {
        clearInterval(this._raf);
        this.el.textContent = finalText;
      }
    }, this.speed);
  }

  cancel() {
    if (this._raf) clearInterval(this._raf);
  }
}

// Global helper
window.scrambleText = (el, text, opts = {}) => {
  const s = new TextScrambler(el, opts);
  s.scramble(text);
  return s;
};

function initTextScramble() {
  const els = qsa("[data-scramble]");
  if (!els.length) return;
  if (prefersReducedMotion()) return;

  if (typeof IntersectionObserver !== "undefined") {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const scrambler = new TextScrambler(el);
          scrambler.scramble();
          obs.unobserve(el);
        });
      },
      { threshold: 0.4 },
    );
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => new TextScrambler(el).scramble());
  }
}

// ========== 37. KEYBOARD NAVIGATION HELPER ==========
// Shows a subtle on-screen guide when a user navigates by keyboard (Tab key).
// The guide lists common shortcuts and highlights focusable elements.
// It auto-hides after 6 s of no keyboard activity, or on mouse use.
// Respects prefers-reduced-motion; skips on touch-only devices.
function initKeyboardNavHelper() {
  if (prefersReducedMotion()) return;

  let isKeyboardUser = false;
  let helpVisible = false;
  let hideTimeout = null;

  // ---- Inject styles ----
  const style = document.createElement("style");
  style.textContent = `
    #vg-kb-helper {
      position: fixed;
      bottom: 24px;
      left: 24px;
      background: rgba(15, 23, 42, 0.95);
      color: #e2e8f0;
      border: 1px solid rgba(8, 145, 178, 0.4);
      border-radius: 12px;
      padding: 14px 18px;
      font-size: 0.8125rem;
      line-height: 1.6;
      z-index: 9999;
      max-width: 280px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      backdrop-filter: blur(8px);
    }
    #vg-kb-helper.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    #vg-kb-helper h4 {
      margin: 0 0 8px;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #0891b2;
      font-weight: 700;
    }
    #vg-kb-helper table { border-collapse: collapse; width: 100%; }
    #vg-kb-helper td { padding: 2px 6px 2px 0; vertical-align: top; }
    #vg-kb-helper td:first-child { white-space: nowrap; }
    #vg-kb-helper kbd {
      display: inline-block;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 0.75rem;
      font-family: monospace;
      color: #f1f5f9;
    }
    #vg-kb-helper .kb-close {
      display: block;
      margin-top: 10px;
      text-align: right;
      font-size: 0.7rem;
      color: #64748b;
      cursor: pointer;
      pointer-events: auto;
    }
    #vg-kb-helper .kb-close:hover { color: #94a3b8; }

    /* Highlight ring on focused elements when keyboard-navigating */
    body.vg-keyboard-nav :focus:not([data-no-focus-ring]) {
      outline: 2px solid #0891b2 !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 4px rgba(8, 145, 178, 0.2) !important;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);

  // ---- Build panel ----
  const panel = document.createElement("div");
  panel.id = "vg-kb-helper";
  panel.setAttribute("role", "complementary");
  panel.setAttribute("aria-label", "Keyboard navigation shortcuts");
  panel.innerHTML = `
    <h4>⌨️ Keyboard Shortcuts</h4>
    <table>
      <tr><td><kbd>Tab</kbd></td><td>Next focusable element</td></tr>
      <tr><td><kbd>Shift+Tab</kbd></td><td>Previous element</td></tr>
      <tr><td><kbd>Enter</kbd> / <kbd>Space</kbd></td><td>Activate button / link</td></tr>
      <tr><td><kbd>Esc</kbd></td><td>Close menu / modal</td></tr>
      <tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Scroll page</td></tr>
      <tr><td><kbd>/</kbd></td><td>Focus search (if present)</td></tr>
    </table>
    <span class="kb-close" tabindex="0" role="button" aria-label="Dismiss keyboard helper">Dismiss</span>
  `;
  document.body.appendChild(panel);

  const closeBtn = qs(".kb-close", panel);

  const showPanel = () => {
    if (helpVisible) return;
    helpVisible = true;
    panel.classList.add("visible");
    resetHideTimer();
  };

  const hidePanel = () => {
    helpVisible = false;
    panel.classList.remove("visible");
    if (hideTimeout) clearTimeout(hideTimeout);
  };

  const resetHideTimer = () => {
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hidePanel, 6000);
  };

  // Show on first Tab keypress
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      if (!isKeyboardUser) {
        isKeyboardUser = true;
        document.body.classList.add("vg-keyboard-nav");
        showPanel();
      } else {
        resetHideTimer();
      }
    }
    // "/" shortcut: focus first search input
    if (
      e.key === "/" &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      const searchInput = qs(
        'input[type="search"], input[name="search"], input[placeholder*="earch" i]',
      );
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    }
  });

  // Hide on mouse activity
  document.addEventListener("mousedown", () => {
    if (isKeyboardUser) {
      isKeyboardUser = false;
      document.body.classList.remove("vg-keyboard-nav");
      hidePanel();
    }
  });

  closeBtn.addEventListener("click", hidePanel);
  closeBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      hidePanel();
    }
  });
}

// ========== 38. TYPEWRITER EFFECT ==========
// Animates text character-by-character, with optional multi-phrase looping.
//
// HTML usage:
//   Single phrase  : <span data-typewriter="Hello World"></span>
//   Multi-phrase   : <span data-typewriter='["Phrase one","Phrase two","Phrase three"]'></span>
//
// Optional data attributes:
//   data-typewriter-speed   — ms per character typed   (default: 60)
//   data-typewriter-delete  — ms per character deleted (default: 35)
//   data-typewriter-pause   — ms to pause after typing (default: 1800)
//   data-typewriter-cursor  — cursor character          (default: "|")
//   data-typewriter-loop    — "false" to disable loop  (default: true)
//
// Or call: typewriterEffect(element, phrases, options)
class Typewriter {
  constructor(el, phrases, options = {}) {
    this.el = el;
    this.phrases = Array.isArray(phrases) ? phrases : [phrases];
    this.speed = parseInt(
      options.speed || el.dataset.typewriterSpeed || "60",
      10,
    );
    this.delSpeed = parseInt(
      options.delete || el.dataset.typewriterDelete || "35",
      10,
    );
    this.pause = parseInt(
      options.pause || el.dataset.typewriterPause || "1800",
      10,
    );
    this.cursor =
      options.cursor !== undefined
        ? options.cursor
        : el.dataset.typewriterCursor !== undefined
          ? el.dataset.typewriterCursor
          : "|";
    this.loop =
      (options.loop !== undefined
        ? options.loop
        : el.dataset.typewriterLoop) !== "false";

    this.phraseIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this._timeout = null;
    this._running = false;

    // Wrap in a span so cursor sits outside typed text
    this.el.innerHTML = "";
    this.textNode = document.createElement("span");
    this.cursorNode = document.createElement("span");
    this.cursorNode.className = "tw-cursor";
    this.cursorNode.setAttribute("aria-hidden", "true");
    this.cursorNode.textContent = this.cursor;
    this.el.appendChild(this.textNode);
    this.el.appendChild(this.cursorNode);

    // Inject cursor blink style once
    if (!qs("#vg-typewriter-styles")) {
      const s = document.createElement("style");
      s.id = "vg-typewriter-styles";
      s.textContent = `
        .tw-cursor {
          display: inline-block;
          margin-left: 1px;
          animation: tw-blink 0.75s step-end infinite;
          color: inherit;
          opacity: 0.9;
        }
        @keyframes tw-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .tw-cursor.tw-done { animation: none; opacity: 0; }
      `;
      document.head.appendChild(s);
    }
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._tick();
  }

  stop() {
    this._running = false;
    if (this._timeout) clearTimeout(this._timeout);
    this.cursorNode.classList.add("tw-done");
  }

  _tick() {
    if (!this._running) return;

    const phrase = this.phrases[this.phraseIndex];

    if (this.isDeleting) {
      // Remove one character
      this.charIndex = Math.max(0, this.charIndex - 1);
      this.textNode.textContent = phrase.slice(0, this.charIndex);

      if (this.charIndex === 0) {
        this.isDeleting = false;
        this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
        // If looping is off and we've cycled back, stop
        if (!this.loop && this.phraseIndex === 0) {
          this.stop();
          return;
        }
        this._timeout = setTimeout(() => this._tick(), 400);
      } else {
        this._timeout = setTimeout(() => this._tick(), this.delSpeed);
      }
    } else {
      // Add one character
      this.charIndex = Math.min(phrase.length, this.charIndex + 1);
      this.textNode.textContent = phrase.slice(0, this.charIndex);

      if (this.charIndex === phrase.length) {
        // Finished typing this phrase
        if (this.phrases.length === 1 && !this.loop) {
          // Single phrase, no loop — done
          this.stop();
          return;
        }
        this.isDeleting = true;
        this._timeout = setTimeout(() => this._tick(), this.pause);
      } else {
        this._timeout = setTimeout(() => this._tick(), this.speed);
      }
    }
  }
}

// Global helper
window.typewriterEffect = (el, phrases, opts = {}) => {
  const tw = new Typewriter(el, phrases, opts);
  tw.start();
  return tw;
};

function initTypewriterEffects() {
  const els = qsa("[data-typewriter]");
  if (!els.length) return;
  if (prefersReducedMotion()) {
    // Just show the first phrase statically
    els.forEach((el) => {
      const raw = el.dataset.typewriter;
      try {
        const parsed = JSON.parse(raw);
        el.textContent = Array.isArray(parsed) ? parsed[0] : raw;
      } catch {
        el.textContent = raw;
      }
    });
    return;
  }

  const startTypewriter = (el) => {
    const raw = el.dataset.typewriter;
    let phrases;
    try {
      const parsed = JSON.parse(raw);
      phrases = Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      phrases = [raw];
    }
    const tw = new Typewriter(el, phrases);
    tw.start();
  };

  if (typeof IntersectionObserver !== "undefined") {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          startTypewriter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.3 },
    );
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach(startTypewriter);
  }
}

// ========== 39. CUSTOM CURSOR (BRANDED RING + DOT) ==========
// Replaces the native cursor with a bold branded ring that smoothly follows
// the pointer, plus a sharp centre dot that snaps instantly.
//
// Brand colours used: #0891b2 (primary), #0e7490 (dark), #67e8f9 (light accent)
//
// States:
//   Default  — visible ring (3px border, 42px) + solid dot (7px)
//   Hover    — ring fills with a semi-transparent brand wash & scales up
//   Click    — both elements compress & the dot flashes white
//   Text     — ring morphs into a slim I-beam indicator
//   Hidden   — fades out when cursor leaves the viewport
//   Touch    — entire feature disabled, native cursor restored
//   Motion   — disabled when prefers-reduced-motion is set
function initCustomCursor(options = {}) {
  const isTouch = "ontouchstart" in window && navigator.maxTouchPoints > 0;
  if (isTouch) return;
  if (prefersReducedMotion()) return;

  // ---- Brand palette ----
  const BRAND = options.brandColor || "#0891b2";
  const BRAND_DARK = options.brandDark || "#0e7490";
  const BRAND_LIGHT = options.brandLight || "#67e8f9";

  // ---- Config ----
  const cfg = {
    dotSize: options.dotSize || 7,
    ringSize: options.ringSize || 42,
    ringBorder: options.ringBorder || 3,
    lerp: options.lerp || 0.14,
    hoverScale: options.hoverScale || 1.7,
    clickScale: options.clickScale || 0.72,
  };

  // ---- Remove any previous instance ----
  const prevStyle = qs("#vg-custom-cursor-styles");
  const prevDot = qs("#vg-cursor-dot");
  const prevRing = qs("#vg-cursor-ring");
  if (prevStyle) prevStyle.remove();
  if (prevDot) prevDot.remove();
  if (prevRing) prevRing.remove();

  // ---- Inject styles ----
  const style = document.createElement("style");
  style.id = "vg-custom-cursor-styles";
  style.textContent = `
    /* ── Hide native cursor everywhere ── */
    html.vg-custom-cursor,
    html.vg-custom-cursor * { cursor: none !important; }

    /* ── Shared base ── */
    #vg-cursor-dot,
    #vg-cursor-ring {
      position: fixed;
      top: 0; left: 0;
      pointer-events: none;
      border-radius: 50%;
      z-index: 999999;
      will-change: transform;
      /* start hidden until first mousemove */
      opacity: 0;
    }

    /* ── Centre dot — snaps instantly, no transition ── */
    #vg-cursor-dot {
      width: ${cfg.dotSize}px;
      height: ${cfg.dotSize}px;
      background: ${BRAND};
      box-shadow:
        0 0 0 2px rgba(8,145,178,0.25),
        0 0 10px rgba(8,145,178,0.55);
      transition: opacity 0.25s ease,
                  background 0.15s ease,
                  box-shadow 0.15s ease;
    }

    /* ── Outer ring — lerp-smoothed, CSS handles size/color changes ── */
    #vg-cursor-ring {
      width: ${cfg.ringSize}px;
      height: ${cfg.ringSize}px;
      border: ${cfg.ringBorder}px solid ${BRAND};
      background: transparent;
      box-shadow:
        0 0 0 1px rgba(8,145,178,0.12),
        inset 0 0 0 1px rgba(8,145,178,0.08),
        0 0 18px rgba(8,145,178,0.22);
      transition:
        opacity        0.3s  ease,
        width          0.22s cubic-bezier(0.34,1.56,0.64,1),
        height         0.22s cubic-bezier(0.34,1.56,0.64,1),
        background     0.2s  ease,
        border-color   0.2s  ease,
        box-shadow     0.2s  ease,
        border-radius  0.2s  ease;
    }

    /* ── Visible state (set after first mousemove) ── */
    #vg-cursor-dot.is-visible  { opacity: 1; }
    #vg-cursor-ring.is-visible { opacity: 1; }

    /* ── Hover over interactive elements ── */
    #vg-cursor-ring.is-hovering {
      width:      ${cfg.ringSize * cfg.hoverScale}px;
      height:     ${cfg.ringSize * cfg.hoverScale}px;
      background: rgba(8,145,178,0.10);
      border-color: ${BRAND_LIGHT};
      box-shadow:
        0 0 0 1px rgba(103,232,249,0.2),
        0 0 28px rgba(8,145,178,0.35),
        inset 0 0 16px rgba(8,145,178,0.08);
    }
    #vg-cursor-dot.is-hovering {
      background: ${BRAND_LIGHT};
      box-shadow:
        0 0 0 3px rgba(103,232,249,0.3),
        0 0 14px rgba(103,232,249,0.6);
    }

    /* ── Click feedback ── */
    #vg-cursor-dot.is-clicking {
      background: #ffffff;
      box-shadow:
        0 0 0 3px rgba(8,145,178,0.5),
        0 0 20px rgba(8,145,178,0.8);
      transition: background 0.08s ease, box-shadow 0.08s ease;
    }
    #vg-cursor-ring.is-clicking {
      width:      ${Math.round(cfg.ringSize * cfg.clickScale)}px;
      height:     ${Math.round(cfg.ringSize * cfg.clickScale)}px;
      border-color: #ffffff;
      background: rgba(8,145,178,0.18);
      transition:
        width          0.1s  ease,
        height         0.1s  ease,
        background     0.1s  ease,
        border-color   0.1s  ease;
    }

    /* ── Text-cursor context — ring becomes a thin vertical bar ── */
    #vg-cursor-ring.is-text {
      width: 3px;
      height: ${cfg.ringSize + 8}px;
      border-radius: 2px;
      border-color: ${BRAND};
      background: rgba(8,145,178,0.15);
    }
    #vg-cursor-dot.is-text { opacity: 0; }

    /* ── Hidden when leaving viewport ── */
    #vg-cursor-dot.is-hidden,
    #vg-cursor-ring.is-hidden {
      opacity: 0 !important;
      transition: opacity 0.2s ease !important;
    }
  `;
  document.head.appendChild(style);

  // ---- Create elements ----
  const dot = document.createElement("div");
  dot.id = "vg-cursor-dot";
  document.body.appendChild(dot);

  const ring = document.createElement("div");
  ring.id = "vg-cursor-ring";
  document.body.appendChild(ring);

  document.documentElement.classList.add("vg-custom-cursor");

  // ---- State ----
  let mouseX = -200,
    mouseY = -200;
  let ringX = -200,
    ringY = -200;
  let hasEntered = false;

  // Selectors that trigger the hover state
  const HOVER_SEL =
    'a, button, [role="button"], label, select, ' +
    'input[type="submit"], input[type="button"], ' +
    'input[type="checkbox"], input[type="radio"], ' +
    ".read-more-btn, .filter-btn, .expand-toggle, " +
    ".nav-links a, .btn, [data-cursor-hover]";

  // Selectors that trigger the text state
  const TEXT_SEL =
    "p, h1, h2, h3, h4, h5, h6, li, span, td, th, " +
    'input[type="text"], input[type="email"], input[type="tel"], ' +
    'input[type="search"], textarea, [contenteditable]';

  // ---- rAF loop — only ring lerps, dot is set directly in mousemove ----
  const animate = () => {
    ringX += (mouseX - ringX) * cfg.lerp;
    ringY += (mouseY - ringY) * cfg.lerp;
    // Use translate3d for GPU compositing
    dot.style.transform = `translate3d(${mouseX}px,${mouseY}px,0) translate(-50%,-50%)`;
    ring.style.transform = `translate3d(${ringX}px,${ringY}px,0) translate(-50%,-50%)`;
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);

  // ---- Mouse move ----
  document.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasEntered) {
        // Snap ring to cursor on first appearance so it doesn't fly in from 0,0
        ringX = mouseX;
        ringY = mouseY;
        hasEntered = true;
        dot.classList.add("is-visible");
        ring.classList.add("is-visible");
      }
      dot.classList.remove("is-hidden");
      ring.classList.remove("is-hidden");
    },
    { passive: true },
  );

  // ---- Hover over interactive elements ----
  document.addEventListener(
    "mouseover",
    (e) => {
      const el = e.target;
      if (el.closest(HOVER_SEL)) {
        ring.classList.add("is-hovering");
        dot.classList.add("is-hovering");
        ring.classList.remove("is-text");
        dot.classList.remove("is-text");
      } else if (el.closest(TEXT_SEL)) {
        ring.classList.add("is-text");
        dot.classList.add("is-text");
        ring.classList.remove("is-hovering");
        dot.classList.remove("is-hovering");
      }
    },
    { passive: true },
  );

  document.addEventListener(
    "mouseout",
    (e) => {
      const el = e.target;
      if (el.closest(HOVER_SEL)) {
        ring.classList.remove("is-hovering");
        dot.classList.remove("is-hovering");
      } else if (el.closest(TEXT_SEL)) {
        ring.classList.remove("is-text");
        dot.classList.remove("is-text");
      }
    },
    { passive: true },
  );

  // ---- Click feedback ----
  document.addEventListener(
    "mousedown",
    () => {
      dot.classList.add("is-clicking");
      ring.classList.add("is-clicking");
    },
    { passive: true },
  );

  document.addEventListener(
    "mouseup",
    () => {
      dot.classList.remove("is-clicking");
      ring.classList.remove("is-clicking");
    },
    { passive: true },
  );

  // ---- Leave / enter viewport ----
  document.addEventListener(
    "mouseleave",
    () => {
      dot.classList.add("is-hidden");
      ring.classList.add("is-hidden");
    },
    { passive: true },
  );

  document.addEventListener(
    "mouseenter",
    () => {
      dot.classList.remove("is-hidden");
      ring.classList.remove("is-hidden");
    },
    { passive: true },
  );
}

// ========== 40. MAGNETIC BUTTON EFFECT ==========
// Buttons with [data-magnetic] gently attract the cursor toward their centre.
// Optional: data-magnetic-strength="0.35"  (0–1, default 0.3)
// Touch and reduced-motion safe.
function initMagneticButtons() {
  const isTouch = "ontouchstart" in window && navigator.maxTouchPoints > 0;
  if (isTouch || prefersReducedMotion()) return;

  const magneticEls = qsa("[data-magnetic]");
  if (!magneticEls.length) return;

  magneticEls.forEach((el) => {
    const strength = parseFloat(el.dataset.magneticStrength || "0.3");

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = "transform 0.1s ease";
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0, 0)";
      el.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
    });
  });
}

// ========== 41. AMBIENT PARTICLE BACKGROUND ==========
// Renders a subtle canvas-based particle field behind elements tagged
// with [data-particles].  Particles drift slowly and connect with
// faint lines when nearby — giving a live, tech-network feel.
//
// HTML: <div data-particles data-particle-color="#0891b2" data-particle-count="60"></div>
//
// Options via data attributes:
//   data-particle-color   — hex/rgb colour  (default: #0891b2)
//   data-particle-count   — number of dots  (default: 50)
//   data-particle-speed   — drift speed     (default: 0.4)
//   data-particle-radius  — dot radius px   (default: 2)
//   data-particle-connect — max connect dist (default: 120)
function initParticleBackgrounds() {
  const isTouch = "ontouchstart" in window && navigator.maxTouchPoints > 0;
  if (prefersReducedMotion()) return;

  const hosts = qsa("[data-particles]");
  if (!hosts.length) return;

  hosts.forEach((host) => {
    // Setup host
    const pos = getComputedStyle(host).position;
    if (pos === "static") host.style.position = "relative";
    host.style.overflow = "hidden";

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "0",
    });
    host.insertBefore(canvas, host.firstChild);

    const ctx = canvas.getContext("2d");
    const color = host.dataset.particleColor || "#0891b2";
    const count = parseInt(host.dataset.particleCount || "50", 10);
    const speed = parseFloat(host.dataset.particleSpeed || "0.4");
    const radius = parseFloat(host.dataset.particleRadius || "2");
    const connectDist = parseInt(host.dataset.particleConnect || "120", 10);

    // Parse color to rgba
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };
    const rgb = color.startsWith("#")
      ? hexToRgb(color)
      : { r: 8, g: 145, b: 178 };

    let W = 0,
      H = 0;
    let particles = [];
    let rafId = null;

    const resize = () => {
      W = canvas.width = host.offsetWidth;
      H = canvas.height = host.offsetHeight;
    };

    const createParticles = () => {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        a: Math.random() * 0.5 + 0.3,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Update + draw dots
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${p.a})`;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectDist) {
            const alpha = (1 - dist / connectDist) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    // Pause when off-screen for performance
    if (typeof IntersectionObserver !== "undefined") {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!rafId) {
                resize();
                if (!particles.length) createParticles();
                draw();
              }
            } else {
              if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
              }
            }
          });
        },
        { threshold: 0.01 },
      );
      io.observe(host);
    } else {
      resize();
      createParticles();
      draw();
    }

    window.addEventListener(
      "resize",
      throttle(() => {
        resize();
        createParticles();
      }, 300),
    );
  });
}

// ========== 42. SCROLL PROGRESS BAR ==========
// A thin branded progress bar at the very top of the viewport that fills
// as the user scrolls from top to bottom of the page.
// Enable by calling initScrollProgressBar() or adding data-scroll-progress
// to any element (uses that element's scroll container instead of window).
function initScrollProgressBar() {
  if (typeof window === "undefined") return;

  // Inject styles once
  if (!qs("#vg-scroll-progress-styles")) {
    const style = document.createElement("style");
    style.id = "vg-scroll-progress-styles";
    style.textContent = `
      #vg-scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        width: 0%;
        background: linear-gradient(90deg, #0891b2, #67e8f9, #0e7490);
        background-size: 200% 100%;
        z-index: 99999;
        pointer-events: none;
        transition: width 0.05s linear;
        animation: vg-progress-shimmer 2.5s linear infinite;
      }
      @keyframes vg-progress-shimmer {
        0%   { background-position: 200% center; }
        100% { background-position: -200% center; }
      }
    `;
    document.head.appendChild(style);
  }

  const bar = document.createElement("div");
  bar.id = "vg-scroll-progress";
  bar.setAttribute("role", "progressbar");
  bar.setAttribute("aria-label", "Page scroll progress");
  bar.setAttribute("aria-valuemin", "0");
  bar.setAttribute("aria-valuemax", "100");
  document.body.appendChild(bar);

  const update = throttle(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const pct =
      docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    bar.style.width = `${pct}%`;
    bar.setAttribute("aria-valuenow", Math.round(pct));
  }, 16);

  window.addEventListener("scroll", update, { passive: true });
  update();
}

// ========== 43. REVEAL ANIMATIONS (SCROLL-TRIGGERED) ==========
// Elements tagged with [data-reveal] or common section/card classes fade
// and slide into view as they enter the viewport.
//
// HTML: <div data-reveal>...</div>
// Optional modifiers:
//   data-reveal="left"   — slides from left
//   data-reveal="right"  — slides from right
//   data-reveal="up"     — slides from below (default)
//   data-reveal="down"   — slides from above
//   data-reveal="scale"  — scales up from 90%
//   data-reveal-delay="200"  — delay in ms before animation starts
//   data-reveal-duration="600" — duration in ms
function initRevealAnimations() {
  if (prefersReducedMotion()) {
    // Make all revealed elements visible immediately
    qsa("[data-reveal]").forEach((el) => (el.style.opacity = "1"));
    return;
  }
  if (typeof IntersectionObserver === "undefined") return;

  // Inject styles once
  if (!qs("#vg-reveal-styles")) {
    const style = document.createElement("style");
    style.id = "vg-reveal-styles";
    style.textContent = `
      [data-reveal] {
        opacity: 0;
        transition-property: opacity, transform;
        transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform;
      }
      [data-reveal="up"],
      [data-reveal=""] ,
      [data-reveal]:not([data-reveal="left"]):not([data-reveal="right"]):not([data-reveal="down"]):not([data-reveal="scale"]) {
        transform: translateY(30px);
      }
      [data-reveal="down"]  { transform: translateY(-30px); }
      [data-reveal="left"]  { transform: translateX(-40px); }
      [data-reveal="right"] { transform: translateX(40px); }
      [data-reveal="scale"] { transform: scale(0.9); }
      [data-reveal].is-revealed {
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  const els = qsa("[data-reveal]");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.revealDelay || "0", 10);
        const duration = parseInt(el.dataset.revealDuration || "700", 10);
        el.style.transitionDuration = `${duration}ms`;
        el.style.transitionDelay = `${delay}ms`;
        // Force reflow
        void el.offsetHeight;
        el.classList.add("is-revealed");
        obs.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  els.forEach((el) => io.observe(el));
}

// ========== 44. SCROLL INDICATOR (HERO SECTION) ==========
// Adds an animated scroll-down indicator chevron to any element tagged with
// [data-scroll-indicator] or .hero-scroll-indicator.
// Automatically hides when the user scrolls past 200px.
function initScrollIndicator() {
  const hosts = qsa("[data-scroll-indicator], .hero-scroll-indicator");
  if (!hosts.length) return;
  if (prefersReducedMotion()) return;

  if (!qs("#vg-scroll-indicator-styles")) {
    const style = document.createElement("style");
    style.id = "vg-scroll-indicator-styles";
    style.textContent = `
      .vg-scroll-chevron {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        opacity: 0.7;
        cursor: pointer;
        transition: opacity 0.3s ease, transform 0.3s ease;
        text-decoration: none;
        color: inherit;
      }
      .vg-scroll-chevron:hover { opacity: 1; transform: translateY(4px); }
      .vg-scroll-chevron svg {
        animation: vg-bounce 1.8s ease-in-out infinite;
      }
      @keyframes vg-bounce {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(8px); }
      }
      .vg-scroll-chevron.hidden {
        opacity: 0;
        pointer-events: none;
        transform: translateY(10px);
      }
    `;
    document.head.appendChild(style);
  }

  hosts.forEach((host) => {
    // Don't double-init
    if (host.dataset.scrollIndicatorInit) return;
    host.dataset.scrollIndicatorInit = "true";

    const chevron = document.createElement("span");
    chevron.className = "vg-scroll-chevron";
    chevron.setAttribute("aria-label", "Scroll down");
    chevron.setAttribute("role", "button");
    chevron.setAttribute("tabindex", "0");
    chevron.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;
    host.appendChild(chevron);

    chevron.addEventListener("click", () => {
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
    });
    chevron.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
      }
    });

    window.addEventListener(
      "scroll",
      throttle(() => {
        chevron.classList.toggle("hidden", window.scrollY > 200);
      }, 100),
      { passive: true },
    );
  });
}

// ========== 45. HORIZONTAL RAIL DRAG-SCROLL ==========
// Makes any element with [data-drag-scroll] or .drag-scroll horizontally
// draggable via mouse drag. Works alongside touch-scroll (no conflict).
// Velocity-based momentum on release for a polished feel.
function initRailDragScroll() {
  const rails = qsa("[data-drag-scroll], .drag-scroll");
  if (!rails.length) return;
  const isTouch = "ontouchstart" in window && navigator.maxTouchPoints > 0;
  if (isTouch) return; // native touch handles this

  rails.forEach((rail) => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let lastX = 0;
    let velocity = 0;
    let momentumId = null;

    rail.style.userSelect = "none";
    rail.style.cursor = "grab";

    rail.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - rail.offsetLeft;
      scrollLeft = rail.scrollLeft;
      lastX = e.pageX;
      velocity = 0;
      rail.style.cursor = "grabbing";
      if (momentumId) cancelAnimationFrame(momentumId);
    });

    document.addEventListener("mouseup", () => {
      if (!isDown) return;
      isDown = false;
      rail.style.cursor = "grab";
      // Momentum
      const applyMomentum = () => {
        velocity *= 0.93;
        if (Math.abs(velocity) > 0.5) {
          rail.scrollLeft -= velocity;
          momentumId = requestAnimationFrame(applyMomentum);
        }
      };
      applyMomentum();
    });

    rail.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      velocity = e.pageX - lastX;
      lastX = e.pageX;
      const x = e.pageX - rail.offsetLeft;
      const walk = (x - startX) * 1.2;
      rail.scrollLeft = scrollLeft - walk;
    });

    rail.addEventListener("mouseleave", () => {
      if (isDown) {
        isDown = false;
        rail.style.cursor = "grab";
      }
    });
  });
}

// ========== INIT ALL ==========
document.addEventListener("DOMContentLoaded", () => {
  initDeviceDetection();
  initPremiumTooltips();
  new PremiumModal();
  initMobileNav();
  initSmoothScroll();
  initHeaderEffects();
  initContactForm();
  initServiceCards();
  initExpandToggles();
  initWebsiteFilter();
  initFAQAccordion();
  initRevealAnimations();
  initScrollIndicator();
  initPageTransitions();
  initBackToTop();
  initParallaxEffect();
  initHeroStatCounters();
  initTrainingHeroEffects();
  initAboutCounters();
  initPortalMockupAnimation();
  initEscClose();
  initFocusStyles();
  initDarkModeClass();
  initOrgSliderAccessibility();
  initScrollSpy();
  initLazyImages();
  initResponsiveHelpers();
  initViewportHeightFix();
  initSVGResponsive();
  initTouchCardInteractions();
  initRailDragScroll();
  initPrintHandler();

  // ---- ORIGINAL ENHANCED FEATURES ----
  initCursorGlow();
  initTextScramble();
  initKeyboardNavHelper();
  initTypewriterEffects();
  initCustomCursor();

  // ---- NEW TECH FEATURES ----
  initMagneticButtons();
  initParticleBackgrounds();
  initScrollProgressBar();

  if (!prefersReducedMotion()) {
    initPageFade();
  } else {
    document.body.classList.add("page-loaded");
    setActiveNavigation();
  }

  // Set active navigation on load (again after any changes)
  setTimeout(setActiveNavigation, 100);

  // Check for form submission success query
  if (window.location.search.includes("submitted")) {
    notifications.success(
      "Thank you! Your message has been sent successfully. We'll respond within one working day.",
    );
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
});

window.addEventListener("popstate", setActiveNavigation);
window.addEventListener("hashchange", setActiveNavigation);

/* End of enhanced script.js code */
