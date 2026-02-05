/* =========================================
   SECTION-AWARE GALLERY EXTRACTOR v4
   Extracts images from WITHIN specific sections
   Uses DOM structure: #section-id > images
   ========================================= */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function extractSectionImages() {
  console.log('\n🔍 Section-Aware Gallery Extractor v4\n');

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

  const photoGalleries = {};
  const photoSections = [
    { id: 'fashion-editorial', name: 'FASHION EDITORIAL' },
    { id: 'portrait-headshots', name: 'PORTRAITS & HEADSHOTS' },
    { id: 'outdoor-lifestyle', name: 'OUTDOOR LIFESTYLE' },
    { id: 'lifestyle-fashion', name: 'LIFESTYLE FASHION' },
    { id: 'fashion-boudoir', name: 'FASHION BOUDOIR' }
  ];

  for (const section of photoSections) {
    console.log(`   Extracting: ${section.id}`);

    // Click the pill to activate the section
    const clicked = await photoPage.evaluate((target) => {
      const pill = document.querySelector(`[data-target="${target}"]`);
      if (pill) {
        pill.click();
        return true;
      }
      return false;
    }, section.id);

    if (!clicked) {
      console.log(`      ⚠️ Could not find pill for ${section.id}`);
      photoGalleries[section.id] = { name: section.name, images: [] };
      continue;
    }

    // Wait for section to be visible
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to trigger lazy loading
    await photoPage.evaluate(() => window.scrollBy(0, 500));
    await new Promise(r => setTimeout(r, 500));

    // Get images ONLY from within the specific section element
    const images = await photoPage.evaluate((sectionId) => {
      // Try multiple ways to find the section
      let sectionEl = document.querySelector(`#${sectionId}`);
      if (!sectionEl) {
        sectionEl = document.querySelector(`[id="${sectionId}"]`);
      }
      if (!sectionEl) {
        // Try finding gallery-section with this ID
        sectionEl = document.querySelector(`.gallery-section#${sectionId}`);
      }

      if (!sectionEl) {
        console.log(`Section #${sectionId} not found in DOM`);
        return [];
      }

      // Get ONLY images within this section
      const imgs = sectionEl.querySelectorAll('img');
      return Array.from(imgs)
        .filter(img => {
          // Skip tiny images, icons, and site-wide assets
          if (img.naturalWidth < 100 || img.naturalWidth === 0) return false;
          const src = img.src || '';
          if (src.includes('Aiphloweb1nlk') || src.includes('AiphloLogo') ||
              src.includes('file_000000004dc4622f8117cb41b7d37634') ||
              src.includes('footer4') || src.includes('AiPhlo_Color_Drop') ||
              src.includes('AiPhlo+Color+Drop')) {
            return false;
          }
          return true;
        })
        .map(img => ({
          src: img.src,
          alt: img.alt || ''
        }));
    }, section.id);

    console.log(`      Found ${images.length} images in #${section.id}`);
    photoGalleries[section.id] = {
      name: section.name,
      images: images
    };

    // Close the section by clicking again
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

  for (const campaign of socialCampaigns) {
    console.log(`   Extracting: ${campaign.id}`);

    // Click the campaign button/pill
    const clicked = await socialPage.evaluate((target) => {
      // Try multiple selectors
      let el = document.querySelector(`[data-target="${target}"]`);
      if (!el) el = document.querySelector(`[data-campaign="${target}"]`);
      if (!el) {
        // Try by text content
        const buttons = document.querySelectorAll('button, .pm-pill, .pm-campaign-btn');
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
      console.log(`      ⚠️ Could not find pill for ${campaign.id}`);
      socialGalleries[campaign.id] = { name: campaign.name, images: [] };
      continue;
    }

    await new Promise(r => setTimeout(r, 2000));
    await socialPage.evaluate(() => window.scrollBy(0, 500));
    await new Promise(r => setTimeout(r, 500));

    // Get images from within the campaign section
    const images = await socialPage.evaluate((campaignId) => {
      // Try to find campaign-specific section
      let sectionEl = document.querySelector(`#${campaignId}`);
      if (!sectionEl) {
        sectionEl = document.querySelector(`[id="${campaignId}"]`);
      }
      if (!sectionEl) {
        sectionEl = document.querySelector(`[data-campaign="${campaignId}"]`);
      }
      if (!sectionEl) {
        // Try finding by class
        sectionEl = document.querySelector(`.${campaignId}-gallery`);
      }

      // If no specific section found, try to find the gallery container
      // that's currently visible/active
      if (!sectionEl) {
        const activeGallery = document.querySelector('.pm-gallery.active, .pm-campaign-gallery.active, .gallery-visible');
        if (activeGallery) sectionEl = activeGallery;
      }

      // If still no section, get images from the main content area
      // but exclude navigation icons
      if (!sectionEl) {
        sectionEl = document.querySelector('.gallery-section, .pm-campaign-section, main');
      }

      if (!sectionEl) {
        return [];
      }

      const imgs = sectionEl.querySelectorAll('img');
      return Array.from(imgs)
        .filter(img => {
          if (img.naturalWidth < 50 || img.naturalWidth === 0) return false;
          const src = img.src || '';
          // Exclude site-wide assets and nav icons
          if (src.includes('Aiphloweb1nlk') || src.includes('AiphloLogo') ||
              src.includes('file_000000004dc4622f8117cb41b7d37634') ||
              src.includes('footer4') || src.includes('AiPhlo_Color_Drop') ||
              src.includes('AiPhlo+Color+Drop')) {
            return false;
          }
          return true;
        })
        .map(img => ({
          src: img.src,
          alt: img.alt || ''
        }));
    }, campaign.id);

    console.log(`      Found ${images.length} images for ${campaign.id}`);
    socialGalleries[campaign.id] = {
      name: campaign.name,
      images: images
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

  // Save results
  const outputPath = path.join(__dirname, '../assets/extracted-galleries-v4.json');
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

extractSectionImages().catch(console.error);
