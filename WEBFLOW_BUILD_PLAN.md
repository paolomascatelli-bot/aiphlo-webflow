# AiPhlo Webflow Template - Build Plan

**Purpose:** High-end luxury Webflow marketplace template showcasing AiPhlo brand navigation systems
**Target:** Luxury brands, photographers, boutique e-commerce
**Key Feature:** Shoppable galleries with custom navigation systems

---

## Design System Implementation

### Brand Colors
```
Primary Gold: #d4af37
Accent Green: #6fb886
Base Black: #000000
Base White: #ffffff
```

### Typography
**Primary Fonts:**
- Headings: Manrope (Google Fonts)
- Body: Nunito Sans (Google Fonts)

**Type Scale:**
- H1: 85px / Weight 500 / Line Height 1.056 / Letter Spacing -1.7px
- H2: 44px / Weight 500 / Line Height 1.2 / Letter Spacing -0.87px
- H3: 16px / Weight 600 / Line Height 1.142 / Letter Spacing 3px / Uppercase
- Body: 16px / Weight 400 / Line Height 1.6

---

## Page Structure

### 1. Home (Landing/Sales Page)
**Purpose:** Showcase AiPhlo navigation products

**Sections:**
- Hero with animated headline
- Value proposition
- Navigation system showcase (4 types)
- Scrollable/shoppable gallery upgrade section
- Three-step process
- Feature grid
- Pricing tiers (Studio/Pro/Agency)
- FAQ accordion
- Footer with email signup

### 2. Projects
**Purpose:** Demonstrate custom navigation with project showcase

**Features:**
- **Tenebre Toggle System** - Dual-mode switching
- Page-specific navigation filters
- Project cards with hover states
- Custom animations

**Content Projects:**
- AiPhlo Development
- Tenebre Project
- CPI Branding
- Digital Graffiti Media

### 3. Photography (Galleries)
**Purpose:** Visual storytelling with category filtering

**Categories:**
- Fashion Editorial
- Portraits & Headshots
- Outdoor Lifestyle
- Lifestyle Fashion
- Fashion Boudoir

**Features:**
- Category filter buttons
- Lightbox gallery
- Grid layout with lazy loading
- **IMPORTANT:** Make galleries shoppable (Webflow E-commerce integration)

### 4. Contact
- Contact form
- Location badges (L.A., NYC, Miami)
- Email signup integration

---

## Key Webflow Components to Build

### 1. Site-Wide Navigation System
**Features:**
- Sticky/fixed positioning
- Transparent background with backdrop blur
- Mobile hamburger menu
- Smooth transitions
- Custom logo placement

**Navigation Items:**
- Home
- Projects
- Photography
- Contact

**Build Approach:**
- Use Webflow native Navbar component
- Custom interactions for smooth open/close
- Mobile menu with slide-in animation

### 2. Tenebre Toggle System
**What it is:** Custom dual-mode switcher for project galleries

**Design:**
- Toggle switch with knob animation
- "OFF/ON" labels
- Smooth slide transition
- State management switches entire gallery view
- Glow effect on active state

**Build Approach:**
- Custom toggle component (div blocks styled as switch)
- Webflow CMS filters tied to toggle state
- IX2 interactions for smooth transitions
- Use CSS for glow effects (box-shadow with brand colors)

### 3. Page-Specific Navigation (Filter Buttons)
**Projects Page:**
- Project category filters
- Active state styling (gold underline/highlight)
- Smooth filter animations

**Photography Page:**
- Gallery category buttons
- Horizontal button row
- Active state indicators

**Build Approach:**
- Webflow CMS filter buttons
- Custom button styling with hover states
- Use Webflow native filter/sort functionality

### 4. Shoppable Gallery System
**CRITICAL FEATURE:** Galleries must support e-commerce

**Requirements:**
- Each gallery item can link to product
- Add to cart functionality
- Price display on hover
- Quick view modal option
- Works with Webflow E-commerce

**Build Approach:**
- Create CMS collection: "Gallery Products"
  - Image
  - Title
  - Description
  - Price
  - Category (for filtering)
  - Link to Product (Webflow E-commerce item)
  - Featured toggle
- Use Webflow E-commerce products linked to gallery items
- Custom lightbox with product details + Add to Cart button
- Grid layout with hover effects revealing price/CTA

### 5. Pricing Tiers Section
**Three Tiers:**
- Studio ($497)
- Pro ($997) - "Most Popular" badge
- Agency ($1,997)

**Each Card Includes:**
- Price
- Feature list
- CTA button
- Highlight styling for "Most Popular"

**Build Approach:**
- 3-column grid (responsive to 1-column mobile)
- Custom styling for "Most Popular" card (green glow)
- Interactive hover states (lift effect)

### 6. FAQ Accordion
**Features:**
- Expand/collapse functionality
- Smooth animations
- Plus/minus icon toggle
- Mobile-friendly

**Build Approach:**
- Webflow native Accordion component
- Custom styling to match brand
- IX2 for smooth expand/collapse

---

## Animations & Interactions (IX2)

### 1. Hero Section
- Fade in on page load
- Staggered text reveals
- CTA button pulse effect

### 2. Navigation
- Smooth expand/collapse (mobile menu)
- Fade in menu items with stagger
- Hover state animations (underline expand)

### 3. Tenebre Toggle
**Animation Name:** `tenebreButtonFadeIn` (0.8s ease)
- Knob slide animation (200ms)
- Glow effect transition (300ms)
- Label fade (150ms)

### 4. Filter Buttons
- Active state gold underline expands from center
- Hover lift effect (2px translate Y)
- Color transition (200ms)

### 5. Gallery Grid
- Cards fade in on scroll (Intersection Observer)
- Hover scale (1.02x)
- Image overlay fade in on hover
- Price/CTA slide up from bottom

### 6. Pricing Cards
- Hover lift effect (8px translate Y)
- Shadow increase on hover
- "Most Popular" badge pulse

---

## CMS Collections Structure

### Collection 1: Projects
**Fields:**
- Name (Plain Text)
- Description (Rich Text)
- Category (Option: AiPhlo, Tenebre, CPI, etc.)
- Featured Image (Image)
- Gallery Images (Multi-Image)
- Tenebre Mode (Switch) - Controls which toggle view shows this
- Client Name (Plain Text)
- Project URL (Link)
- Order (Number)
- Slug (auto-generated)

### Collection 2: Photography Gallery
**Fields:**
- Title (Plain Text)
- Image (Image)
- Category (Option: Fashion Editorial, Portraits, Outdoor Lifestyle, etc.)
- Caption (Plain Text)
- Location (Plain Text)
- **Product Link (Reference to E-commerce Product)** ← CRITICAL
- **Price (Number)** - If shoppable
- **Shoppable (Switch)** - Toggle if item can be purchased
- Featured (Switch)
- Order (Number)

### Collection 3: E-commerce Products (Webflow E-commerce)
**For shoppable gallery items:**
- Product Name
- Price
- Images
- Description
- Category
- SKU
- Inventory
- Variant options (if needed)

**Link Strategy:**
- Photography Gallery items reference E-commerce Products
- Clicking gallery item can:
  - Open lightbox with product details + "Add to Cart"
  - Link directly to product page
  - Both options available based on user preference

### Collection 4: FAQs
**Fields:**
- Question (Plain Text)
- Answer (Rich Text)
- Category (Option)
- Order (Number)

---

## Webflow E-commerce Setup

### Enable E-commerce Plan
Required for shoppable galleries

### Product Structure
**Sample Products:**
- Navigation System Templates (if selling the nav systems)
- Photography Prints (for photography gallery)
- Digital Downloads
- Services/Consultations

### Shopping Cart
- Custom styled cart icon in navigation
- Mini cart dropdown (optional)
- Full cart page
- Checkout flow with Webflow's native system

### Payment Integration
- Stripe (Webflow default)
- PayPal (optional)
- Apple Pay / Google Pay

---

## Template Customization Features
**For Webflow Marketplace Requirements:**

### 1. Style Guide Page
Create a dedicated page showing:
- All color swatches (easy to swap)
- Typography examples
- Button styles
- Component library

### 2. Client Instructions
Include a "Getting Started" page with:
- How to swap colors
- How to add products
- How to customize navigation
- How to add gallery items

### 3. Symbol Components
Create reusable symbols for:
- Navigation
- Footer
- CTA buttons
- Gallery cards
- Pricing cards

### 4. CMS Templates
Pre-populate with dummy content so buyers can see structure

### 5. Utility Classes
Create custom classes for:
- Brand colors (`.text-gold`, `.bg-gold`, etc.)
- Spacing utilities
- Typography utilities

---

## Mobile Responsive Strategy

### Breakpoints
- Desktop: 992px+
- Tablet: 768px - 991px
- Mobile Landscape: 480px - 767px
- Mobile Portrait: < 479px

### Mobile Optimizations
1. **Navigation:**
   - Full-screen mobile menu
   - Hamburger icon (animated to X)
   - Touch-friendly button sizes (min 44px)

2. **Gallery:**
   - Single column on mobile
   - Swipe-enabled if possible (custom code)
   - Larger tap targets for filters

3. **Tenebre Toggle:**
   - Larger toggle switch (easier to tap)
   - Labels remain visible

4. **Pricing:**
   - Stack cards vertically
   - Increase padding for touch

5. **Typography:**
   - H1: 48px (mobile)
   - H2: 32px (mobile)
   - Body: 14px (mobile)

---

## Performance Optimization

### Images
- Use Webflow's responsive images
- Lazy loading enabled
- Compress all uploaded images
- Use WebP format where possible

### Code
- Minimize custom code
- Defer non-critical JavaScript
- Use CSS animations over JavaScript when possible

### Loading Strategy
- Critical CSS inline
- Async load Google Fonts
- Lazy load images below fold

---

## SEO Considerations

### Page Meta
- Unique title tags for each page
- Meta descriptions (150-160 characters)
- OG images for social sharing
- Structured data (JSON-LD) for products

### Headings Hierarchy
- One H1 per page
- Logical H2-H6 structure
- Keywords in headings

### Alt Text
- All images have descriptive alt text
- Decorative images have empty alt=""

---

## Build Order / Implementation Steps

### Phase 1: Foundation (Day 1-2)
1. Create Webflow project
2. Set up design system (colors, fonts, typography classes)
3. Build global navigation
4. Build footer
5. Create style guide page

### Phase 2: Home Page (Day 3-4)
6. Hero section with animations
7. Navigation showcase section
8. Pricing tiers
9. FAQ accordion
10. Email signup form integration

### Phase 3: CMS Setup (Day 5)
11. Create Projects collection
12. Create Photography collection
13. Enable Webflow E-commerce
14. Create Products collection
15. Populate with sample content

### Phase 4: Projects Page (Day 6-7)
16. Build Tenebre toggle system
17. Project grid layout
18. Filter functionality
19. Animations and hover states
20. Mobile responsive adjustments

### Phase 5: Photography Page (Day 8-9)
21. Gallery grid with CMS
22. Category filter buttons
23. Shoppable lightbox integration
24. Add to cart functionality
25. Mobile swipe (if custom code allowed)

### Phase 6: E-commerce (Day 10)
26. Product page templates
27. Shopping cart styling
28. Checkout flow customization
29. Test purchase flow

### Phase 7: Interactions (Day 11)
30. Page load animations
31. Scroll-triggered animations
32. Hover effects
33. Mobile menu animations
34. Tenebre toggle animations

### Phase 8: Polish & Testing (Day 12-14)
35. Cross-browser testing
36. Mobile testing (all devices)
37. Performance optimization
38. SEO setup
39. Accessibility audit
40. Client instructions documentation

---

## Questions for Confirmation

Before we build, I need clarification on:

### 1. Shoppable Gallery Details
- **What products will be sold?** (Prints, navigation templates, services?)
- **Price range?**
- **Do you want direct "Add to Cart" in gallery, or click to product page?**
- **Variants needed?** (sizes, colors, etc.)

### 2. Content Strategy
- **Will you provide actual content or use placeholder content?**
- **How many projects to showcase?** (Currently have 4)
- **How many photography gallery items?**

### 3. Webflow Plan
- **Do you already have a Webflow account with E-commerce enabled?**
- **Target: Webflow marketplace template or custom client site?** (Different requirements)

### 4. Custom Code
- **Are you comfortable with custom CSS/JS if needed for advanced features?**
- **Tenebre toggle: Pure Webflow or allow custom code for smoother UX?**

### 5. Timeline
- **Target launch date?**
- **Build in phases or all at once?**

---

## Next Steps

Once you confirm the above questions, we can:

1. **Set up Webflow project immediately**
2. **Start with design system + navigation** (foundation)
3. **Build home page** (showcase AiPhlo products)
4. **Implement shoppable galleries** (core feature)
5. **Add custom interactions** (Tenebre toggle, animations)
6. **Optimize for marketplace** (if selling as template)

Would you like to proceed with the build now, or do you need time to review and answer the questions?
