# AiPhlo Phase 2 Brief for Kimi

## Project Context
Building **AiPhlo** - a licensable automation infrastructure for Squarespace → Webflow website migration. The goal is a universal solution that works for ANY Squarespace site, not custom per-site scripts.

---

## WHAT WE DID SINCE YOUR LAST BRIEF

### Applied Your CSS Extraction Approach
Following your recommendation, we implemented stylesheet extraction instead of `getComputedStyle()`:

**Script**: `scripts/extract-stylesheets.js`
- Intercepts CSS files via Puppeteer response events
- Extracts inline styles from `<style>` tags
- Filters to Paolo's custom selectors (pm-*, tenebre-*, gallery-*, etc.)

**Result**: `template/extracted-from-squarespace.css` (27KB)
- 152 relevant CSS rules
- 14 hover states captured
- 10 active states captured
- 5 pseudo-elements
- Full transitions and animations

**This solved the 70% CSS gap.** We now have hover rules like:
```css
#pm-nav-trigger:hover img {
  transform: scale(1.12);
  filter: brightness(0);
}
```

### Built Multi-Page SPA System

**New File**: `template/aiphlo-client.js` (~585 lines)

Core functionality:
1. **SPA Router** - Uses `history.pushState()` for page transitions
2. **API Integration** - Fetches from `POST /v1/populate`
3. **Section Renderers** - Functions for each block type:
   - `renderHero()` - Hero sections with headline, subhead, body, CTA
   - `renderProjects()` - Grid of project cards with images
   - `renderGallery()` - Filterable gallery with category tabs
   - `renderFAQs()` - Accordion-style FAQ list
   - `renderContact()` - Contact info with email, locations, social
   - `renderTenebre()` - Special handler for home page Tenebre section

4. **Page Switching Logic**:
   ```javascript
   function renderPage(content, isHomePage) {
     if (isHomePage) {
       // Show #home-content (Tenebre static HTML)
       // Hide #page-content
     } else {
       // Hide #home-content
       // Render API blocks into #page-content
     }
   }
   ```

5. **Nav Link Interception** - Clicks on nav links load pages without full refresh

### Updated Server for SPA Routes

**Modified**: `api/server.js`
- Added catch-all routes for all pages: `/, /home, /projects, /photography, /socialmedia, /faqs, /contact`
- All routes serve `accurate.html` (SPA pattern)
- Added no-cache headers to prevent stale HTML

### Updated Template Structure

**Modified**: `template/accurate.html`
- Added `<div id="page-content"></div>` for dynamic content
- Added `id="home-content"` to Tenebre section
- Changed CSS/JS paths to absolute (`/template/accurate.css`)
- Added cache-busting query strings (`?v=2`)
- Added critical inline fallback CSS

### Created Page Styles

**New File**: `template/pages.css` (~376 lines)
- Styles for Hero sections (`.page-hero`, `.hero-headline`, etc.)
- Styles for Projects grid (`.projects-section`, `.project-card`, etc.)
- Styles for Gallery (`.gallery-section`, `.gallery-tabs`, etc.)
- Styles for FAQs (`.faqs-section`, `.faq-item`, `.faq-question`, etc.)
- Styles for Contact (`.contact-section`, `.contact-grid`, etc.)
- Responsive breakpoints

---

## WHAT'S WORKING

| Feature | Status | Notes |
|---------|--------|-------|
| CSS Stylesheet Extraction | ✅ WORKING | Captures hover, transitions, animations |
| API Content Structure | ✅ WORKING | All 6 JSON files with proper blocks |
| Server SPA Routes | ✅ WORKING | All pages serve accurate.html |
| Nav Dropdown | ✅ WORKING | Opens on hover/click |
| Page Switching | ✅ PARTIAL | Pages render but content not correct |

---

## WHAT BROKE (Current State)

### 1. Homepage Tenebre Features REGRESSED

The Tenebre section that was fully working is now broken:
- Toggle switch (ON/OFF) may not animate
- Slideshow may not expand
- Gallery nav buttons may not activate
- Tenebre gallery sections may not appear

**Why**: The `aiphlo-client.js` is interfering with `accurate.js`:
- Both scripts try to initialize the same elements
- The SPA router may be re-rendering content unexpectedly
- Race conditions between the two scripts

### 2. Non-Home Pages Rendering Incorrectly

Going to `/projects`, `/photography`, etc. shows "some gallery" but:
- Wrong content (seeing Tenebre galleries instead of page-specific content)
- Styling incorrect
- Layout broken

**Why**: The `renderPage()` function may not be correctly:
- Hiding `#home-content`
- Populating `#page-content` with the right blocks
- Or the section renderers are outputting incorrect HTML

### 3. Screenshots from User Show:
- Massive nav icon on white background (CSS not loading)
- Unstyled text
- This indicates browser cache was serving old HTML before path fixes

---

## THE CONFLICT: Two Script Paradigms

### `accurate.js` (Original)
- Designed for STATIC page
- Directly manipulates DOM elements that exist in HTML
- Handles: nav hover/click, Tenebre toggle, slideshow, gallery nav
- Expects elements to exist on page load

### `aiphlo-client.js` (New)
- Designed for DYNAMIC SPA
- Fetches content from API and renders it
- Tries to re-initialize Tenebre after render
- Expects to control what's visible via show/hide

**Problem**: These two approaches fight each other.

When on home page:
- `aiphlo-client.js` calls `loadPage('/')`
- Fetches home.json but then returns early (uses static HTML)
- `accurate.js` initializes Tenebre elements
- Both work? Or race condition?

When on other pages:
- `aiphlo-client.js` should hide `#home-content`, show `#page-content`
- But if `accurate.js` already ran, it may have attached listeners to now-hidden elements
- Dynamic content rendered but Tenebre stuff bleeding through?

---

## PROPOSED FIX OPTIONS

### Option A: Merge Scripts (Clean but Work)
Combine `accurate.js` and `aiphlo-client.js` into one unified script:
- Single initialization flow
- Clear separation: "is this home page? do X, else do Y"
- No race conditions

### Option B: Script Loading Order (Quick Fix)
- Load `aiphlo-client.js` first, let it set up page state
- Load `accurate.js` second, only for home page
- Use a flag to prevent `accurate.js` from running on non-home pages

### Option C: Static Multi-Page (Abandon SPA)
- Create separate HTML files: `projects.html`, `photography.html`, etc.
- No JavaScript routing
- Simpler, but less "modern" and harder to maintain

### Recommendation: Option A (Merge Scripts)
This is the cleanest long-term solution. One script, one source of truth.

---

## CURRENT FILE STATE

```
template/
├── accurate.html        # Main template (modified for SPA)
├── accurate.css         # Base styles + Tenebre (WORKING)
├── pages.css            # Styles for other pages (NEW, untested)
├── accurate.js          # Original Tenebre interactions
├── aiphlo-client.js     # SPA router + renderers (NEW, conflicts)
└── extracted-from-squarespace.css  # Raw extracted CSS (reference)

api/
├── server.js            # Express server with SPA routes (WORKING)
└── content/
    ├── home.json        # ✅
    ├── projects.json    # ✅
    ├── photography.json # ✅
    ├── socialmedia.json # ✅
    ├── faqs.json        # ✅
    └── contact.json     # ✅

scripts/
├── extract-stylesheets.js    # CSS extractor (WORKING)
├── extract-relevant-css.js   # CSS filter (WORKING)
└── export/
    └── sqsp.json              # Scraped element data
```

---

## WHAT NEEDS TO HAPPEN NEXT

### Immediate (Fix the Regression)
1. Decide: Merge scripts OR separate concerns clearly
2. Fix home page so Tenebre toggle/slideshow/galleries work again
3. Verify non-home pages show their correct content (not Tenebre)

### Then (Complete Multi-Page)
4. Test all 6 pages render correctly
5. Verify navigation works between all pages
6. Ensure styles apply correctly (pages.css)

### Finally (Polish)
7. Match hover states, transitions, animations to original
8. Mobile responsive testing
9. API content can be swapped without code changes

---

## NOTES FOR KIMI

1. **The CSS extraction YOU recommended is working** - that's a win
2. **The SPA approach broke things** - we may have over-engineered
3. **Two scripts fighting** - need to unify or clearly separate
4. **User frustrated** - needs to see forward progress, not regressions
5. **Home page WAS working** - any fix must restore that functionality

The core question: **Do we need SPA routing at all?**

Alternative: Just create 6 separate HTML pages that share the same nav/footer. Simpler, less JS, easier to debug. The API injection can still work with static pages.

---

## CONFIDENCE ASSESSMENT (Updated)

| Component | Confidence | Notes |
|-----------|------------|-------|
| CSS Extraction | 90% | ✅ PROVEN WORKING |
| API Content | 95% | ✅ All JSON files ready |
| Home Page Tenebre | 50% | Was 100%, now regressed |
| Multi-Page Rendering | 30% | Built but not working correctly |
| SPA Router | 40% | Working but causing conflicts |
| Overall System | 45% | Step forward + step back |

---

*Updated: 2026-02-02*
*Status: Regressed - home page features broken, multi-page incomplete*
*Blocker: Script conflict between accurate.js and aiphlo-client.js*
