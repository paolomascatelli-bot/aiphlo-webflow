/* Verify different layout types */
const puppeteer = require('puppeteer');
const path = require('path');

async function verify() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });

  await page.goto('http://localhost:3001/socialmedia', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot initial state
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/layout-initial.png'),
    fullPage: false
  });
  console.log('Screenshot 1: Initial state');

  // Click VYAYAMA (phone mockups)
  console.log('\nOpening VYAYAMA (phone-mockups layout)...');
  await page.evaluate(() => {
    const card = document.querySelector('.pm-campaign-card[data-target="vyayama"]');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const vyayamaLayout = await page.evaluate(() => {
    const gallery = document.getElementById('vyayama');
    return {
      hasPhoneMockups: !!gallery?.querySelector('.pm-phone-gallery'),
      hasSlideshow: !!gallery?.querySelector('.pm-horizontal-slideshow')
    };
  });
  console.log('  Layout check:', vyayamaLayout);

  await page.screenshot({
    path: path.join(__dirname, '../screenshots/layout-vyayama-phones.png'),
    fullPage: false
  });

  // Click VICTORIA (horizontal slideshow)
  console.log('\nOpening VICTORIA (horizontal-slideshow layout)...');
  await page.evaluate(() => {
    const card = document.querySelector('.pm-campaign-card[data-target="victoria"]');
    if (card) card.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const victoriaLayout = await page.evaluate(() => {
    const gallery = document.getElementById('victoria');
    return {
      hasPhoneMockups: !!gallery?.querySelector('.pm-phone-gallery'),
      hasSlideshow: !!gallery?.querySelector('.pm-horizontal-slideshow')
    };
  });
  console.log('  Layout check:', victoriaLayout);

  await page.screenshot({
    path: path.join(__dirname, '../screenshots/layout-victoria-slideshow.png'),
    fullPage: false
  });

  await browser.close();
  console.log('\nDone! Check /screenshots folder');
}

verify().catch(console.error);
