const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.paolomascatelli.com';
const OUTPUT_DIR = path.join(__dirname, '../assets/content');
const URL_MAP_FILE = path.join(OUTPUT_DIR, 'url-redirects.json');
const HTACCESS_FILE = path.join(OUTPUT_DIR, 'redirects.htaccess');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function mapUrls() {
  console.log('🚀 Starting URL mapping...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const discoveredUrls = new Set();
  const urlMap = [];

  // Start with known pages
  const startUrls = [
    BASE_URL,
    `${BASE_URL}/projects`,
    `${BASE_URL}/photography`,
    `${BASE_URL}/social-media`,
    `${BASE_URL}/faqs`,
    `${BASE_URL}/contact`
  ];

  for (const url of startUrls) {
    discoveredUrls.add(url);
  }

  console.log('🔍 Discovering all URLs on the site...');

  // Visit each page and extract links
  for (const url of Array.from(discoveredUrls)) {
    try {
      console.log(`   Visiting: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Extract all links
      const links = await page.evaluate((baseUrl) => {
        const allLinks = [];
        document.querySelectorAll('a[href]').forEach(link => {
          const href = link.href;
          // Only include links from the same domain
          if (href.startsWith(baseUrl)) {
            allLinks.push(href);
          }
        });
        return allLinks;
      }, BASE_URL);

      // Add new URLs to the set
      links.forEach(link => {
        // Remove query params and anchors for cleaner URLs
        const cleanUrl = link.split('?')[0].split('#')[0];
        if (cleanUrl !== BASE_URL && !cleanUrl.endsWith('.css') && !cleanUrl.endsWith('.js')) {
          discoveredUrls.add(cleanUrl);
        }
      });

    } catch (error) {
      console.error(`   ❌ Error visiting ${url}:`, error.message);
    }
  }

  console.log(`\n✅ Discovered ${discoveredUrls.size} unique URLs`);

  // Create URL mapping
  console.log('\n📋 Creating URL redirect map...');

  discoveredUrls.forEach(oldUrl => {
    const urlPath = new URL(oldUrl).pathname;

    // Map old Squarespace URLs to new Webflow URLs
    // This is a basic mapping - adjust based on actual Webflow structure
    let newPath = urlPath;

    // Example mappings (customize based on your needs)
    if (urlPath === '/' || urlPath === '') {
      newPath = '/';
    } else if (urlPath.includes('/projects')) {
      newPath = urlPath.replace('/projects', '/work');
    } else if (urlPath.includes('/photography')) {
      newPath = urlPath;
    } else if (urlPath.includes('/social-media')) {
      newPath = '/social';
    } else if (urlPath.includes('/faqs')) {
      newPath = '/faq';
    } else if (urlPath.includes('/contact')) {
      newPath = '/contact';
    }

    urlMap.push({
      oldUrl: oldUrl,
      oldPath: urlPath,
      newPath: newPath,
      status: 301 // Permanent redirect
    });
  });

  await browser.close();

  // Save URL map as JSON
  fs.writeFileSync(URL_MAP_FILE, JSON.stringify(urlMap, null, 2));
  console.log(`   📁 URL map saved to: ${URL_MAP_FILE}`);

  // Generate .htaccess file for Apache servers
  let htaccess = '# 301 Redirects for Squarespace to Webflow Migration\n';
  htaccess += '# Generated on ' + new Date().toISOString() + '\n\n';
  htaccess += 'RewriteEngine On\n\n';

  urlMap.forEach(mapping => {
    if (mapping.oldPath !== mapping.newPath && mapping.oldPath !== '/') {
      htaccess += `RewriteRule ^${mapping.oldPath.substring(1)}$ ${mapping.newPath} [R=301,L]\n`;
    }
  });

  fs.writeFileSync(HTACCESS_FILE, htaccess);
  console.log(`   📁 .htaccess file saved to: ${HTACCESS_FILE}`);

  // Generate Webflow redirect configuration
  const webflowRedirects = urlMap
    .filter(m => m.oldPath !== m.newPath && m.oldPath !== '/')
    .map(m => `${m.oldPath} ${m.newPath} 301`);

  const webflowFile = path.join(OUTPUT_DIR, 'webflow-redirects.txt');
  fs.writeFileSync(webflowFile, webflowRedirects.join('\n'));
  console.log(`   📁 Webflow redirects saved to: ${webflowFile}`);

  console.log(`\n✨ URL mapping complete!`);
  console.log(`   🔗 Total redirects: ${urlMap.length}`);
}

// Run the mapper
mapUrls().catch(console.error);
