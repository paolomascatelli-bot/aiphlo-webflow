/**
 * Screenshot full footer section
 */
const puppeteer = require('puppeteer');
const path = require('path');

async function screenshot() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 2000 });

  console.log('Taking full page screenshot focused on footer...');
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2', timeout: 30000 });

  // Scroll to show footer
  await page.evaluate(() => {
    const footer = document.querySelector('.pm-footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: path.join(__dirname, '../screenshots/footer-full-view.png'),
    fullPage: false
  });
  console.log('Saved: footer-full-view.png');

  await browser.close();
}

screenshot().catch(console.error);
