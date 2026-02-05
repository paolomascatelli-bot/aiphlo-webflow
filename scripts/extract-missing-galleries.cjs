/* =========================================
   EXTRACT MISSING GALLERIES
   Targets: portrait-headshots, lifestyle-fashion, victoria
   Uses broader image discovery within each gallery context
   ========================================= */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function extractMissingGalleries() {
  console.log('\n🔍 Extracting Missing Galleries\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const results = { photography: {}, socialmedia: {} };

  // ========== PHOTOGRAPHY - Missing galleries ==========
  console.log('📸 PHOTOGRAPHY - Looking for portrait-headshots & lifestyle-fashion\n');

  const photoPage = await browser.newPage();
  await photoPage.goto('https://www.paolomascatelli.com/photography', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 3000));

  // Try to find the actual gallery structure
  const photoStructure = await photoPage.evaluate(() => {
    // Look for gallery sections and slideshow containers
    const sections = document.querySelectorAll('[id*="portrait"], [id*="lifestyle"], section, .gallery-section');
    const info = [];

    sections.forEach(s => {
      const imgs = s.querySelectorAll('img');
      const id = s.id || s.className;
      if (imgs.length > 0) {
        info.push({
          id: id.substring(0, 50),
          imgCount: imgs.length,
          firstImg: imgs[0]?.src?.substring(0, 80)
        });
      }
    });

    // Also look for any slideshow or gallery grid
    const slideshows = document.querySelectorAll('.sqs-gallery, [class*="slideshow"], [class*="gallery-grid"]');
    slideshows.forEach(s => {
      const imgs = s.querySelectorAll('img');
      info.push({
        type: 'slideshow/gallery',
        class: s.className.substring(0, 50),
        imgCount: imgs.length
      });
    });

    return info;
  });

  console.log('  Page structure:', JSON.stringify(photoStructure, null, 2));

  // Click portrait-headshots and capture ALL visible images with broader scope
  const missingPhotoGalleries = ['portrait-headshots', 'lifestyle-fashion'];

  for (const galleryId of missingPhotoGalleries) {
    console.log(`\n   Trying: ${galleryId}`);

    // Click the pill
    const clicked = await photoPage.evaluate((target) => {
      const pill = document.querySelector(`[data-target="${target}"]`);
      if (pill) {
        pill.click();
        return true;
      }
      return false;
    }, galleryId);

    if (!clicked) {
      console.log(`      ⚠️ Could not find pill for ${galleryId}`);
      results.photography[galleryId] = { name: galleryId.toUpperCase(), images: [] };
      continue;
    }

    await new Promise(r => setTimeout(r, 3000));

    // Scroll extensively to trigger lazy loading
    for (let i = 0; i < 5; i++) {
      await photoPage.evaluate((scrollAmount) => window.scrollTo(0, scrollAmount), i * 500);
      await new Promise(r => setTimeout(r, 500));
    }

    // Get images - try multiple approaches
    const images = await photoPage.evaluate((sectionId) => {
      const found = [];

      // Approach 1: Look in section by ID
      let section = document.getElementById(sectionId);
      if (section) {
        section.querySelectorAll('img').forEach(img => {
          if (img.naturalWidth > 100) found.push({ src: img.src, alt: img.alt, from: 'section' });
        });
      }

      // Approach 2: Look for visible gallery-section that contains images
      document.querySelectorAll('.gallery-section, [class*="gallery"]').forEach(gs => {
        const rect = gs.getBoundingClientRect();
        // If visible and has images
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          gs.querySelectorAll('img').forEach(img => {
            if (img.naturalWidth > 100 && !found.some(f => f.src === img.src)) {
              found.push({ src: img.src, alt: img.alt, from: 'visible-gallery' });
            }
          });
        }
      });

      // Approach 3: Look for sqs-gallery images
      document.querySelectorAll('.sqs-gallery img, .sqs-gallery-block img').forEach(img => {
        if (img.naturalWidth > 100 && !found.some(f => f.src === img.src)) {
          found.push({ src: img.src, alt: img.alt, from: 'sqs-gallery' });
        }
      });

      // Filter out site assets
      return found.filter(img => {
        const src = img.src || '';
        return !src.includes('Aiphloweb1nlk') &&
               !src.includes('AiphloLogo') &&
               !src.includes('footer4') &&
               !src.includes('AiPhlo_Color_Drop');
      });
    }, galleryId);

    console.log(`      Found ${images.length} images for ${galleryId}`);
    if (images.length > 0) {
      console.log(`      First: ${images[0].src.substring(0, 60)}...`);
      console.log(`      From: ${images[0].from}`);
    }

    results.photography[galleryId] = {
      name: galleryId.replace(/-/g, ' ').toUpperCase(),
      images: images.map(img => ({ src: img.src, alt: img.alt || '' }))
    };

    // Close section
    await photoPage.evaluate((target) => {
      const pill = document.querySelector(`[data-target="${target}"]`);
      if (pill) pill.click();
    }, galleryId);

    await new Promise(r => setTimeout(r, 1000));
  }

  await photoPage.close();

  // ========== SOCIAL MEDIA - Victoria ==========
  console.log('\n📱 SOCIAL MEDIA - Looking for victoria campaign\n');

  const socialPage = await browser.newPage();
  await socialPage.goto('https://www.paolomascatelli.com/socialmedia', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 3000));

  // Check page structure
  const socialStructure = await socialPage.evaluate(() => {
    const sections = document.querySelectorAll('section, [id*="victoria"], [id*="vyayama"], .gallery-section');
    return Array.from(sections).map(s => ({
      tag: s.tagName,
      id: s.id || '',
      class: s.className.substring(0, 60),
      imgCount: s.querySelectorAll('img').length
    }));
  });

  console.log('  Social page structure:', JSON.stringify(socialStructure.slice(0, 5), null, 2));

  // Click victoria
  console.log('\n   Trying: victoria');

  const victoriaClicked = await socialPage.evaluate(() => {
    // Try multiple selectors
    let el = document.querySelector('[data-target="victoria"]');
    if (!el) {
      const buttons = document.querySelectorAll('button, .pm-pill, [class*="campaign"]');
      for (const btn of buttons) {
        if (btn.textContent.toUpperCase().includes('VICTORIA')) {
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
  });

  if (victoriaClicked) {
    await new Promise(r => setTimeout(r, 3000));

    // Scroll
    for (let i = 0; i < 5; i++) {
      await socialPage.evaluate((scrollAmount) => window.scrollTo(0, scrollAmount), i * 400);
      await new Promise(r => setTimeout(r, 400));
    }

    // Get images
    const victoriaImages = await socialPage.evaluate(() => {
      const found = [];

      // Try section by ID
      let section = document.getElementById('victoria');
      if (section) {
        section.querySelectorAll('img').forEach(img => {
          if (img.naturalWidth > 50) found.push({ src: img.src, alt: img.alt });
        });
      }

      // Try any visible gallery
      document.querySelectorAll('.sqs-gallery img, [class*="gallery"] img').forEach(img => {
        if (img.naturalWidth > 50 && !found.some(f => f.src === img.src)) {
          found.push({ src: img.src, alt: img.alt });
        }
      });

      return found.filter(img => {
        const src = img.src || '';
        return !src.includes('Aiphloweb1nlk') &&
               !src.includes('AiphloLogo') &&
               !src.includes('footer4') &&
               !src.includes('AiPhlo_Color_Drop');
      });
    });

    console.log(`      Found ${victoriaImages.length} images for victoria`);

    results.socialmedia.victoria = {
      name: 'VICTORIA',
      images: victoriaImages.map(img => ({ src: img.src, alt: img.alt || '' }))
    };
  } else {
    console.log('      ⚠️ Could not find victoria button');
    results.socialmedia.victoria = { name: 'VICTORIA', images: [] };
  }

  await socialPage.close();
  await browser.close();

  // Save results
  const outputPath = path.join(__dirname, '../assets/extracted-missing.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Saved to: ${outputPath}`);

  // Summary
  console.log('\n📊 Summary:');
  console.log('\nPhotography:');
  for (const [id, data] of Object.entries(results.photography)) {
    console.log(`  ${id}: ${data.images.length} images`);
  }
  console.log('\nSocial Media:');
  for (const [id, data] of Object.entries(results.socialmedia)) {
    console.log(`  ${id}: ${data.images.length} images`);
  }
}

extractMissingGalleries().catch(console.error);
