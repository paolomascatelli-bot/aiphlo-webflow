/**
 * Screenshot Footer and Contact Page
 * Compare our version vs original
 */
const puppeteer = require('puppeteer');
const path = require('path');

async function screenshot() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('\n=== SCREENSHOT COMPARISON ===\n');

  // 1. Our Footer
  console.log('1. Our Footer:');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/our-footer.png'),
    fullPage: false
  });
  console.log('   Saved: our-footer.png');

  // 2. Original Footer
  console.log('2. Original Footer:');
  await page.goto('https://www.paolomascatelli.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/original-footer.png'),
    fullPage: false
  });
  console.log('   Saved: original-footer.png');

  // 3. Our Contact Page
  console.log('3. Our Contact Page:');
  await page.goto('http://localhost:3001/contact', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/our-contact.png'),
    fullPage: true
  });
  console.log('   Saved: our-contact.png');

  // 4. Analyze footer differences
  console.log('\n4. Footer Analysis:');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 500));

  const ourFooter = await page.evaluate(() => {
    const footer = document.querySelector('.pm-footer');
    if (!footer) return { found: false };

    const rect = footer.getBoundingClientRect();
    const bgImg = footer.querySelector('.pm-footer-bg-img');
    const logos = footer.querySelectorAll('.pm-footer-logo, .pm-footer-color-drop');
    const newsletter = footer.querySelector('.pm-footer-newsletter');

    return {
      found: true,
      height: rect.height,
      hasBgImg: !!bgImg,
      bgImgLoaded: bgImg ? bgImg.complete && bgImg.naturalWidth > 0 : false,
      logoCount: logos.length,
      hasNewsletter: !!newsletter,
      visibleText: footer.innerText.substring(0, 500)
    };
  });
  console.log('   Our footer:', ourFooter);

  // 5. Original footer analysis
  await page.goto('https://www.paolomascatelli.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1000));

  const origFooter = await page.evaluate(() => {
    const footer = document.querySelector('footer') || document.querySelector('[class*="footer"]');
    if (!footer) return { found: false };

    const rect = footer.getBoundingClientRect();
    const images = footer.querySelectorAll('img');
    const forms = footer.querySelectorAll('form');

    return {
      found: true,
      height: rect.height,
      imageCount: images.length,
      hasForm: forms.length > 0,
      visibleText: footer.innerText.substring(0, 500)
    };
  });
  console.log('   Original footer:', origFooter);

  await browser.close();
  console.log('\n=== DONE ===\n');
}

screenshot().catch(console.error);
