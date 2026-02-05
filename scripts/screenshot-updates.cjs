/**
 * Screenshot Footer and Contact Page Updates
 */
const puppeteer = require('puppeteer');
const path = require('path');

async function screenshot() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('\n=== SCREENSHOT UPDATES ===\n');

  // 1. Our updated footer (scroll to bottom of home)
  console.log('1. Our Updated Footer:');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/our-footer-updated.png'),
    fullPage: false
  });
  console.log('   Saved: our-footer-updated.png');

  // 2. Our updated contact page
  console.log('2. Our Updated Contact Page:');
  await page.goto('http://localhost:3001/contact', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/our-contact-updated.png'),
    fullPage: true
  });
  console.log('   Saved: our-contact-updated.png');

  // 3. Original footer for comparison
  console.log('3. Original Footer:');
  await page.goto('https://www.paolomascatelli.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/original-footer-compare.png'),
    fullPage: false
  });
  console.log('   Saved: original-footer-compare.png');

  await browser.close();
  console.log('\n=== DONE ===\n');
}

screenshot().catch(console.error);
