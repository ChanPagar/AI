# SDG 9 Website - Service API Reference

## Overview

This document describes the public API contract for all services in the SDG 9 website architecture.

---

## LoggerService

**Purpose**: Centralized logging with environment awareness  
**Pattern**: Module Pattern (Singleton)  
**Scope**: Application-wide

### Public API

```javascript
LoggerService.log(message: string, data?: any): void
```
Logs informational messages to console in development mode.

**Parameters:**
- `message: string` - Log message
- `data?: any` - Optional data to log

**Example:**
```javascript
LoggerService.log("User clicked button", { button: "Learn More" });
```

---

```javascript
LoggerService.error(message: string, error?: any): void
```
Logs error messages with stack traces.

**Parameters:**
- `message: string` - Error message
- `error?: any` - Error object or details

**Example:**
```javascript
try {
  await fetch("data.json");
} catch (e) {
  LoggerService.error("Failed to load data", e);
}
```

---

```javascript
LoggerService.warn(message: string, data?: any): void
```
Logs warning messages for non-critical issues.

**Parameters:**
- `message: string` - Warning message
- `data?: any` - Optional context data

**Example:**
```javascript
LoggerService.warn("Fallback data used", { reason: "Network timeout" });
```

---

## DataService

**Purpose**: Manage content data loading and caching  
**Pattern**: Module Pattern with Caching  
**Scope**: Application-wide

### Public API

```javascript
DataService.loadData(): Promise<object | null>
```
Loads website content from `data.json` with automatic caching.

**Returns:**
- `Promise<object>` - Content data or null if loading fails
- First call fetches from network; subsequent calls return cached data

**Example:**
```javascript
const data = await DataService.loadData();
if (data) {
  console.log(data.metadata.title);
}
```

### Error Handling

Failures are logged but do not throw. Returns `null` on error.

```javascript
// Graceful error handling
const data = await DataService.loadData();
if (!data) {
  LoggerService.warn("Using fallback data");
  // Continue with fallback
}
```

### Data Structure

```typescript
interface ContentData {
  metadata: {
    title: string;
    description: string;
  };
  navigation: NavItem[];
  hero: HeroContent;
  about: AboutContent;
  targets: TargetItem[];
  progress: ProgressContent;
  actions: ActionItem[];
  footer: FooterContent;
}
```

See `data.json` for full structure.

---

## AnimationService

**Purpose**: Manage scroll-based animations with Intersection Observer  
**Pattern**: Module Pattern  
**Scope**: UI animations

### Public API

```javascript
AnimationService.fadeInOnScroll(): IntersectionObserver
```
Applies fade-in animation to elements when they scroll into view.

**Selectors animated:**
- `.target-card`
- `.action-card`
- `.stat-card`
- `.progress-item`

**Returns:** IntersectionObserver instance (for potential cleanup)

**Example:**
```javascript
AnimationService.fadeInOnScroll();
// Elements fade in as user scrolls
```

---

```javascript
AnimationService.animateProgressBars(): IntersectionObserver
```
Animates progress bars when progress section comes into view.

**Behavior:**
- Resets bar width to 0
- Animates fill over 1.5 seconds
- Fires once when section becomes visible

**Returns:** IntersectionObserver instance

**Example:**
```javascript
AnimationService.animateProgressBars();
// Progress bars animate when visible
```

---

## NavigationService

**Purpose**: Manage navigation functionality and smooth scrolling  
**Pattern**: Module Pattern  
**Scope**: Page navigation

### Public API

```javascript
NavigationService.init(): void
```
Initializes all navigation features.

**Initializes:**
- Smooth scroll behavior on anchor clicks
- Active link highlighting on scroll
- Navigation styling injection

**Example:**
```javascript
NavigationService.init();
// Call once at app startup
```

### Behavior

- **Smooth Scroll**: Clicking `<a href="#section">` smoothly scrolls to section
- **Active Highlighting**: Current section nav link highlighted with styling
- **Auto Highlight**: Updates as user scrolls through sections
- **ARIA Support**: Navigation marked with `role="navigation"` and `aria-label`

---

## UIAnimationService

**Purpose**: Coordinate all UI animations  
**Pattern**: Module Pattern (Orchestrator)  
**Scope**: Animation coordination

### Public API

```javascript
UIAnimationService.init(): void
```
Initializes all UI animations and effects.

**Initializes:**
- Fade-in animations on scroll
- Progress bar animations
- Error handling for animation failures

**Example:**
```javascript
UIAnimationService.init();
// All animations become active
```

---

## App (Bootstrap)

**Purpose**: Application initialization and lifecycle management  
**Pattern**: Module Pattern (Singleton)  
**Scope**: Application-wide

### Public API

```javascript
App.init(): Promise<void>
```
Bootstraps the entire application.

**Initialization Order:**
1. Log startup
2. Initialize NavigationService
3. Initialize UIAnimationService
4. Load data via DataService
5. Log completion

**Handles:**
- DOM ready state
- Error handling
- Service orchestration

**Example:**
```javascript
// Automatically called on DOMContentLoaded
// Can be called manually if needed
await App.init();
```

### Development Helpers

```javascript
window.SDG9.LoggerService     // Access logger
window.SDG9.DataService       // Access data service
window.SDG9.NavigationService // Access navigation
```

Debug in browser console:
```javascript
// Check what's loaded
window.SDG9.DataService.loadData().then(d => console.log(d));

// Trigger logging
window.SDG9.LoggerService.log("Test message");
```

---

## Service Interaction Diagram

```
App.init()
  ├─> NavigationService.init()
  │    ├─> setupSmoothScroll()
  │    ├─> setupActiveNavHighlight()
  │    └─> injectNavStyles()
  │
  ├─> UIAnimationService.init()
  │    ├─> AnimationService.fadeInOnScroll()
  │    └─> AnimationService.animateProgressBars()
  │
  ├─> DataService.loadData()
  │    └─> [Cache hit on subsequent calls]
  │
  └─> Log completion
       └─> LoggerService.log(...)
```

---

## Error Handling Strategy

### Try-Catch Boundaries

Each service initialization is wrapped:

```javascript
try {
  NavigationService.init();
} catch (error) {
  LoggerService.error("Navigation initialization failed", error);
}
```

### Graceful Degradation

- Data loading failure: Continue with fallback
- Animation initialization failure: Page still functional
- Navigation failure: Site still navigable (no smooth scroll)

### Logging

All errors logged via LoggerService with context.

---

## Performance Characteristics

### DataService
- **First Load**: Network request (~10-50ms for JSON)
- **Subsequent Calls**: O(1) cache lookup
- **Memory**: Single object cached in closure

### AnimationService
- **Setup**: O(n) where n = elements to observe
- **Runtime**: Native browser optimization (efficient)
- **Memory**: Observer instances stored, cleaned up on unobserve

### NavigationService
- **Setup**: O(n) for event listener attachment
- **Runtime**: O(m) on scroll where m = number of sections
- **Memory**: Event listeners attached to window and anchors

---

## Extending Services

### Adding a New Service

Follow the Module Pattern:

```javascript
const NewService = (() => {
  // Private state
  const state = {};
  
  // Private methods
  const privateMethod = () => {
    LoggerService.log("Private operation");
  };
  
  // Public interface
  return {
    init: () => {
      try {
        privateMethod();
        LoggerService.log("NewService initialized");
      } catch (error) {
        LoggerService.error("NewService init failed", error);
      }
    },
    publicMethod: () => {
      // Public implementation
    }
  };
})();
```

### Integrating into App

```javascript
const App = (() => {
  const init = async () => {
    // ... existing code ...
    NewService.init();  // Add initialization
    // ... rest of code ...
  };
})();
```

---

## Testing Services

### Manual Testing

```javascript
// Test LoggerService
window.SDG9.LoggerService.log("Test");

// Test DataService
window.SDG9.DataService.loadData().then(d => {
  console.log("Data loaded:", d);
});

// Test NavigationService
const link = document.querySelector('a[href="#about"]');
link.click();
```

### Unit Test Example (Jest)

```javascript
describe("LoggerService", () => {
  it("logs messages in dev mode", () => {
    const spy = jest.spyOn(console, "log");
    LoggerService.log("Test");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
```

---

## Type Definitions (TypeScript Reference)

```typescript
interface LoggerService {
  log(message: string, data?: any): void;
  error(message: string, error?: any): void;
  warn(message: string, data?: any): void;
}

interface DataService {
  loadData(): Promise<ContentData | null>;
}

interface AnimationService {
  fadeInOnScroll(): IntersectionObserver;
  animateProgressBars(): IntersectionObserver;
}

interface NavigationService {
  init(): void;
}

interface UIAnimationService {
  init(): void;
}

interface App {
  init(): Promise<void>;
}
```

---

## Migration Guide

### From Old Architecture

**Before:**
```javascript
// Monolithic code
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) { /* ... */ });
});
```

**After:**
```javascript
// Service-based
NavigationService.init();
```

---

## Troubleshooting

### Issue: Services not initializing

**Solution:** Check console for errors
```javascript
window.SDG9.LoggerService.log("Test");
```

### Issue: Animations not working

**Solution:** Verify AnimationService initialized
```javascript
// Check if service exists
console.log(window.SDG9);
```

### Issue: Data not loading

**Solution:** Check network tab for data.json request
```javascript
window.SDG9.DataService.loadData().then(d => {
  console.log("Data:", d);
});
```

---

## Best Practices

1. **Always use LoggerService** for debugging
2. **Catch errors** at service boundaries
3. **Use public APIs only** (avoid accessing private state)
4. **Initialize in order** (App.init() handles this)
5. **Follow error patterns** for new services
6. **Document changes** in ARCHITECTURE.md

---

**Last Updated**: April 2024  
**API Version**: 2.0
