/**
 * Extract Contact Section from Main Page
 * The contact page appears to be a section on the single-page site
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function extractContact() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  const page = await browser.newPage();

  console.log('\n=== EXTRACTING CONTACT SECTION ===\n');

  // Go to main page
  await page.goto('https://www.paolomascatelli.com/', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  console.log('Loaded main page');

  // Screenshot initial state
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/original-home-top.png'),
    fullPage: false
  });
  console.log('Screenshot: original-home-top.png');

  // Scroll to bottom to find footer/contact
  console.log('\nScrolling to bottom...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({
    path: path.join(__dirname, '../screenshots/original-footer-full.png'),
    fullPage: false
  });
  console.log('Screenshot: original-footer-full.png');

  // Extract footer/contact section content
  const footerData = await page.evaluate(() => {
    // Look for footer element
    const footer = document.querySelector('footer') ||
                   document.querySelector('[class*="footer"]') ||
                   document.querySelector('[data-section-id*="footer"]');

    // Get all sections at the bottom
    const allSections = document.querySelectorAll('section');
    const lastSections = Array.from(allSections).slice(-3);

    // Extract text from bottom sections
    const bottomContent = lastSections.map(section => ({
      id: section.id || section.dataset?.sectionId || 'unknown',
      className: section.className,
      text: section.innerText?.substring(0, 1000),
      hasForm: section.querySelectorAll('form, input, button[type="submit"]').length > 0,
      hasNewsletter: section.innerText?.toLowerCase().includes('newsletter') ||
                     section.innerText?.toLowerCase().includes('subscribe') ||
                     section.innerText?.toLowerCase().includes('email'),
      images: Array.from(section.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt
      }))
    }));

    // Find forms
    const forms = document.querySelectorAll('form');
    const formData = Array.from(forms).map(form => ({
      action: form.action,
      method: form.method,
      inputs: Array.from(form.querySelectorAll('input, textarea, button')).map(el => ({
        type: el.type,
        name: el.name,
        placeholder: el.placeholder,
        text: el.innerText
      }))
    }));

    // Find email links
    const emailLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]')).map(a => a.href);

    // Find location text
    const locationText = [];
    const allText = document.body.innerText;
    if (allText.includes('L.A.') || allText.includes('LA')) locationText.push('L.A.');
    if (allText.includes('NYC') || allText.includes('New York')) locationText.push('NYC');
    if (allText.includes('MIAMI') || allText.includes('Miami')) locationText.push('Miami');
    if (allText.includes('ITALY') || allText.includes('Italy')) locationText.push('Italy');

    return {
      footerFound: !!footer,
      footerText: footer?.innerText?.substring(0, 2000),
      footerClasses: footer?.className,
      bottomSections: bottomContent,
      forms: formData,
      emailLinks,
      locationText,
      totalSections: allSections.length
    };
  });

  console.log('\n--- FOOTER/CONTACT DATA ---');
  console.log(JSON.stringify(footerData, null, 2));

  // Now look for the actual navigation to see if there's a Contact link
  const navData = await page.evaluate(() => {
    const navLinks = Array.from(document.querySelectorAll('nav a, header a, [class*="nav"] a'));
    return navLinks.map(a => ({
      text: a.innerText.trim(),
      href: a.href
    })).filter(link => link.text);
  });

  console.log('\n--- NAVIGATION LINKS ---');
  console.log(JSON.stringify(navData, null, 2));

  // Try clicking any "Contact" navigation if found
  const contactLink = navData.find(l =>
    l.text.toLowerCase().includes('contact') ||
    l.href.toLowerCase().includes('contact')
  );

  if (contactLink) {
    console.log('\nFound contact link:', contactLink);
    await page.click(`a[href="${contactLink.href}"]`);
    await new Promise(r => setTimeout(r, 2000));

    console.log('Current URL after click:', page.url());

    await page.screenshot({
      path: path.join(__dirname, '../screenshots/original-contact-clicked.png'),
      fullPage: true
    });
    console.log('Screenshot: original-contact-clicked.png');

    // Extract contact page content
    const contactContent = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
          tag: h.tagName,
          text: h.innerText
        })),
        paragraphs: Array.from(document.querySelectorAll('p')).map(p => p.innerText).filter(t => t.length > 5),
        forms: Array.from(document.querySelectorAll('form')).length,
        inputs: Array.from(document.querySelectorAll('input, textarea')).map(el => ({
          type: el.type,
          name: el.name,
          placeholder: el.placeholder
        })),
        images: Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src?.split('/').pop(),
          alt: img.alt
        })).slice(0, 20),
        fullText: document.body.innerText.substring(0, 5000)
      };
    });

    console.log('\n--- CONTACT PAGE CONTENT ---');
    console.log(JSON.stringify(contactContent, null, 2));
  }

  // Save all data
  const outputPath = path.join(__dirname, '../screenshots/contact-extraction.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    footerData,
    navData,
    contactLink,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log('\nData saved to:', outputPath);

  console.log('\nBrowser left open for inspection. Close manually.');
}

extractContact().catch(console.error);
