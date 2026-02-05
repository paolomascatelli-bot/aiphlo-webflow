# AiPhlo UX Assistant Prompts

Ready-to-use scripts for guiding users through common migration issues.

---

## 1. Hidden/Unpublished Video

**Trigger:** Video exists in Squarespace editor but wasn't captured during extraction

```
I see you have a video that wasn't captured during extraction. This happens when the video exists in your Squarespace editor but isn't published to the live page.

Let's get that video transferred. You have two options:

**Option 1: Download from Squarespace (Recommended)**
1. Open your Squarespace editor
2. Navigate to the page with the video
3. Click on the video block
4. Look for a download icon or right-click the video preview
5. Save the file (it will be named something like `video.mp4`)
6. Upload it to your migration folder

**Option 2: Get the Squarespace URL**
1. In Squarespace, go to Settings → Advanced → Files
2. Find your video file in the asset library
3. Click to get the direct URL
4. Share that URL with me

Once you provide the file or URL, I'll integrate it into your migrated site automatically.
```

---

## 2. Images in Wrong Order

**Trigger:** Gallery images appear but not in correct sequence

```
The images are showing but not in the right order. This is a mapping issue I can fix.

Quick question: Are the images completely wrong, or just slightly shuffled?

- **Completely wrong:** I'll re-run the gallery structure extraction to get the exact order from your original site
- **Slightly shuffled:** I'll adjust the sort order based on the original indices

Can you point me to a specific example where the order is off?
```

---

## 3. Missing Campaign/Gallery Images

**Trigger:** Campaign button exists but shows no images

```
I see the campaign button but no images are loading. Let me check what's available.

Can you tell me:
1. How many images should be in this campaign?
2. Are they the same images as another section, or unique?
3. Are these images visible on your live Squarespace site?

This helps me locate and assign them correctly.
```

---

## 4. Styling Mismatch

**Trigger:** Colors, fonts, or spacing don't match original

```
The styling looks different from your original. I can match it more closely.

What's off?
- **Colors** (buttons, backgrounds, text)
- **Fonts** (headings, body text)
- **Spacing/Layout** (margins, padding, alignment)

Point me to the specific elements and I'll pull the exact styles from your Squarespace site.
```

---

## 5. Navigation Not Working

**Trigger:** Pills, buttons, or dropdowns don't behave correctly

```
The navigation isn't behaving quite right. Let me tune it.

What's the issue?
- **Transitions** too fast or slow
- **Click behavior** wrong (should toggle vs. stay selected)
- **Scroll effects** missing or jerky
- **Mobile** touch interactions not working

I'll adjust the animation timing and interaction logic to match your original.
```

---

## 6. Page Not Loading

**Trigger:** Blank page or error when navigating

```
That page isn't loading correctly. Let me diagnose it.

Can you tell me:
1. Does it show a blank page or an error message?
2. Did it work before and stop working?
3. Are other pages working fine?

I'll check the API response and template rendering for that route.
```

---

## 7. Missing Section/Block

**Trigger:** Entire section from original site not appearing

```
A section from your original site isn't showing up. This could be:

1. **Hidden in Squarespace** - The section might be set to hidden/draft
2. **Not extracted** - Our scraper might have missed it
3. **Different page** - It might be on a different page than expected

Can you:
- Share a screenshot of the missing section from your Squarespace site
- Tell me which page it should appear on

I'll add it to the migration.
```

---

## 8. Form Not Working

**Trigger:** Contact form or other forms not submitting

```
The form isn't working yet. Squarespace forms use their own backend, so we need to reconnect it.

Options:
1. **Keep Squarespace forms** - I can embed your existing Squarespace form
2. **Use Webflow forms** - Set up native Webflow form handling
3. **Third-party** - Connect to Formspree, Netlify Forms, etc.

Which approach works best for your needs?
```

---

## 9. Pre-Migration Checklist

**Use before starting extraction**

```
Before we begin the migration, let's make sure everything is ready:

**On your Squarespace site:**
- [ ] All sections you want migrated are published (not hidden/draft)
- [ ] All images are uploaded and visible on the live site
- [ ] All videos are uploaded and published
- [ ] Custom code blocks are saved and active

**Information I'll need:**
- [ ] List of pages to migrate
- [ ] Any pages with video content
- [ ] Any member-only or password-protected sections
- [ ] Custom fonts you're using (if not Google Fonts)

Ready to proceed?
```

---

## 10. Migration Complete - Review

**Use after migration is done**

```
Your migration is complete! Let's do a final review together.

Please check each page and let me know if anything needs adjustment:

**Home Page**
- [ ] Hero section correct
- [ ] All sections visible
- [ ] Images in right places

**Photography**
- [ ] Gallery categories working
- [ ] Images loading correctly
- [ ] Pill navigation functional

**Social Media**
- [ ] Campaign buttons working
- [ ] Videos playing (or placeholders showing)
- [ ] Gallery images correct

**Projects**
- [ ] All projects visible
- [ ] Navigation working

**FAQs**
- [ ] Accordions expanding/collapsing
- [ ] All Q&As present

**Contact**
- [ ] Information correct
- [ ] Form functional (if applicable)

Any issues? I'll fix them right away.
```

---

## Response Templates

### Acknowledging Issue
```
Got it. I see the issue with [specific element]. Let me fix that.
```

### Requesting More Info
```
To fix this properly, I need a bit more detail. Can you [specific request]?
```

### Confirming Resolution
```
Done! I've [action taken]. Please refresh and check if it looks correct now.
```

### Escalating
```
This one's a bit tricky. I'm logging it for deeper investigation. In the meantime, here's a workaround: [workaround].
```
