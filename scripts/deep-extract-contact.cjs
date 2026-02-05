/**
 * Deep Extract Contact Page
 * Look for embedded code blocks, iframes, custom widgets
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function deepExtract() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  const page = await browser.newPage();

  console.log('\n=== DEEP EXTRACTION: CONTACT PAGE ===\n');

  // Go to main page first
  await page.goto('https://www.paolomascatelli.com/', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // 1. Look for ALL navigation links (including hidden ones)
  console.log('1. Finding ALL navigation links...');
  const allLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links.map(a => ({
      text: a.innerText?.trim() || a.textContent?.trim() || '',
      href: a.href,
      visible: a.offsetParent !== null,
      classes: a.className
    })).filter(l => l.href && !l.href.startsWith('javascript'));
  });

  console.log('All links found:', allLinks.length);
  const uniqueHrefs = [...new Set(allLinks.map(l => l.href))];
  console.log('Unique hrefs:', uniqueHrefs.slice(0, 20));

  // 2. Look for contact-related links specifically
  const contactLinks = allLinks.filter(l =>
    l.text.toLowerCase().includes('contact') ||
    l.href.toLowerCase().includes('contact') ||
    l.text.toLowerCase().includes('resume') ||
    l.href.toLowerCase().includes('resume')
  );
  console.log('\nContact/Resume links:', contactLinks);

  // 3. Check for any sections with code blocks or embeds
  console.log('\n2. Looking for code blocks and embeds...');
  const embeds = await page.evaluate(() => {
    const codeBlocks = document.querySelectorAll('[class*="code"], [class*="embed"], [class*="html"], iframe, object, embed');
    const scripts = document.querySelectorAll('script[src]');

    return {
      codeBlocks: Array.from(codeBlocks).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        src: el.src || '',
        innerHTML: el.innerHTML?.substring(0, 500)
      })),
      externalScripts: Array.from(scripts).map(s => s.src)
    };
  });
  console.log('Code blocks/embeds found:', embeds.codeBlocks.length);
  console.log('External scripts:', embeds.externalScripts.length);

  // 4. Get full site structure - all sections with IDs
  console.log('\n3. Mapping site sections...');
  const sections = await page.evaluate(() => {
    const allSections = document.querySelectorAll('section, [data-section-id], [id]');
    return Array.from(allSections).map(s => ({
      tagName: s.tagName,
      id: s.id || s.dataset?.sectionId || '',
      className: s.className?.substring(0, 100),
      hasCodeBlock: s.querySelector('[class*="code"], [class*="embed"], iframe') !== null,
      textPreview: s.innerText?.substring(0, 200)
    })).filter(s => s.id || s.hasCodeBlock);
  });
  console.log('Sections with IDs or embeds:', sections.length);
  sections.forEach(s => {
    if (s.hasCodeBlock) console.log('  [EMBED]', s.id || 'no-id', s.textPreview?.substring(0, 50));
  });

  // 5. Try clicking on "contact us" link if it exists
  console.log('\n4. Trying to navigate to contact...');
  const contactLink = await page.$('a[href*="contact"], a:contains("contact")');
  if (contactLink) {
    await contactLink.click();
    await new Promise(r => setTimeout(r, 3000));
    console.log('After click, URL:', page.url());
  }

  // 6. Check for Squarespace-specific page list
  console.log('\n5. Checking Squarespace structure...');
  const sqPages = await page.evaluate(() => {
    // Squarespace stores page data in Static context
    if (window.Static && window.Static.SQUARESPACE_CONTEXT) {
      return window.Static.SQUARESPACE_CONTEXT;
    }
    // Also check for navigation data
    const navData = document.querySelector('[data-controller="Navigation"]');
    return { navData: navData?.innerHTML?.substring(0, 1000) };
  });
  console.log('Squarespace context:', JSON.stringify(sqPages, null, 2).substring(0, 2000));

  // 7. Get ALL page URLs from the site
  console.log('\n6. Extracting all internal URLs...');
  const internalUrls = await page.evaluate(() => {
    const base = window.location.origin;
    const links = Array.from(document.querySelectorAll('a[href]'));
    const urls = links
      .map(a => a.href)
      .filter(href => href.startsWith(base) || href.startsWith('/'))
      .map(href => href.startsWith('/') ? base + href : href);
    return [...new Set(urls)];
  });
  console.log('Internal URLs found:', internalUrls);

  // Save all data
  const outputPath = path.join(__dirname, '../screenshots/deep-contact-extraction.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    allLinks: allLinks.slice(0, 50),
    contactLinks,
    embeds,
    sections: sections.slice(0, 30),
    sqPages,
    internalUrls,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log('\nData saved to:', outputPath);

  // Take screenshot
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/deep-extraction-view.png'),
    fullPage: true
  });

  console.log('\nBrowser left open for manual inspection. Close when done.');
}

deepExtract().catch(console.error);
