/**
 * Fetch Contact Page via Browser Navigation
 * Since direct URL returns 404, we need to navigate via the site
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function fetchContact() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  const page = await browser.newPage();

  console.log('\n=== FETCHING CONTACT PAGE VIA NAVIGATION ===\n');

  // Go to home first
  await page.goto('https://www.paolomascatelli.com/', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });
  console.log('Loaded home page');

  // Screenshot home page - look for the button in upper left
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/home-with-nav.png'),
    fullPage: false
  });
  console.log('Screenshot: home-with-nav.png');

  // Find and extract all navigation links
  const navLinks = await page.evaluate(() => {
    const allLinks = document.querySelectorAll('a');
    return Array.from(allLinks).map(a => ({
      text: a.innerText?.trim() || a.title || '',
      href: a.href,
      classList: a.className
    })).filter(l => l.href && (l.text.toLowerCase().includes('contact') || l.href.toLowerCase().includes('contact')));
  });
  console.log('Contact-related links found:', navLinks);

  // Try to click the contact link in nav
  console.log('\nAttempting to navigate to Contact...');

  // Method 1: Click the Contact link
  try {
    await page.evaluate(() => {
      const contactLink = Array.from(document.querySelectorAll('a')).find(
        a => a.innerText?.toLowerCase().includes('contact') || a.href?.toLowerCase().includes('contact')
      );
      if (contactLink) {
        console.log('Found contact link:', contactLink.href);
        contactLink.click();
      }
    });

    await new Promise(r => setTimeout(r, 3000));
    console.log('Current URL after click:', page.url());

    // Screenshot the result
    await page.screenshot({
      path: path.join(__dirname, '../screenshots/contact-after-click.png'),
      fullPage: true
    });
    console.log('Screenshot: contact-after-click.png');

  } catch (e) {
    console.log('Click method failed:', e.message);
  }

  // Method 2: Try direct navigation with waitUntil options
  console.log('\nTrying direct navigation to /contact...');
  try {
    const response = await page.goto('https://www.paolomascatelli.com/contact', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    console.log('Response status:', response.status());

    await new Promise(r => setTimeout(r, 3000));

    await page.screenshot({
      path: path.join(__dirname, '../screenshots/contact-direct.png'),
      fullPage: true
    });
    console.log('Screenshot: contact-direct.png');

  } catch (e) {
    console.log('Direct navigation failed:', e.message);
  }

  // Extract whatever content is on the page now
  const content = await page.evaluate(() => {
    return {
      url: window.location.href,
      title: document.title,
      bodyText: document.body?.innerText?.substring(0, 5000),
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText),
      forms: document.querySelectorAll('form').length,
      codeBlocks: document.querySelectorAll('[class*="code"], [class*="embed"]').length
    };
  });

  console.log('\n=== PAGE CONTENT ===');
  console.log('URL:', content.url);
  console.log('Title:', content.title);
  console.log('Headings:', content.headings);
  console.log('Forms:', content.forms);
  console.log('Code blocks:', content.codeBlocks);
  console.log('\nBody preview:', content.bodyText?.substring(0, 1000));

  // Save content
  fs.writeFileSync(
    path.join(__dirname, '../screenshots/contact-page-content.json'),
    JSON.stringify(content, null, 2)
  );

  console.log('\nBrowser open for inspection. Close when done.');
}

fetchContact().catch(console.error);
