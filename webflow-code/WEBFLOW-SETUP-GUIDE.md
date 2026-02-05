# AiPhlo Webflow Integration Guide

This guide explains how to set up your Webflow template to work with the AiPhlo API.

---

## Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  AiPhlo API     │────▶│  Listener.js    │────▶│ Webflow Template│
│  (Your server)  │     │  (Embedded)     │     │  (data-slots)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. API serves JSON content
2. Listener script (embedded in Webflow) fetches content
3. Content populates Webflow elements via `data-` attributes

---

## Step 1: Deploy Your API

Run the deploy script:
```bash
./scripts/deploy.sh
```

You'll get a URL like: `https://aiphlo-api.up.railway.app`

---

## Step 2: Add Listener to Webflow

1. Open your Webflow project
2. Go to **Project Settings** → **Custom Code**
3. In the **Footer Code** section, paste:

```html
<script>
  // AiPhlo Config - UPDATE THESE
  window.AIPHLO_CONFIG = {
    API_URL: 'https://your-api.railway.app', // ← Your deployed API URL
    SITE_KEY: 'aiphlo-demo',
    DEBUG: true // Set false in production
  };
</script>
<script src="https://your-api.railway.app/template/aiphlo-listener.js"></script>
```

Or paste the full listener script directly (from `webflow-code/aiphlo-listener.js`).

---

## Step 3: Structure Your Webflow Elements

The listener uses `data-` attributes to know where to put content.

### Basic Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `data-block="id"` | Marks a content block | `data-block="hero"` |
| `data-slot="name"` | Marks where content goes | `data-slot="headline"` |
| `data-slot-type="type"` | Content type (text/image/html/link) | `data-slot-type="image"` |
| `data-repeater="name"` | Container for repeated items | `data-repeater="menu"` |
| `data-template` | Template for repeated items | (hidden by default) |

### Adding Custom Attributes in Webflow

1. Select an element
2. Open Settings panel (gear icon)
3. Scroll to **Custom Attributes**
4. Click **+** to add attribute

---

## Step 4: Build Your Blocks

### Navigation Block

```html
<!-- Webflow structure -->
<nav data-block="nav">
  <img data-slot="logo" data-slot-type="image" src="placeholder.png">

  <div data-repeater="menu">
    <!-- Template item (will be cloned for each menu item) -->
    <a data-template data-slot="url" data-slot-type="link" style="display:none">
      <span data-slot="text"></span>
    </a>
  </div>
</nav>
```

**In Webflow Designer:**
1. Add a Navbar or Section, set custom attribute: `data-block` = `nav`
2. Add an Image, set: `data-slot` = `logo`, `data-slot-type` = `image`
3. Add a Div for menu, set: `data-repeater` = `menu`
4. Inside, add a Link Block, set: `data-template`, `data-slot` = `url`, `data-slot-type` = `link`
5. Inside link, add Text, set: `data-slot` = `text`
6. Hide the template link (display: none)

---

### Hero Block

```html
<section data-block="hero">
  <div data-slot="background" data-slot-type="image" class="hero-bg"></div>
  <h1 data-slot="headline"></h1>
  <p data-slot="subhead"></p>
  <p data-slot="body"></p>
  <a data-slot="cta.url" data-slot-type="link">
    <span data-slot="cta.text"></span>
  </a>
</section>
```

**In Webflow Designer:**
1. Add a Section, set: `data-block` = `hero`
2. Add background Div, set: `data-slot` = `background`, `data-slot-type` = `image`
3. Add H1, set: `data-slot` = `headline`
4. Add Paragraph for subhead, set: `data-slot` = `subhead`
5. Add Paragraph for body, set: `data-slot` = `body`
6. Add Link Block, set: `data-slot` = `cta.url`, `data-slot-type` = `link`
7. Inside link, add Text, set: `data-slot` = `cta.text`

---

### Gallery Block (Tenebre style)

```html
<section data-block="tenebre">
  <img data-slot="logo" data-slot-type="image">

  <div data-repeater="items" class="gallery-grid">
    <!-- Template item -->
    <div data-template class="gallery-item" style="display:none">
      <img data-slot="image" data-slot-type="image">
      <span data-slot="title"></span>
      <span data-slot="price"></span>
    </div>
  </div>
</section>
```

---

### Photography Grid

```html
<section data-block="photography-grid">
  <h2 data-slot="title"></h2>

  <div data-repeater="images" class="photo-grid">
    <div data-template class="photo-item" style="display:none">
      <img data-slot="src" data-slot-type="image">
      <span data-slot="caption"></span>
    </div>
  </div>
</section>
```

---

### FAQ Block

```html
<section data-block="faqs">
  <h2 data-slot="title"></h2>

  <div data-repeater="items" class="faq-list">
    <div data-template class="faq-item" style="display:none">
      <div class="faq-question" data-slot="question"></div>
      <div class="faq-answer" data-slot="answer" data-slot-type="html"></div>
    </div>
  </div>
</section>
```

---

### Contact Block

```html
<section data-block="contact">
  <h1 data-slot="headline"></h1>
  <p data-slot="intro" data-slot-type="html"></p>

  <div class="contact-details">
    <a data-slot="email" data-slot-type="link"></a>
    <a data-slot="phone" data-slot-type="link"></a>
  </div>

  <div data-slot="address" data-slot-type="html"></div>
</section>
```

---

## Step 5: Test Your Setup

1. Publish your Webflow site
2. Open browser console (F12)
3. Look for `[AiPhlo]` log messages
4. Check that content is populated

### Debugging

If content isn't loading:
1. Check console for errors
2. Verify API URL is correct
3. Ensure `data-block` IDs match your JSON
4. Check `data-slot` names match your content structure

Enable debug mode:
```javascript
window.AIPHLO_CONFIG.DEBUG = true;
```

---

## API Content Structure

Your API returns content in this format:

```json
{
  "title": "Page Title",
  "blocks": [
    {
      "id": "hero",
      "slots": {
        "headline": "Welcome",
        "subhead": "Subtitle here",
        "body": "Body text...",
        "background": "https://example.com/image.jpg",
        "cta": {
          "text": "Learn More",
          "url": "/about"
        }
      }
    },
    {
      "id": "gallery",
      "slots": {
        "title": "Our Work",
        "items": [
          { "image": "img1.jpg", "title": "Project 1" },
          { "image": "img2.jpg", "title": "Project 2" }
        ]
      }
    }
  ]
}
```

---

## Quick Reference

| What you want | Webflow attribute |
|--------------|-------------------|
| Mark a section as a block | `data-block="blockname"` |
| Fill text content | `data-slot="fieldname"` |
| Fill image src | `data-slot="fieldname"` + `data-slot-type="image"` |
| Fill link href | `data-slot="fieldname"` + `data-slot-type="link"` |
| Fill HTML content | `data-slot="fieldname"` + `data-slot-type="html"` |
| Container for repeated items | `data-repeater="arrayname"` |
| Template for repeated items | `data-template` (hide with CSS) |
| Nested content | `data-slot="parent.child"` |

---

## Need Help?

1. Check the console for `[AiPhlo]` messages
2. Verify your JSON structure matches your template
3. Test API endpoint directly: `curl -X POST your-api/v1/populate -H "Content-Type: application/json" -d '{"site_key":"aiphlo-demo","page":"/"}'`
