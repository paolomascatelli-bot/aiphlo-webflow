# EXTRACTION PROTOCOL

**AiPhlo Site Migration - Extraction & Backup Procedures**

No fluff. No maybes. Execute or escalate.

---

## PHASE 0: SITEMAP DISCOVERY (MANDATORY)

Before touching navigation, before clicking anything:

```
GET {site-url}/sitemap.xml
```

**If sitemap exists:**
1. Parse all `<loc>` URLs
2. Store as `sitemap_pages[]`
3. Proceed to Phase 1

**If sitemap 404s:**
1. Flag: `SITEMAP_MISSING`
2. Ask consumer: "No sitemap found. Provide list of ALL page URLs including hidden/unlinked pages."
3. Wait for response before proceeding

---

## PHASE 1: NAVIGATION EXTRACTION

Scrape all navigation links from the live site:

```javascript
const navLinks = document.querySelectorAll('nav a, header a, [class*="nav"] a');
```

Store as `nav_pages[]`

---

## PHASE 2: GAP ANALYSIS

Compare sitemap vs navigation:

```
unlinked_pages = sitemap_pages - nav_pages
```

**If unlinked_pages.length > 0:**

Present to consumer:
```
UNLINKED PAGES DETECTED:
- /departmentofcreativity
- /therealdigitalgraffiti
- /aiphlo
- /new-page-2
- /new-page-3

Include these in migration? [Y/N per page]
```

**Consumer response required.** No assumptions. No skipping.

---

## PHASE 2.5: COLOR & BRANDING EXTRACTION (CRITICAL)

**Color hierarchy - DO NOT SKIP:**

### 1. Site-Wide Brand Colors
Extract from CSS/computed styles:
```javascript
// Primary brand colors (nav, footer, global elements)
const brandColors = {
  background: getComputedStyle(document.body).backgroundColor,
  text: getComputedStyle(document.body).color,
  accent: // Extract from nav, buttons, links
};
```

### 2. Page-Specific Colors
**Each page may have unique accent colors.** Do NOT assume one color fits all.

| Page | Common Accent Use |
|------|-------------------|
| Home | May have project-specific colors (e.g., gold for Tenebre) |
| Photography | Gallery nav active states |
| Social Media | Campaign-specific palettes |
| Contact | Unique accent (often cyan/teal for tech-forward look) |
| Projects | Individual project brand colors |

### 3. Consumer Confirmation Script
Before building each page, confirm:
```
PAGE: {page_name}
We detected these colors:
- Background: {color}
- Primary accent: {color}
- Secondary accent: {color}

Confirm these match your design? [Y/N]
If different, provide hex codes.
```

### 4. Color Variables Structure
```css
/* Site-wide */
--brand-bg: #000;
--brand-text: #fff;
--brand-nav-accent: #c02428;

/* Page-specific */
--page-accent-primary: /* varies */
--page-accent-secondary: /* varies */
```

**Rule: Project colors ≠ Brand colors ≠ Page colors**

### 5. CSS Scoping (CRITICAL)
**Always scope page-specific colors to page wrapper classes:**

```css
/* CORRECT: Scoped to page */
.pm-contact-page .pm-action-btn { color: rgb(0, 212, 180); }

/* WRONG: Global scope causes color bleed */
.pm-action-btn { color: rgb(0, 212, 180); }
```

**See BUILD_ORDER_PROTOCOL.md for full color isolation rules.**

---

## PHASE 3: PAGE-BY-PAGE EXTRACTION

For each confirmed page:

### 3.1 Navigate & Wait
```javascript
await page.goto(url, { waitUntil: 'networkidle2' });
await page.waitForTimeout(3000); // Let JS render
```

### 3.2 Extract Content Layers

| Layer | Selector | What We Get |
|-------|----------|-------------|
| Text | `h1, h2, h3, p, span, li` | All copy |
| Images | `img[src]` | Asset URLs |
| Links | `a[href]` | Internal navigation |
| Forms | `form, input, button` | Newsletter, contact |
| Embeds | `iframe, [class*="embed"], [class*="code-block"]` | Custom content |
| Video | `video, [class*="video"]` | Media embeds |

### 3.3 Squarespace-Specific Blocks
```javascript
// Code blocks
document.querySelectorAll('.sqs-block-code, .code-block');

// HTML blocks
document.querySelectorAll('.sqs-block-html');

// Embedded content
document.querySelectorAll('.sqs-block-embed');

// Gallery blocks
document.querySelectorAll('.sqs-gallery-block-grid, .sqs-gallery-block-slideshow');
```

### 3.4 Screenshot
```javascript
await page.screenshot({ path: `screenshots/${pageName}.png`, fullPage: true });
```

### 3.5 Save Extraction
```json
{
  "url": "/contact",
  "title": "Contact | Site Name",
  "extracted_at": "2026-02-04T...",
  "content": { ... },
  "assets": [ ... ],
  "embeds": [ ... ],
  "flags": []
}
```

---

## PHASE 4: ASSET DOWNLOAD

For each unique asset URL:

```
GET {asset-url}
SAVE TO /assets/images/{page}_{index}_{filename}
```

**Track:**
- Total assets expected
- Total assets downloaded
- Failed downloads (retry 3x, then flag)

---

## PHASE 5: TEMPLATE GENERATION

Generate JSON content files:
```
/api/content/{page}.json
```

Generate page renderer if new page type detected.

---

## PHASE 6: VERIFICATION

Side-by-side screenshot comparison:
- Original page
- Our rendered page

**Automated checks:**
- [ ] Image count matches
- [ ] Text content matches
- [ ] Links functional
- [ ] Forms present
- [ ] Embeds rendered

---

## BACKUP PROTOCOL: THE 20% FALLBACK

When extraction fails or misses content:

### Step 1: Identify Gap
Consumer or system flags: "X is missing" or "Y doesn't match"

### Step 2: Classify Gap Type

| Type | Solution |
|------|----------|
| Unlinked page | Get URL from consumer |
| Code block not rendering | Extract raw HTML, embed directly |
| Third-party embed | Get embed code from consumer |
| Dynamic content | Increase wait time, check for API calls |
| Protected content | Get credentials or exported content |
| Custom font | Get font files or fallback |

### Step 3: Manual Extraction
If automated fails:
1. Consumer provides screenshot
2. Consumer provides raw content (copy/paste)
3. We rebuild from description

### Step 4: Iterate
```
Extract → Compare → Adjust → Verify → Repeat
```

Until match achieved or consumer approves deviation.

---

## CONSUMER INTAKE CHECKLIST

**Before starting ANY migration, get answers:**

```
□ Site URL: _______________
□ Sitemap available? [Y/N]
□ Unlinked/hidden pages? [Y/N]
  If yes, list URLs: _______________
□ Password-protected pages? [Y/N]
  If yes, provide credentials: _______________
□ Custom code blocks? [Y/N]
  If yes, which pages: _______________
□ Third-party embeds (forms, calendars, chat)? [Y/N]
  If yes, list services: _______________
□ Custom fonts? [Y/N]
  If yes, provide files or names: _______________
□ Priority pages (must be perfect): _______________
□ Pages OK to skip/simplify: _______________
```

---

## ERROR CODES & RESPONSES

| Code | Meaning | Action |
|------|---------|--------|
| `SITEMAP_MISSING` | No sitemap.xml | Request manual page list |
| `PAGE_404` | Page not found | Verify URL with consumer |
| `ASSET_FAIL` | Image download failed | Retry 3x, then request from consumer |
| `EMBED_EMPTY` | Code block returned nothing | Request raw HTML from consumer |
| `RENDER_MISMATCH` | Our page doesn't match original | Enter iterative fix loop |
| `AUTH_REQUIRED` | Page needs login | Request credentials |

---

## QUALITY GATES

**Cannot ship until:**

1. [ ] All sitemap pages accounted for (extracted or explicitly skipped)
2. [ ] All nav links functional
3. [ ] Asset count within 95% of original
4. [ ] Footer matches original layout
5. [ ] Mobile responsive verified
6. [ ] Consumer sign-off on each page

---

## THE RULE

```
80% automated extraction
20% human-guided refinement
100% consumer satisfaction

If the system misses it, the human catches it.
If the human misses it, the consumer flags it.
Nothing ships broken. Period.
```

---

## SCRIPTS REFERENCE

| Script | Purpose |
|--------|---------|
| `comprehensive-page-audit.cjs` | Full site scan |
| `download-assets.cjs` | Asset collection |
| `extract-page.cjs` | Single page extraction |
| `screenshot-comparison.cjs` | Side-by-side verify |

---

## REVISION LOG

| Date | Change |
|------|--------|
| 2026-02-04 | Initial protocol. Added sitemap-first discovery. |
| 2026-02-04 | Added backup protocol for 20% fallback. |
| 2026-02-04 | Consumer intake checklist finalized. |
| 2026-02-04 | Added CSS scoping rules to Phase 2.5 after color bleed incident. |
| 2026-02-04 | Created BUILD_ORDER_PROTOCOL.md for color Q&A system. |

---

*Built from the trenches. Tested on real migrations. No theoretical BS.*
