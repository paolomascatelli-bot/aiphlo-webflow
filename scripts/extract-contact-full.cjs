/**
 * Extract FULL Contact Page from Original Site
 * Get everything - text, images, embedded content, layout
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function extract() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('\n=== EXTRACTING FULL CONTACT PAGE ===\n');

  // Navigate to home first to get the contact link
  await page.goto('https://www.paolomascatelli.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Find and click contact link
  const contactLink = await page.$('a[href*="contact"]');
  if (contactLink) {
    await contactLink.click();
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log('Current URL:', await page.url());

  // Take full page screenshot
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/contact-original-full.png'),
    fullPage: true
  });
  console.log('Screenshot saved: contact-original-full.png');

  // Extract all content
  const content = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;

    // Get all sections
    const sections = main.querySelectorAll('section, [data-section-id]');
    const sectionData = Array.from(sections).map((section, i) => {
      const styles = window.getComputedStyle(section);
      return {
        index: i,
        id: section.id || section.getAttribute('data-section-id'),
        className: section.className,
        background: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        innerText: section.innerText.substring(0, 1000),
        html: section.innerHTML.substring(0, 3000)
      };
    });

    // Get all headings
    const headings = Array.from(main.querySelectorAll('h1, h2, h3, h4')).map(h => ({
      tag: h.tagName,
      text: h.textContent.trim(),
      className: h.className
    }));

    // Get all paragraphs
    const paragraphs = Array.from(main.querySelectorAll('p')).map(p => ({
      text: p.textContent.trim(),
      className: p.className
    })).filter(p => p.text.length > 0);

    // Get all images
    const images = Array.from(main.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      className: img.className,
      width: img.naturalWidth,
      height: img.naturalHeight
    }));

    // Get all links
    const links = Array.from(main.querySelectorAll('a')).map(a => ({
      text: a.textContent.trim(),
      href: a.href,
      className: a.className
    }));

    // Get all forms
    const forms = Array.from(main.querySelectorAll('form')).map(f => ({
      action: f.action,
      method: f.method,
      html: f.outerHTML.substring(0, 2000)
    }));

    // Get embedded content / code blocks
    const embeds = Array.from(main.querySelectorAll(
      '[data-block-type="code"], .sqs-block-code, iframe, .code-block, [class*="embed"]'
    )).map(e => ({
      tag: e.tagName,
      className: e.className,
      html: e.outerHTML.substring(0, 3000)
    }));

    // Get all visible text
    const allText = main.innerText;

    return {
      url: window.location.href,
      title: document.title,
      sections: sectionData,
      headings,
      paragraphs,
      images,
      links,
      forms,
      embeds,
      fullText: allText.substring(0, 5000)
    };
  });

  console.log('\n--- EXTRACTED CONTENT ---\n');
  console.log('URL:', content.url);
  console.log('Title:', content.title);
  console.log('\nHeadings:');
  content.headings.forEach(h => console.log(`  [${h.tag}] ${h.text}`));
  console.log('\nParagraphs:');
  content.paragraphs.slice(0, 10).forEach(p => console.log(`  - ${p.text.substring(0, 100)}...`));
  console.log('\nImages:', content.images.length);
  content.images.forEach(img => console.log(`  - ${img.src.split('/').pop()}`));
  console.log('\nLinks:');
  content.links.forEach(l => console.log(`  - "${l.text}" -> ${l.href}`));
  console.log('\nForms:', content.forms.length);
  console.log('\nEmbeds:', content.embeds.length);
  console.log('\nSections:', content.sections.length);

  console.log('\n--- FULL TEXT ---\n');
  console.log(content.fullText);

  // Save to file
  fs.writeFileSync(
    path.join(__dirname, '../screenshots/contact-full-data.json'),
    JSON.stringify(content, null, 2)
  );
  console.log('\nData saved to: contact-full-data.json');

  console.log('\nBrowser left open for inspection. Close manually.');
}

extract().catch(console.error);
