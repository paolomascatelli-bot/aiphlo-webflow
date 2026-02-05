/* Check home page for missing elements */
const puppeteer = require('puppeteer');
const path = require('path');

async function check() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Our current home page
  console.log('=== OUR HOME PAGE ===');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  const ourPage = await page.evaluate(() => {
    // Check for hero/header section
    const hero = document.querySelector('.pm-hero, .hero, header, [class*="hero"]');
    const heroImg = hero ? hero.querySelector('img') : null;

    // Check for background images
    const body = document.body;
    const bodyBg = window.getComputedStyle(body).backgroundImage;

    // Check sections
    const sections = document.querySelectorAll('section, [class*="section"]');

    return {
      hasHero: !!hero,
      heroClass: hero ? hero.className : null,
      hasHeroImg: !!heroImg,
      heroImgSrc: heroImg ? heroImg.src.split('/').pop() : null,
      bodyBackground: bodyBg !== 'none' ? bodyBg.substring(0, 80) : 'none',
      sectionCount: sections.length
    };
  });
  console.log(ourPage);

  await page.screenshot({
    path: path.join(__dirname, '../screenshots/home-check-ours.png'),
    fullPage: false
  });

  await browser.close();
  console.log('\nScreenshot saved');
}

check().catch(console.error);
