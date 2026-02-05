# AiPhlo Site Architecture
## Site-Wide vs Page-Specific Components

---

## COMPONENT HIERARCHY

```
┌─────────────────────────────────────────────────────────────┐
│                    SITE-WIDE (accurate.html)                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  NAVIGATION (always visible)                         │   │
│  │  - #pm-nav-trigger (floating button)                 │   │
│  │  - #pm-nav-dropdown (expandable menu)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  MAIN CONTENT AREA                                   │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  #page-content (dynamic pages render here)   │    │   │
│  │  │  - Rendered by aiphlo-unified.js             │    │   │
│  │  │  - Hidden when on home page                  │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  #home-content (home page only)              │    │   │
│  │  │  - Static HTML in accurate.html              │    │   │
│  │  │  - Hidden when on other pages                │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FOOTER (always visible)                             │   │
│  │  .pm-footer                                          │   │
│  │  - Dark bg image section with text overlay           │   │
│  │  - Scalloped wave divider                            │   │
│  │  - White section (newsletter, locations, logo)       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## SITE-WIDE COMPONENTS

### 1. Navigation (`accurate.html`)
**Location**: Top of body, outside main
**Classes**: `#pm-nav-trigger`, `#pm-nav-dropdown`
**Behavior**: Always visible, floats above content
**Styling**: `accurate.css`

```html
<div id="pm-nav-trigger">
  <img src="..." alt="Aiphlo Icon">
  <span>NAV</span>
</div>
<div id="pm-nav-dropdown">
  <a href="/home">Home</a>
  <a href="/projects">Projects</a>
  <!-- etc -->
</div>
```

### 2. Footer (`accurate.html`)
**Location**: After `</main>`, always visible
**Classes**: `.pm-footer`, `.pm-footer-bg`, `.pm-footer-white`
**Styling**: `accurate.css`

**Structure**:
```
┌─────────────────────────────────────────┐
│  .pm-footer-bg                          │
│  ├─ Background image (aiphlo watermark) │
│  └─ .pm-footer-bg-overlay               │  ← "Footer Header"
│      ├─ "ALL RIGHTS RESERVED"           │
│      ├─ "NOT FOR PUBLIC USE"            │
│      └─ Red icon (links to /secret)     │
├─────────────────────────────────────────┤
│  .pm-footer-divider (scalloped SVG)     │
├─────────────────────────────────────────┤
│  .pm-footer-white                       │
│  └─ 3-column grid                       │
│      ├─ Newsletter signup               │
│      ├─ Locations + contact link        │
│      └─ AiPhlo logo                     │
└─────────────────────────────────────────┘
```

```html
<footer class="pm-footer">
  <div class="pm-footer-bg">
    <img src="..." class="pm-footer-bg-img">
    <div class="pm-footer-bg-overlay">
      <p class="pm-footer-rights">ALL RIGHTS RESERVED</p>
      <p class="pm-footer-rights pm-footer-rights--small">NOT FOR PUBLIC USE</p>
      <a href="/secret" class="pm-footer-red-link">
        <img src="..." class="pm-footer-red-logo">
      </a>
    </div>
  </div>
  <div class="pm-footer-divider">...</div>
  <div class="pm-footer-white">...</div>
</footer>
```

**CRITICAL**:
- Do NOT render page-specific footers. Let site-wide footer show.
- The "Footer Header" (overlay content) is a DESIGN BLOCK, not navigation
- It appears on every page as part of site-wide footer

---

## PAGE-SPECIFIC COMPONENTS

### Rendered into `#page-content` by `aiphlo-unified.js`

| Page | Wrapper Class | Unique Elements |
|------|---------------|-----------------|
| Contact/Resume | `.pm-resume-page` | Resume header, quick actions, contact cards, work experience, skills |
| Photography | `.pm-photo-section` | Gallery nav pills, photo sections |
| Social Media | `.pm-campaigns-container` | Campaign cards, phone mockup galleries |
| Projects | `.pm-project-showcase` | Project thumbs, project sections with toggles |
| FAQs | `.pm-faqs-page` | Accordion-style FAQ items |

### Page-Specific Closing Rules

**Resume/Contact Page**:
- Closes with `</section></main>` (via `renderContactFooter`)
- Then site-wide footer displays automatically
- Page-specific copyright info rendered before closing tags

**Other Pages**:
- Content renders into `#page-content`
- Site-wide footer is always visible after

---

## STYLE FILE ORGANIZATION

### `accurate.css` - Site-Wide Styles
- Navigation styles
- Footer styles (`.pm-footer-*`)
- Global typography
- Base layout

### `pages.css` - Page-Specific Styles
- Page wrapper styles (`.pm-resume-page`, `.pm-faqs-page`, etc.)
- Gallery styles
- Project showcase styles
- Resume/CV component styles

### Conflict Prevention Rules

1. **Never duplicate class names** between accurate.css and pages.css
2. **Scope page styles** to page wrapper classes
3. **Site-wide elements** (nav, footer) only styled in accurate.css
4. **If same class needed**, prefix with page wrapper:
   ```css
   /* WRONG - conflicts with site-wide */
   .pm-footer-locations { font-size: 36px; }

   /* RIGHT - scoped to specific context */
   .pm-resume-page .pm-footer-locations { font-size: 36px; }
   ```

---

## VISIBILITY LOGIC

### `aiphlo-unified.js` Page Switching

```javascript
// Home page: show home-content, hide page-content
function showHomePage() {
  document.getElementById('home-content').hidden = false;
  document.getElementById('page-content').hidden = true;
}

// Other pages: hide home-content, show page-content
function showDynamicPage(page) {
  document.getElementById('home-content').hidden = true;
  document.getElementById('page-content').hidden = false;
  // Render page content...
}
```

### Footer Visibility
- **Always visible** - no hide/show logic needed
- Positioned after `</main>` in HTML
- Works for all pages automatically

---

## ADDING NEW PAGES

### Checklist

1. **Create JSON content** in `/api/content/{page}.json`
2. **Add renderer function** in `aiphlo-unified.js`
3. **Add case to switch** in `renderPageContent()`
4. **Add page-specific CSS** in `pages.css`
   - Create page wrapper class: `.pm-{page}-page`
   - Scope all styles to wrapper
5. **Add to navigation** in `accurate.html`
6. **DO NOT** create page-specific footer - use site-wide

### Page Template

```javascript
function renderNewPage(content) {
  let html = '<main class="pm-newpage-page">';
  // Render page content...
  html += '</main>';
  return html;
}
```

---

## COMMON MISTAKES

### ❌ Creating duplicate footers
```javascript
// WRONG - creates footer inside page-content
html += '<footer class="pm-custom-footer">...</footer>';
```

### ✅ Let site-wide footer show
```javascript
// RIGHT - just close page wrapper, site footer follows
html += '</main>';
```

### ❌ Unscoped styles that conflict
```css
/* WRONG - overrides site-wide footer */
.pm-footer-locations { color: red; }
```

### ✅ Scoped styles
```css
/* RIGHT - only affects specific context */
.pm-resume-page .pm-custom-locations { color: red; }
```

---

## QUICK REFERENCE

| Component | Location | Styled In | Notes |
|-----------|----------|-----------|-------|
| Navigation | accurate.html | accurate.css | Always visible |
| Footer | accurate.html | accurate.css | Always visible |
| Home content | accurate.html | accurate.css | Static HTML |
| Dynamic pages | #page-content | pages.css | Rendered by JS |
| Page wrappers | JS-rendered | pages.css | Scoped styles |

---

*Created: February 4, 2026*
*For: AiPhlo Migration System*
