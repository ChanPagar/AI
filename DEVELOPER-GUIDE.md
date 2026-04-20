# SDG 9 Website - Developer Guide

A comprehensive guide for developers extending and maintaining the SDG 9 website.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Architecture Overview](#architecture-overview)
5. [Adding Features](#adding-features)
6. [Debugging](#debugging)
7. [Performance Tips](#performance-tips)
8. [Deployment](#deployment)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Code editor (VS Code, Sublime Text, etc.)
- Basic knowledge of HTML, CSS, JavaScript

### Local Development Setup

```bash
# 1. Clone or download the project
git clone <repository-url>
cd sdg9-website

# 2. Open in browser
open index.html

# 3. For live reload development:
# Option A: Use Python's built-in server
python -m http.server 8000

# Option B: Use Node.js http-server
npx http-server

# 4. Visit http://localhost:8000
```

### First Time Users

1. Open `index.html` in a browser
2. Open browser DevTools (F12)
3. Go to Console tab
4. Type `window.SDG9` to see available services
5. Try: `window.SDG9.LoggerService.log("Hello World")`

---

## Project Structure

```
sdg9-website/
├── index.html              # Main HTML (semantic, accessible)
├── styles.css              # Styling (CSS variables, responsive)
├── script.js               # Application (modular services)
├── data.json               # Content configuration (data-driven)
├── README.md               # Project overview
├── ARCHITECTURE.md         # Architecture Decision Records
├── SERVICE-API.md          # Service API reference
└── DEVELOPER-GUIDE.md      # This file
```

### File Responsibilities

| File | Responsibility | Maintainer Notes |
|------|---|---|
| `index.html` | Semantic structure, accessibility | Update with your content |
| `styles.css` | Visual design, responsive layout | Edit CSS variables for theming |
| `script.js` | Application logic, services | Follow service pattern for changes |
| `data.json` | Content management | Primary file for content updates |
| `ARCHITECTURE.md` | Design decisions, rationale | Update when architectural decisions change |
| `SERVICE-API.md` | Service interfaces, contracts | Update when adding/modifying services |

---

## Development Workflow

### Feature Development Process

```
1. Design
   └─> Document in ARCHITECTURE.md if impactful
   
2. Implementation
   └─> Follow existing service patterns
   └─> Add error handling with LoggerService
   └─> Test in browser console
   
3. Testing
   └─> Manual testing in multiple browsers
   └─> Mobile testing (responsive)
   └─> Accessibility check (keyboard nav)
   
4. Documentation
   └─> Update SERVICE-API.md if adding services
   └─> Update README.md if user-facing
   └─> Add comments to complex code
   
5. Deployment
   └─> Test on staging
   └─> Deploy to production
```

### Git Workflow (if using version control)

```bash
# Create feature branch
git checkout -b feature/add-tracking

# Make changes
# Commit with descriptive messages
git commit -m "feat: add analytics tracking service"

# Push and create pull request
git push origin feature/add-tracking

# After review and merge
git checkout main
git pull
```

---

## Architecture Overview

### Service Architecture Pattern

Each service follows the Module Pattern for encapsulation:

```javascript
const ServiceName = (() => {
  // PRIVATE - only accessible within service
  const privateState = {};
  
  const privateMethod = () => {
    LoggerService.log("Private operation");
  };
  
  // PUBLIC - exported interface
  return {
    publicMethod: () => {
      try {
        privateMethod();
      } catch (error) {
        LoggerService.error("Error in publicMethod", error);
      }
    }
  };
})();
```

### Service Dependencies

```
App (Bootstrap)
  ├─ LoggerService (no dependencies)
  ├─ DataService (uses LoggerService)
  ├─ NavigationService (uses LoggerService)
  ├─ AnimationService (no dependencies)
  └─ UIAnimationService (uses AnimationService)
```

### Data Flow

```
User Action (click, scroll)
  ↓
HTML/Browser Event
  ↓
Service Handler
  ↓
LoggerService (logs action)
  ↓
DOM Update / Animation
  ↓
Browser Render
  ↓
User Sees Result
```

---

## Adding Features

### Adding a New Service

**Example: Add Google Analytics Service**

```javascript
// Step 1: Create the service
const AnalyticsService = (() => {
  const trackEvent = (eventName, eventData) => {
    try {
      if (window.gtag) {
        gtag('event', eventName, eventData);
        LoggerService.log(`Analytics: ${eventName}`, eventData);
      }
    } catch (error) {
      LoggerService.error("Analytics tracking failed", error);
    }
  };

  return {
    trackEvent,
    trackPageView: (pageName) => {
      trackEvent('page_view', { page_path: pageName });
    }
  };
})();

// Step 2: Initialize in App
const App = (() => {
  const init = async () => {
    // ... existing services ...
    AnalyticsService.trackPageView('home');
  };
})();

// Step 3: Update SERVICE-API.md with new service docs
```

### Adding a New Content Section

**Example: Add "Success Stories" Section**

```json
// 1. Update data.json
{
  "successStories": [
    {
      "title": "Infrastructure Project",
      "description": "...",
      "icon": "..."
    }
  ]
}

// 2. Add HTML in index.html
<section id="stories" class="success-stories">
  <div class="container">
    <h2>Success Stories</h2>
    <div class="stories-grid" id="storiesContainer"></div>
  </div>
</section>

// 3. Add CSS in styles.css
.success-stories { /* ... */ }
.stories-grid { /* ... */ }

// 4. Add rendering in script.js
const UIRenderer = (() => {
  return {
    renderStories: (stories) => {
      const container = document.getElementById('storiesContainer');
      stories.forEach(story => {
        const element = document.createElement('div');
        element.className = 'story-card';
        element.innerHTML = `<h3>${story.title}</h3>...`;
        container.appendChild(element);
      });
    }
  };
})();
```

### Adding Styling

**CSS Variable System**

```css
:root {
  /* Colors */
  --primary-color: #DD3426;
  --secondary-color: #FDB913;
  
  /* Spacing */
  --spacing-unit: 8px;
  --spacing-sm: calc(var(--spacing-unit) * 1);
  --spacing-md: calc(var(--spacing-unit) * 2);
  
  /* Typography */
  --font-primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.6;
}
```

**Usage:**
```css
.my-element {
  color: var(--primary-color);
  padding: var(--spacing-md);
  font-family: var(--font-primary);
}
```

---

## Debugging

### Browser Console Commands

```javascript
// View all services
window.SDG9

// Test logging
window.SDG9.LoggerService.log("Test message");
window.SDG9.LoggerService.error("Test error");

// Load and inspect data
window.SDG9.DataService.loadData().then(d => {
  console.table(d);
  console.log("Targets:", d.targets);
});

// Check navigation state
document.querySelectorAll('.nav-links a').forEach(a => {
  console.log(a.textContent, a.classList);
});

// Inspect animations
document.querySelectorAll('.target-card').forEach(c => {
  console.log(c.style.animation);
});
```

### DevTools Debugging

```
1. Open DevTools (F12)
2. Inspect Element to see structure
3. Sources tab to set breakpoints
4. Network tab to see data.json request
5. Console tab to run commands above
6. Performance tab to measure metrics
```

### Common Issues Debug Checklist

```
❑ Check browser console for errors
❑ Verify data.json is loading (Network tab)
❑ Check if services are initialized (window.SDG9)
❑ Verify CSS variables are applied (DevTools Styles)
❑ Check responsive breakpoints (F12 → Toggle device toolbar)
❑ Test keyboard navigation (Tab key)
❑ Test screen reader (VoiceOver, NVDA)
```

---

## Performance Tips

### Optimization Checklist

```
❑ Minimize HTTP requests (data.json loaded once, cached)
❑ Use CSS variables instead of duplicating values
❑ Use Intersection Observer for animations (done ✓)
❑ Lazy load images if added
❑ Minimize JavaScript parsing time
❑ Use CSS Grid/Flexbox (not floats)
❑ Avoid layout thrashing (batch DOM reads/writes)
❑ Use event delegation for many similar listeners
```

### Measuring Performance

```javascript
// Performance timing
performance.mark('feature-start');
// ... do work ...
performance.mark('feature-end');
performance.measure('feature', 'feature-start', 'feature-end');
console.log(performance.getEntriesByName('feature')[0].duration);

// Memory usage
console.memory  // Chrome DevTools

// Lighthouse audit
// DevTools → Lighthouse → Analyze page load
```

### Common Performance Issues

| Issue | Solution |
|-------|----------|
| Slow animations | Use Intersection Observer (done ✓) |
| Large JavaScript | Keep services modular, tree-shake unused |
| Jank on scroll | Use requestAnimationFrame, optimize scroll handlers |
| Layout shift | Use size attributes, avoid dynamic sizing |
| Render blocking CSS | Keep CSS small, inline critical styles |

---

## Deployment

### Pre-Deployment Checklist

```bash
# 1. Test locally
open index.html

# 2. Check browser console for errors
# DevTools → Console tab

# 3. Test on multiple browsers
# Chrome, Firefox, Safari, Edge

# 4. Test responsive design
# DevTools → Toggle device toolbar

# 5. Run Lighthouse audit
# DevTools → Lighthouse → Analyze page load

# 6. Verify all links work
# Click all navigation links

# 7. Check performance metrics
# Lighthouse score should be 95+
```

### Deployment Options

#### GitHub Pages (Free, Easy)

```bash
# Push to gh-pages branch
git subtree push --prefix . origin gh-pages

# Or in repository settings:
# Settings → Pages → Source: main branch /root
```

#### Netlify (Free, Recommended)

```bash
# Option 1: Drag and drop
# 1. Go to app.netlify.com/drop
# 2. Drag folder here
# 3. Done! Site deployed

# Option 2: Git integration
# 1. Connect GitHub repository
# 2. Build command: (leave empty)
# 3. Publish directory: (leave empty)
```

#### Vercel (Free, For React/Next.js)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Traditional Hosting (cPanel, etc.)

```bash
# 1. Zip all files
zip -r sdg9-website.zip .

# 2. Upload via FTP/cPanel
# Connect to hosting
# Upload zip file
# Extract files

# 3. Make sure index.html is in public_html root
```

### Environment-Specific Configuration

```javascript
// Development
const isDev = window.location.hostname === 'localhost';

// Production
const isProd = window.location.hostname.includes('sdg9.org');

// API endpoints
const API_BASE = isDev 
  ? 'http://localhost:3000' 
  : 'https://api.sdg9.org';
```

---

## Common Tasks

### Update Website Content

**Task: Change hero title**

```javascript
// Option 1: Edit data.json
{
  "hero": {
    "title": "New Title"
  }
}

// Option 2: Use dynamic rendering
DataService.loadData().then(data => {
  document.querySelector('.hero h1').textContent = data.hero.title;
});
```

### Update Colors/Theming

**Task: Change primary color to blue**

```css
/* styles.css */
:root {
  --primary-color: #0066CC;  /* Changed from #DD3426 */
}
```

### Add a New Service

**Task: Add Google Analytics**

See "Adding Features" → "Adding a New Service" section above.

### Optimize Images

**Task: Reduce image file size**

```bash
# Using online tool: tinypng.com
# Or command line:
imagemagick convert large.png -resize 50% small.png
```

### Add Dark Mode

```css
/* styles.css */
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #FF6B6B;
    --bg-color: #1e1e1e;
    --text-color: #ffffff;
  }
}
```

---

## Troubleshooting

### "data.json is not loading"

**Causes:**
- File not in same directory as index.html
- CORS issue (local file protocol)
- Invalid JSON syntax

**Solutions:**
```bash
# 1. Check file exists
ls data.json

# 2. Validate JSON
python -m json.tool data.json

# 3. Run local server (required for file:// protocol)
python -m http.server

# 4. Check network tab in DevTools
```

### "Animations not working"

**Causes:**
- JavaScript disabled
- Browser doesn't support Intersection Observer
- Elements not in viewport

**Solutions:**
```javascript
// Check support
console.log('IntersectionObserver' in window);

// Add fallback
if ('IntersectionObserver' in window) {
  AnimationService.fadeInOnScroll();
} else {
  // Fallback animation
  document.querySelectorAll('.target-card').forEach(el => {
    el.style.opacity = '1';
  });
}
```

### "Links not working"

**Causes:**
- Malformed anchor tags
- Section IDs don't match href values
- Smooth scroll handler error

**Solutions:**
```html
<!-- Correct format -->
<a href="#about">About</a>
<section id="about"></section>

<!-- Check with DevTools -->
<!-- Elements tab → Search for section IDs -->
```

### "Performance is slow"

**Diagnosis:**
```javascript
// Measure service initialization
performance.mark('app-start');
App.init();
performance.mark('app-end');
performance.measure('app', 'app-start', 'app-end');
console.log(performance.getEntriesByName('app')[0]);
```

**Optimization:**
- Remove unused CSS/JS
- Compress images
- Use CDN for assets
- Enable gzip compression on server

---

## Best Practices for Developers

### Code Quality

```javascript
// ✅ DO: Use clear variable names
const navigationLinks = document.querySelectorAll('.nav-links a');

// ❌ DON'T: Use cryptic abbreviations
const nl = document.querySelectorAll('.nav-links a');
```

```javascript
// ✅ DO: Add error handling
try {
  await DataService.loadData();
} catch (error) {
  LoggerService.error("Data load failed", error);
}

// ❌ DON'T: Ignore errors
await DataService.loadData();
```

```javascript
// ✅ DO: Document complex logic
/*
 * Implements Intersection Observer for efficient scroll detection.
 * Observes elements and triggers animation once on visibility.
 */
const observer = new IntersectionObserver(callback);

// ❌ DON'T: Leave code unexplained
const observer = new IntersectionObserver(callback);
```

### Accessibility

```html
<!-- ✅ DO: Use semantic HTML -->
<nav role="navigation" aria-label="Main navigation">
  <a href="#about">About</a>
</nav>

<!-- ❌ DON'T: Use divs for everything -->
<div class="navbar">
  <div onclick="navigate('#about')">About</div>
</div>
```

### Testing Changes

```javascript
// Test in console before deploying
window.SDG9.LoggerService.log("Testing");
window.SDG9.DataService.loadData().then(d => {
  console.log("Data OK:", d);
});
```

---

## Resources for Developers

### Learning Resources
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev](https://web.dev/) - Performance & best practices
- [JavaScript.info](https://javascript.info/)
- [Accessibility Guidelines](https://www.w3.org/WAI/)

### Tools
- [VS Code Editor](https://code.visualstudio.com/)
- [Web Developer DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse Audit](https://developers.google.com/web/tools/lighthouse)
- [JSON Validator](https://jsonlint.com/)

### Useful Extensions (VS Code)
- **Prettier** - Code formatting
- **ESLint** - Code quality
- **Live Server** - Local development server
- **Thunder Client** - API testing

---

## Getting Help

### Debug Strategy

1. **Check browser console** for errors
2. **Use DevTools** to inspect elements
3. **Check network tab** for failed requests
4. **Review ARCHITECTURE.md** for design decisions
5. **Check SERVICE-API.md** for service documentation
6. **Search GitHub issues** for similar problems

### Reporting Bugs

Include:
- Description of issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Console error messages

---

## Contributions

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of conduct
- Pull request process
- Style guide
- Commit message conventions

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | April 2024 | Enterprise architecture refactor |
| 1.0 | April 2024 | Initial release |

---

**Last Updated**: April 2024  
**Maintained By**: Architecture Team  
**Status**: Production Ready
