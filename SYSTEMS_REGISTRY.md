# AiPhlo Systems Registry
## Product Functions, Protocols & Wins

---

## PRODUCT OVERVIEW

**AiPhlo** - Squarespace to Webflow migration automation product

### Three-Phase Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Universal responsive template for general site transfer | In Progress |
| **Phase 2** | Migration + redesign capability | In Progress |
| **Phase 3** | Consumer Control Center - guided plain language interface | Planned |

---

## CORE PROTOCOLS (Documentation)

| Protocol | File | Purpose |
|----------|------|---------|
| Extraction | `EXTRACTION_PROTOCOL.md` | How to extract content, assets, structure from source site |
| Build Order | `BUILD_ORDER_PROTOCOL.md` | Color Q&A system, page build sequence, lessons learned |
| Site Architecture | `SITE_ARCHITECTURE.md` | Component hierarchy, site-wide vs page-specific |
| Screenshot Overlay | `SCREENSHOT_OVERLAY_PROTOCOL.md` | Visual QA verification when data extraction insufficient |
| Migration Plan | `MIGRATION_PLAN.md` | Overall migration strategy |
| Migration Protocols | `MIGRATION_PROTOCOLS.md` | Step-by-step migration procedures |

---

## CORE OPERATING RULES

### Rule 1: No Assumptions
**NEVER guess or assume. ASK when uncertain.**

### Rule 2: Nav vs Content Distinction
Determined by **testing actions**, not visual appearance:
- **Navigation**: Triggers page changes, opens menus, scrolls to sections
- **Content/Design Block**: Static display, may link somewhere but primary purpose is visual

### Rule 3: Site-Wide vs Page-Specific
- **Site-wide**: Appears on EVERY page (nav, footer, footer header)
- **Page-specific**: Unique to one page, scoped with page wrapper class

### Rule 4: Document Everything
All decisions, fixes, and learnings go into protocols for future migrations.

### Rule 5: Visual Verification Required
Never mark component "complete" without screenshot overlay verification.

---

## SYSTEM FUNCTIONS

### Content Delivery
| Function | Location | Purpose |
|----------|----------|---------|
| JSON Content API | `/api/content/*.json` | Page content as structured JSON blocks |
| Asset Storage | `/assets/images/` | Extracted images from source site |
| Dynamic Rendering | `aiphlo-unified.js` | Renders JSON content into HTML |

### Template System
| Function | Location | Purpose |
|----------|----------|---------|
| Base Template | `template/accurate.html` | Site-wide shell (nav, footer, content areas) |
| Global Styles | `template/accurate.css` | Site-wide styling (nav, footer, base) |
| Page Styles | `template/pages.css` | Page-specific scoped styles |
| JS Controller | `template/aiphlo-unified.js` | SPA routing, page rendering, interactions |

### Routing
| Route | Content | Status |
|-------|---------|--------|
| `/home` | Home page with Tenebre section | Built |
| `/projects` | Project showcase | Built |
| `/photography` | Photo galleries | Built |
| `/socialmedia` | Social media campaigns | Built |
| `/faqs` | FAQ accordion | Built |
| `/contact` | Resume/CV page | Built |
| `/aiphlo` | AiPhlo product page (navigation systems) | Built |

---

## WINS LOG

### Architectural Wins
- [x] **JSON-driven content system** - Separates content from presentation
- [x] **SPA routing without framework** - Vanilla JS page switching
- [x] **CSS scoping pattern** - Prevents style conflicts between pages
- [x] **Site-wide vs page-specific separation** - Clear component hierarchy

### Extraction Wins
- [x] **Sitemap-first discovery** - Finds all pages before crawling
- [x] **Computed style extraction** - Gets actual rendered CSS values
- [x] **Asset download automation** - Saves all images with organized naming

### QA Wins
- [x] **Screenshot overlay protocol** - Visual verification method
- [x] **Color confirmation Q&A** - User validates colors before build
- [x] **Lessons learned log** - Documents mistakes to prevent repeating
- [x] **Automated screenshot capture** - `scripts/capture-footer-comparison.js` captures both sites for comparison
- [x] **TOP/MID/BOTTOM naming convention** - Prevents confusion between header nav and footer elements

### Tooling Wins
- [x] **capture-footer-comparison.js** - Puppeteer script for automated footer screenshot capture
- [x] **capture-page-comparison.js** - Generic page comparison script for any route
  ```bash
  # Usage: node capture-page-comparison.js /route pagename
  node capture-page-comparison.js /aiphlo aiphlo
  node capture-page-comparison.js /contact contact
  ```

---

## LESSONS LEARNED (Summary)

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| Color bleed between pages | Used `replace_all` for page-specific colors | Always use page-scoped CSS selectors |
| Layout too wide | Applied max-width to wrapper, not children | Use `.page > *` selector pattern |
| Footer overlay removed | Assumed instead of asking | Never assume - ASK user |
| Component misidentified | Confused nav vs content by appearance | Test actions to determine function |
| Screenshot TOP/BOTTOM confusion | Analyzed header screenshots as footer | Use naming convention with position (TOP/MID/BOTTOM) |

---

## CONSUMER CONTROL CENTER (Phase 3)

### Concept
Guided interface where consumers give plain language directions to fix/customize their migrated sites.

### Example Interaction Flow
```
Consumer: "The footer icon is too small"
System: "How much larger would you like it?"
Consumer: "About 20% bigger"
System: [Applies change] "Here's the result. Is this correct?"
Consumer: "Yes, that's perfect"
System: [Saves change, updates CSS]
```

### Planned Features
- [ ] Plain language design direction input
- [ ] Visual comparison preview
- [ ] Drag-and-drop element positioning
- [ ] Color picker with brand palette suggestions
- [ ] One-click revert capability

---

## FILE STRUCTURE

```
aiphlo_webflow/
├── api/
│   └── content/           # JSON content files
│       ├── home.json
│       ├── projects.json
│       ├── photography.json
│       ├── socialmedia.json
│       ├── faqs.json
│       └── contact.json
├── assets/
│   └── images/            # Extracted site images
├── template/
│   ├── accurate.html      # Base template
│   ├── accurate.css       # Site-wide styles
│   ├── pages.css          # Page-specific styles
│   └── aiphlo-unified.js  # JS controller
├── screenshots/           # QA comparison images
├── backups/               # Source backups
│
├── EXTRACTION_PROTOCOL.md
├── BUILD_ORDER_PROTOCOL.md
├── SITE_ARCHITECTURE.md
├── SCREENSHOT_OVERLAY_PROTOCOL.md
├── MIGRATION_PLAN.md
├── MIGRATION_PROTOCOLS.md
└── SYSTEMS_REGISTRY.md    # This file
```

---

## QUICK LINKS

- **Start extraction**: Follow `EXTRACTION_PROTOCOL.md`
- **Build pages**: Follow `BUILD_ORDER_PROTOCOL.md`
- **Verify visually**: Follow `SCREENSHOT_OVERLAY_PROTOCOL.md`
- **Understand structure**: Read `SITE_ARCHITECTURE.md`

---

*Registry Created: February 4, 2026*
*For: AiPhlo Migration System*
*Maintained by: Development team + Claude assistant*

**Update this document when:**
- New protocol created
- New system function added
- New win achieved
- New lesson learned
