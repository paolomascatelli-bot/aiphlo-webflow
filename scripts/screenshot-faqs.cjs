const puppeteer = require('puppeteer');
const path = require('path');

async function screenshot() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('Taking FAQs page screenshot...');
  await page.goto('http://localhost:3001/faqs', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({
    path: path.join(__dirname, '../screenshots/our-faqs.png'),
    fullPage: true
  });
  console.log('Saved: our-faqs.png');

  // Click on first FAQ to expand
  const faqBtn = await page.$('.pm-faq-question');
  if (faqBtn) {
    await faqBtn.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({
      path: path.join(__dirname, '../screenshots/our-faqs-expanded.png'),
      fullPage: true
    });
    console.log('Saved: our-faqs-expanded.png');
  }

  await browser.close();
  console.log('Done!');
}

screenshot().catch(console.error);
