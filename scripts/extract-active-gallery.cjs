/* =========================================
   ACTIVE GALLERY EXTRACTOR v5
   Captures the DISPLAYED gallery images after clicking
   Uses comparison to identify NEW images for each gallery
   ========================================= */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Helper to get filename from URL for comparison
function getFilename(url) {
  return url.split('?')[0].split('/').pop();
}

async function extractActiveGallery() {
  console.log('\n🔍 Active Gallery Extractor v5\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const results = {};

  // ========== PHOTOGRAPHY ==========
  console.log('📸 PHOTOGRAPHY PAGE\n');

  const photoPage = await browser.newPage();
  await photoPage.goto('https://www.paolomascatelli.com/photography', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 3000));

  // Get ALL gallery section images to understand what belongs to what
  const photoGalleries = {};
  const photoSections = [
    { id: 'fashion-editorial', name: 'FASHION EDITORIAL' },
    { id: 'portrait-headshots', name: 'PORTRAITS & HEADSHOTS' },
    { id: 'outdoor-lifestyle', name: 'OUTDOOR LIFESTYLE' },
    { id: 'lifestyle-fashion', name: 'LIFESTYLE FASHION' },
    { id: 'fashion-boudoir', name: 'FASHION BOUDOIR' }
  ];

  // Track seen images across all galleries
  const seenImages = new Set();

  for (const section of photoSections) {
    console.log(`   Extracting: ${section.id}`);

    // Record images BEFORE clicking
    const beforeImages = await photoPage.evaluate(() => {
      return Array.from(document.querySelectorAll('.gallery-section img, [class*="gallery"] img, .sqs-gallery img'))
        .filter(img => img.naturalWidth >= 100)
        .map(img => img.src);
    });

    // Click the pill
    const clicked = await photoPage.evaluate((target) => {
      const pill = document.querySelector(`[data-target="${target}"]`);
      if (pill) {
        pill.click();
        return true;
      }
      // Try alternative selectors
      const byText = Array.from(document.querySelectorAll('.pm-pill')).find(el =>
        el.textContent.toLowerCase().includes(target.replace(/-/g, ' ').substring(0, 8))
      );
      if (byText) {
        byText.click();
        return true;
      }
      return false;
    }, section.id);

    if (!clicked) {
      console.log(`      ⚠️ Could not find pill for ${section.id}`);
      photoGalleries[section.id] = { name: section.name, images: [] };
      continue;
    }

    // Wait for gallery change and scroll
    await new Promise(r => setTimeout(r, 2500));

    // Scroll down to load lazy images
    await photoPage.evaluate(() => {
      window.scrollTo(0, 500);
    });
    await new Promise(r => setTimeout(r, 1000));
    await photoPage.evaluate(() => {
      window.scrollTo(0, 1000);
    });
    await new Promise(r => setTimeout(r, 1000));

    // Get images AFTER clicking - should show the new gallery
    const afterImages = await photoPage.evaluate(() => {
      // Get the main gallery grid that's currently visible
      const galleryGrid = document.querySelector('.sqs-gallery-design-grid, [class*="gallery-grid"], .gallery-slideshow');

      if (galleryGrid) {
        return Array.from(galleryGrid.querySelectorAll('img'))
          .filter(img => {
            if (img.naturalWidth < 100) return false;
            const src = img.src || '';
            if (src.includes('Aiphloweb1nlk') || src.includes('AiphloLogo') ||
                src.includes('footer4') || src.includes('AiPhlo_Color_Drop')) {
              return false;
            }
            return true;
          })
          .map(img => ({
            src: img.src,
            alt: img.alt || ''
          }));
      }

      // Fallback: get all gallery-section images
      return Array.from(document.querySelectorAll('.gallery-section img, [class*="gallery"] img'))
        .filter(img => {
          if (img.naturalWidth < 100) return false;
          const src = img.src || '';
          if (src.includes('Aiphloweb1nlk') || src.includes('AiphloLogo') ||
              src.includes('footer4') || src.includes('AiPhlo_Color_Drop')) {
            return false;
          }
          return true;
        })
        .map(img => ({
          src: img.src,
          alt: img.alt || ''
        }));
    });

    // Filter to only include NEW images not seen before
    const newImages = afterImages.filter(img => {
      const filename = getFilename(img.src);
      if (seenImages.has(filename)) {
        return false;
      }
      seenImages.add(filename);
      return true;
    });

    console.log(`      Total visible: ${afterImages.length}, New unique: ${newImages.length}`);
    photoGalleries[section.id] = {
      name: section.name,
      images: newImages
    };

    // Close section
    await photoPage.evaluate((target) => {
      const pill = document.querySelector(`[data-target="${target}"]`);
      if (pill) pill.click();
    }, section.id);

    await new Promise(r => setTimeout(r, 500));
  }

  results.photography = photoGalleries;
  await photoPage.close();

  // ========== SOCIAL MEDIA ==========
  console.log('\n📱 SOCIAL MEDIA PAGE\n');

  const socialPage = await browser.newPage();
  await socialPage.goto('https://www.paolomascatelli.com/socialmedia', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 3000));

  const socialGalleries = {};
  const socialCampaigns = [
    { id: 'vyayama', name: 'VYAYAMA' },
    { id: 'victoria', name: 'VICTORIA' }
  ];

  const socialSeenImages = new Set();

  for (const campaign of socialCampaigns) {
    console.log(`   Extracting: ${campaign.id}`);

    // Click campaign button
    const clicked = await socialPage.evaluate((target) => {
      // Try data-target
      let el = document.querySelector(`[data-target="${target}"]`);
      if (!el) el = document.querySelector(`[data-campaign="${target}"]`);
      if (!el) {
        // Try by text
        const buttons = document.querySelectorAll('button, .pm-pill, .pm-campaign-btn, [class*="campaign"]');
        for (const btn of buttons) {
          if (btn.textContent.toUpperCase().includes(target.toUpperCase())) {
            el = btn;
            break;
          }
        }
      }
      if (el) {
        el.click();
        return true;
      }
      return false;
    }, campaign.id);

    if (!clicked) {
      console.log(`      ⚠️ Could not find button for ${campaign.id}`);
      socialGalleries[campaign.id] = { name: campaign.name, images: [] };
      continue;
    }

    await new Promise(r => setTimeout(r, 2500));
    await socialPage.evaluate(() => window.scrollTo(0, 500));
    await new Promise(r => setTimeout(r, 1000));
    await socialPage.evaluate(() => window.scrollTo(0, 1000));
    await new Promise(r => setTimeout(r, 1000));

    // Get gallery images
    const images = await socialPage.evaluate(() => {
      // Try to get the gallery grid
      const galleryGrid = document.querySelector('.sqs-gallery-design-grid, [class*="gallery-grid"], .gallery-slideshow, [class*="campaign-gallery"]');

      let imgs = [];
      if (galleryGrid) {
        imgs = Array.from(galleryGrid.querySelectorAll('img'));
      } else {
        // Fallback to all gallery images
        imgs = Array.from(document.querySelectorAll('.sqs-gallery img, [class*="gallery"] img'));
      }

      return imgs
        .filter(img => {
          if (img.naturalWidth < 50) return false;
          const src = img.src || '';
          if (src.includes('Aiphloweb1nlk') || src.includes('AiphloLogo') ||
              src.includes('footer4') || src.includes('AiPhlo_Color_Drop')) {
            return false;
          }
          return true;
        })
        .map(img => ({
          src: img.src,
          alt: img.alt || ''
        }));
    });

    // Filter to only NEW images
    const newImages = images.filter(img => {
      const filename = getFilename(img.src);
      if (socialSeenImages.has(filename)) {
        return false;
      }
      socialSeenImages.add(filename);
      return true;
    });

    console.log(`      Total visible: ${images.length}, New unique: ${newImages.length}`);
    socialGalleries[campaign.id] = {
      name: campaign.name,
      images: newImages
    };

    // Close by clicking again
    await socialPage.evaluate((target) => {
      const el = document.querySelector(`[data-target="${target}"]`);
      if (el) el.click();
    }, campaign.id);

    await new Promise(r => setTimeout(r, 500));
  }

  results.socialmedia = socialGalleries;
  await socialPage.close();

  await browser.close();

  // Save
  const outputPath = path.join(__dirname, '../assets/extracted-galleries-v5.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Saved to: ${outputPath}`);

  // Summary
  console.log('\n📊 Summary:\n');
  console.log('Photography:');
  for (const [id, data] of Object.entries(results.photography)) {
    console.log(`  ${id}: ${data.images.length} images`);
  }
  console.log('\nSocial Media:');
  for (const [id, data] of Object.entries(results.socialmedia)) {
    console.log(`  ${id}: ${data.images.length} images`);
  }
}

extractActiveGallery().catch(console.error);
