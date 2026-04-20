/**
 * SDG 9 Website - Modular Architecture
 * Clean Architecture principles with proper separation of concerns
 * Department: Frontend Architecture
 * Pattern: Module Pattern + Observer
 */

/**
 * Logger Service
 * Handles all logging operations with error boundaries
 */
const LoggerService = (() => {
  const isDev = true;

  return {
    log: (message, data = null) => {
      if (isDev) {
        console.log(`[SDG9] ${message}`, data || "");
      }
    },
    error: (message, error = null) => {
      console.error(`[SDG9 ERROR] ${message}`, error || "");
    },
    warn: (message, data = null) => {
      console.warn(`[SDG9 WARN] ${message}`, data || "");
    },
  };
})();

/**
 * Data Service
 * Manages content data loading with error handling
 */
const DataService = (() => {
  let contentCache = null;

  const loadData = async () => {
    try {
      if (contentCache) return contentCache;
      const response = await fetch("data.json");
      if (!response.ok) throw new Error("Failed to load configuration");
      contentCache = await response.json();
      LoggerService.log("Data loaded successfully");
      return contentCache;
    } catch (error) {
      LoggerService.error("Failed to load data.json", error);
      return null;
    }
  };

  return { loadData };
})();

/**
 * Animation Service
 * Manages all animation operations with intersection observers
 */
const AnimationService = (() => {
  const createObserver = (callback, threshold = 0.5) => {
    return new IntersectionObserver(callback, {
      threshold,
      rootMargin: "0px",
    });
  };

  const observeElements = (selector, onIntersect) => {
    const elements = document.querySelectorAll(selector);
    const observer = createObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onIntersect(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });

    elements.forEach((el) => observer.observe(el));
    return observer;
  };

  return {
    fadeInOnScroll: () => {
      return observeElements(
        ".target-card, .action-card, .stat-card, .progress-item",
        (el) => {
          el.style.opacity = "0";
          el.style.animation = "fadeIn 0.6s ease-in forwards";
        },
      );
    },

    animateProgressBars: () => {
      const progressSection = document.querySelector(".progress-content");
      if (!progressSection) return;

      return observeElements(".progress-content", (el) => {
        const progressFills = el.querySelectorAll(".progress-fill");
        progressFills.forEach((fill) => {
          const width = fill.style.width;
          fill.style.width = "0";
          setTimeout(() => {
            fill.style.transition = "width 1.5s ease-out";
            fill.style.width = width;
          }, 100);
        });
      });
    },
  };
})();

/**
 * Navigation Service
 * Handles all navigation-related functionality
 */
const NavigationService = (() => {
  const setupSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
    LoggerService.log("Smooth scroll initialized");
  };

  const setupActiveNavHighlight = () => {
    window.addEventListener("scroll", () => {
      let current = "";
      const sections = document.querySelectorAll("section");

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
          current = section.getAttribute("id");
        }
      });

      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href").slice(1) === current) {
          link.classList.add("active");
        }
      });
    });
    LoggerService.log("Active nav highlight initialized");
  };

  const injectNavStyles = () => {
    const style = document.createElement("style");
    style.textContent = `
      .nav-links a.active {
        color: var(--secondary-color) !important;
        font-weight: bold;
        border-bottom: 2px solid var(--secondary-color);
        padding-bottom: 5px;
      }
    `;
    document.head.appendChild(style);
  };

  return {
    init: () => {
      try {
        setupSmoothScroll();
        setupActiveNavHighlight();
        injectNavStyles();
        LoggerService.log("Navigation service initialized");
      } catch (error) {
        LoggerService.error("Navigation initialization failed", error);
      }
    },
  };
})();

/**
 * Animation Service Initialization
 * Applies animations to page elements
 */
const UIAnimationService = (() => {
  return {
    init: () => {
      try {
        AnimationService.fadeInOnScroll();
        AnimationService.animateProgressBars();
        LoggerService.log("UI animations initialized");
      } catch (error) {
        LoggerService.error("UI animation initialization failed", error);
      }
    },
  };
})();

/**
 * Application Bootstrap
 * Initializes all services and starts the application
 */
const App = (() => {
  const init = async () => {
    try {
      LoggerService.log("SDG 9 Application starting...");

      // Initialize services in order
      NavigationService.init();
      UIAnimationService.init();

      // Load and verify data
      const data = await DataService.loadData();
      if (!data) {
        LoggerService.warn("Data not available, using fallback");
      }

      LoggerService.log(
        "SDG 9 - Industry, Innovation and Infrastructure website loaded successfully!",
      );
    } catch (error) {
      LoggerService.error("Application initialization failed", error);
    }
  };

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { init };
})();

// Export for debugging in console
window.SDG9 = { LoggerService, DataService, NavigationService };
