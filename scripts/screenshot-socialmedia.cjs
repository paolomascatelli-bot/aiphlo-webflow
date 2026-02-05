const puppeteer = require('puppeteer');
const path = require('path');

async function screenshot() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Navigate to local Social Media page
  await page.goto('http://localhost:3001/socialmedia', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot initial state
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/local-socialmedia-cards.png'),
    fullPage: false
  });
  console.log('Screenshot 1: Initial state saved');

  // Click vyayama card
  const vyayamaClicked = await page.evaluate(() => {
    const card = document.querySelector('.pm-campaign-card[data-target="vyayama"]');
    if (card) {
      card.click();
      return true;
    }
    return false;
  });

  if (vyayamaClicked) {
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({
      path: path.join(__dirname, '../screenshots/local-socialmedia-vyayama.png'),
      fullPage: false
    });
    console.log('Screenshot 2: Vyayama gallery saved');
  } else {
    console.log('Could not find vyayama card');
  }

  await browser.close();
  console.log('\nDone! Check /screenshots folder');
}

screenshot().catch(console.error);
