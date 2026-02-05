# AIPHLO Site Audit & Rebuild Protocol

## EXISTING ASSETS (Source of Truth)

### Original Code (Already Extracted)
```
/webflow-code/
├── HEAD-CSS.css          ← EXACT original CSS (use this, don't improvise)
├── FOOTER-JS.js          ← EXACT original JS (use this, don't improvise)
└── embeds/
    ├── SITEWIDE-NAV.html       ← Exact nav structure + real image URLs
    ├── TENEBRE-HEADER.html     ← Exact Tenebre toggle + slideshow structure
    ├── TENEBRE-GALLERY-NAV.html← Exact 5 gallery buttons + real image URLs
    ├── PHOTOGRAPHY-NAV.html    ← Photography page nav
    ├── SOCIAL-MEDIA-NAV.html   ← Social media page nav
    └── PROJECTS-NAV.html       ← Projects page nav
```

### Extracted Content
```
/assets/content/
├── site-content.json     ← Full site text, headings, paragraphs per page
├── gallery-structure.json← 692KB of gallery data with exact image mappings
├── home.md               ← Home page copy
├── projects.md           ← Projects page copy
├── photography.md        ← Photography page copy
├── social-media.md       ← Social media page copy
├── faqs.md               ← FAQs page copy
└── contact.md            ← Contact page copy
```

### Downloaded Images
```
/assets/images/           ← 315 images already downloaded
```

---

## SITE STRUCTURE (6 Pages)

| Page | Slug | Nav Components | Special Features |
|------|------|----------------|------------------|
| Home | `/` | Sitewide Nav | Tenebre section, 5 galleries, slideshow toggle |
| Projects | `/projects` | Sitewide Nav + Projects Nav | Project circles, scroll navigation |
| Photography | `/photography` | Sitewide Nav + Photography Nav | Pill nav, section reveal, scroll dim |
| Social Media | `/socialmedia` | Sitewide Nav + Social Media Nav | Campaign buttons |
| FAQs | `/faqs` | Sitewide Nav | Accordion |
| Contact | `/contact` | Sitewide Nav | Contact form, locations |

**+ Aiphlo Brief button** (unique header element linking to brief page)

---

## TENEBRE GALLERY STRUCTURE (5 Categories)

From `/webflow-code/embeds/TENEBRE-GALLERY-NAV.html`:

| Category | data-gallery | data-section | Preview Image |
|----------|--------------|--------------|---------------|
| SEAT STYLES | seating | #seating | DU9A1989.jpg |
| CHANDELIERS | lighting | #lighting | file_00000000bde461f9b3fbf768fd9133af.jpg |
| PATIO & POOL | waterfall | #waterfall | SwingHeadshot.png |
| KING BED/BATH | kingbedbath | #kingbedbath | DU9A7324.png |
| GUEST BED/BATH | guest-bedroom | #guest-bedroom | DU9A2621-Edit.jpg |

---

## REBUILD ORDER (Exact Protocol)

### Phase 1: FRAME (Structure Only)
1. Create `/template/pages/` directory
2. Create exact HTML for each page using embeds as source
3. No content yet - just empty slots with correct IDs
4. Structure must match original exactly

**Files to create:**
- `index.html` (home) - includes Tenebre section
- `projects.html`
- `photography.html`
- `socialmedia.html`
- `faqs.html`
- `contact.html`

### Phase 2: COPY (Text Content)
1. Read `/assets/content/{page}.md` for each page
2. Insert exact text into correct slots
3. Verify against original site
4. No images yet

### Phase 3: IMAGES
1. Use `/assets/content/gallery-structure.json` for exact mappings
2. Map downloaded images to correct gallery sections
3. Use exact filenames from embeds (DU9A1989.jpg, etc.)
4. Verify each image is in correct location

### Phase 4: STYLE
1. Copy `/webflow-code/HEAD-CSS.css` exactly
2. Do not modify unless necessary
3. Link CSS to all pages

### Phase 5: INTERACTIONS
1. Copy `/webflow-code/FOOTER-JS.js` exactly
2. Only add API listener on top, don't modify core interactions
3. Test each interaction against original

---

## API ROLE (Minimal)

The API should ONLY:
1. Serve content JSON when requested
2. Allow swapping site_key for different sites
3. NOT interpret or transform content

The template should be mostly static with specific `data-slot` points for API injection.

---

## WHAT NOT TO DO

- ❌ Don't improvise CSS - use HEAD-CSS.css
- ❌ Don't improvise HTML - use embeds as templates
- ❌ Don't guess image mappings - use gallery-structure.json
- ❌ Don't rewrite copy - use extracted .md files
- ❌ Don't add features not in original
- ❌ Don't "improve" the design

---

## VERIFICATION CHECKLIST

Before marking phase complete:

- [ ] Does it match original visually? (screenshot compare)
- [ ] Are all IDs identical to embeds?
- [ ] Is copy word-for-word from extracted content?
- [ ] Are images in exact same positions?
- [ ] Do interactions behave identically?

---

## NEXT ACTION

Start Phase 1: Build exact HTML frame using embeds as templates.
