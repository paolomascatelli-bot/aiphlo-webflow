/* =========================================
   GALLERY IMAGE EXTRACTOR v3
   Captures ALL visible images after each pill click
   Then deduplicates to assign each image to first gallery
   ========================================= */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function extractGalleryImages() {
  console.log('\n🔍 Gallery Image Extractor v3\n');

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
  const sectionIds = ['fashion-editorial', 'portrait-headshots', 'outdoor-lifestyle', 'lifestyle-fashion', 'fashion-boudoir'];

  for (const sectionId of sectionIds) {
    console.log(`   Clicking: ${sectionId}`);

    // Click the pill
    const clicked = await photoPage.evaluate((target) => {
      // Try multiple selectors
      const selectors = [
        `[data-target="${target}"]`,
        `button[data-section="#${target}"]`,
        `.pm-pill[data-target="${target}"]`
      ];

      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          el.click();
          return true;
        }
      }

      // Try by text content
      const buttons = document.querySelectorAll('button, .pm-pill');
      const targetText = target.replace(/-/g, ' ').toUpperCase();
      for (const btn of buttons) {
        if (btn.textContent.toUpperCase().includes(targetText.substring(0, 8))) {
          btn.click();
          return true;
        }
      }
      return false;
    }, sectionId);

    if (!clicked) {
      console.log(`      ⚠️ Could not find pill for ${sectionId}`);
      photoGalleries[sectionId] = { name: sectionId.toUpperCase(), images: [] };
      continue;
    }

    await new Promise(r => setTimeout(r, 2000));

    // Scroll down to load lazy images
    await photoPage.evaluate(() => window.scrollBy(0, 500));
    await new Promise(r => setTimeout(r, 500));

    // Get ALL visible images
    const images = await photoPage.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(img => {
          if (img.naturalWidth < 150) return false;
          const src = img.src || '';
          // Exclude site-wide assets
          if (src.includes('Aiphloweb1nlk') || src.includes('AiphloLogo') ||
              src.includes('file_000000004dc4622f8117cb41b7d37634') ||
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

    console.log(`      Found ${images.length} images`);
    photoGalleries[sectionId] = {
      name: sectionId.replace(/-/g, ' ').toUpperCase(),
      images: images
    };

    // Close section
    await photoPage.evaluate((target) => {
      const pill = document.querySelector(`[data-target="${target}"]`);
      if (pill) pill.click();
    }, sectionId);

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
  const campaignIds = ['vyayama', 'victoria'];

  for (const campaignId of campaignIds) {
    console.log(`   Clicking: ${campaignId}`);

    const clicked = await socialPage.evaluate((target) => {
      const selectors = [
        `[data-target="${target}"]`,
        `[data-campaign="${target}"]`,
        `.pm-pill[data-target="${target}"]`
      ];

      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          el.click();
          return true;
        }
      }

      // Try by text
      const buttons = document.querySelectorAll('button, .pm-pill, .pm-campaign-btn');
      for (const btn of buttons) {
        if (btn.textContent.toUpperCase().includes(target.toUpperCase())) {
          btn.click();
          return true;
        }
      }
      return false;
    }, campaignId);

    if (!clicked) {
      console.log(`      ⚠️ Could not find pill for ${campaignId}`);
      socialGalleries[campaignId] = { name: campaignId.toUpperCase(), images: [] };
      continue;
    }

    await new Promise(r => setTimeout(r, 2000));
    await socialPage.evaluate(() => window.scrollBy(0, 500));
    await new Promise(r => setTimeout(r, 500));

    const images = await socialPage.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(img => {
          if (img.naturalWidth < 50) return false;
          const src = img.src || '';
          if (src.includes('Aiphloweb1nlk') || src.includes('AiphloLogo') ||
              src.includes('file_000000004dc4622f8117cb41b7d37634') ||
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

    console.log(`      Found ${images.length} images`);
    socialGalleries[campaignId] = {
      name: campaignId.toUpperCase(),
      images: images
    };

    await socialPage.evaluate((target) => {
      const pill = document.querySelector(`[data-target="${target}"]`);
      if (pill) pill.click();
    }, campaignId);

    await new Promise(r => setTimeout(r, 500));
  }

  results.socialmedia = socialGalleries;
  await socialPage.close();

  await browser.close();

  // Save
  const outputPath = path.join(__dirname, '../assets/extracted-galleries.json');
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

extractGalleryImages().catch(console.error);
