/**
 * Extract full /aiphlo page content
 * This is the product/contact page with embedded code blocks
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function extract() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  const page = await browser.newPage();

  console.log('\n=== EXTRACTING /aiphlo PAGE ===\n');

  await page.goto('https://www.paolomascatelli.com/aiphlo', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // Wait for dynamic content
  await new Promise(r => setTimeout(r, 3000));

  // Full page screenshot
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/aiphlo-page-full.png'),
    fullPage: true
  });
  console.log('Screenshot saved: aiphlo-page-full.png');

  // Extract all content
  const content = await page.evaluate(() => {
    // Get all text sections
    const sections = [];
    const allSections = document.querySelectorAll('section, [class*="section"], .sqs-block');

    allSections.forEach((section, idx) => {
      const heading = section.querySelector('h1, h2, h3, h4');
      const paragraphs = section.querySelectorAll('p');
      const lists = section.querySelectorAll('ul, ol');

      if (heading || paragraphs.length > 0) {
        sections.push({
          index: idx,
          heading: heading?.innerText?.trim() || null,
          text: Array.from(paragraphs).map(p => p.innerText?.trim()).filter(Boolean),
          lists: Array.from(lists).map(l => Array.from(l.querySelectorAll('li')).map(li => li.innerText?.trim())),
          className: section.className?.substring(0, 100)
        });
      }
    });

    // Get all headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5')).map(h => ({
      tag: h.tagName,
      text: h.innerText?.trim()
    }));

    // Get contact info
    const contactInfo = {
      emails: Array.from(document.querySelectorAll('a[href^="mailto:"]')).map(a => a.href.replace('mailto:', '').split('?')[0]),
      phones: Array.from(document.querySelectorAll('a[href^="tel:"]')).map(a => a.href.replace('tel:', '')),
      addresses: []
    };

    // Look for address text
    const bodyText = document.body.innerText;
    const addressMatch = bodyText.match(/\d+\s+[A-Za-z\s]+Street[^,]*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}/);
    if (addressMatch) contactInfo.addresses.push(addressMatch[0]);

    // Get pricing if exists
    const pricingElements = document.querySelectorAll('[class*="pricing"], [class*="price"], [class*="tier"]');
    const pricing = Array.from(pricingElements).map(el => el.innerText?.substring(0, 500));

    // Get all visible text organized
    const fullText = document.body.innerText;

    // Get code blocks
    const codeBlocks = Array.from(document.querySelectorAll('.sqs-block-code, [class*="code-block"], .sqs-block-html')).map(el => ({
      type: el.className,
      content: el.innerHTML?.substring(0, 2000)
    }));

    // Get embedded content
    const embeds = Array.from(document.querySelectorAll('iframe, [class*="embed"]')).map(el => ({
      type: el.tagName,
      src: el.src || '',
      className: el.className
    }));

    return {
      url: window.location.href,
      title: document.title,
      headings,
      sections: sections.slice(0, 50),
      contactInfo,
      pricing,
      codeBlocks,
      embeds,
      fullTextLength: fullText.length,
      fullTextPreview: fullText.substring(0, 5000)
    };
  });

  console.log('\n--- PAGE CONTENT ---');
  console.log('Title:', content.title);
  console.log('Headings:', content.headings.length);
  console.log('Sections:', content.sections.length);
  console.log('Contact Info:', content.contactInfo);
  console.log('Code Blocks:', content.codeBlocks.length);
  console.log('Embeds:', content.embeds.length);

  // Save full extraction
  const outputPath = path.join(__dirname, '../screenshots/aiphlo-page-extraction.json');
  fs.writeFileSync(outputPath, JSON.stringify(content, null, 2));
  console.log('\nFull extraction saved to:', outputPath);

  console.log('\n--- FULL TEXT PREVIEW ---');
  console.log(content.fullTextPreview);

  console.log('\nBrowser left open. Close when done inspecting.');
}

extract().catch(console.error);
