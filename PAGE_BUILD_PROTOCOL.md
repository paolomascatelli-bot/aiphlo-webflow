# PAGE BUILD PROTOCOL

**CRITICAL**: Execute this checklist for EVERY page build. No exceptions.

---

## Pre-Flight Checklist (BEFORE building)

### 1. BACKGROUND FIRST
- [ ] What is the page background? (color / image / video)
- [ ] Extract exact value: `#000000`, `#ffffff`, gradient, image URL
- [ ] Document in JSON: `"background": { "type": "color", "value": "#000000" }`

### 2. SECONDARY NAV
- [ ] What navigation exists on this page?
- [ ] Pills / Thumbnails / Cards / Tabs?
- [ ] Floating or inline?
- [ ] Sticky behavior?
- [ ] What does it control? (galleries, sections, anchors)

### 3. CONTENT ACCURACY
- [ ] Extract EXACT copy from original
- [ ] Project/campaign names - verbatim
- [ ] Descriptions - verbatim
- [ ] Do NOT paraphrase or generate text

### 4. ASSET SIZING
- [ ] Thumbnail dimensions from original
- [ ] Icon sizes from original
- [ ] Image aspect ratios

---

## Page Template Checklist

| Check | Question | Action |
|-------|----------|--------|
| BG | Background color/image? | Set in CSS + JSON |
| NAV | Secondary nav type? | Choose correct component |
| COPY | All text extracted? | Use exact original text |
| SIZE | Asset dimensions? | Match original sizes |
| LAYOUT | Grid/list/showcase? | Match original structure |

---

## Current Page Status (Audit Date: 2026-02-04)

### Home
- [x] Background: `#000000` (sections)
- [x] Hero: Sunset header image (`home_5_amandaedit.png`)
- [x] Nav: TENEBRE gallery pills
- [x] Layout: Hero + slideshow + category galleries
- [ ] **AUDIT**: Original shows "THIS SPACE IS COMING" text

### Photography
- [x] Background: `#000000`
- [x] Nav: Pill-based gallery nav (floating)
- [x] Layout: Grid galleries per category
- [ ] **AUDIT**: Missing 60 images vs original (71 vs 131)

### Social Media
- [x] Background: `#ffffff` (full-width)
- [x] Nav: Campaign cards (floating sticky)
- [x] Layout: Phone mockups / horizontal slideshow
- [ ] **AUDIT**: Missing 8 images vs original

### Projects
- [x] Background: `#000000`
- [x] Nav: Thumbnail anchors (44px icons)
- [x] Layout: Project sections with toggle
- [x] Copy: Accurate from original
- [ ] **AUDIT**: Missing 12 images vs original

### FAQs
- [x] Background: `#000000`
- [x] Layout: Accordion with expand/collapse
- [x] Copy: Accurate from original (3 questions)
- [x] **STATUS**: COMPLETE

### Contact
- [x] Background: `#000000`
- [x] Layout: Hero + newsletter + locations
- [x] Copy: Accurate email (paolomascatelli@gmail.com)
- [x] **STATUS**: COMPLETE

### Footer (All Pages)
- [x] Background image (footer4.png)
- [x] Scalloped wave divider
- [x] White section with 3-column grid
- [x] Newsletter, locations, colorful logo
- [x] **STATUS**: COMPLETE

---

## Automated Audit Script

Run comprehensive audit to check all pages:
```bash
node scripts/comprehensive-page-audit.cjs
```

Output: `screenshots/audit/audit-report.json`

---

## Execution Rule

**Before writing ANY page code:**

1. Fetch original page
2. Run audit: `node scripts/comprehensive-page-audit.cjs`
3. Screenshot it
4. Fill out checklist above
5. THEN build

This is mandatory. Skipping steps = repeated mistakes.
