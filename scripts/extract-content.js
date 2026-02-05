const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.paolomascatelli.com';
const OUTPUT_DIR = path.join(__dirname, '../assets/content');
const CONTENT_FILE = path.join(OUTPUT_DIR, 'site-content.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function extractContent() {
  console.log('🚀 Starting content extraction...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const pages = [
    { name: 'Home', url: BASE_URL, slug: 'home' },
    { name: 'Projects', url: `${BASE_URL}/projects`, slug: 'projects' },
    { name: 'Photography', url: `${BASE_URL}/photography`, slug: 'photography' },
    { name: 'Social Media', url: `${BASE_URL}/social-media`, slug: 'social-media' },
    { name: 'FAQs', url: `${BASE_URL}/faqs`, slug: 'faqs' },
    { name: 'Contact', url: `${BASE_URL}/contact`, slug: 'contact' }
  ];

  const siteContent = {
    metadata: {},
    pages: []
  };

  for (const pageInfo of pages) {
    console.log(`\n📄 Extracting content from: ${pageInfo.name}`);

    try {
      await page.goto(pageInfo.url, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract page content
      const pageContent = await page.evaluate(() => {
        // Helper function to get clean text
        const getCleanText = (element) => {
          if (!element) return '';
          return element.innerText?.trim() || element.textContent?.trim() || '';
        };

        // Extract meta information
        const getMeta = (name) => {
          const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
          return meta ? meta.content : '';
        };

        // Extract headings
        const headings = [];
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
          const text = getCleanText(heading);
          if (text) {
            headings.push({
              level: heading.tagName.toLowerCase(),
              text: text,
              id: heading.id || ''
            });
          }
        });

        // Extract paragraphs
        const paragraphs = [];
        document.querySelectorAll('p').forEach(p => {
          const text = getCleanText(p);
          if (text && text.length > 10) { // Filter out very short text
            paragraphs.push(text);
          }
        });

        // Extract links
        const links = [];
        document.querySelectorAll('a[href]').forEach(link => {
          const href = link.href;
          const text = getCleanText(link);
          if (text && href) {
            links.push({
              text: text,
              href: href,
              isExternal: !href.includes(window.location.hostname)
            });
          }
        });

        // Extract navigation
        const navigation = [];
        document.querySelectorAll('nav a, [class*="nav"] a, [class*="menu"] a').forEach(link => {
          const text = getCleanText(link);
          const href = link.href;
          if (text && href) {
            navigation.push({
              text: text,
              href: href
            });
          }
        });

        // Extract gallery/image captions
        const captions = [];
        document.querySelectorAll('figcaption, [class*="caption"], [class*="description"]').forEach(el => {
          const text = getCleanText(el);
          if (text) {
            captions.push(text);
          }
        });

        // Extract buttons
        const buttons = [];
        document.querySelectorAll('button, .button, [class*="btn"]').forEach(btn => {
          const text = getCleanText(btn);
          if (text) {
            buttons.push({
              text: text,
              className: btn.className
            });
          }
        });

        // Extract forms
        const forms = [];
        document.querySelectorAll('form').forEach(form => {
          const inputs = [];
          form.querySelectorAll('input, textarea, select').forEach(input => {
            inputs.push({
              type: input.type || input.tagName.toLowerCase(),
              name: input.name,
              placeholder: input.placeholder || '',
              required: input.required,
              label: input.labels?.[0]?.textContent?.trim() || ''
            });
          });

          forms.push({
            action: form.action,
            method: form.method,
            inputs: inputs
          });
        });

        return {
          title: document.title,
          meta: {
            description: getMeta('description') || getMeta('og:description'),
            keywords: getMeta('keywords'),
            ogTitle: getMeta('og:title'),
            ogImage: getMeta('og:image'),
            ogUrl: getMeta('og:url')
          },
          headings: headings,
          paragraphs: paragraphs,
          links: links,
          navigation: navigation,
          captions: captions,
          buttons: buttons,
          forms: forms,
          bodyText: document.body.innerText
        };
      });

      // Add to site content
      siteContent.pages.push({
        name: pageInfo.name,
        slug: pageInfo.slug,
        url: pageInfo.url,
        ...pageContent
      });

      console.log(`   ✓ Extracted:`);
      console.log(`      - ${pageContent.headings.length} headings`);
      console.log(`      - ${pageContent.paragraphs.length} paragraphs`);
      console.log(`      - ${pageContent.links.length} links`);
      console.log(`      - ${pageContent.captions.length} captions`);
      console.log(`      - ${pageContent.forms.length} forms`);

    } catch (error) {
      console.error(`   ❌ Error extracting ${pageInfo.name}:`, error.message);
    }
  }

  // Extract global metadata (from home page)
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    siteContent.metadata = await page.evaluate(() => {
      const getMeta = (name) => {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return meta ? meta.content : '';
      };

      // Extract social links
      const socialLinks = [];
      document.querySelectorAll('a[href*="instagram"], a[href*="linkedin"], a[href*="facebook"], a[href*="twitter"]').forEach(link => {
        socialLinks.push({
          platform: link.href.includes('instagram') ? 'Instagram' :
                    link.href.includes('linkedin') ? 'LinkedIn' :
                    link.href.includes('facebook') ? 'Facebook' :
                    link.href.includes('twitter') ? 'Twitter' : 'Other',
          url: link.href
        });
      });

      // Extract contact info
      const emails = [];
      const phones = [];
      document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        emails.push(link.href.replace('mailto:', ''));
      });
      document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        phones.push(link.href.replace('tel:', ''));
      });

      return {
        siteName: getMeta('og:site_name') || document.title,
        description: getMeta('description'),
        socialLinks: socialLinks,
        emails: emails,
        phones: phones,
        favicon: document.querySelector('link[rel="icon"]')?.href || '',
        logo: document.querySelector('img[class*="logo"]')?.src || ''
      };
    });

  } catch (error) {
    console.error('❌ Error extracting metadata:', error.message);
  }

  await browser.close();

  // Save content
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(siteContent, null, 2));

  console.log(`\n✨ Content extraction complete!`);
  console.log(`   📁 Content saved to: ${CONTENT_FILE}`);
  console.log(`   📊 Extracted ${siteContent.pages.length} pages`);

  // Create individual markdown files for each page
  siteContent.pages.forEach(page => {
    const mdContent = generateMarkdown(page);
    const mdFile = path.join(OUTPUT_DIR, `${page.slug}.md`);
    fs.writeFileSync(mdFile, mdContent);
    console.log(`   📝 Created: ${page.slug}.md`);
  });
}

function generateMarkdown(page) {
  let md = `# ${page.title}\n\n`;

  if (page.meta.description) {
    md += `**Description:** ${page.meta.description}\n\n`;
  }

  md += `---\n\n`;

  // Headings and content
  if (page.headings.length > 0) {
    md += `## Headings\n\n`;
    page.headings.forEach(h => {
      md += `- ${h.level.toUpperCase()}: ${h.text}\n`;
    });
    md += `\n`;
  }

  // Paragraphs
  if (page.paragraphs.length > 0) {
    md += `## Main Content\n\n`;
    page.paragraphs.forEach(p => {
      md += `${p}\n\n`;
    });
  }

  // Forms
  if (page.forms.length > 0) {
    md += `## Forms\n\n`;
    page.forms.forEach((form, i) => {
      md += `### Form ${i + 1}\n`;
      md += `- Action: ${form.action}\n`;
      md += `- Method: ${form.method}\n`;
      md += `- Fields:\n`;
      form.inputs.forEach(input => {
        md += `  - ${input.label || input.name} (${input.type})${input.required ? ' *required*' : ''}\n`;
      });
      md += `\n`;
    });
  }

  return md;
}

// Run the extractor
extractContent().catch(console.error);
