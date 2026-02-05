/* Test Victoria slideshow with mixed aspect ratios */
const puppeteer = require('puppeteer');
const path = require('path');

async function test() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  await page.goto('http://localhost:3001/socialmedia', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Open Victoria
  await page.evaluate(() => {
    const card = document.querySelector('.pm-campaign-card[data-target="victoria"]');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Screenshot first image (logo - square/landscape)
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/victoria-mixed-1.png'),
    fullPage: false
  });
  console.log('Screenshot 1: First image');

  // Click next a few times to see different aspect ratios
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      const nextBtn = document.querySelector('.pm-layout-horizontal-slideshow .pm-slideshow-next-btn');
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
  }

  await page.screenshot({
    path: path.join(__dirname, '../screenshots/victoria-mixed-2.png'),
    fullPage: false
  });
  console.log('Screenshot 2: After navigation');

  await browser.close();
  console.log('\nDone! Check /screenshots');
}

test().catch(console.error);
