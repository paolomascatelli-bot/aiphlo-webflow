/* =========================================
   EXTRACT LIFESTYLE-FASHION GALLERY
   Direct extraction from section by ID (not visibility)
   ========================================= */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function extractLifestyleFashion() {
  console.log('\n🔍 Direct extraction for lifestyle-fashion gallery\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  // Navigate to photography page
  await page.goto('https://www.paolomascatelli.com/photography', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 3000));

  console.log('📸 Page loaded, extracting from #lifestyle-fashion section...\n');

  // Click lifestyle-fashion pill to ensure content is loaded
  await page.evaluate(() => {
    const pill = document.querySelector('[data-target="lifestyle-fashion"]');
    if (pill) pill.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Extract directly from the section by ID - don't rely on visibility
  const images = await page.evaluate(() => {
    const section = document.getElementById('lifestyle-fashion');
    if (!section) {
      console.log('Section not found');
      return [];
    }

    const imgs = section.querySelectorAll('img');
    const result = [];

    imgs.forEach(img => {
      // Get the actual source (may be in data-src for lazy loading)
      let src = img.src || img.getAttribute('data-src') || img.getAttribute('data-image');

      if (src && src.includes('squarespace-cdn')) {
        // Skip site assets
        if (src.includes('Aiphloweb1nlk') ||
            src.includes('AiphloLogo') ||
            src.includes('footer4') ||
            src.includes('AiPhlo_Color_Drop')) {
          return;
        }

        result.push({
          src: src,
          alt: img.alt || ''
        });
      }
    });

    return result;
  });

  console.log(`Found ${images.length} images in #lifestyle-fashion section`);

  if (images.length > 0) {
    console.log('\nImages:');
    images.forEach((img, i) => {
      console.log(`  ${i+1}. ${img.src.substring(0, 80)}...`);
    });

    // Update the extracted-missing.json
    const missingPath = path.join(__dirname, '../assets/extracted-missing.json');
    let missingData = { photography: {}, socialmedia: {} };

    try {
      missingData = JSON.parse(fs.readFileSync(missingPath, 'utf8'));
    } catch (e) {}

    missingData.photography['lifestyle-fashion'] = {
      name: 'LIFESTYLE FASHION',
      images: images
    };

    fs.writeFileSync(missingPath, JSON.stringify(missingData, null, 2));
    console.log(`\n✅ Updated extracted-missing.json with ${images.length} images`);
  } else {
    console.log('\n⚠️ No images found. Trying alternative approach...');

    // Alternative: Get images from the gallery-masonry within lifestyle-fashion
    const altImages = await page.evaluate(() => {
      // The section structure shows: page-section gallery-section with 11 imgs
      // Look for the 4th gallery section (lifestyle-fashion is 4th in order)
      const gallerySections = document.querySelectorAll('.gallery-section');
      const results = [];

      gallerySections.forEach((section, idx) => {
        const sectionId = section.id;
        if (sectionId === 'lifestyle-fashion' || idx === 3) { // 0-indexed, so 4th = index 3
          section.querySelectorAll('img').forEach(img => {
            const src = img.src || img.getAttribute('data-src');
            if (src && src.includes('squarespace-cdn') &&
                !src.includes('Aiphloweb1nlk') &&
                !src.includes('AiphloLogo')) {
              results.push({ src, alt: img.alt || '', fromSection: sectionId || `index-${idx}` });
            }
          });
        }
      });

      return results;
    });

    console.log(`Alternative approach found ${altImages.length} images`);
    if (altImages.length > 0) {
      altImages.forEach((img, i) => {
        console.log(`  ${i+1}. ${img.src.substring(0, 70)}... (from: ${img.fromSection})`);
      });

      // Update extracted-missing.json
      const missingPath = path.join(__dirname, '../assets/extracted-missing.json');
      let missingData = { photography: {}, socialmedia: {} };

      try {
        missingData = JSON.parse(fs.readFileSync(missingPath, 'utf8'));
      } catch (e) {}

      missingData.photography['lifestyle-fashion'] = {
        name: 'LIFESTYLE FASHION',
        images: altImages.map(img => ({ src: img.src, alt: img.alt }))
      };

      fs.writeFileSync(missingPath, JSON.stringify(missingData, null, 2));
      console.log(`\n✅ Updated extracted-missing.json with ${altImages.length} images`);
    }
  }

  await browser.close();
}

extractLifestyleFashion().catch(console.error);
