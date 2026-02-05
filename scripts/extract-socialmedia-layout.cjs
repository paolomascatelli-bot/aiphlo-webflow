/* =========================================
   EXTRACT SOCIAL MEDIA LAYOUT STRUCTURE
   Captures: icon placement, image aspect ratios, gallery styles
   ========================================= */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function getClassName(el) {
  if (!el.className) return '';
  if (typeof el.className === 'string') return el.className;
  if (el.className.baseVal) return el.className.baseVal; // SVG elements
  return '';
}

async function extractSocialMediaLayout() {
  console.log('\n🎨 Extracting Social Media page layout structure\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  await page.goto('https://www.paolomascatelli.com/socialmedia', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  await new Promise(r => setTimeout(r, 3000));

  // Take initial screenshot
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/socialmedia-initial.png'),
    fullPage: false
  });
  console.log('📷 Initial screenshot saved\n');

  // Analyze the page structure
  console.log('=== ANALYZING PAGE STRUCTURE ===\n');

  const initialStructure = await page.evaluate(() => {
    function getClassName(el) {
      if (!el.className) return '';
      if (typeof el.className === 'string') return el.className;
      if (el.className.baseVal) return el.className.baseVal;
      return '';
    }

    const structure = {
      sections: [],
      iconBlocks: [],
      campaigns: []
    };

    // Find all sections
    document.querySelectorAll('section').forEach(s => {
      const rect = s.getBoundingClientRect();
      if (rect.height > 50) {
        structure.sections.push({
          id: s.id,
          class: getClassName(s).substring(0, 80),
          height: Math.round(rect.height)
        });
      }
    });

    // Find image blocks (potential icons)
    document.querySelectorAll('img').forEach(img => {
      const src = img.src || '';
      if (src.includes('vyayama') || src.includes('victoria')) {
        const rect = img.getBoundingClientRect();
        structure.iconBlocks.push({
          type: src.includes('vyayama') ? 'vyayama' : 'victoria',
          src: src.substring(0, 80),
          width: img.naturalWidth,
          height: img.naturalHeight,
          top: Math.round(rect.top),
          visible: rect.top < window.innerHeight && rect.bottom > 0
        });
      }
    });

    // Find campaign buttons/pills
    document.querySelectorAll('[data-target], button').forEach(el => {
      const text = el.textContent?.trim() || '';
      if (text.toUpperCase().includes('VYAYAMA') || text.toUpperCase().includes('VICTORIA')) {
        structure.campaigns.push({
          text: text.substring(0, 30),
          dataTarget: el.getAttribute('data-target')
        });
      }
    });

    return structure;
  });

  console.log('Sections:', initialStructure.sections.length);
  initialStructure.sections.forEach(s => {
    console.log(`  ${s.id || s.class?.substring(0, 40)} - height: ${s.height}px`);
  });

  console.log('\nCampaign icons:', initialStructure.iconBlocks.length);
  initialStructure.iconBlocks.forEach(b => {
    console.log(`  ${b.type}: ${b.width}x${b.height}, top: ${b.top}px, visible: ${b.visible}`);
  });

  console.log('\nCampaign buttons:', initialStructure.campaigns.length);
  initialStructure.campaigns.forEach(c => {
    console.log(`  "${c.text}" -> ${c.dataTarget}`);
  });

  // Click VYAYAMA to see the gallery layout
  console.log('\n=== ANALYZING VYAYAMA GALLERY ===\n');

  const vyayamaClicked = await page.evaluate(() => {
    const pills = document.querySelectorAll('[data-target], button');
    for (const p of pills) {
      if (p.textContent?.toUpperCase().includes('VYAYAMA') || p.getAttribute('data-target') === 'vyayama') {
        p.click();
        return true;
      }
    }
    return false;
  });

  if (vyayamaClicked) {
    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({
      path: path.join(__dirname, '../screenshots/socialmedia-vyayama.png'),
      fullPage: false
    });
    console.log('📷 Vyayama gallery screenshot saved\n');

    // Analyze gallery structure
    const vyayamaLayout = await page.evaluate(() => {
      const layout = {
        galleryType: 'unknown',
        images: []
      };

      // Look for the vyayama section
      let section = document.getElementById('vyayama');
      if (!section) {
        // Look for any visible gallery
        document.querySelectorAll('[id], section').forEach(s => {
          const rect = s.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0 && rect.height > 200) {
            const imgs = s.querySelectorAll('img');
            if (imgs.length > 2) section = s;
          }
        });
      }

      if (section) {
        // Check gallery type by class
        const html = section.innerHTML;
        if (html.includes('slideshow')) layout.galleryType = 'slideshow';
        else if (html.includes('masonry')) layout.galleryType = 'masonry';
        else if (html.includes('grid')) layout.galleryType = 'grid';
        else if (html.includes('strips')) layout.galleryType = 'strips';

        // Get image dimensions
        section.querySelectorAll('img').forEach(img => {
          if (img.src?.includes('squarespace-cdn') &&
              !img.src.includes('Aiphloweb') &&
              !img.src.includes('Logo') &&
              img.naturalWidth > 100) {
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            let orientation = 'square';
            const ratio = w / h;
            if (ratio > 1.2) orientation = 'landscape';
            else if (ratio < 0.8) orientation = 'portrait';

            layout.images.push({
              width: w,
              height: h,
              ratio: ratio.toFixed(2),
              orientation: orientation
            });
          }
        });
      }

      return layout;
    });

    console.log('Gallery type:', vyayamaLayout.galleryType);
    console.log('Images:', vyayamaLayout.images.length);
    vyayamaLayout.images.forEach((img, i) => {
      console.log(`  ${i+1}. ${img.width}x${img.height} (${img.ratio}) - ${img.orientation}`);
    });
  }

  // Click VICTORIA
  console.log('\n=== ANALYZING VICTORIA GALLERY ===\n');

  // Close vyayama first
  await page.evaluate(() => {
    const pills = document.querySelectorAll('[data-target="vyayama"], button');
    for (const p of pills) {
      if (p.textContent?.toUpperCase().includes('VYAYAMA')) {
        p.click();
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  const victoriaClicked = await page.evaluate(() => {
    const pills = document.querySelectorAll('[data-target], button');
    for (const p of pills) {
      if (p.textContent?.toUpperCase().includes('VICTORIA') || p.getAttribute('data-target') === 'victoria') {
        p.click();
        return true;
      }
    }
    return false;
  });

  if (victoriaClicked) {
    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({
      path: path.join(__dirname, '../screenshots/socialmedia-victoria.png'),
      fullPage: false
    });
    console.log('📷 Victoria gallery screenshot saved\n');

    const victoriaLayout = await page.evaluate(() => {
      const layout = { galleryType: 'unknown', images: [] };

      let section = document.getElementById('victoria');
      if (!section) {
        document.querySelectorAll('[id], section').forEach(s => {
          const rect = s.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0 && rect.height > 200) {
            const imgs = s.querySelectorAll('img');
            if (imgs.length > 2) section = s;
          }
        });
      }

      if (section) {
        const html = section.innerHTML;
        if (html.includes('slideshow')) layout.galleryType = 'slideshow';
        else if (html.includes('masonry')) layout.galleryType = 'masonry';
        else if (html.includes('grid')) layout.galleryType = 'grid';
        else if (html.includes('strips')) layout.galleryType = 'strips';

        section.querySelectorAll('img').forEach(img => {
          if (img.src?.includes('squarespace-cdn') &&
              !img.src.includes('Aiphloweb') &&
              !img.src.includes('Logo') &&
              img.naturalWidth > 50) {
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            const ratio = w / h;
            let orientation = 'square';
            if (ratio > 1.2) orientation = 'landscape';
            else if (ratio < 0.8) orientation = 'portrait';

            layout.images.push({
              width: w,
              height: h,
              ratio: ratio.toFixed(2),
              orientation: orientation
            });
          }
        });
      }

      return layout;
    });

    console.log('Gallery type:', victoriaLayout.galleryType);
    console.log('Images:', victoriaLayout.images.length);
    victoriaLayout.images.forEach((img, i) => {
      console.log(`  ${i+1}. ${img.width}x${img.height} (${img.ratio}) - ${img.orientation}`);
    });
  }

  await browser.close();

  console.log('\n✅ Layout analysis complete\n');
  console.log('Check screenshots in /screenshots folder for visual reference');
}

extractSocialMediaLayout().catch(console.error);
