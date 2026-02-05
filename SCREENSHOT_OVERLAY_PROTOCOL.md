# Screenshot Overlay Comparison Protocol
## Visual QA Tool for Accurate Migration

---

## PURPOSE

When CSS extraction, sitemap scans, or computed style data doesn't provide accurate positioning/sizing values, use screenshot overlay comparison as a visual verification tool.

**Use Cases:**
- Footer positioning verification
- Element sizing confirmation
- Layout alignment checks
- Before marking any component as "complete"

---

## PROCESS

### Step 1: Capture Screenshots (AUTOMATED)

**Use the automated script:**
```bash
cd /Users/pauldaggett/projects/aiphlo_webflow/scripts
node capture-footer-comparison.js
```

This script:
1. Opens both original site and localhost at 1440x900 viewport
2. Scrolls to bottom of page
3. Captures footer element and full bottom viewport
4. Saves with proper naming convention
5. Generates comparison report JSON

**Manual capture (fallback):**
```
1. Navigate to the exact page/section on original site
2. Set viewport to consistent width (1440px desktop)
3. Capture full section screenshot
4. Save as: screenshots/{page}_{POSITION}_{section}_original.png
```

### Step 2: Create Overlay

**Method A: Image Editor (Photoshop/GIMP/Figma)**
1. Open original screenshot as base layer
2. Add implementation screenshot as top layer
3. Set top layer opacity to 50%
4. Align key reference points (nav, edges, text baselines)
5. Look for misalignments

**Method B: Browser DevTools**
1. Use original screenshot as background-image on a div
2. Position implementation elements over it
3. Toggle visibility to compare

**Method C: Diff Tool**
1. Use image diff tools (ImageMagick, online diff)
2. Generate difference image highlighting mismatches
3. Red areas = differences to investigate

### Step 3: Measure Differences

When overlay shows misalignment:
1. **Identify the gap** - How many pixels off?
2. **Determine direction** - Too big/small? Shifted left/right/up/down?
3. **Calculate adjustment** - What CSS change needed?
4. **Apply fix** - Make targeted CSS edit
5. **Re-verify** - New overlay to confirm fix

---

## WHEN TO USE

### Required Before:
- Marking any visual component as "complete"
- Moving to next page in build sequence
- User approval requests

### Triggers:
- User reports "that looks off"
- CSS values don't produce expected result
- Extracted values seem unreliable
- Multiple revision attempts without success

---

## MEASUREMENT GUIDELINES

### Acceptable Tolerance
- Position: ±2px
- Font size: exact match
- Spacing/padding: ±3px
- Colors: exact hex match

### Red Flags (Re-do required)
- Position: >5px off
- Obvious visual shift in overlay
- Elements not aligned to same baseline
- Proportions clearly different

---

## FOOTER OVERLAY EXAMPLE

### Current Task: Footer Header Overlay

**Elements to Compare:**
1. Red icon position relative to "aiphlo" watermark
2. Red icon size
3. Text color brightness
4. Text position relative to icon
5. Overall vertical positioning in footer bg section

**Alignment Reference Points:**
- Top of "aiphlo" text in bg image
- Center line of footer section
- Bottom edge of footer bg section

---

## INTEGRATION WITH BUILD PROTOCOLS

This protocol supplements:
- `BUILD_ORDER_PROTOCOL.md` - Use before color confirmation
- `EXTRACTION_PROTOCOL.md` - Use when extraction values unreliable
- `SITE_ARCHITECTURE.md` - Reference for component structure

---

## SCREENSHOTS DIRECTORY

Store all comparison screenshots in: `/screenshots/`

### Naming Convention (CRITICAL)
Include position indicator to prevent TOP vs BOTTOM confusion:

```
{page}_{POSITION}_{section}_{type}.png

POSITION values:
- TOP = header/nav area (first viewport)
- MID = middle content sections
- BOTTOM = footer area (last viewport)

Examples:
home_TOP_nav_original.png
home_BOTTOM_footer_original.png
home_BOTTOM_footer_implementation.png
contact_TOP_hero_original.png
contact_MID_resume_original.png
contact_BOTTOM_footer_original.png
```

### Avoid Confusion
- The floating NAV trigger appears at TOP of viewport on all pages
- When scrolled to bottom, the NAV may appear OVER the footer area
- Don't confuse floating NAV with footer content
- Footer icon has NO "NAV" text - that's the floating header nav

---

*Protocol Created: February 4, 2026*
*For: AiPhlo Migration System*
*Purpose: Visual QA verification when data extraction insufficient*
