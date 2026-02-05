/* Verify each campaign displays unique content */
const puppeteer = require('puppeteer');
const path = require('path');

async function verify() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });

  // Load Social Media page
  await page.goto('http://localhost:3001/socialmedia', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Click VYAYAMA
  console.log('Opening VYAYAMA...');
  await page.evaluate(() => {
    const card = document.querySelector('.pm-campaign-card[data-target="vyayama"]');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Get vyayama image sources
  const vyayamaImages = await page.evaluate(() => {
    const gallery = document.getElementById('vyayama');
    if (!gallery) return [];
    return Array.from(gallery.querySelectorAll('.pm-phone-screen img'))
      .map(img => img.src.split('/').pop().split('?')[0]);
  });
  console.log('VYAYAMA images:', vyayamaImages);

  await page.screenshot({
    path: path.join(__dirname, '../screenshots/verify-vyayama.png'),
    fullPage: false
  });

  // Click VICTORIA
  console.log('\nOpening VICTORIA...');
  await page.evaluate(() => {
    const card = document.querySelector('.pm-campaign-card[data-target="victoria"]');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Get victoria image sources
  const victoriaImages = await page.evaluate(() => {
    const gallery = document.getElementById('victoria');
    if (!gallery) return [];
    return Array.from(gallery.querySelectorAll('.pm-phone-screen img'))
      .map(img => img.src.split('/').pop().split('?')[0]);
  });
  console.log('VICTORIA images:', victoriaImages);

  await page.screenshot({
    path: path.join(__dirname, '../screenshots/verify-victoria.png'),
    fullPage: false
  });

  // Check if they're unique
  const vyayamaSet = new Set(vyayamaImages);
  const victoriaSet = new Set(victoriaImages);
  const overlap = vyayamaImages.filter(img => victoriaSet.has(img));

  console.log('\n=== COMPARISON ===');
  console.log('Vyayama count:', vyayamaImages.length);
  console.log('Victoria count:', victoriaImages.length);
  console.log('Overlapping images:', overlap.length);
  if (overlap.length > 0) {
    console.log('Overlap:', overlap);
  }

  await browser.close();
  console.log('\nScreenshots saved to /screenshots');
}

verify().catch(console.error);
