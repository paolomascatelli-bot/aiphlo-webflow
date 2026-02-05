/**
 * SITEMAP DISCOVERY - Phase 0 of Extraction Protocol
 *
 * Run FIRST before any other extraction.
 * Compares sitemap pages to navigation links.
 * Flags unlinked pages for consumer review.
 */

const puppeteer = require('puppeteer');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function discoverPages(siteUrl) {
  console.log('\n========================================');
  console.log('  SITEMAP DISCOVERY - PHASE 0');
  console.log('========================================\n');

  const results = {
    siteUrl,
    timestamp: new Date().toISOString(),
    sitemap: { found: false, pages: [] },
    navigation: { pages: [] },
    analysis: { unlinkedPages: [], missingFromSitemap: [] },
    flags: []
  };

  // STEP 1: Fetch sitemap.xml
  console.log('STEP 1: Fetching sitemap.xml...');
  const sitemapUrl = siteUrl.replace(/\/$/, '') + '/sitemap.xml';

  try {
    const sitemapXml = await fetchUrl(sitemapUrl);
    const sitemapPages = parseSitemap(sitemapXml);

    if (sitemapPages.length > 0) {
      results.sitemap.found = true;
      results.sitemap.pages = sitemapPages;
      console.log(`   ✓ Found ${sitemapPages.length} pages in sitemap`);
      sitemapPages.forEach(p => console.log(`     - ${p}`));
    } else {
      results.flags.push('SITEMAP_EMPTY');
      console.log('   ✗ Sitemap exists but contains no pages');
    }
  } catch (err) {
    results.flags.push('SITEMAP_MISSING');
    console.log('   ✗ No sitemap.xml found (404 or error)');
    console.log('   → Consumer must provide page list manually');
  }

  // STEP 2: Extract navigation links
  console.log('\nSTEP 2: Extracting navigation links...');

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(siteUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const navPages = await page.evaluate((baseUrl) => {
      const links = document.querySelectorAll('nav a, header a, [class*="nav"] a, [class*="menu"] a');
      const base = baseUrl.replace(/\/$/, '');

      return Array.from(links)
        .map(a => {
          const href = a.href;
          if (!href || href.startsWith('javascript') || href.startsWith('#')) return null;
          // Normalize to path only
          try {
            const url = new URL(href);
            if (url.origin === new URL(baseUrl).origin) {
              return url.pathname;
            }
          } catch (e) {}
          return null;
        })
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i); // unique
    }, siteUrl);

    results.navigation.pages = navPages;
    console.log(`   ✓ Found ${navPages.length} pages in navigation`);
    navPages.forEach(p => console.log(`     - ${p}`));
  } catch (err) {
    results.flags.push('NAV_EXTRACTION_FAILED');
    console.log('   ✗ Failed to extract navigation:', err.message);
  }

  await browser.close();

  // STEP 3: Gap Analysis
  console.log('\nSTEP 3: Gap Analysis...');

  const sitemapPaths = results.sitemap.pages.map(normalizeUrl);
  const navPaths = results.navigation.pages.map(normalizeUrl);

  // Pages in sitemap but NOT in navigation = UNLINKED
  results.analysis.unlinkedPages = sitemapPaths.filter(p => !navPaths.includes(p));

  // Pages in navigation but NOT in sitemap = might be missing from sitemap
  results.analysis.missingFromSitemap = navPaths.filter(p => !sitemapPaths.includes(p));

  if (results.analysis.unlinkedPages.length > 0) {
    console.log('\n   ⚠️  UNLINKED PAGES DETECTED:');
    results.analysis.unlinkedPages.forEach(p => console.log(`     → ${p}`));
    console.log('\n   These pages exist but are NOT in navigation.');
    console.log('   ASK CONSUMER: Include in migration? [Y/N per page]');
    results.flags.push('UNLINKED_PAGES_FOUND');
  } else {
    console.log('   ✓ No unlinked pages detected');
  }

  if (results.analysis.missingFromSitemap.length > 0) {
    console.log('\n   ℹ️  Pages in nav but not sitemap:');
    results.analysis.missingFromSitemap.forEach(p => console.log(`     → ${p}`));
  }

  // STEP 4: Summary
  console.log('\n========================================');
  console.log('  DISCOVERY SUMMARY');
  console.log('========================================');
  console.log(`  Sitemap pages:    ${results.sitemap.pages.length}`);
  console.log(`  Navigation pages: ${results.navigation.pages.length}`);
  console.log(`  Unlinked pages:   ${results.analysis.unlinkedPages.length}`);
  console.log(`  Flags:            ${results.flags.join(', ') || 'None'}`);
  console.log('========================================\n');

  // Save results
  const outputPath = path.join(__dirname, '../screenshots/sitemap-discovery.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Results saved: ${outputPath}`);

  // Return for programmatic use
  return results;
}

// Helper: Fetch URL content
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };
    client.get(url, options, (res) => {
      if (res.statusCode === 404 || res.statusCode === 403) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Helper: Parse sitemap XML
function parseSitemap(xml) {
  const urls = [];
  // Match <loc> tags containing full URLs
  const regex = /<loc>(https?:\/\/[^<]+)<\/loc>/gi;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const url = match[1].trim();
    // Only include page URLs, not image URLs from Squarespace CDN
    if (!url.includes('squarespace-cdn.com') && !url.includes('images.squarespace')) {
      urls.push(url);
    }
  }
  // Remove duplicates
  return [...new Set(urls)];
}

// Helper: Normalize URL to path
function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/\/$/, '') || '/';
  } catch {
    return url.replace(/\/$/, '') || '/';
  }
}

// Run if called directly
if (require.main === module) {
  const siteUrl = process.argv[2] || 'https://www.paolomascatelli.com';
  discoverPages(siteUrl).catch(console.error);
}

module.exports = { discoverPages };
