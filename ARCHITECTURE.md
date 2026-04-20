# SDG 9 Website - Architecture Decision Records (ADRs)

## ADR-001: Module Pattern for JavaScript Organization

**Status:** Accepted  
**Date:** 2024  
**Context:** Initial JavaScript implementation was monolithic with global scope pollution.

### Decision
Implemented Module Pattern (IIFE) for all services to create proper encapsulation and namespace isolation.

### Rationale
- **Encapsulation**: Private variables and functions are not exposed to global scope
- **Maintainability**: Clear service boundaries make code easier to understand and modify
- **Testability**: Modules can be tested independently
- **Scalability**: New services can be added without affecting existing code

### Consequences
- Code is more verbose due to closure patterns
- Better long-term maintainability and reduced debugging complexity
- Easier to implement new features without breaking existing functionality

---

## ADR-002: Data-Driven Architecture with External Configuration

**Status:** Accepted  
**Date:** 2024  
**Context:** Content was hardcoded in HTML, making it difficult to update and maintain.

### Decision
Externalize all content to `data.json` configuration file with a dedicated `DataService` for loading and caching.

### Rationale
- **Separation of Concerns**: Content management separate from presentation
- **Flexibility**: Content can be updated without modifying HTML/CSS/JS
- **Scalability**: Easy to integrate with CMS or API in the future
- **Maintainability**: Single source of truth for all content
- **Testability**: Services can be tested independent of HTML

### Consequences
- Additional HTTP request for data loading (minimal impact)
- Data service includes caching layer to optimize performance
- Future versions can easily swap JSON for API endpoints

---

## ADR-003: Service-Oriented Architecture

**Status:** Accepted  
**Date:** 2024  
**Context:** Multiple responsibilities mixed in single code blocks

### Decision
Implemented distinct services:
- **LoggerService**: Centralized logging
- **DataService**: Content management
- **AnimationService**: Animation orchestration
- **NavigationService**: Navigation functionality
- **UIAnimationService**: UI animation coordination
- **App**: Bootstrap and initialization

### Rationale
- **Single Responsibility**: Each service has one clear purpose
- **Reusability**: Services can be reused and extended
- **Error Handling**: Centralized error management
- **Debuggability**: Services exposed on `window.SDG9` for console debugging
- **Future API Integration**: Easy to add API calls through services

### Consequences
- More file organization needed as app grows
- Clear interfaces between services
- Easy to mock services for testing

---

## ADR-004: Intersection Observer for Performance

**Status:** Accepted  
**Date:** 2024  
**Context:** Scroll event listeners were inefficient and caused jank

### Decision
Use Intersection Observer API for all scroll-based animations and visibility detection.

### Rationale
- **Performance**: Offloads work to browser's optimized native implementation
- **Accessibility**: Better support for users with different abilities
- **Battery Life**: Mobile devices use less battery with native Observer
- **Frame Rate**: Eliminates janky scroll event handlers

### Consequences
- Not supported in older browsers (fallback can be added)
- Clean, declarative animation triggers
- Better overall user experience

---

## ADR-005: Error Handling & Graceful Degradation

**Status:** Accepted  
**Date:** 2024  
**Context:** Missing data or initialization errors could break the page

### Decision
Implement try-catch blocks and fallback mechanisms throughout services.

### Rationale
- **Resilience**: Page continues to function even if data fails to load
- **User Experience**: Users see functional website even with partial content
- **Debugging**: Detailed error messages for developers
- **Production Stability**: Prevents cascading failures

### Consequences
- Requires testing of error paths
- Error messages aid in debugging
- Data service includes caching as fallback

---

## ADR-006: CSS Custom Properties (CSS Variables)

**Status:** Accepted  
**Date:** 2024  
**Context:** Hard-coded color values scattered throughout styles

### Decision
Centralized all colors, spacing, and sizing as CSS custom properties (variables).

### Rationale
- **Maintainability**: Single place to update design tokens
- **Theming**: Easy to implement dark mode or multiple themes
- **Consistency**: Enforces design system compliance
- **Developer Experience**: Self-documenting through clear variable names

### Consequences
- requires CSS3 support (not IE11, but supported in all modern browsers)
- enables rapid theme changes
- facilitates design system implementation

---

## ADR-007: Responsive Design with Mobile-First Approach

**Status:** Accepted  
**Date:** 2024  
**Context:** Need to support diverse devices and screen sizes

### Decision
Implement mobile-first responsive design with media queries for tablet and desktop.

### Rationale
- **User Base**: ~60% of traffic on mobile devices
- **Performance**: Mobile-first CSS is lighter
- **Progressive Enhancement**: Basic experience on all devices, enhanced on larger screens
- **Maintainability**: Easier to extend than desktop-first approach

### Consequences
- Content reorganizes for different screen sizes
- Touch-friendly interface on all devices
- Tested on multiple breakpoints

---

## ADR-008: Accessibility & Semantic HTML

**Status:** Accepted  
**Date:** 2024  
**Context:** Initial version lacked accessibility features

### Decision
Use semantic HTML5 elements and ARIA labels where appropriate.

### Rationale
- **Inclusivity**: Users with disabilities can access content
- **SEO**: Search engines better understand semantic markup
- **Maintenance**: Clearer intent in HTML structure
- **Standards**: Compliance with WCAG guidelines

### Consequences
- Better browser support for assistive technologies
- Improves search engine indexing
- Makes content more maintainable

---

## ADR-009: No External Dependencies

**Status:** Accepted  
**Date:** 2024  
**Context:** Keep website lightweight and simple

### Decision
Build using vanilla HTML, CSS, and JavaScript without frameworks or libraries.

### Rationale
- **Performance**: No overhead from frameworks
- **Maintainability**: Direct control over implementation
- **Learning**: Educational value in understanding core web technologies
- **Deployment**: Single directory, no build process needed

### Consequences
- More boilerplate code than frameworks
- All features built from scratch
- Educational value for developers
- Perfect for static hosting

---

## ADR-010: Progressive Enhancement & Graceful Fallbacks

**Status:** Accepted  
**Date:** 2024  
**Context:** Some users might have JavaScript disabled or old browsers

### Decision
Core content and navigation work without JavaScript; animations and advanced features enhance.

### Rationale
- **Resilience**: Site functional in all conditions
- **Accessibility**: Screen readers can access all content
- **Performance**: Fast initial page load
- **SEO**: All content crawlable without JavaScript

### Consequences
- Content duplicated (static + JS-enhanced)
- Layered feature implementation
- Better overall user experience

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface (HTML)               │
├─────────────────────────────────────────────────────────┤
│                   Styling Layer (CSS)                  │
├─────────────────────────────────────────────────────────┤
│                Application Layer (App)                 │
├──────────────────────┬──────────────────────────────────┤
│  Navigation Service  │    UI Animation Service         │
├──────────────────────┼──────────────────────────────────┤
│  Data Service        │    Animation Service            │
├──────────────────────┼──────────────────────────────────┤
│  Logger Service      │    (Core Utilities)             │
└──────────────────────┴──────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────┐
│            External Resources (data.json)              │
└─────────────────────────────────────────────────────────┘
```

---

## Future Architectural Improvements

### Phase 2: Component System
- Build reusable UI components with template pattern
- Implement shadow DOM for style encapsulation
- Create component registry

### Phase 3: State Management
- Implement observable/reactive state
- Add state change middleware
- Enable time-travel debugging

### Phase 4: API Integration
- Create API service layer
- Implement caching strategies
- Add real-time data fetching

### Phase 5: Testing Architecture
- Unit tests for each service
- Integration tests for workflows
- E2E tests for user journeys

### Phase 6: Internationalization
- Extract strings to i18n keys
- Support multiple languages
- Date/number localization

---

## Deployment Architecture

### Current
- Static file serving (index.html, styles.css, script.js, data.json)
- CDN-friendly, cacheable assets
- No server-side dependencies

### Future Options
- Serverless static hosting (Netlify, Vercel)
- GitHub Pages deployment
- AWS S3 + CloudFront
- Docker containerization for enterprise

---

## Performance Metrics

- **Lighthouse Score Target**: 95+
- **First Contentful Paint**: < 1.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 2s
- **Bundle Size**: < 100KB

---

## Security Considerations

- ✅ No external script dependencies (XSS protection)
- ✅ Content Security Policy ready
- ✅ Semantic HTML prevents injection
- ✅ Data.json served with proper MIME type
- ⚠️ Future: Add integrity checks for CDN assets

---

## Conclusion

This architecture prioritizes:
1. **Performance** - Fast loading, smooth interactions
2. **Maintainability** - Clear code organization
3. **Scalability** - Easy to extend features
4. **Accessibility** - Inclusive design
5. **Resilience** - Graceful error handling

The decision to avoid frameworks and use vanilla web technologies makes this an excellent educational resource while maintaining production-quality code standards.
