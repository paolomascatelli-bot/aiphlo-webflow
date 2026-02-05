# AiPhlo Migration Protocols

## Protocol: Hidden/Unpublished Video Assets

### Situation
During automated extraction, some video assets may not be captured because they exist in the Squarespace backend but are not rendered on the public-facing page. This occurs when:

1. **Section is unpublished** - The video exists in a section marked as "hidden" or "draft"
2. **Video block is not live** - The video is uploaded but the containing block isn't published
3. **Conditional visibility** - The video only appears after user interaction that our scraper doesn't trigger
4. **Member-only content** - The video is behind a login/paywall

### Detection
The migration tool will flag this when:
- A page has `videoSourceProvider: "none"` in its config but visual inspection shows video content
- The scraper finds 0 videos but page metadata references video content
- User reports missing video during migration review

### UX Assistant Script

**When user reports missing video:**

> "I see you have a video that wasn't captured during extraction. This happens when the video exists in your Squarespace editor but isn't published to the live page.
>
> **Let's get that video transferred. You have two options:**
>
> **Option 1: Download from Squarespace (Recommended)**
> 1. Open your Squarespace editor
> 2. Navigate to the page with the video
> 3. Click on the video block
> 4. Look for a download icon or right-click the video preview
> 5. Save the file (it will be named something like `AJD.mp4`)
> 6. Upload it to your migration folder
>
> **Option 2: Get the Squarespace URL**
> 1. In Squarespace, go to **Settings → Advanced → Files**
> 2. Find your video file in the asset library
> 3. Click to get the direct URL (looks like `https://static1.squarespace.com/static/.../*.mp4`)
> 4. Share that URL with me
>
> Once you provide the file or URL, I'll integrate it into your migrated site automatically."

### Technical Resolution

When video file/URL is obtained:

```bash
# If file is provided:
1. Place in: /assets/videos/{campaign-name}-video.mp4
2. Update content JSON:
   "video": {
     "src": "http://localhost:3001/assets/videos/{filename}.mp4",
     "poster": "...",
     "description": "..."
   }

# If URL is provided:
1. Download: curl -o assets/videos/{name}.mp4 "{squarespace-url}"
2. Update content JSON with local path
```

### Prevention

To minimize this issue for future migrations:

1. **Pre-migration checklist** - Ask user to verify all sections are published
2. **Video inventory** - Request user provide list of pages with video content
3. **Authenticated scraping** - If user provides Squarespace credentials, scraper can access unpublished content (future feature)

---

## Protocol: Image Order Mismatch

### Situation
Images appear in galleries but in wrong positions compared to original site.

### Cause
- Squarespace gallery structure not properly parsed
- Image indices not preserved during extraction
- Duplicate images causing offset

### Resolution
1. Use `gallery-structure.json` for exact image ordering
2. Map images by original Squarespace URL → local path
3. Sort by `index` field from extraction
4. Deduplicate by normalized URL before sorting

### UX Assistant Script

> "The images are showing but not in the right order. This is a mapping issue I can fix.
>
> **Quick question:** Are the images completely wrong, or just slightly shuffled?
>
> - **Completely wrong:** I'll re-run the gallery structure extraction
> - **Slightly shuffled:** I'll adjust the sort order based on the original site"

---

## Protocol: Missing Campaign/Gallery Content

### Situation
A campaign button or gallery category exists but has no images.

### Cause
- Images filtered out by logo/size detection
- Campaign not present in gallery-structure.json
- Dynamic content loaded via JavaScript not captured

### Resolution
1. Check `image-metadata.json` for page-specific images
2. Adjust filter criteria to be more permissive
3. Manual image assignment if automated mapping fails

### UX Assistant Script

> "I see the campaign button but no images are loading. Let me check what's available.
>
> **Can you tell me:**
> 1. How many images should be in this campaign?
> 2. Are they the same images as another section, or unique?
>
> This helps me locate and assign them correctly."

---

## Protocol: CSS/Styling Mismatch

### Situation
Colors, fonts, or layouts don't match original site.

### Cause
- CSS extraction missed specific selectors
- Squarespace uses dynamic class names
- Custom CSS in code injection blocks

### Resolution
1. Extract CSS from code injection blocks
2. Map Squarespace CSS variables to template variables
3. Manual override in `pages.css` for specific elements

### UX Assistant Script

> "The styling looks different from your original. I can match it more closely.
>
> **What's off?**
> - Colors (buttons, backgrounds, text)
> - Fonts (headings, body text)
> - Spacing/Layout
>
> Point me to the specific elements and I'll pull the exact styles from your Squarespace site."

---

## Protocol: Navigation Behavior Mismatch

### Situation
Secondary nav (photo pills, campaign buttons) doesn't behave like original.

### Cause
- Animation timings different
- Toggle states not matching
- Scroll behaviors not replicated

### Resolution
1. Check `--timing-*` CSS variables
2. Review JS interaction handlers
3. Compare with `INJECTION-GUIDE.md` timing reference

### UX Assistant Script

> "The navigation isn't behaving quite right. Let me tune it.
>
> **What's the issue?**
> - Too fast/slow on transitions
> - Click behavior wrong (should toggle vs. select)
> - Scroll effects missing
>
> I'll adjust the animation timing and interaction logic to match."

---

## Escalation Path

If UX assistant cannot resolve:

1. **Log the issue** with screenshots and extracted data
2. **Flag for manual review** in migration report
3. **Provide workaround** if possible (manual content entry)
4. **Document for future** automated handling

---

## Migration Validation Checklist

Before marking migration complete:

- [ ] All pages load without errors
- [ ] All images appear in correct positions
- [ ] All videos play (or show appropriate placeholder)
- [ ] Navigation works on all pages
- [ ] Secondary navs (galleries, campaigns) function correctly
- [ ] Mobile responsive behavior verified
- [ ] Footer and header consistent across pages
- [ ] Contact forms functional (if applicable)
- [ ] SEO metadata preserved
