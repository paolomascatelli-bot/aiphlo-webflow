/**
 * Extract Contact Page from Original Site
 * Looking specifically for embedded code blocks
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function extract() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('\n=== EXTRACTING CONTACT PAGE ===\n');

  // Try to find the contact page from the main site navigation
  try {
    await page.goto('https://www.paolomascatelli.com/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await new Promise(r => setTimeout(r, 2000));

    // Check the navigation for contact link
    const navLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      return Array.from(links)
        .filter(a => a.textContent.toLowerCase().includes('contact'))
        .map(a => ({
          text: a.textContent.trim(),
          href: a.href
        }));
    });

    console.log('Contact links found:', navLinks);

    // Try clicking on contact link if found
    for (const link of navLinks) {
      console.log(`\nTrying: ${link.href}`);
      try {
        await page.goto(link.href, { waitUntil: 'networkidle2', timeout: 15000 });
        await new Promise(r => setTimeout(r, 2000));

        // Extract page content
        const content = await page.evaluate(() => {
          const main = document.querySelector('main') || document.body;

          // Look for code blocks / embeds
          const codeBlocks = main.querySelectorAll(
            '[data-block-type="code"], .sqs-block-code, .code-block, ' +
            'iframe, .embed-block, script[type="text/javascript"], ' +
            '[class*="code"], [class*="embed"]'
          );

          // Get all block types
          const sqsBlocks = main.querySelectorAll('[data-block-type]');
          const blockTypes = Array.from(sqsBlocks).map(b => ({
            type: b.getAttribute('data-block-type'),
            html: b.outerHTML.substring(0, 1000)
          }));

          // Get visible text
          const textContent = main.innerText.substring(0, 3000);

          // Get all forms
          const forms = main.querySelectorAll('form');
          const formData = Array.from(forms).map(f => ({
            action: f.action,
            method: f.method,
            html: f.outerHTML.substring(0, 2000)
          }));

          return {
            url: window.location.href,
            title: document.title,
            codeBlocks: Array.from(codeBlocks).map(b => ({
              tag: b.tagName,
              className: b.className,
              html: b.outerHTML.substring(0, 2000)
            })),
            blockTypes: blockTypes,
            textContent: textContent,
            forms: formData,
            fullHtml: main.innerHTML.substring(0, 15000)
          };
        });

        console.log('Page title:', content.title);
        console.log('Text preview:', content.textContent.substring(0, 500));
        console.log('Code blocks found:', content.codeBlocks.length);
        console.log('Block types:', content.blockTypes.map(b => b.type));
        console.log('Forms:', content.forms.length);

        // Screenshot
        await page.screenshot({
          path: path.join(__dirname, '../screenshots/contact-page-original.png'),
          fullPage: true
        });

        // Save data
        fs.writeFileSync(
          path.join(__dirname, '../screenshots/contact-page-data.json'),
          JSON.stringify(content, null, 2)
        );

        console.log('\nSaved contact page data!');
        break;
      } catch (e) {
        console.log(`  Error: ${e.message}`);
      }
    }

  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\nBrowser left open for inspection. Close manually when done.');
  // await browser.close();
}

extract().catch(console.error);
