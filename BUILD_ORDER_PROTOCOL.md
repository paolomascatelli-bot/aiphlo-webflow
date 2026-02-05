# AiPhlo Build Order Protocol
## Consumer Migration: Color & Branding Q&A System

---

## CORE OPERATING RULES

### Rule 1: No Assumptions
**NEVER guess or assume. ASK when uncertain.**
- If visual comparison doesn't give clear values, ask the user
- If component function is unclear (nav vs content), ask the user
- If unsure whether something belongs in a section, ask the user

### Rule 2: Nav vs Content Distinction
Determined by **testing actions**, not visual appearance:
- **Navigation**: Triggers page changes, opens menus, scrolls to sections
- **Content/Design Block**: Static display, may link somewhere but primary purpose is visual

### Rule 3: Site-Wide vs Page-Specific
- **Site-wide**: Appears on EVERY page (nav, footer, footer header)
- **Page-specific**: Unique to one page, scoped with page wrapper class

### Rule 4: Document Everything
All decisions, fixes, and learnings go into protocols for future migrations.

---

## COLOR HIERARCHY - Critical Understanding

### Level 1: Site-Wide Brand Colors
These are the global colors that appear across the entire site (navigation, footer, shared elements).

**Example from PaoloMascatelli.com:**
- Background: `#000000` (black)
- Primary text: `#ffffff` (white)
- Secondary text: `rgba(255, 255, 255, 0.6)` (muted white)
- Footer accent: Red `#c02428`

### Level 2: Page-Specific Colors
Individual pages may have unique color schemes that differ from site-wide branding.

**Example from PaoloMascatelli.com:**
| Page | Primary Accent | Use Case |
|------|----------------|----------|
| Home | Gold `rgb(212, 175, 55)` | Headlines, CTAs |
| Projects | Gold `rgb(212, 175, 55)` | Project titles, tags, toggles |
| Photography | Red/White `#c02428` / `#ffffff` | Gallery nav pills |
| Social Media | Red/White `#c02428` / `#ffffff` | Campaign nav, cards |
| FAQs | Gold `rgb(212, 175, 55)` | Headlines, arrows |
| Contact | Cyan/Teal `rgb(0, 212, 180)` | Logo ring, buttons, links |

### Level 3: Project/Component Colors
Individual projects or components within a page may have their own color schemes.

**Example: Tenebre Project (on Home page)**
- Uses gold `rgb(212, 175, 55)` for toggle, nav elements
- This is a PROJECT color, not a SITE color

---

## BUILD ORDER SEQUENCE

### Phase 1: Site Framework
1. Extract and confirm site-wide navigation colors
2. Extract and confirm footer colors
3. Build template structure with confirmed colors

### Phase 2: Page-by-Page Build
For EACH page, follow this sequence:

```
2.1 → Extract page content & structure
2.2 → Run COLOR CONFIRMATION Q&A (see below)
2.3 → Build page HTML structure
2.4 → Apply confirmed page-specific styles
2.5 → Test isolation (colors don't bleed to other pages)
```

### Phase 3: Final Integration
1. Test all pages for color isolation
2. Verify no color bleed between pages
3. Final consumer review

---

## COLOR CONFIRMATION Q&A SCRIPT

### Before Building Each Page

**Script for Consumer:**

```
We're about to build: [PAGE NAME]

Based on our extraction, this page uses:

  Primary Accent: [COLOR HEX/RGB]
  Secondary Accent: [COLOR HEX/RGB]
  Background: [COLOR HEX/RGB]

  [Show color swatches if possible]

Please confirm:
1. Are these colors correct for this page? (Yes/No)
2. Would you like to adjust any colors? (Provide new values)
3. Is this the same color scheme as another page, or unique?

Note: We can always adjust later. Our goal is to get as close
as possible before final adjustments.
```

### Color Confirmation Response Options

**Option A: Confirm**
- Consumer says "Yes, those are correct"
- Proceed with build

**Option B: Adjust**
- Consumer provides new color values
- Update extraction notes
- Proceed with build

**Option C: Reference**
- Consumer says "Use same colors as [other page]"
- Copy color scheme from referenced page
- Proceed with build

---

## COLOR ISOLATION RULES

### NEVER Do:
- Use `replace_all` for color changes that should be page-specific
- Assume project colors = brand colors
- Assume one page's colors apply to all pages

### ALWAYS Do:
- Scope CSS selectors to page-specific classes
- Use page wrapper classes: `.pm-[page]-page`
- Test color changes in isolation before committing
- Document which colors belong to which pages

### CSS Scoping Pattern:
```css
/* CORRECT: Page-scoped */
.pm-contact-page .pm-action-btn {
  color: rgb(0, 212, 180);  /* Contact page cyan */
}

/* WRONG: Global scope affecting all pages */
.pm-action-btn {
  color: rgb(0, 212, 180);  /* Would bleed to all pages */
}
```

---

## COLOR EXTRACTION CHECKLIST

For each page, extract and document:

- [ ] Primary headline color
- [ ] Secondary headline color
- [ ] Button/CTA primary color
- [ ] Button/CTA hover color
- [ ] Link color (default)
- [ ] Link color (hover)
- [ ] Background color
- [ ] Border/divider colors
- [ ] Icon/accent colors
- [ ] Text colors (primary, secondary, muted)

---

## PAGE COLOR REGISTRY

### Template: Copy for each project

```
PROJECT: [Client Name]
DATE: [Date]

PAGE: Home
├── Headline: [color]
├── CTA Button: [color]
├── Background: [color]
└── Confirmed: [ ] Yes / [ ] Adjusted

PAGE: [Page Name]
├── Headline: [color]
├── CTA Button: [color]
├── Background: [color]
└── Confirmed: [ ] Yes / [ ] Adjusted

[Repeat for each page]
```

---

## PAGE LAYOUT GUIDELINES

### Width Constraints
**Problem**: Pages rendering edge-to-edge instead of matching original narrow/centered layouts.

**Solution**: Apply max-width constraints to content containers, NOT the page wrapper (which holds background).

```css
/* CORRECT: Content constrained, background full-width */
.pm-resume-page {
  background: #000;  /* Full-width background */
  padding: 100px 20px;
}
.pm-resume-page > * {
  max-width: 800px;  /* Content constrained */
  margin: 0 auto;    /* Centered */
}

/* WRONG: Everything constrained including background */
.pm-resume-page {
  max-width: 800px;  /* Background would be cut off */
  margin: 0 auto;
}
```

### Standard Width Values
| Content Type | Max Width | Use Case |
|--------------|-----------|----------|
| Header/Hero | 600-700px | Name, tagline, summary |
| Contact Cards | 800px | 3-column grid |
| Resume Content | 700px | Work experience, skills |
| Full Resume Page | 800px | Overall content area |

### Always Verify
Before shipping any page:
1. Compare layout width to original screenshot
2. Check content is centered (not left-aligned)
3. Verify background extends full-width
4. Test responsive breakpoints

---

## UNBUILT PAGES REGISTRY

### /aiphlo (Secret Page)
**Status**: NOT BUILT (screenshots captured via `capture-page-comparison.js`)
**References**:
- Footer logo links to `/secret`
- Contact page "AiPhlo Inquiries" button links to `/aiphlo`
- Access: Button in upper-left corner of home page

**Content Extracted (Feb 2026)**:
- [x] Screenshot captured: `screenshots/original_aiphlo_FULL_full.png`
- [ ] Extract content structure
- [ ] Build page

**Page Structure (from screenshot)**:
1. **Hero Section**
   - H1: "Luxury Navigation. Zero Code."
   - Subtext: Platform-agnostic UX/UI augmentation description
   - CTAs: "Free Demo" + "Start Custom Project"

2. **Accordion Sections** (expandable)
   - "Your Brand Deserves Better Than Template Navigation"
   - "Plug In Luxury: AiPhlo 1.0"
   - "Navigation Systems"
   - "Upgrade: Scrollable & Shoppable Galleries"
   - "Three Steps to Six-Figure Navigation"
   - "Built for Performance. Designed for Luxury"

3. **Pricing Section** - "One-Time Purchase. Lifetime Access."
   - STUDIO: $24.95 (custom install $175)
   - PRO: $49.95 (custom install $795)
   - AGENCY: $125 (custom install $1,250)
   - Each tier has gradient border (rainbow effect)

4. **Additional Sections**
   - "What's Next: AI-Powered Interoperability"
   - "Frequently Asked Questions"

5. **CTA Section**
   - "Stop Looking Like A Template. Start Looking Like A Brand."
   - Button: "Start Your Custom Project"

6. **Footer** - Standard site-wide footer

**Color Scheme**: Red accents, gradient borders on pricing cards, black background

---

## LESSONS LEARNED LOG

### Issue: Layout Too Wide (Feb 2026)
**Problem:** Contact/resume page content spanning full viewport width instead of narrow centered layout like original.

**Root Cause:** Applied `max-width` to page wrapper which cut off background. Content elements didn't have individual constraints.

**Resolution:**
1. Keep page wrapper full-width for background
2. Apply `max-width` to direct children: `.pm-resume-page > * { max-width: 800px; margin: 0 auto; }`
3. Individual sections have their own constraints (header: 600px, cards: 800px, resume: 700px)

**Prevention:**
1. Always compare to original screenshot for layout width
2. Use child selector pattern for content constraints
3. Add width guidelines to extraction checklist

---

### Issue: Color Bleed (Feb 2026)
**Problem:** Used `replace_all` for gold→cyan color change, which affected all pages instead of just Contact page.

**Root Cause:** Didn't scope CSS changes to page-specific selectors.

**Resolution:** Manually reverted 15+ color declarations back to original gold for non-contact pages.

**Prevention:**
1. Always use page-scoped selectors
2. Never use `replace_all` for page-specific color changes
3. Test color isolation before committing

---

### Issue: Footer Overlay Misidentified (Feb 2026)
**Problem:** Initially removed footer overlay content thinking it wasn't in the original - this was INCORRECT.

**Root Cause:** Confused the footer's red icon (design block) with the floating NAV trigger. Made assumptions instead of asking.

**Actual Structure (CORRECT):**
The footer dark section contains:
1. Background image (with "aiphlo" watermark baked in)
2. Overlay content = "Footer Header" design block:
   - "ALL RIGHTS RESERVED" text
   - "NOT FOR PUBLIC USE" text
   - Red icon (links to /secret)
3. This appears on EVERY page - it's site-wide

**Resolution:**
1. Restored overlay content to footer HTML
2. Positioned text + icon correctly above "aiphlo" logo

**Prevention:**
1. **NEVER assume - ASK when uncertain**
2. Nav vs content is determined by testing actions (clicks, navigation behavior)
3. Design blocks that appear on every page are site-wide content, not page-specific

---

## SCREENSHOT COMPARISON PROCESS

**Full protocol: See `SCREENSHOT_OVERLAY_PROTOCOL.md`**

### Step-by-Step Analysis
1. **Collect screenshots**: Original site + current implementation
2. **Identify fixed/floating elements**: Nav triggers, sticky headers that appear over multiple sections
3. **Section-by-section comparison**:
   - Background images: Is content baked in or overlaid?
   - Text content: Match exact wording, sizing, positioning
   - Spacing: Padding, margins, gaps between elements
   - Colors: Match exactly (use color picker tools)
4. **Document differences** before making changes
5. **Fix one issue at a time** to avoid cascading problems

### Screenshot Overlay Method (REQUIRED)
When CSS values don't produce expected results:
1. Capture original screenshot at fixed viewport (1440px)
2. Capture implementation screenshot at same viewport
3. **Overlay at 50% opacity** to visualize differences
4. Measure pixel differences (acceptable: ±2-3px)
5. Apply targeted CSS fixes
6. Re-overlay to verify fix

**RULE: Never mark component "complete" without overlay verification**

### Key Questions
- Is this element baked into the image or rendered as HTML?
- Is this element part of this section or floating over it?
- Does the original have content here, or is it empty?

---

## QUICK REFERENCE: PaoloMascatelli.com Colors

| Color Name | Value | Used On |
|------------|-------|---------|
| Gold | `rgb(212, 175, 55)` | Home, Projects, FAQs |
| Cyan/Teal | `rgb(0, 212, 180)` | Contact page only |
| Red | `#c02428` | Photography nav, Social Media nav |
| White | `#ffffff` | Active pills, text |
| Black | `#000000` | Backgrounds |
| White (muted) | `rgba(255,255,255,0.6)` | Secondary text |

---

---

## FUTURE FEATURE: CONSUMER DIY POSITIONING

### Problem Statement
Some layout elements (logos, icons, decorative elements) may not position perfectly during automated migration. Manual fine-tuning is needed.

### Proposed Solution
**Drag-and-Drop Positioning Window**
- Pop-up interface for element repositioning
- Consumer can drag elements to exact position
- No code knowledge required
- Position saved to configuration

### Implementation Notes
- Target elements: logos, icons, decorative images
- Interface: overlay with drag handles
- Output: CSS position values or transform coordinates
- Fallback: manual CSS adjustment by support

### Priority
Medium - Implement after core migration is stable

---

*Protocol Version: 1.3*
*Last Updated: February 4, 2026*
*Created for: AiPhlo Migration System*

**Changelog:**
- v1.3: Added screenshot comparison process, footer overlay lesson learned
- v1.2: Added consumer DIY positioning feature request
- v1.1: Added layout guidelines, unbuilt pages registry, layout width lessons learned
