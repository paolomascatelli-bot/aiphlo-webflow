# AiPhlo Operations Guide
## Product Definition, Process, Tools & Results

---

## 1. WHAT IS THE PRODUCT

**AiPhlo** is a Squarespace-to-Webflow migration automation system with three phases:

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| 1 | **Universal Template** | Responsive template for general site transfer | In Progress |
| 2 | **Migration + Redesign** | Migration with styling customization capability | In Progress |
| 3 | **Consumer Control Center** | Plain language interface for consumers to direct fixes/customizations | Prototype Working |

### Core Value Proposition
- Automate the extraction and rebuild of Squarespace sites
- Preserve original design accuracy through visual comparison
- Enable non-technical consumers to fine-tune their migrated sites

---

## 2. HOW IT WORKS

### High-Level Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│                         MIGRATION PIPELINE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PHASE 1: EXTRACTION                                                │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐         │
│  │ Sitemap │ -> │ Content │ -> │ Assets  │ -> │  JSON   │         │
│  │Discovery│    │  Scrape │    │Download │    │  API    │         │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘         │
│                                                                     │
│  PHASE 2: BUILD                                                     │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐         │
│  │Template │ -> │  Page   │ -> │  Style  │ -> │ Visual  │         │
│  │  Setup  │    │ Render  │    │  Match  │    │   QA    │         │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘         │
│                                                                     │
│  PHASE 3: REFINEMENT (Control Center)                               │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐         │
│  │Consumer │ -> │  Parse  │ -> │  Apply  │ -> │ Verify  │         │
│  │Direction│    │ Command │    │   CSS   │    │Screenshot│        │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. STEPS & TOOLS FOR EACH STEP

### STEP 1: Site Discovery
**Purpose**: Find all pages and structure of source site

| Tool | File | Function |
|------|------|----------|
| `map-urls.js` | scripts/ | Discovers sitemap, lists all pages |
| Puppeteer | dependency | Browser automation for discovery |

**Output**: List of all page URLs to extract

---

### STEP 2: Content Extraction
**Purpose**: Scrape content, structure, and computed styles

| Tool | File | Function |
|------|------|----------|
| `extract-content.js` | scripts/ | Extracts page content and structure |
| `analyze-galleries.js` | scripts/ | Analyzes gallery configurations |
| `scrape-and-package.js` | scripts/ | Combined extraction pipeline |

**Output**: Raw content data, gallery configurations

---

### STEP 2.5: Design Token Extraction ⭐ CRITICAL
**Purpose**: Extract exact colors, typography, spacing, and interaction styles from source

| Tool | File | Function |
|------|------|----------|
| `extract-design-tokens.mjs` | scripts/ | Extracts colors, fonts, spacing, borders, shadows |
| `extract-color.mjs` | scripts/ | Quick single-color extraction for debugging |

**Command**:
```bash
cd scripts
node extract-design-tokens.mjs https://source-site.com tokens.json
```

**Output**:
- `/extractions/tokens.json` - Full design token data
- `/extractions/tokens-variables.css` - Ready-to-use CSS variables

**What It Captures**:
- **Colors**: Primary accent, cyan/teal, backgrounds, text colors (with HEX and RGB)
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Margins, paddings, gaps
- **Borders**: Radii, widths, styles
- **Shadows**: Box shadows
- **Interactions**: Button styles, link styles

**Why This Step Is Critical**:
This guarantees accurate color matching. Without this, colors are approximated and require manual adjustment later. Running this first means CSS values are correct from the start.

---

### STEP 3: Asset Download
**Purpose**: Download all images and media

| Tool | File | Function |
|------|------|----------|
| `scrape-images.js` | scripts/ | Downloads all images from source |
| `fix-images.js` | scripts/ | Repairs broken image references |

**Output**: `/assets/images/` directory with all media

---

### STEP 4: JSON API Generation
**Purpose**: Convert extracted content to structured JSON

| Tool | File | Function |
|------|------|----------|
| `convert-to-api.js` | scripts/ | Converts raw data to JSON blocks |

**Output**: `/api/content/*.json` files for each page

---

### STEP 5: Template Build
**Purpose**: Create HTML/CSS/JS framework

| File | Location | Function |
|------|----------|----------|
| `accurate.html` | template/ | Base HTML shell (nav, footer, content areas) |
| `accurate.css` | template/ | Site-wide styles |
| `pages.css` | template/ | Page-specific scoped styles |
| `aiphlo-unified.js` | template/ | SPA routing, JSON rendering, interactions |

**Output**: Working site framework

---

### STEP 6: Visual QA
**Purpose**: Compare implementation to original

| Tool | File | Function |
|------|------|----------|
| `capture-footer-comparison.js` | scripts/ | Captures footer from both sites |
| `capture-page-comparison.js` | scripts/ | Captures any page from both sites |

**Output**: Side-by-side screenshots for comparison

---

### STEP 7: Consumer Control Center
**Purpose**: Accept plain language directions, apply CSS changes

| Component | How It Works |
|-----------|--------------|
| User gives direction | "Lower it by 10%, make it 25% bigger" |
| Parse direction | Translate to CSS property changes |
| Apply changes | Edit CSS file with new values |
| Verify result | Capture screenshot, show to user |

**Current State**: Manual (Claude interprets and executes). Future: Automated UI.

---

## 4. PROCEDURES & PROTOCOLS

### Core Documents

| Document | Purpose | Location |
|----------|---------|----------|
| `EXTRACTION_PROTOCOL.md` | How to extract from source sites | root |
| `BUILD_ORDER_PROTOCOL.md` | Page build sequence, color Q&A, lessons learned | root |
| `SITE_ARCHITECTURE.md` | Component hierarchy, site-wide vs page-specific | root |
| `SCREENSHOT_OVERLAY_PROTOCOL.md` | Visual QA verification process | root |
| `SYSTEMS_REGISTRY.md` | All tools, wins, lessons learned | root |
| `OPERATIONS_GUIDE.md` | This document | root |

### Core Operating Rules

1. **No Assumptions** - NEVER guess. ASK when uncertain.
2. **Nav vs Content** - Determined by testing actions, not appearance.
3. **Site-Wide vs Page-Specific** - Scope CSS correctly.
4. **Document Everything** - All decisions go into protocols.
5. **Visual Verification Required** - Never mark complete without screenshot comparison.

### Key Procedures

**Design Token Extraction** (FIRST STEP before any build):
```
1. Run: cd scripts && node extract-design-tokens.mjs https://source-site.com
2. Review output: colors, typography, spacing, borders
3. Copy CSS variables from generated file to pages.css
4. Use exact HEX/RGB values - no approximation
5. Document primary accent color in project notes
```

**Color Confirmation Q&A** (before building each page):
```
1. Present extracted colors to consumer
2. Consumer confirms or adjusts
3. Apply confirmed colors with page-scoped CSS
4. Never use replace_all for page-specific colors
```

**Screenshot Comparison** (before marking complete):
```
1. Run: node capture-page-comparison.js /route pagename
2. Compare original vs local screenshots
3. Document pixel differences
4. Apply targeted CSS fixes
5. Re-capture to verify
```

**Control Center Pattern** (consumer directions):
```
1. Consumer gives plain language direction
2. Translate to specific CSS changes
3. Apply edits to accurate.css or pages.css
4. Capture screenshot
5. Show result, ask if more adjustments needed
```

---

## 4.5 CONSUMER ADJUSTMENT PROTOCOL

### Service Tiers

| Tier | Name | Target User | What They Get |
|------|------|-------------|---------------|
| 1 | **Basic** | DIY users (built Squarespace w/ tutorials) | Live AI tutorial, basic adjustments, ask to a point |
| 2 | **Semi-Pro** | Designers, small shops | Basic + design suggestions, more direction & control |
| 3 | **Premium** | Agencies, demanding clients | Full control center, unlimited everything |

### What Each Tier Includes

**BASIC** - The Accessible Entry Point
```
Target: People who built their Squarespace site alone with YouTube tutorials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Live AI-assisted migration (we are: developer, engineer, designer, tutorial)
✓ Automated best-match placement
✓ Limited adjustment rounds
✓ Token-based extras (buy more when needed)
✓ Manageable cost - consumer feels satisfied, not gouged

Upgrade trigger: "You've used your adjustment rounds. Buy tokens or upgrade?"
```

**SEMI-PRO** - The Sweet Spot for Professionals
```
Target: Freelance designers, small agencies, boutique shops
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Everything in Basic
✓ Design suggestions on placement, sizing, color
✓ More directional control BEFORE changes are made
✓ Extended adjustment rounds
✓ Priority queue

This is where a designer or small shop can get by and get
real design value without going premium.
```

**PREMIUM** - The Full Arsenal
```
Target: Agencies with demanding clients, enterprise migrations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Everything in Semi-Pro
✓ Unlimited control center access
✓ Consumer directs ALL changes
✓ Custom integrations
✓ Priority turnaround
✓ White-glove service
✓ Everything we can offer
```

### Post-Change Interaction Flow

After ANY visual change (size, position, color, spacing):

```
┌─────────────────────────────────────────────────────────┐
│ SYSTEM: [Makes change based on extraction/comparison]   │
├─────────────────────────────────────────────────────────┤
│ SYSTEM: "Made change. Would you like it adjusted?"      │
├─────────────────────────────────────────────────────────┤
│ CONSUMER OPTIONS:                                        │
│   ○ "Looks good" → Move to next task                    │
│   ○ "Make it bigger/smaller" → Adjust + re-verify       │
│   ○ "Move it left/right/up/down" → Adjust + re-verify   │
│   ○ "Change the color" → Adjust + re-verify             │
│   ○ "More control" → Enter Premium adjustment mode       │
└─────────────────────────────────────────────────────────┘
```

### Adjustment Commands (Plain Language)

| Consumer Says | System Action |
|---------------|---------------|
| "Make it bigger" | Increase size by 20% |
| "Make it smaller" | Decrease size by 20% |
| "Make it 50% bigger" | Increase by exact percentage |
| "Move it up/down/left/right" | Shift position by 10px |
| "Move it up by 20px" | Shift by exact amount |
| "Change the color to X" | Update color value |
| "Match the original exactly" | Re-extract + apply |

### Pricing Philosophy

**Core Principle**: Manageable costs that leave consumers satisfied, not gouged.

| Tier | Model | Philosophy |
|------|-------|------------|
| **Basic** | Low monthly OR token-based | Entry accessible, buy tokens when needed |
| **Semi-Pro** | Mid-tier subscription | Sweet spot - real value without premium price |
| **Premium** | All-inclusive package | Everything for those who need everything |

### Token System (Basic Tier)

- Start with X free adjustment rounds
- Each round = one "make it bigger/smaller/move it" cycle
- Buy token packs when rounds run out
- Tokens never expire
- Natural upgrade path: heavy users see value in Semi-Pro

### Key Principles

> "We are live-time AI tutorial AND a developer AND an engineer AND a designer - the list goes on."

> "We place it and size it as best we can, then they can opt in for suggestions or more control and adjust the level of play depending on their user preference."

> "Nothing too costly - something manageable so they feel satisfied."

---

## 5. SUCCESSES

### Architecture Wins
| Win | Description |
|-----|-------------|
| ✅ JSON-driven content | Content separated from presentation |
| ✅ SPA routing | Page switching without framework |
| ✅ CSS scoping | Page-specific styles don't bleed |
| ✅ Component hierarchy | Clear site-wide vs page-specific separation |

### Extraction Wins
| Win | Description |
|-----|-------------|
| ✅ Sitemap-first discovery | Finds all pages before crawling |
| ✅ Computed style extraction | Gets actual rendered CSS values |
| ✅ Asset automation | Downloads and organizes all images |

### QA Wins
| Win | Description |
|-----|-------------|
| ✅ Screenshot overlay protocol | Visual verification method documented |
| ✅ Automated screenshot capture | Scripts capture both sites for comparison |
| ✅ TOP/MID/BOTTOM naming | Prevents header/footer confusion |

### Tooling Wins
| Win | Description |
|-----|-------------|
| ✅ `capture-footer-comparison.js` | Automated footer screenshot capture |
| ✅ `capture-page-comparison.js` | Generic page comparison for any route |

### Control Center Wins
| Win | Description |
|-----|-------------|
| ✅ Plain language → CSS | "Enlarge by 25%" successfully translated and applied |
| ✅ Iterative refinement | Multiple adjustment rounds working |
| ✅ Screenshot verification | Automatic capture after changes |

### Pages Built
| Page | Route | Status |
|------|-------|--------|
| Home | `/home` | ✅ Built |
| Projects | `/projects` | ✅ Built |
| Photography | `/photography` | ✅ Built |
| Social Media | `/socialmedia` | ✅ Built |
| FAQs | `/faqs` | ✅ Built |
| Contact | `/contact` | ✅ Built |
| AiPhlo | `/aiphlo` | ✅ Built |

---

## 6. FAILURES & LESSONS LEARNED

### Failure 1: Color Bleed
| Aspect | Detail |
|--------|--------|
| **What happened** | Used `replace_all` for gold→cyan, affected all pages |
| **Root cause** | Didn't scope CSS to page-specific selectors |
| **Impact** | Had to manually revert 15+ color declarations |
| **Prevention** | Always use page-scoped selectors, never `replace_all` for page colors |

### Failure 2: Layout Too Wide
| Aspect | Detail |
|--------|--------|
| **What happened** | Contact page content spanning full viewport |
| **Root cause** | Applied max-width to wrapper, not children |
| **Impact** | Background cut off, layout wrong |
| **Prevention** | Use `.page > *` selector pattern for constraints |

### Failure 3: Footer Overlay Removed
| Aspect | Detail |
|--------|--------|
| **What happened** | Removed footer header content thinking it wasn't original |
| **Root cause** | Made assumptions instead of asking |
| **Impact** | Had to restore and reposition |
| **Prevention** | NEVER assume - ASK when uncertain |

### Failure 4: Screenshot Orientation Confusion
| Aspect | Detail |
|--------|--------|
| **What happened** | Analyzed header screenshots as footer |
| **Root cause** | Screenshots not labeled with position |
| **Impact** | Wasted time analyzing wrong elements |
| **Prevention** | Use TOP/MID/BOTTOM naming convention |

### Failure 5: Design Direction Not Executed
| Aspect | Detail |
|--------|--------|
| **What happened** | User gave specific instructions (20% larger, icon above text), I only partially executed |
| **Root cause** | Didn't follow instructions precisely |
| **Impact** | User had to repeat instructions |
| **Prevention** | Execute directions exactly as given, verify each change |

---

## 7. CURRENT STATE

### What's Working
- Site framework with SPA routing
- 6 of 7 pages built and rendering
- Footer overlay positioned and styled
- Screenshot comparison tooling
- Control Center pattern (manual execution)

### What's Not Built
- Automated Control Center UI
- Drag-and-drop positioning feature

### Active CSS Values (Footer Header)
```css
.pm-footer-bg-overlay { top: 18%; }
.pm-footer-rights { font-size: 12px; font-weight: 500; }
.pm-footer-rights--small { font-size: 10px; }
.pm-footer-red-logo { width: 60px; margin-bottom: 12px; }
```

---

## 8. COMMAND QUICK REFERENCE

```bash
# ======================================
# DESIGN TOKEN EXTRACTION (RUN FIRST!)
# ======================================
cd scripts
node extract-design-tokens.mjs https://source-site.com tokens.json

# Output:
#   extractions/tokens.json           - Full design data
#   extractions/tokens-variables.css  - Ready CSS variables

# ======================================
# SCREENSHOT COMPARISON
# ======================================
node capture-page-comparison.js /aiphlo aiphlo    # Any page
node capture-page-comparison.js /contact contact  # Contact page
node capture-footer-comparison.js                  # Footer only

# Screenshots saved to: /screenshots/

# ======================================
# LOCAL SERVER
# ======================================
cd api && node server.js    # Start on port 3001

# ======================================
# KEY FILES
# ======================================
template/accurate.css       # Site-wide styles
template/pages.css          # Page-specific styles (use extracted colors here)
template/accurate.html      # Base HTML structure
template/aiphlo-unified.js  # SPA routing, JSON rendering
api/content/*.json          # Page content
extractions/*.json          # Extracted design tokens
```

## 9. DESIGN TOKEN WORKFLOW

**For every new migration project:**

1. **Extract tokens FIRST**
   ```bash
   node extract-design-tokens.mjs https://client-site.com client-tokens.json
   ```

2. **Review the output**
   - Check `extractions/client-tokens.json` for all extracted values
   - Identify primary accent color (usually cyan/teal/blue)
   - Note typography (fonts, sizes)
   - Note border radii

3. **Apply to CSS**
   - Copy relevant variables from `extractions/client-tokens-variables.css`
   - Use exact HEX values in `pages.css`
   - Use `replace_all` only for global color updates

4. **Verify with screenshot**
   ```bash
   node capture-page-comparison.js /page pagename
   ```

**This guarantees 100% color accuracy on every build.**

---

*Document Created: February 4, 2026*
*For: AiPhlo Migration System*
*Version: 1.0*
