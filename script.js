/* ===============================
   V E R S E D   G L O B A L
   PREMIUM Site Script.js — Version 8.0 (2026)
   Performance-Refactored Build
   - Removed: custom cursor, cursor glow, particle backgrounds,
     magnetic buttons, text scramble, typewriter, keyboard nav
     helper, page transitions, premium loader
   - Added: initCaseTileFilter (clients.html Recent Engagements)
   - All essential UI, form, nav, and widget functions retained
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

// ---------- 10. MOBILE NAVIGATION WITH HAMBURGER MENU ----------
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
    isMenuOpen = false;
  };

  const openNav = () => {
    navLinks.classList.add("active", "open");
    mobileMenuToggle.classList.add("active", "open");
    document.body.classList.add("no-scroll");
    mobileMenuToggle.setAttribute("aria-expanded", "true");
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
      if (window.innerWidth >= 641 && isMenuOpen) {
        closeNav();
      }
    }, 150),
  );
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      if (window.innerWidth >= 641 && isMenuOpen) {
        closeNav();
      }
    }, 250);
  });
}

// ---------- 12. PAGE LOAD FADE-IN ----------
function initPageFade() {
  const style = document.createElement("style");
  style.textContent = `
    body { opacity: 0; transition: opacity .6s ease-in-out; }
    body.page-loaded { opacity: 1; }
    .no-scroll { overflow: hidden; }

    /* Form validation styles */
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

    /* Tooltip styles */
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

    /* Notification styles */
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

    /* Modal styles */
    .premium-modal-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
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

    /* Loader styles */
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

// ---------- 18. LAZY-LOAD IMAGES ----------
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
          // Do NOT overwrite innerHTML — CSS hamburger-icon spans handle the visual
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

// ---------- 21. SERVICE CARD READ MORE ----------
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

// ---------- 23b. CLIENTS PAGE CASE TILE FILTER (Recent Engagements) ----------
function initCaseTileFilter() {
  const filterBtns = qsa(".case-filter-btn");
  const caseTiles = qsa(".case-tile");
  if (!filterBtns.length || !caseTiles.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");

      // Update active state
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Show/hide tiles
      caseTiles.forEach((tile) => {
        const category = tile.getAttribute("data-category");
        if (filter === "all" || category === filter) {
          tile.classList.remove("hidden");
          tile.style.display = "";
        } else {
          tile.classList.add("hidden");
          tile.style.display = "none";
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

// ---------- 30. HERO STAT COUNTER ANIMATION ----------
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

// ---------- 34. FAQ ACCORDION ----------
function initFAQAccordion() {
  const faqItems = qsa(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = qs(".faq-question", item);
    if (!question) return;

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
      if (!item.classList.contains("active")) {
        toggleIcon.textContent = "+";
      } else {
        toggleIcon.textContent = "-";
      }
    }

    const toggleItem = () => {
      const isActive = item.classList.contains("active");
      if (isActive) {
        item.classList.remove("active");
        question.setAttribute("aria-expanded", "false");
        if (toggleIcon) toggleIcon.textContent = "+";
      } else {
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

// ========== 42. SCROLL PROGRESS BAR ==========
function initScrollProgressBar() {
  if (typeof window === "undefined") return;

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
function initRevealAnimations() {
  if (prefersReducedMotion()) {
    qsa("[data-reveal]").forEach((el) => (el.style.opacity = "1"));
    return;
  }
  if (typeof IntersectionObserver === "undefined") return;

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
function initRailDragScroll() {
  const rails = qsa("[data-drag-scroll], .drag-scroll");
  if (!rails.length) return;
  const isTouch = "ontouchstart" in window && navigator.maxTouchPoints > 0;
  if (isTouch) return;

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

// ========== 46. DROPDOWN NAVIGATION ==========
function initDropdownNav() {
  const navItems = qsa(".nav-item.has-dropdown");
  if (!navItems.length) return;
  const isMobile = () => window.innerWidth <= 640;

  navItems.forEach((item) => {
    const trigger = qs(".dropdown-trigger", item);
    const dropdown = qs(".nav-dropdown", item);
    const chevron = qs(".nav-chevron", item);
    if (!trigger || !dropdown) return;

    let closeTimeout = null;

    // Desktop: hover-based
    item.addEventListener("mouseenter", () => {
      if (isMobile()) return;
      if (closeTimeout) clearTimeout(closeTimeout);
      qsa(".nav-item.has-dropdown").forEach((other) => {
        if (other !== item) {
          other.classList.remove("dropdown-open");
          const otherChev = qs(".nav-chevron", other);
          if (otherChev) otherChev.style.transform = "rotate(0deg)";
        }
      });
      item.classList.add("dropdown-open");
      if (chevron) chevron.style.transform = "rotate(180deg)";
    });

    item.addEventListener("mouseleave", () => {
      if (isMobile()) return;
      closeTimeout = setTimeout(() => {
        item.classList.remove("dropdown-open");
        if (chevron) chevron.style.transform = "rotate(0deg)";
      }, 200);
    });

    // Mobile: accordion-style click toggle
    trigger.addEventListener("click", (e) => {
      if (!isMobile()) return;
      e.preventDefault();
      e.stopPropagation();
      const isOpen = item.classList.contains("dropdown-open");

      qsa(".nav-item.has-dropdown").forEach((other) => {
        if (other !== item) {
          other.classList.remove("dropdown-open");
          const otherDd = qs(".nav-dropdown", other);
          const otherChev = qs(".nav-chevron", other);
          if (otherDd) otherDd.style.maxHeight = "0";
          if (otherChev) otherChev.style.transform = "rotate(0deg)";
        }
      });

      if (isOpen) {
        item.classList.remove("dropdown-open");
        dropdown.style.maxHeight = "0";
        if (chevron) chevron.style.transform = "rotate(0deg)";
      } else {
        item.classList.add("dropdown-open");
        dropdown.style.maxHeight = dropdown.scrollHeight + "px";
        if (chevron) chevron.style.transform = "rotate(180deg)";
      }
    });

    // Keyboard accessibility
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        trigger.click();
      }
      if (e.key === "Escape") {
        item.classList.remove("dropdown-open");
        dropdown.style.maxHeight = "0";
        if (chevron) chevron.style.transform = "rotate(0deg)";
        trigger.focus();
      }
    });
  });

  // Close all dropdowns on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-item.has-dropdown")) {
      qsa(".nav-item.has-dropdown").forEach((item) => {
        item.classList.remove("dropdown-open");
        const dd = qs(".nav-dropdown", item);
        const chev = qs(".nav-chevron", item);
        if (dd) dd.style.maxHeight = "0";
        if (chev) chev.style.transform = "rotate(0deg)";
      });
    }
  });

  // Reset dropdowns on resize crossing breakpoint
  window.addEventListener(
    "resize",
    throttle(() => {
      qsa(".nav-item.has-dropdown").forEach((item) => {
        const dd = qs(".nav-dropdown", item);
        if (!isMobile()) {
          if (dd) dd.style.maxHeight = "";
          item.classList.remove("dropdown-open");
          const chev = qs(".nav-chevron", item);
          if (chev) chev.style.transform = "";
        }
      });
    }, 200),
  );
}

// ========== 47. WEBZY AI CHAT WIDGET ==========
function initWebzy() {
  const knowledgeBase = {
    salesforce: {
      keywords: ["salesforce", "crm", "sfdc", "sales cloud", "service cloud"],
      response:
        "Versed Global is a certified Salesforce consulting partner. We offer full CRM implementation, customisation, integration, and managed services across Sales Cloud, Service Cloud, Marketing Cloud, and Experience Cloud. Our certified consultants help organisations maximise their Salesforce ROI with tailored solutions.",
    },
    web: {
      keywords: [
        "website",
        "web design",
        "web development",
        "wordpress",
        "ecommerce",
        "online store",
        "site",
      ],
      response:
        "We build premium, conversion-optimised websites using modern frameworks and CMS platforms. Our web development services include custom design, WordPress/Shopify builds, progressive web apps, SEO optimisation, and ongoing maintenance. Every site is mobile-responsive and performance-tuned.",
    },
    fundraising: {
      keywords: [
        "fundraising",
        "donation",
        "charity",
        "nonprofit",
        "ngo",
        "grants",
        "donor",
      ],
      response:
        "Our fundraising technology solutions help nonprofits and charities maximise donor engagement and revenue. We implement donation platforms, peer-to-peer fundraising tools, grant management systems, and integrate with CRMs like Salesforce Nonprofit Cloud for end-to-end donor lifecycle management.",
    },
    training: {
      keywords: [
        "training",
        "course",
        "learning",
        "certification",
        "workshop",
        "upskill",
      ],
      response:
        "Versed Global offers professional training programmes in Salesforce administration, digital marketing, web development, and data analytics. Our courses are delivered by certified instructors and include hands-on labs, real-world projects, and certification preparation support.",
    },
    contact: {
      keywords: [
        "contact",
        "email",
        "phone",
        "call",
        "reach",
        "address",
        "location",
        "office",
      ],
      response:
        "You can reach Versed Global at:\n\nEmail: info@versedglobal.com\nPhone: 07554 623171\nAddress: 29 Crown Way, Burgess Hill, RH15 8SX\n\nOr visit our Contact page to send us a message directly. We typically respond within one working day.",
    },
    about: {
      keywords: [
        "about",
        "who",
        "company",
        "team",
        "history",
        "founded",
        "mission",
      ],
      response:
        "Versed Global is a UK-based digital consultancy specialising in Salesforce solutions, web development, fundraising technology, and professional training. We partner with organisations across the public, private, and nonprofit sectors to deliver transformative digital solutions that drive measurable results.",
    },
    pricing: {
      keywords: [
        "price",
        "pricing",
        "cost",
        "quote",
        "budget",
        "fee",
        "rate",
        "how much",
      ],
      response:
        "Our pricing is tailored to each project's scope and complexity. We offer flexible engagement models including fixed-price projects, time & materials, and retainer packages. Contact us for a free consultation and personalised quote \u2014 we'll work within your budget to deliver maximum value.",
    },
    greeting: {
      keywords: [
        "hello",
        "hi",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
        "howdy",
        "greetings",
      ],
      response:
        "Hello! Welcome to Versed Global. I'm Webzy, your AI assistant. I can help you learn about our services including Salesforce consulting, web development, fundraising technology, and training programmes. What would you like to know?",
    },
  };

  function getResponse(message) {
    const lower = message.toLowerCase().trim();
    for (const category of Object.values(knowledgeBase)) {
      for (const keyword of category.keywords) {
        if (lower.includes(keyword)) {
          return category.response;
        }
      }
    }
    return "Thanks for your message! I'm not sure about that specific topic, but I can help with information about our Salesforce consulting, web development, fundraising technology, and training services. You can also visit our Contact page or call us at 07554 623171 for personalised assistance.";
  }

  const widget = document.createElement("div");
  widget.id = "webzy-widget";
  widget.innerHTML = `
    <button class="webzy-trigger" aria-label="Open Webzy AI Chat" title="Chat with Webzy AI">
      <svg class="webzy-icon-chat" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <svg class="webzy-icon-close" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
      <span class="webzy-badge" style="display:none;">1</span>
    </button>
    <div class="webzy-chat-window" aria-hidden="true">
      <div class="webzy-chat-header">
        <div class="webzy-chat-header-info">
          <div class="webzy-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div>
            <div class="webzy-chat-title">Webzy AI</div>
            <div class="webzy-chat-status"><span class="webzy-status-dot"></span> Online</div>
          </div>
        </div>
        <button class="webzy-chat-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="webzy-chat-body">
        <div class="webzy-message webzy-message-bot">
          <div class="webzy-message-content">
            Hi there! I'm <strong>Webzy</strong>, your AI assistant from Versed Global. How can I help you today?
          </div>
        </div>
      </div>
      <div class="webzy-quick-actions">
        <button class="webzy-quick-btn" data-message="Tell me about Salesforce services">Salesforce</button>
        <button class="webzy-quick-btn" data-message="Tell me about web development">Web Dev</button>
        <button class="webzy-quick-btn" data-message="Tell me about fundraising technology">Fundraising</button>
        <button class="webzy-quick-btn" data-message="How can I contact you?">Contact</button>
      </div>
      <div class="webzy-chat-input-area">
        <input type="text" class="webzy-chat-input" placeholder="Type your message..." aria-label="Type your message" maxlength="500">
        <button class="webzy-send-btn" aria-label="Send message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  const trigger = qs(".webzy-trigger", widget);
  const chatWindow = qs(".webzy-chat-window", widget);
  const closeBtn = qs(".webzy-chat-close", widget);
  const chatBody = qs(".webzy-chat-body", widget);
  const chatInput = qs(".webzy-chat-input", widget);
  const sendBtn = qs(".webzy-send-btn", widget);
  const iconChat = qs(".webzy-icon-chat", widget);
  const iconClose = qs(".webzy-icon-close", widget);
  const badge = qs(".webzy-badge", widget);
  const quickBtns = qsa(".webzy-quick-btn", widget);
  let isOpen = false;

  setTimeout(() => {
    if (!isOpen) {
      badge.style.display = "flex";
    }
  }, 5000);

  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.classList.toggle("webzy-open", isOpen);
    chatWindow.setAttribute("aria-hidden", !isOpen);
    iconChat.style.display = isOpen ? "none" : "block";
    iconClose.style.display = isOpen ? "block" : "none";
    trigger.classList.toggle("webzy-active", isOpen);
    badge.style.display = "none";
    if (isOpen) {
      setTimeout(() => chatInput.focus(), 300);
    }
  }

  function addMessage(text, isBot) {
    const msgDiv = document.createElement("div");
    msgDiv.className =
      "webzy-message " + (isBot ? "webzy-message-bot" : "webzy-message-user");
    const contentDiv = document.createElement("div");
    contentDiv.className = "webzy-message-content";
    contentDiv.textContent = text;
    if (isBot) {
      contentDiv.innerHTML = text.replace(/\n/g, "<br>");
    }
    msgDiv.appendChild(contentDiv);
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function showTypingIndicator() {
    const typing = document.createElement("div");
    typing.className = "webzy-message webzy-message-bot webzy-typing";
    typing.innerHTML =
      '<div class="webzy-message-content"><span class="webzy-typing-dots"><span></span><span></span><span></span></span></div>';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;
    return typing;
  }

  function sendMessage(text) {
    if (!text || !text.trim()) return;
    addMessage(text.trim(), false);
    chatInput.value = "";

    const typingEl = showTypingIndicator();
    setTimeout(
      () => {
        typingEl.remove();
        const response = getResponse(text);
        addMessage(response, true);
      },
      800 + Math.random() * 700,
    );
  }

  trigger.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", toggleChat);

  sendBtn.addEventListener("click", () => {
    sendMessage(chatInput.value);
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(chatInput.value);
    }
  });

  quickBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const msg = btn.getAttribute("data-message");
      sendMessage(msg);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      toggleChat();
    }
  });
}

// ========== 48. COOKIE CONSENT POPUP ==========
function initCookieConsent() {
  let consent = null;
  try {
    consent = localStorage.getItem("vg_cookie_consent");
  } catch (e) {}
  if (consent === "accepted" || consent === "declined") return;

  const banner = document.createElement("div");
  banner.id = "cookieConsent";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie consent");
  banner.innerHTML = `
    <div class="cookie-consent-inner">
      <div class="cookie-consent-left">
        <div class="cookie-consent-icon">
          <i class="fas fa-cookie-bite"></i>
        </div>
        <div class="cookie-consent-text">
          <strong style="color:#f0f9ff;display:block;margin-bottom:0.2rem;font-size:0.88rem;">We use cookies</strong>
          <p style="margin:0;font-size:0.82rem;line-height:1.5;color:#94a3b8;">We use cookies to enhance your browsing experience and analyse site traffic. By accepting, you help us improve our services.</p>
        </div>
      </div>
      <div class="cookie-consent-actions">
        <button class="cookie-btn cookie-btn-manage" aria-label="Manage cookie preferences">Manage</button>
        <button class="cookie-btn cookie-btn-decline" aria-label="Decline cookies">Decline</button>
        <button class="cookie-btn cookie-btn-accept" aria-label="Accept all cookies">Accept All</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  setTimeout(() => {
    banner.classList.add("show");
  }, 1500);

  const acceptBtn = qs(".cookie-btn-accept", banner);
  const declineBtn = qs(".cookie-btn-decline", banner);
  const manageBtn = qs(".cookie-btn-manage", banner);

  function closeBanner(value) {
    try {
      localStorage.setItem("vg_cookie_consent", value);
    } catch (e) {}
    banner.classList.remove("show");
    setTimeout(() => banner.remove(), 400);
  }

  acceptBtn.addEventListener("click", () => closeBanner("accepted"));
  declineBtn.addEventListener("click", () => closeBanner("declined"));
  manageBtn.addEventListener("click", () => {
    closeBanner("declined");
    if (typeof notifications !== "undefined") {
      notifications.info(
        "Cookie preferences saved. You can update your preferences in our Privacy Policy page.",
        5000,
      );
    }
  });
}

// ========== 48b. CONTACT FORM HANDLER ==========
function initContactForm() {
  const form = document.querySelector(
    '.contact-form, #contactForm, form[data-form="contact"]',
  );
  if (!form) return;

  const inputs = form.querySelectorAll("input, textarea, select");
  const submitBtn = form.querySelector('[type="submit"]');

  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      if (input.required && !input.value.trim()) {
        input.classList.add("input-error");
      } else {
        input.classList.remove("input-error");
      }
    });
    input.addEventListener("input", () => {
      if (input.value.trim()) input.classList.remove("input-error");
    });
  });

  form.addEventListener("submit", (e) => {
    let valid = true;
    inputs.forEach((input) => {
      if (input.required && !input.value.trim()) {
        input.classList.add("input-error");
        valid = false;
      }
    });
    if (!valid) {
      e.preventDefault();
      const firstError = form.querySelector(".input-error");
      if (firstError) firstError.focus();
    }
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
  initCaseTileFilter();
  initFAQAccordion();
  initRevealAnimations();
  initScrollIndicator();
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
  initScrollProgressBar();
  initDropdownNav();
  initWebzy();
  initCookieConsent();

  if (!prefersReducedMotion()) {
    initPageFade();
  } else {
    document.body.classList.add("page-loaded");
    setActiveNavigation();
  }

  setTimeout(setActiveNavigation, 100);

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

/* End of script.js — Version 8.0 (Performance Refactored) */
