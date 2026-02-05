# AiPhlo Documentation Index

## Quick Links

| Document | Purpose |
|----------|---------|
| [EXTRACTION_PROTOCOL.md](EXTRACTION_PROTOCOL.md) | **Phase 0-6 extraction workflow + backup procedures** |
| [UX_ASSISTANT_PROMPTS.md](UX_ASSISTANT_PROMPTS.md) | Ready-to-use scripts for user communication |
| [MIGRATION_PROTOCOLS.md](MIGRATION_PROTOCOLS.md) | Technical protocols for common issues |
| [PRODUCT_ARCHITECTURE.md](PRODUCT_ARCHITECTURE.md) | Service tiers + Directed Procedure system |
| [webflow-code/INJECTION-GUIDE.md](webflow-code/INJECTION-GUIDE.md) | Webflow code injection instructions |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AIPHLO MIGRATION FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SQUARESPACE          EXTRACTION           AIPHLO API       │
│  ┌─────────┐         ┌─────────┐         ┌─────────┐       │
│  │  Live   │ ──────► │ Scraper │ ──────► │ Content │       │
│  │  Site   │         │ Scripts │         │  JSON   │       │
│  └─────────┘         └─────────┘         └─────────┘       │
│       │                   │                   │              │
│       ▼                   ▼                   ▼              │
│  ┌─────────┐         ┌─────────┐         ┌─────────┐       │
│  │ Images  │ ──────► │ Assets  │ ◄────── │  API    │       │
│  │ Videos  │         │ Folder  │         │ Server  │       │
│  └─────────┘         └─────────┘         └─────────┘       │
│                                               │              │
│                                               ▼              │
│                                          ┌─────────┐       │
│                                          │Template │       │
│                                          │ Render  │       │
│                                          └─────────┘       │
│                                               │              │
│                      UX ASSISTANT            ▼              │
│                      ┌─────────┐         ┌─────────┐       │
│                      │ Review  │ ◄────── │Migrated │       │
│                      │ & Fix   │         │  Site   │       │
│                      └─────────┘         └─────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Scripts Reference

### Phase 0: Discovery (RUN FIRST)
| Script | Purpose | Command |
|--------|---------|---------|
| `sitemap-discovery.cjs` | **Find ALL pages + flag unlinked** | `node scripts/sitemap-discovery.cjs {url}` |

### Extraction Scripts
| Script | Purpose | Command |
|--------|---------|---------|
| `comprehensive-page-audit.cjs` | Full site audit with screenshots | `node scripts/comprehensive-page-audit.cjs` |
| `scrape-images.js` | Download all images | `node scripts/scrape-images.js` |
| `scrape-videos.js` | Extract video URLs | `node scripts/scrape-videos.js` |
| `analyze-galleries.js` | Extract gallery structure | `node scripts/analyze-galleries.js` |
| `extract-content.js` | Extract text content | `node scripts/extract-content.js` |

### Generation Scripts
| Script | Purpose | Command |
|--------|---------|---------|
| `generate-content.js` | Generate content JSON | `node scripts/generate-content.js` |

### Server
| Script | Purpose | Command |
|--------|---------|---------|
| `api/server.js` | Run API server | `node api/server.js` |

---

## Content JSON Structure

```
api/content/
├── home.json        # Home page blocks
├── photography.json # Photography galleries + nav
├── socialmedia.json # Campaign data + videos
├── projects.json    # Project cards
├── faqs.json        # FAQ accordions
└── contact.json     # Contact info + form
```

### Block Types
- `nav` - Site navigation
- `hero` - Page hero section
- `photo-nav` - Photography pill navigation + galleries
- `campaigns` - Social media campaign buttons + content
- `projects` - Project grid
- `faqs` - FAQ accordions
- `contact` - Contact information
- `footer` - Site footer

---

## Common Issues & Solutions

| Issue | Solution | Documentation |
|-------|----------|---------------|
| Video not captured | User downloads from SQS | [MIGRATION_PROTOCOLS.md#hidden-video](MIGRATION_PROTOCOLS.md) |
| Images wrong order | Re-run with gallery-structure.json | [MIGRATION_PROTOCOLS.md#image-order](MIGRATION_PROTOCOLS.md) |
| Missing content | Check extraction filters | [MIGRATION_PROTOCOLS.md#missing-content](MIGRATION_PROTOCOLS.md) |
| Style mismatch | Extract CSS variables | [MIGRATION_PROTOCOLS.md#css-mismatch](MIGRATION_PROTOCOLS.md) |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/populate` | POST | Get page content |
| `/health` | GET | Server health check |
| `/assets/*` | GET | Serve static assets |

### POST /v1/populate
```json
{
  "site_key": "aiphlo-demo",
  "page": "/photography"
}
```

---

## CSS Variables

```css
/* Brand Colors */
--aiphlo-gold: #d4af37
--aiphlo-green: #6fb886
--aiphlo-black: #000000
--pm-active-text: #c02428

/* Animation Timings */
--timing-photo-section: 1.13s
--timing-social-vyayama: 1.75s
--timing-social-victoria: 1.0s
--timing-tenebre-gallery: 2.0s
```

---

## File Naming Conventions

### Images
```
{page}_{index}_{original-filename}.{ext}
Example: photography_242_DSC_1311.JPG
```

### Videos
```
{campaign}-video.mp4
Example: victoria-video.mp4
```

---

## Testing

```bash
# Test API health
curl http://localhost:3001/health

# Test page content
curl -X POST http://localhost:3001/v1/populate \
  -H "Content-Type: application/json" \
  -d '{"site_key":"aiphlo-demo","page":"/photography"}'

# Test image serving
curl -I http://localhost:3001/assets/images/logo.png
```

---

## Deployment Checklist

- [ ] All content JSON files generated
- [ ] All images downloaded to `/assets/images/`
- [ ] All videos downloaded to `/assets/videos/`
- [ ] API server tested locally
- [ ] All pages render correctly
- [ ] Mobile responsive verified
- [ ] UX review completed with user
