/**
 * Extract Footer and Contact Page from Original Site
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function extract() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const results = {
    footer: null,
    contact: null
  };

  console.log('\n=== EXTRACTING FOOTER & CONTACT ===\n');

  // 1. Extract Footer from Home Page
  console.log('1. FOOTER EXTRACTION:');
  try {
    await page.goto('https://www.paolomascatelli.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to bottom to ensure footer loads
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 1000));

    results.footer = await page.evaluate(() => {
      // Try multiple footer selectors
      const footerSelectors = [
        'footer',
        '[data-section-id*="footer"]',
        '.footer',
        '#footer',
        '[class*="footer"]',
        'section:last-of-type'
      ];

      let footer = null;
      for (const sel of footerSelectors) {
        footer = document.querySelector(sel);
        if (footer) break;
      }

      if (!footer) {
        // Get last section of page
        const sections = document.querySelectorAll('section');
        footer = sections[sections.length - 1];
      }

      if (!footer) return { found: false };

      const styles = window.getComputedStyle(footer);
      const rect = footer.getBoundingClientRect();

      // Get all text content
      const textElements = footer.querySelectorAll('p, span, a, div');
      const texts = [];
      textElements.forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length < 200) {
          texts.push(text);
        }
      });

      // Get all images
      const images = footer.querySelectorAll('img');
      const imageUrls = Array.from(images).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight
      }));

      // Get all links
      const links = footer.querySelectorAll('a');
      const linkData = Array.from(links).map(link => ({
        text: link.textContent.trim(),
        href: link.href
      }));

      // Get HTML structure
      const html = footer.outerHTML;

      return {
        found: true,
        height: rect.height,
        background: styles.backgroundColor,
        textContent: [...new Set(texts)].filter(t => t.length > 0),
        images: imageUrls,
        links: linkData,
        html: html.substring(0, 5000) // Limit HTML size
      };
    });

    console.log('   Text content:', results.footer?.textContent);
    console.log('   Images:', results.footer?.images?.length);
    console.log('   Links:', results.footer?.links);

    // Screenshot footer
    await page.screenshot({
      path: path.join(__dirname, '../screenshots/footer-original.png'),
      fullPage: true
    });

  } catch (error) {
    console.log('   Error:', error.message);
    results.footer = { error: error.message };
  }

  // 2. Extract Contact Page
  console.log('\n2. CONTACT PAGE EXTRACTION:');

  // Try different contact URLs
  const contactUrls = [
    'https://www.paolomascatelli.com/contact',
    'https://www.paolomascatelli.com/contact-1',
    'https://www.paolomascatelli.com/contact-us'
  ];

  for (const url of contactUrls) {
    console.log(`   Trying: ${url}`);
    try {
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      if (response.status() === 200) {
        await new Promise(r => setTimeout(r, 2000));

        results.contact = await page.evaluate(() => {
          // Get main content
          const main = document.querySelector('main') || document.body;

          // Look for embedded code blocks
          const codeBlocks = main.querySelectorAll('[data-block-type="code"], .code-block, .sqs-block-code, iframe, .embed-block');
          const embeds = Array.from(codeBlocks).map(block => ({
            type: block.tagName,
            className: block.className,
            html: block.outerHTML.substring(0, 2000)
          }));

          // Get all text content
          const textElements = main.querySelectorAll('h1, h2, h3, p, span, a');
          const texts = [];
          textElements.forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length > 0 && text.length < 500) {
              texts.push({
                tag: el.tagName,
                text: text
              });
            }
          });

          // Get forms
          const forms = main.querySelectorAll('form');
          const formData = Array.from(forms).map(form => ({
            action: form.action,
            method: form.method,
            fields: Array.from(form.querySelectorAll('input, textarea, select')).map(f => ({
              type: f.type,
              name: f.name,
              placeholder: f.placeholder
            }))
          }));

          // Get images
          const images = main.querySelectorAll('img');
          const imageUrls = Array.from(images).map(img => ({
            src: img.src,
            alt: img.alt
          }));

          // Get iframes (for embedded content)
          const iframes = main.querySelectorAll('iframe');
          const iframeData = Array.from(iframes).map(iframe => ({
            src: iframe.src,
            width: iframe.width,
            height: iframe.height
          }));

          // Get background
          const styles = window.getComputedStyle(main);

          return {
            found: true,
            url: window.location.href,
            background: styles.backgroundColor,
            texts: texts.slice(0, 50),
            embeds: embeds,
            forms: formData,
            images: imageUrls,
            iframes: iframeData,
            html: main.innerHTML.substring(0, 10000)
          };
        });

        console.log('   Found contact page!');
        console.log('   Texts:', results.contact?.texts?.length);
        console.log('   Embeds:', results.contact?.embeds?.length);
        console.log('   Forms:', results.contact?.forms?.length);
        console.log('   Iframes:', results.contact?.iframes?.length);

        // Screenshot contact page
        await page.screenshot({
          path: path.join(__dirname, '../screenshots/contact-original.png'),
          fullPage: true
        });

        break;
      }
    } catch (error) {
      console.log(`   ${url}: ${error.message}`);
    }
  }

  await browser.close();

  // Save results
  const outputPath = path.join(__dirname, '../screenshots/footer-contact-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nData saved to: ${outputPath}`);

  // Print summary
  console.log('\n=== EXTRACTION COMPLETE ===\n');

  if (results.footer?.found) {
    console.log('FOOTER TEXT:');
    results.footer.textContent?.forEach(t => console.log(`  - ${t}`));
  }

  if (results.contact?.found) {
    console.log('\nCONTACT PAGE:');
    console.log('  URL:', results.contact.url);
    results.contact.texts?.slice(0, 10).forEach(t => console.log(`  [${t.tag}] ${t.text}`));
  }

  return results;
}

extract().catch(console.error);
