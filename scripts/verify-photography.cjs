/* Verify photography galleries */
const puppeteer = require('puppeteer');
const path = require('path');

async function verify() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });

  await page.goto('http://localhost:3001/photography', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Check all galleries
  const galleries = ['fashion-editorial', 'portrait-headshots', 'outdoor-lifestyle', 'lifestyle-fashion', 'fashion-boudoir'];

  for (const galleryId of galleries) {
    console.log(`\nChecking ${galleryId}...`);

    // Click the pill
    const clicked = await page.evaluate((id) => {
      const pill = document.querySelector(`[data-target="${id}"]`);
      if (pill) {
        pill.click();
        return true;
      }
      return false;
    }, galleryId);

    if (!clicked) {
      console.log(`  ⚠️ Could not find pill for ${galleryId}`);
      continue;
    }

    await new Promise(r => setTimeout(r, 1500));

    // Count images in the gallery section
    const imageCount = await page.evaluate((id) => {
      const section = document.getElementById(id);
      if (!section) return { found: false, count: 0 };
      const imgs = section.querySelectorAll('img');
      return {
        found: true,
        count: imgs.length,
        visible: section.style.display !== 'none',
        firstSrc: imgs[0]?.src?.split('/').pop()?.substring(0, 40) || 'none'
      };
    }, galleryId);

    console.log(`  Section found: ${imageCount.found}`);
    console.log(`  Visible: ${imageCount.visible}`);
    console.log(`  Image count: ${imageCount.count}`);
    console.log(`  First image: ${imageCount.firstSrc}`);

    // Screenshot lifestyle-fashion specifically
    if (galleryId === 'lifestyle-fashion') {
      await page.screenshot({
        path: path.join(__dirname, '../screenshots/verify-lifestyle-fashion.png'),
        fullPage: false
      });
      console.log('  📷 Screenshot saved');
    }

    // Close gallery
    await page.evaluate((id) => {
      const pill = document.querySelector(`[data-target="${id}"]`);
      if (pill) pill.click();
    }, galleryId);
    await new Promise(r => setTimeout(r, 500));
  }

  await browser.close();
}

verify().catch(console.error);
