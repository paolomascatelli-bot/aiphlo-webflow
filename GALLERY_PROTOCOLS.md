gr# AiPhlo Gallery Migration Protocols

## Core Principle
**Autonomous extraction → Chat-based customization → Remote client control**

The tool should:
1. Get as close as possible autonomously
2. Offer chat/voice-based redesign options where automation can't match exactly
3. Allow clients to make changes remotely without login/hands-on access

---

## Gallery Type Detection

### Social Media Galleries

| Type | Layout | Use Case | Detection |
|------|--------|----------|-----------|
| **Vertical Phone Mockups** | Instagram-style phone frames, horizontal scroll | Social posts, stories, vertical content | Images with portrait aspect ratio (< 0.8) |
| **Horizontal Slideshow** | Full-width images, prev/next navigation | Landscape photos, campaign imagery | Images with landscape aspect ratio (> 1.2) |
| **Mixed Gallery** | Adaptive based on content | Varied content types | Mixed aspect ratios |

### Key Learning: Victoria vs Vyayama
- **Vyayama**: Vertical Instagram-style posts → Phone mockup gallery ✅
- **Victoria**: Horizontal slideshow content → Should NOT use phone mockups
- **Protocol**: Detect original gallery layout type and replicate, don't force uniform style

---

## Extraction Protocol

### Phase 1: Autonomous Extraction
1. Extract gallery structure (sections, IDs, relationships)
2. Extract images per section (not page-wide)
3. Detect gallery layout type (slideshow vs grid vs masonry vs phone mockups)
4. Detect image aspect ratios to inform layout decisions
5. Map to local assets where available

### Phase 2: Layout Detection
```
For each gallery:
  1. Analyze original site's gallery container classes
  2. Check for slideshow indicators (arrows, counters, autoplay)
  3. Check for grid indicators (columns, masonry)
  4. Check image aspect ratios (portrait vs landscape vs square)
  5. Store layout metadata with extraction
```

### Phase 3: Chat-Based Customization
When autonomous extraction can't perfectly match:
- Offer options: "Would you like [Option A] or [Option B]?"
- Let client choose via chat/voice
- Apply changes remotely without requiring login

---

## Layout Metadata Schema

```json
{
  "galleryId": "vyayama",
  "layoutType": "phone-mockups",
  "aspectRatio": "portrait",
  "scrollDirection": "horizontal",
  "features": {
    "phoneBezels": true,
    "notch": true,
    "homeIndicator": true
  },
  "background": {
    "color": "#ffffff",
    "fullWidth": true
  }
}
```

---

## Known Customization Points

These are aspects where chat-based client input may be needed:

| Aspect | Issue | Client Option |
|--------|-------|---------------|
| **Background sizing** | Full-width vs contained | "Would you like full-width white backdrop?" |
| **Gallery layout** | Phone mockups vs slideshow | "Your original used [X], would you like to keep it or try [Y]?" |
| **Image cropping** | Aspect ratio mismatch | "Some images are landscape, crop to portrait or show as-is?" |
| **Navigation style** | Pills vs cards vs tabs | "How would you like to navigate between galleries?" |
| **Mixed aspect ratios** | Gallery has both portrait & landscape | "Your gallery has mixed sizes. Show at natural size or crop to uniform?" |

---

## Mixed Aspect Ratio Rule

**Protocol**: When a gallery contains both portrait AND landscape images:

1. **Detection**: During extraction, analyze image dimensions
2. **Classification**:
   - All portrait (ratio < 0.8) → `phone-mockups` layout
   - All landscape (ratio > 1.2) → `horizontal-slideshow` with 16:9 viewport
   - Mixed ratios → `horizontal-slideshow` with **adaptive viewport**
3. **Adaptive Viewport**: Uses `object-fit: contain` with flexible aspect ratio
4. **Client Option**: Ask if they want uniform cropping or natural sizing

```javascript
// Detection logic
function detectAspectMix(images) {
  let hasPortrait = false;
  let hasLandscape = false;

  images.forEach(img => {
    const ratio = img.width / img.height;
    if (ratio < 0.8) hasPortrait = true;
    if (ratio > 1.2) hasLandscape = true;
  });

  return {
    isMixed: hasPortrait && hasLandscape,
    dominant: hasLandscape ? 'landscape' : 'portrait'
  };
}
```

---

## AiPhlo Unique Features

### Phantom Nav
- **Purpose**: Navigation that pushes content down instead of floating over it
- **Behavior**: When nav opens, secondary navs and content shift down - never overlapping
- **Principle**: "Optimal control, never hiding or blocking"
- **Implementation**: Use `position: relative` with dynamic height, not `position: fixed` overlay

### Floating Navs with Lift
- **Purpose**: Navigation elements that float above page content with visual depth
- **Behavior**:
  - Site-wide nav: `position: fixed`, top-left, z-index: 999999
  - Campaign cards: `position: sticky`, top: 80px (below site nav), z-index: 9990
  - Both have `box-shadow` for visual "lift" effect
- **Interactions**:
  - Hover: Cards elevate further (translateY + deeper shadow)
  - Active: Red glow accent, maintained lift
  - Scroll: Cards stay visible above gallery content
- **CSS Key Properties**:
  ```css
  .pm-campaign-cards {
    position: sticky;
    top: 80px;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  }
  ```

### Phone Mockup Gallery (Vyayama-style)
- **Purpose**: Display social media posts in Instagram-style phone frames
- **Best for**: Vertical content, social media campaigns, influencer work
- **Components**:
  - Phone frame with notch
  - 9:16 aspect ratio screen
  - Home indicator
  - Horizontal scroll track
- **Note**: This is an AiPhlo product feature, not a Squarespace replication

---

## Autonomous Build Goals

Continue pushing toward full automation:
1. ✅ Section-aware image extraction
2. ✅ Gallery-to-image relationship mapping
3. ✅ Multiple extraction source merging (v4 + missing)
4. 🔄 Layout type detection (in progress)
5. ⬜ Aspect ratio analysis for layout decisions
6. ⬜ Background/styling extraction
7. ⬜ Automatic gallery type selection based on content

---

## Milestone: Round One Complete

**Grade: B (Shippable)**

**Status**: Auto-build infrastructure functional. Client-facing build ready for review.

**What's Working**:
- ✅ Automated Squarespace extraction (section-aware)
- ✅ Gallery-to-image relationship mapping
- ✅ Multiple layout types (phone mockups, horizontal slideshow)
- ✅ Floating navs with visual lift
- ✅ Mixed aspect ratio support
- ✅ Full-width background options
- ✅ Page title without hero

**Client Refinement Model**:
At this stage, if a client sees differences from their original site, they can:
1. **Speak or type** the change request
2. **AI guidance** helps identify the exact modification
3. **Changes executed** on command

**Path to A+**:
- Interactive interface for design changes
- Client subscription model
- Real-time preview of modifications
- All nuances auto-detected or prompted

---

## Session Notes

**Date**: 2026-02-03

**Resolved**:
- lifestyle-fashion: 11 images extracted and displaying
- victoria: 6 unique images (different from vyayama)
- All 5 photography galleries working
- Both social media campaigns showing unique content

**Feedback**:
- Vyayama phone mockup style = good, keep as product feature
- Victoria needs horizontal slideshow, not phone mockups
- White background needs to be full-width
- Product should offer chat-based customization for layout choices

**Next**:
- Implement gallery layout type detection
- Create alternative renderer for horizontal slideshows
- Add background sizing options
- Build chat interface for customization options
