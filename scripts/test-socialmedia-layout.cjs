/* Test Social Media page layout - no hero, page title above cards */
const puppeteer = require('puppeteer');
const path = require('path');

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  await page.goto('http://localhost:3001/socialmedia', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Check layout elements
  const checks = await page.evaluate(() => {
    const hero = document.querySelector('.page-hero');
    const pageTitle = document.querySelector('.pm-campaigns-page-title');
    const container = document.querySelector('.pm-campaigns-container');
    const cards = document.querySelectorAll('.pm-campaign-card');

    let bgColor = 'unknown';
    if (container) {
      const styles = window.getComputedStyle(container);
      bgColor = styles.backgroundColor;
    }

    return {
      hasHero: hero !== null,
      hasPageTitle: pageTitle !== null,
      pageTitleText: pageTitle ? pageTitle.textContent : null,
      hasContainer: container !== null,
      hasFullWidthBg: container ? container.classList.contains('pm-full-width-bg') : false,
      backgroundColor: bgColor,
      cardCount: cards.length
    };
  });

  console.log('\n=== Social Media Layout Test ===\n');
  console.log('Hero section:', checks.hasHero ? '❌ FOUND (should be removed)' : '✅ NOT found (correct)');
  console.log('Page title:', checks.hasPageTitle ? '✅ FOUND' : '❌ NOT found');
  console.log('Page title text:', checks.pageTitleText || 'n/a');
  console.log('Full-width bg class:', checks.hasFullWidthBg ? '✅ YES' : '❌ NO');
  console.log('Background color:', checks.backgroundColor);
  console.log('Campaign cards:', checks.cardCount);

  // Screenshot
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/socialmedia-final-layout.png'),
    fullPage: false
  });
  console.log('\n📷 Screenshot saved to screenshots/socialmedia-final-layout.png');

  await browser.close();
}

test().catch(console.error);
