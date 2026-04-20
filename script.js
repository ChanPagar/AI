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
 * Chat Service
 * Manages AI chatbox with SDG 9 knowledge base
 */
const ChatService = (() => {
  let isOpen = false;
  let conversationHistory = [];

  const knowledgeBase = {
    "what is sdg 9": "SDG 9 focuses on building resilient infrastructure, promoting sustainable industrialization, and fostering innovation. It recognizes that reliable infrastructure and sustainable industries are the backbone of economic development.",
    "sdg 9 targets": "SDG 9 has 6 targets: 9.1 Reliable Infrastructure, 9.2 Sustainable Industrialization, 9.3 Small Business Support, 9.4 Clean Industries, 9.5 Innovation & Research, and 9.c ICT Access.",
    "how can i help": "You can support SDG 9 by: supporting infrastructure projects, promoting innovation, expanding digital access, supporting sustainable industries, building capacity, and enabling public-private partnerships.",
    "infrastructure": "Resilient infrastructure is essential for sustainable development. It including reliable water and sanitation systems, transportation networks, energy systems, and digital connectivity.",
    "innovation": "Innovation drives sustainable development. We need enhanced research capabilities, technology transfer, and support for entrepreneurs, especially in developing countries.",
    "digital access": "Digital access is critical. Currently, 2.3 billion people lack internet access. We're working to expand connectivity in underserved communities.",
    "climate": "SDG 9 is deeply connected to climate action. Clean industries and sustainable infrastructure reduce environmental impact and support the transition to green economies.",
    "developing countries": "Developing countries face unique challenges in infrastructure, industrialization, and technology access. International cooperation and investment are crucial to bridging these gaps.",
    "default": "I'm here to help with questions about SDG 9 - Industry, Innovation and Infrastructure. Ask me about the targets, progress, or how you can contribute!"
  };

  const findResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(knowledgeBase)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    return knowledgeBase.default;
  };

  const createChatbotUI = () => {
    const chatboxHTML = `
      <div id="chatbox" class="chatbox">
        <div class="chatbox-header">
          <h3>SDG 9 Assistant</h3>
          <button id="closeChat" class="close-chat" aria-label="Close chat">✕</button>
        </div>
        <div id="chatMessages" class="chat-messages">
          <div class="chat-message bot-message">
            <p>Hello! I'm your SDG 9 Assistant. Ask me anything about Industry, Innovation and Infrastructure! 👋</p>
          </div>
        </div>
        <div class="chat-input-area">
          <input 
            type="text" 
            id="chatInput" 
            class="chat-input" 
            placeholder="Ask about SDG 9..."
            aria-label="Chat message input"
          />
          <button id="sendChat" class="send-btn" aria-label="Send message">Send</button>
        </div>
      </div>
      <button id="chatToggle" class="chat-toggle" aria-label="Open chat">💬 Chat</button>
    `;
    
    document.body.insertAdjacentHTML("beforeend", chatboxHTML);
  };

  const attachEventListeners = () => {
    const chatToggle = document.getElementById("chatToggle");
    const closeChat = document.getElementById("closeChat");
    const sendChat = document.getElementById("sendChat");
    const chatInput = document.getElementById("chatInput");

    chatToggle.addEventListener("click", toggleChatbox);
    closeChat.addEventListener("click", closeChatbox);
    sendChat.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    LoggerService.log("Chat event listeners attached");
  };

  const toggleChatbox = () => {
    isOpen ? closeChatbox() : openChatbox();
  };

  const openChatbox = () => {
    const chatbox = document.getElementById("chatbox");
    const chatToggle = document.getElementById("chatToggle");
    chatbox.classList.add("open");
    chatToggle.classList.add("hidden");
    document.getElementById("chatInput").focus();
    isOpen = true;
    LoggerService.log("Chatbox opened");
  };

  const closeChatbox = () => {
    const chatbox = document.getElementById("chatbox");
    const chatToggle = document.getElementById("chatToggle");
    chatbox.classList.remove("open");
    chatToggle.classList.remove("hidden");
    isOpen = false;
    LoggerService.log("Chatbox closed");
  };

  const sendMessage = () => {
    const input = document.getElementById("chatInput");
    const userMessage = input.value.trim();
    
    if (!userMessage) return;

    addMessageToChat(userMessage, "user");
    input.value = "";
    LoggerService.log("User message sent", userMessage);

    // Simulate typing delay for bot response
    setTimeout(() => {
      const botResponse = findResponse(userMessage);
      addMessageToChat(botResponse, "bot");
    }, 500);
  };

  const addMessageToChat = (message, sender) => {
    const messagesContainer = document.getElementById("chatMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}-message`;
    
    const messageP = document.createElement("p");
    messageP.textContent = message;
    messageDiv.appendChild(messageP);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    conversationHistory.push({ sender, message });
  };

  return {
    init: () => {
      try {
        createChatbotUI();
        attachEventListeners();
        LoggerService.log("Chat service initialized");
      } catch (error) {
        LoggerService.error("Chat service initialization failed", error);
      }
    },
    sendMessage,
    toggleChatbox,
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
      ChatService.init();

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
window.SDG9 = { LoggerService, DataService, NavigationService, ChatService };
