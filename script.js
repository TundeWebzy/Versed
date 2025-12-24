// Mobile menu toggle functionality
document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu elements
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const navLinks = document.querySelector(".nav-links");

  // Toggle mobile menu
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("mobile-open");
    });
  }

  // Close mobile menu when clicking on a link
  const navLinkItems = document.querySelectorAll(".nav-links a");
  navLinkItems.forEach((link) => {
    link.addEventListener("click", function () {
      navLinks.classList.remove("mobile-open");
    });
  });

  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href !== "#") {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });

  // Active navigation highlighting
  function setActiveNav() {
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      }
    });
  }

  // Run on page load
  setActiveNav();

  // Update active nav on page change (for single-page navigation)
  window.addEventListener("popstate", setActiveNav);
});

// Form submission handler (static form - for demo)
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Simple form validation
      const requiredFields = contactForm.querySelectorAll("[required]");
      let isValid = true;

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          field.style.borderColor = "#ef4444";
          isValid = false;
        } else {
          field.style.borderColor = "#d1d5db";
        }
      });

      if (isValid) {
        // Simulate form submission
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
          alert(
            "Thank you! Your message has been sent. We'll be in touch within 24 hours."
          );
          contactForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 1500);
      }
    });
  }
});

// Add scroll effect to header
window.addEventListener("scroll", function () {
  const header = document.querySelector(".header-bar");
  if (header) {
    if (window.scrollY > 100) {
      header.style.boxShadow = "0 2px 20px rgba(0,0,0,0.1)";
      header.style.background = "rgba(255,255,255,0.98)";
    } else {
      header.style.boxShadow = "0 1px 1px rgba(0,0,0,0.05)";
      header.style.background = "rgba(255,255,255,1)";
    }
  }
});

// Intersection Observer for animations (fade in on scroll)
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate-fade-in");
    }
  });
}, observerOptions);

// Observe cards for animation
document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".card, .value");
  cards.forEach((card) => {
    observer.observe(card);
  });
});

// Prevent layout shift on images
if (document.querySelector(".hero-image img")) {
  document
    .querySelector(".hero-image img")
    .addEventListener("load", function () {
      this.style.opacity = "1";
    });
}

// Keyboard navigation support
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const navLinks = document.querySelector(".nav-links");
    if (navLinks && navLinks.classList.contains("mobile-open")) {
      navLinks.classList.remove("mobile-open");
    }
  }
});
