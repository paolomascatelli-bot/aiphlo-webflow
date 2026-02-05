# AIPHLO BUILD DIAGNOSTIC REPORT
**Date:** February 2, 2026
**Purpose:** Troubleshooting analysis for Kimi review
**Project Goal:** Licensable Squarespace → Webflow migration automation

---

## EXECUTIVE SUMMARY

The build is currently **non-functional**. The template shows a blank/broken page despite having:
- 315 successfully downloaded images
- Complete original CSS and JS
- Extracted content in JSON format
- Working API server infrastructure

**Root cause:** Architectural mismatch between two competing approaches that were never reconciled.

---

## WHAT WE STARTED WITH

### Source Materials (All Present and Valid)
```
/webflow-code/
├── HEAD-CSS.css          ✓ Original site CSS (working)
├── FOOTER-JS.js          ✓ Original site JS (working)
└── embeds/
    ├── SITEWIDE-NAV.html      ✓ Exact nav HTML
    ├── TENEBRE-HEADER.html    ✓ Exact toggle/slideshow HTML
    ├── TENEBRE-GALLERY-NAV.html ✓ Exact gallery nav HTML
    ├── PHOTOGRAPHY-NAV.html   ✓ Exact photo nav HTML
    ├── SOCIAL-MEDIA-NAV.html  ✓ Exact social nav HTML
    └── PROJECTS-NAV.html      ✓ Exact projects nav HTML

/assets/
├── images/               ✓ 315 downloaded images (all valid)
├── image-metadata.json   ✓ URL → local path mapping
└── content/
    ├── site-content.json     ✓ Extracted page content
    └── gallery-structure.json ✓ Gallery mappings
```

### What These Source Files Contain

**Embeds** use hardcoded Squarespace URLs:
```html
<!-- From SITEWIDE-NAV.html -->
<img src="https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/6917fe50c0cd4c2bb2ae0a19/1763180112897/Aiphloweb1nlk_red.png">
```

**Image metadata** maps those URLs to local files:
```json
{
  "src": "https://static1.squarespace.com/static/559bdae3e4b00228d055250c/...",
  "localPath": "/Users/.../assets/images/home_0_Aiphloweb1nlk_red.png"
}
```

---

## TWO COMPETING ARCHITECTURES

### Approach A: Static HTML (Current Attempt)
**What it is:** Copy embeds directly into HTML files, serve with simple Python server

**Files created:**
- `/template/index.html` - Home page
- `/template/pages/projects.html`
- `/template/pages/photography.html`
- `/template/pages/socialmedia.html`
- `/template/pages/faqs.html`
- `/template/pages/contact.html`
- `/template/styles.css` - Copy of HEAD-CSS.css
- `/template/interactions.js` - Copy of FOOTER-JS.js

**Server:** `python -m http.server 8080`

**Why it failed:**
1. Images use Squarespace URLs → return 404
2. No URL rewriting to use local images
3. Server can't serve `/assets/` folder (different directory)

### Approach B: API-Driven (Partially Built)
**What it is:** Template calls API, API returns content with local image paths

**Files created:**
```
/api/
├── server.js             ✓ Express server (working)
├── content/
│   ├── home.json         ✓ Content with localhost URLs
│   ├── projects.json     ✓
│   ├── photography.json  ✓
│   └── etc...
```

**API content uses localhost URLs:**
```json
{
  "logo": "http://localhost:3001/assets/images/home_6_TENEBRE-WHITE.png",
  "slideshow": [
    "http://localhost:3001/assets/images/home_104_DU9A0533-2.jpg",
    ...
  ]
}
```

**Why it failed:**
1. Template (Approach A) doesn't call the API
2. Template HTML has hardcoded Squarespace URLs
3. The two systems were never connected

---

## THE SPECIFIC FAILURE CHAIN

```
User loads http://localhost:8080/
    ↓
Python serves /template/index.html
    ↓
HTML contains: <img src="https://static1.squarespace.com/...">
    ↓
Browser requests Squarespace URL → 404 NOT FOUND
    ↓
No images load
    ↓
JS interactions can't find images → errors
    ↓
Page appears blank/broken
```

**Meanwhile, unused:**
- API server at localhost:3001 (running but not called)
- Local images at /assets/images/ (present but not served)
- Image metadata mapping (exists but not used)

---

## WHY THE "LAST VERSION" WORKED BETTER

The earlier version likely had one of these:
1. A working symlink from `/template/assets` → `/assets`
2. Images served from the same origin
3. Or was using actual Squarespace URLs when they still worked

---

## WHAT NEEDS TO BE FIXED

### Option 1: Fix Static Approach (Simpler)
```
1. Symlink: /template/assets → /assets
2. Search/replace all Squarespace URLs in HTML with relative paths:
   src="https://static1.squarespace.com/.../Aiphloweb1nlk_red.png"
   → src="assets/images/home_0_Aiphloweb1nlk_red.png"
3. Same for JS slideshow array
```

### Option 2: Connect API Approach (More Robust)
```
1. Add fetch logic to template HTML/JS
2. On page load, call API: POST /v1/populate
3. API returns content with localhost:3001/assets/... URLs
4. JS populates DOM with returned content
```

### Option 3: Single Server Serving Both (Best)
```
1. Use Express server that serves:
   - /           → template HTML files
   - /assets/    → image files
2. All URLs become relative (/assets/images/...)
3. No CORS issues, no port confusion
```

---

## IS THIS HUMAN ERROR OR TECH PROBLEM?

### Human Error Component
- **Unclear initial direction:** "Use exact embeds" vs "Build API system" were mixed
- **Session fragmentation:** Multiple restarts lost context of what was working
- **Prompt interpretation:** "Clean rebuild" was interpreted as "start fresh" rather than "fix what exists"

### Technical Problem Component
- **Squarespace URL expiration:** Original image URLs now return 404
- **CORS/Origin issues:** API on :3001 can't easily serve images to template on :8080
- **No automated URL rewriting:** Manual replacement needed for 100+ image references

### Missing Step
**URL Transformation Script** was never created:
```javascript
// This script should exist but doesn't:
// 1. Read image-metadata.json
// 2. For each entry, replace src URL with localPath
// 3. Update all HTML files
// 4. Update all JS files with hardcoded URLs
```

---

## INVENTORY OF WORKING COMPONENTS

| Component | Status | Notes |
|-----------|--------|-------|
| Image download | ✓ Working | 315 images in /assets/images/ |
| Image metadata | ✓ Working | URL → local path mapping exists |
| Original CSS | ✓ Working | Exact copy from Squarespace |
| Original JS | ✓ Working | Exact copy from Squarespace |
| HTML embeds | ✓ Working | Exact structure from Squarespace |
| API server | ✓ Running | localhost:3001 responds |
| API content | ✓ Working | JSON files with local URLs |
| Template server | ✓ Running | localhost:8080 serves HTML |
| URL rewriting | ✗ MISSING | Never implemented |
| API ↔ Template connection | ✗ MISSING | Never wired up |

---

## RECOMMENDED FIX SEQUENCE

### Immediate Fix (5 steps)
1. Stop Python server
2. Create symlink: `ln -s ../assets /template/assets`
3. Write script to replace all Squarespace URLs in HTML/JS with `assets/images/...` paths
4. Restart server
5. Test

### Script That Should Exist
```javascript
// scripts/rewrite-urls.js
const fs = require('fs');
const path = require('path');

// Load mapping
const metadata = JSON.parse(fs.readFileSync('../assets/image-metadata.json'));

// Build URL → local path map
const urlMap = {};
metadata.forEach(img => {
  const filename = path.basename(img.localPath);
  urlMap[img.src] = `assets/images/${filename}`;
});

// Find all HTML and JS files in /template
// Replace each Squarespace URL with local path
// Save files
```

---

## QUESTIONS FOR KIMI

1. **Architecture choice:** Should we commit to static HTML or API-driven? Mixing both created confusion.

2. **URL handling:** What's the cleanest way to map 315 Squarespace URLs to local paths? Build-time replacement vs runtime rewriting?

3. **Server setup:** Single Express server serving both HTML and assets, or keep them separate?

4. **Session continuity:** How to prevent context loss across conversation restarts? The working version got lost.

5. **Testing protocol:** What verification steps should run after each change to catch breakage early?

---

## FILE STRUCTURE REFERENCE

```
/Users/pauldaggett/projects/aiphlo_webflow/
├── api/
│   ├── server.js              # Express API (port 3001)
│   └── content/*.json         # Page content with localhost URLs
├── assets/
│   ├── images/                # 315 downloaded images
│   ├── image-metadata.json    # URL → local path mapping
│   └── content/               # Extracted site content
├── webflow-code/
│   ├── HEAD-CSS.css           # Original CSS
│   ├── FOOTER-JS.js           # Original JS
│   └── embeds/*.html          # Original HTML components
├── template/
│   ├── index.html             # Home page (broken - uses Squarespace URLs)
│   ├── pages/*.html           # Other pages (broken - same reason)
│   ├── styles.css             # CSS (working)
│   └── interactions.js        # JS (broken - hardcoded URLs)
└── scripts/
    ├── extract-all.js         # Content extraction
    ├── scrape-images.js       # Image download
    └── (missing: rewrite-urls.js)
```

---

## CONCLUSION

The build failed because two architectures (static HTML vs API-driven) were partially implemented without being connected. The immediate blocker is simple: **images use dead Squarespace URLs instead of local paths**.

The fix is straightforward but was never executed:
1. Serve local images
2. Replace all Squarespace URLs with local paths

This is primarily an **architectural clarity issue** compounded by **session context loss**. The individual components (images, CSS, JS, embeds, API) are all present and valid. They just need to be wired together correctly.
