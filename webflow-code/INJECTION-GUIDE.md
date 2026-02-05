# AiPhlo Webflow Code Injection Guide

## Overview

This guide explains how to inject the AiPhlo navigation systems into Webflow. The code is designed to work with minimal Webflow structure - just empty sections to receive the custom code.

---

## File Structure

```
webflow-code/
├── HEAD-CSS.css          # All styles → Project Settings > Head Code
├── FOOTER-JS.js          # All scripts → Project Settings > Footer Code
└── embeds/
    ├── SITEWIDE-NAV.html      # Every page (Symbol recommended)
    ├── PHOTOGRAPHY-NAV.html   # Photography page only
    ├── TENEBRE-HEADER.html    # Home page - Tenebre section
    ├── TENEBRE-GALLERY-NAV.html # Home page - below Tenebre header
    ├── SOCIAL-MEDIA-NAV.html  # Social Media page only
    └── PROJECTS-NAV.html      # Projects page only
```

---

## Step 1: Project-Level Code (Sitewide)

### Head Code (CSS)
1. In Webflow: **Project Settings → Custom Code → Head Code**
2. Wrap the CSS in style tags:
```html
<style>
[PASTE CONTENTS OF HEAD-CSS.css HERE]
</style>
```

### Footer Code (JS)
1. In Webflow: **Project Settings → Custom Code → Footer Code**
2. Wrap the JS in script tags:
```html
<script>
[PASTE CONTENTS OF FOOTER-JS.js HERE]
</script>
```

---

## Step 2: Sitewide Navigation (Symbol)

**Recommended: Create a Symbol**

1. Create a new Symbol called "Global Nav"
2. Add an **HTML Embed** element inside
3. Paste contents of `embeds/SITEWIDE-NAV.html`
4. Place this Symbol at the top of every page's body

The floating nav will appear fixed at top-left on all pages.

---

## Step 3: Page-Specific Embeds

### Home Page Structure

```
Body
├── [Global Nav Symbol]
├── Section: Hero
│   └── [Your hero content]
├── Section: Tenebre (id="tenebre-section")
│   ├── HTML Embed: TENEBRE-HEADER.html
│   ├── HTML Embed: TENEBRE-GALLERY-NAV.html
│   └── Div: Gallery Sections Container
│       ├── Section (id="seating", class="tenebre-gallery-section")
│       ├── Section (id="lighting", class="tenebre-gallery-section")
│       ├── Section (id="waterfall", class="tenebre-gallery-section")
│       ├── Section (id="kingbedbath", class="tenebre-gallery-section")
│       └── Section (id="guest-bedroom", class="tenebre-gallery-section")
└── Footer
```

### Photography Page Structure

```
Body
├── [Global Nav Symbol]
├── HTML Embed: PHOTOGRAPHY-NAV.html
├── Section (id="fashion-editorial", class="pm-photo-section")
├── Section (id="portrait-headshots", class="pm-photo-section")
├── Section (id="outdoor-lifestyle", class="pm-photo-section")
├── Section (id="lifestyle-fashion", class="pm-photo-section")
├── Section (id="fashion-boudoir", class="pm-photo-section")
└── Footer
```

### Projects Page Structure

```
Body
├── [Global Nav Symbol]
├── HTML Embed: PROJECTS-NAV.html
├── Section (id="project-aiphlo", data-project="project-aiphlo")
├── Section (id="project-tenebre", data-project="project-tenebre")
├── Section (id="project-cpi", data-project="project-cpi")
├── Section (id="project-graffdigital", data-project="project-graffdigital")
└── Footer
```

### Social Media Page Structure

```
Body
├── [Global Nav Symbol]
├── HTML Embed: SOCIAL-MEDIA-NAV.html
├── Section (id="vyayama", class="pm-social-section", data-campaign="vyayama")
├── Section (id="victoria", class="pm-social-section", data-campaign="victoria")
└── Footer
```

---

## Step 4: Section Setup in Webflow Designer

For each gallery/content section, set these in Webflow:

1. **Add the correct ID** (e.g., `fashion-editorial`, `seating`)
2. **Add the correct class** (e.g., `pm-photo-section`, `tenebre-gallery-section`)
3. **Set initial display to none** - The JS handles show/hide

### Webflow Class Setup

Create these classes in Webflow with `display: none`:
- `pm-photo-section`
- `pm-social-section`
- `tenebre-gallery-section`

The CSS and JS will override these when sections become active.

---

## Step 5: Image Assets

### Option A: Keep Squarespace URLs (Quick)
The code uses Squarespace-hosted images. These will work as-is.

### Option B: Re-upload to Webflow (Recommended for Production)
1. Download images from `/assets/images/`
2. Upload to Webflow Asset Manager
3. Find/replace image URLs in the embed files

---

## Navigation Behaviors

### 1. Sitewide Floating Nav
- **Hover**: Opens dropdown after 300ms
- **Click**: Locks dropdown open
- **Click again**: Unlocks and closes
- **Click outside**: Closes if locked
- **Escape key**: Closes

### 2. Photography Nav
- **Scroll dim**: Fades to 30% opacity after 240px scroll (220px mobile)
- **Scroll brighten**: Returns to full opacity near top
- **GALLERIES toggle**: Shows/hides pill group
- **Pill click**: Shows corresponding section

### 3. Tenebre System
- **OFF/ON toggle**: Expands slideshow container
- **Slideshow**: 12 images, 4s interval, 2.18s crossfade
- **Gallery buttons**: Toggle individual gallery sections

### 4. Projects Nav
- **Circle click**: Smooth scroll to project section
- **Scroll dim**: Similar to photography nav

### 5. Social Media Nav
- **Campaign button click**: Shows corresponding campaign section

---

## Troubleshooting

### Nav not appearing
- Check that CSS is in Head Code with `<style>` tags
- Check that JS is in Footer Code with `<script>` tags
- Verify HTML Embeds are set to "Display: Block"

### Sections not showing/hiding
- Verify section IDs match exactly (case-sensitive)
- Verify classes are applied (`pm-photo-section`, etc.)
- Check browser console for JS errors

### Scroll behaviors not working
- Ensure the sections have sufficient height (min-height: 100vh recommended)
- Check that no Webflow interactions conflict with the scroll listener

### Mobile issues
- The CSS includes breakpoints at 767px
- Touch interactions are handled via click events
- Verify Webflow isn't overriding mobile styles

---

## Z-Index Hierarchy

```
999999 - Sitewide floating nav trigger
999998 - Sitewide dropdown
99999  - Photography nav
99999  - Projects nav
50     - Tenebre gallery nav
10     - Tenebre header/toggle
2      - Tenebre black overlay
1      - Tenebre slide layers
```

---

## Animation Timings

| Element | Duration | Easing |
|---------|----------|--------|
| Floating nav dropdown | 0.3s | ease |
| Photography sections | 1.13s | ease |
| Social Media (VYAYAMA) | 1.75s | ease |
| Social Media (VICTORIA) | 1.0s | ease |
| Tenebre gallery sections | 2.0s | ease |
| Tenebre slideshow crossfade | 2.18s | ease |
| Tenebre container expand | 1.2s | cubic-bezier(0.4, 0, 0.2, 1) |

---

## Brand Colors (CSS Variables)

```css
--aiphlo-gold: #d4af37
--aiphlo-green: #6fb886
--aiphlo-black: #000000
--aiphlo-white: #ffffff
--pm-nav-bg: rgba(70, 76, 82, 0.96)
--pm-active-text: #c02428
```
