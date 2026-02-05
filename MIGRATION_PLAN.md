# Paolo Mascatelli Website Migration Plan
## Squarespace → Webflow

**Target Site:** https://www.paolomascatelli.com
**Project Type:** Luxury Interior Photography Portfolio with E-commerce
**Location:** Miami, FL

---

## Executive Summary

This migration involves transferring a sophisticated portfolio site featuring custom navigation systems, interactive photo galleries, and e-commerce functionality from Squarespace to Webflow.

### Key Features to Migrate:
- Custom "Phantom Nav" navigation system
- Multi-category photo galleries with filtering
- Tenebre dual-mode toggle system
- E-commerce shopping cart
- Responsive grid layouts
- Contact forms and email signup
- Social media integrations

---

## Phase 1: Content Audit & Asset Collection

### 1.1 Content Inventory
**Pages to migrate:**
- Home (portfolio showcase)
- Projects (Tenebre collection catalog)
- Photography (film, DSLR, mirrorless galleries)
- Social Media
- FAQs
- Contact

**Categories for Photography:**
- Seat Styles
- Chandeliers
- Patio & Pool
- Bedrooms & Bathrooms
- Decorative Items
- Before/After

### 1.2 Asset Collection Strategy
Using Puppeteer to systematically download:
- All high-resolution images from galleries
- Product photos for e-commerce items
- Logo and branding assets
- Any video content
- PDF documents (if any)

**Automated Script Tasks:**
- Scrape all image URLs from the Squarespace site
- Download images with organized folder structure
- Extract alt text and captions
- Document image dimensions for optimization

---

## Phase 2: Webflow Project Setup

### 2.1 Design System Configuration

**Colors:**
- Primary Gold: `#d4af37`
- Accent Green: `#6fb886`
- Background: `#000000` (dark theme)
- Text colors and hierarchy

**Typography:**
- Document current font families from Squarespace
- Set up similar or matching fonts in Webflow
- Define heading styles (H1-H6)
- Body text and link styles
- Letter-spacing for navigation elements (uppercase)

**Breakpoints:**
- Mobile: 8-column grid
- Tablet: Adaptive
- Desktop: 24-column grid
- Large desktop: Optimized

### 2.2 Project Structure
```
├── Home
├── Projects
│   └── [CMS Collection Items]
├── Photography
│   ├── Film
│   ├── DSLR
│   └── Mirrorless
├── Social Media
├── FAQs
└── Contact
```

---

## Phase 3: CMS & Data Structure

### 3.1 CMS Collections

**Projects Collection:**
- Name (text)
- Description (rich text)
- Category (dropdown: Seat Styles, Chandeliers, etc.)
- Gallery Images (multi-image)
- Featured Image (image)
- Tenebre Mode (toggle)
- Slug (for URL)

**Photography Collection:**
- Title (text)
- Type (dropdown: Film, DSLR, Mirrorless)
- Image (image)
- Caption (text)
- Date (date)
- Featured (toggle)

**Store Products Collection** (if using Webflow E-commerce):
- Product details
- Images
- Pricing
- Inventory

### 3.2 Dynamic Content
- Set up CMS templates for project detail pages
- Configure collection lists for gallery displays
- Filter logic for category switching

---

## Phase 4: Layout & Component Development

### 4.1 Global Components

**Navigation System:**
- Recreate "Phantom Nav" with custom interactions
- Mobile hamburger menu
- Expandable dropdown menus
- Smooth animations and transitions

**Footer:**
- Location highlights (L.A., NYC, Miami)
- Social media links
- Contact information

**Announcement Bar:**
- Conditional display logic
- Custom messaging

### 4.2 Page-Specific Components

**Gallery Component:**
- Grid-based responsive layout
- Category filter buttons
- Lightbox functionality
- Lazy loading for performance

**Tenebre Toggle:**
- Custom toggle switch design
- State management for on/off modes
- Visual feedback with glow effects
- Synchronized gallery switching

**Contact Forms:**
- Email signup form
- Contact form with validation
- Integration with email service

---

## Phase 5: Custom Interactions & Animations

### 5.1 Navigation Animations
- Expand/collapse transitions
- Fade-in effects for menu items
- Hover states
- Click states with visual feedback

### 5.2 Gallery Interactions
- Category filter animations
- Image hover effects
- Smooth transitions between states
- Staggered animation delays

### 5.3 Toggle Animations
- Knob slide animation
- Glow effect transitions
- State change feedback

### 5.4 Page Load Effects
- Hero section animations
- Content fade-ins
- Scroll-based reveals

---

## Phase 6: E-commerce Setup

### 6.1 Webflow E-commerce Configuration
- Enable e-commerce plan
- Set up product catalog
- Configure shopping cart
- Payment gateway integration
- Shipping settings
- Tax configuration

### 6.2 Store Features
- Product pages with image galleries
- Add to cart functionality
- Cart indicator in navigation
- Checkout flow
- Order confirmation emails

---

## Phase 7: Integrations & Tracking

### 7.1 Analytics & Tracking
- Facebook Pixel (ID: AiPhlo)
- Google Analytics
- Conversion tracking

### 7.2 Third-Party Integrations
- Email marketing platform (for signup form)
- Social media feeds (Instagram: digital_graffiti_media_co)
- reCAPTCHA for form protection

### 7.3 SEO Configuration
- Meta titles and descriptions
- Open Graph tags
- Twitter Card data
- XML sitemap
- 301 redirects from old URLs
- Alt text for all images

---

## Phase 8: Testing & Quality Assurance

### 8.1 Functional Testing
- All navigation links
- Form submissions
- Gallery filtering
- Toggle functionality
- E-commerce cart and checkout
- Mobile menu behavior

### 8.2 Cross-Browser Testing
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

### 8.3 Responsive Testing
- Mobile devices (320px - 767px)
- Tablets (768px - 991px)
- Desktop (992px+)
- Large displays (1920px+)

### 8.4 Performance Testing
- Page load speeds
- Image optimization
- Code minification
- Lazy loading verification

---

## Phase 9: Deployment

### 9.1 Pre-Launch Checklist
- [ ] All content migrated and proofread
- [ ] All images optimized and uploaded
- [ ] Forms tested and connected
- [ ] E-commerce tested end-to-end
- [ ] Analytics and tracking verified
- [ ] SEO settings configured
- [ ] 301 redirects mapped
- [ ] SSL certificate ready
- [ ] Backup of Squarespace site

### 9.2 Domain Setup
- Configure DNS settings
- Point domain to Webflow
- Verify SSL certificate
- Test all subdomains

### 9.3 Launch
- Publish Webflow site
- Monitor for errors
- Test checkout flow in production
- Verify email notifications

---

## Technical Challenges & Solutions

### Challenge 1: Custom Navigation System
**Issue:** Squarespace has custom "Phantom Nav" JavaScript
**Solution:** Recreate using Webflow Interactions 2.0 with custom code if needed

### Challenge 2: Tenebre Toggle System
**Issue:** Complex dual-mode gallery switching
**Solution:** Use Webflow CMS filters + custom JavaScript for state management

### Challenge 3: Advanced Gallery Filtering
**Issue:** Multiple category filters with smooth transitions
**Solution:** Combine Webflow CMS filtering with custom interactions

### Challenge 4: E-commerce Migration
**Issue:** Existing cart/product data
**Solution:** Manual product setup in Webflow E-commerce, export customer data if needed

### Challenge 5: Custom Animations
**Issue:** Specific timing and stagger effects
**Solution:** Webflow Interactions 2.0 with custom CSS animations for advanced effects

---

## Tooling & Automation

### Puppeteer Scripts Needed:
1. **Image Scraper** - Download all images with metadata
2. **Content Extractor** - Pull text content from all pages
3. **URL Mapper** - Create redirect map for SEO
4. **Gallery Analyzer** - Document gallery structures and categories

### Webflow API Usage:
- Bulk CMS item creation (if available)
- Automated content population
- Collection management

---

## Timeline Estimate

**Note:** Actual timeline depends on content volume and complexity

1. Content Audit & Asset Collection: 2-3 days
2. Webflow Setup & Design System: 2-3 days
3. CMS Configuration: 1-2 days
4. Layout & Component Development: 5-7 days
5. Custom Interactions: 3-4 days
6. E-commerce Setup: 2-3 days
7. Integrations & Tracking: 1-2 days
8. Testing & QA: 2-3 days
9. Deployment: 1 day

**Total:** Approximately 3-4 weeks

---

## Next Steps

1. Start with automated content extraction using Puppeteer
2. Set up Webflow project with design system
3. Begin CMS collection structure
4. Iterative development with regular client reviews

---

## Resources & Documentation

- Webflow University (interactions, CMS, e-commerce tutorials)
- Webflow API Documentation
- Puppeteer Documentation for scraping
- Current Squarespace site export (if available)

---

**Last Updated:** 2026-01-24
