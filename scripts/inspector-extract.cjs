/**
 * INSPECTOR EXTRACT
 * Scrapes exact spacing/positioning values from live Squarespace site
 * For accurate replication in our template
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.paolomascatelli.com';
const PAGES = [
  { name: 'home', url: '/' },
  { name: 'photography', url: '/photography' },
  { name: 'projects', url: '/projects' }
];

async function extractSpacing() {
  console.log('🔍 Starting Inspector Extract...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    desktop: {},
    mobile: {}
  };

  try {
    const page = await browser.newPage();

    // ========== DESKTOP EXTRACTION ==========
    console.log('📐 Extracting DESKTOP values...');
    await page.setViewport({ width: 1440, height: 900 });

    for (const pageInfo of PAGES) {
      console.log(`  → ${pageInfo.name}: ${SITE_URL}${pageInfo.url}`);
      await page.goto(`${SITE_URL}${pageInfo.url}`, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));

      results.desktop[pageInfo.name] = await page.evaluate(() => {
        const getStyle = (selector) => {
          const el = document.querySelector(selector);
          if (!el) return null;
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            width: style.width,
            height: style.height,
            padding: style.padding,
            paddingTop: style.paddingTop,
            paddingBottom: style.paddingBottom,
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight,
            margin: style.margin,
            marginTop: style.marginTop,
            marginBottom: style.marginBottom,
            top: rect.top,
            left: rect.left,
            position: style.position,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            gap: style.gap
          };
        };

        return {
          // Main nav trigger/logo
          navTrigger: getStyle('[data-nc-element="branding"]') || getStyle('.header-title') || getStyle('header'),

          // Hero/header section
          hero: getStyle('.page-section:first-child') || getStyle('[data-section-id]'),

          // Gallery sections
          gallery: getStyle('.gallery-grid') || getStyle('.sqs-gallery-container'),
          galleryItem: getStyle('.gallery-grid-item') || getStyle('.slide'),

          // Secondary nav (Tenebre buttons, photo nav)
          secondaryNav: getStyle('#tenebre-gallery-nav') || getStyle('.gallery-nav'),

          // Section spacing
          sections: Array.from(document.querySelectorAll('section, [data-section-id]')).slice(0, 5).map((el, i) => {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
              index: i,
              paddingTop: style.paddingTop,
              paddingBottom: style.paddingBottom,
              marginTop: style.marginTop,
              marginBottom: style.marginBottom,
              top: rect.top,
              height: rect.height
            };
          }),

          // Body/container
          body: getStyle('body'),
          mainContent: getStyle('main') || getStyle('#page') || getStyle('.content-wrapper')
        };
      });
    }

    // ========== MOBILE EXTRACTION ==========
    console.log('\n📱 Extracting MOBILE values...');
    await page.setViewport({ width: 375, height: 812 }); // iPhone X dimensions

    for (const pageInfo of PAGES) {
      console.log(`  → ${pageInfo.name}: ${SITE_URL}${pageInfo.url}`);
      await page.goto(`${SITE_URL}${pageInfo.url}`, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));

      results.mobile[pageInfo.name] = await page.evaluate(() => {
        const getStyle = (selector) => {
          const el = document.querySelector(selector);
          if (!el) return null;
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            width: style.width,
            height: style.height,
            padding: style.padding,
            paddingTop: style.paddingTop,
            paddingBottom: style.paddingBottom,
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight,
            margin: style.margin,
            marginTop: style.marginTop,
            marginBottom: style.marginBottom,
            top: rect.top,
            left: rect.left,
            position: style.position,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            gap: style.gap
          };
        };

        return {
          navTrigger: getStyle('[data-nc-element="branding"]') || getStyle('.header-title') || getStyle('header'),
          hero: getStyle('.page-section:first-child') || getStyle('[data-section-id]'),
          gallery: getStyle('.gallery-grid') || getStyle('.sqs-gallery-container'),
          secondaryNav: getStyle('#tenebre-gallery-nav') || getStyle('.gallery-nav'),
          sections: Array.from(document.querySelectorAll('section, [data-section-id]')).slice(0, 5).map((el, i) => {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
              index: i,
              paddingTop: style.paddingTop,
              paddingBottom: style.paddingBottom,
              marginTop: style.marginTop,
              marginBottom: style.marginBottom,
              top: rect.top,
              height: rect.height
            };
          }),
          body: getStyle('body'),
          mainContent: getStyle('main') || getStyle('#page') || getStyle('.content-wrapper')
        };
      });
    }

    // ========== SAVE RESULTS ==========
    const outputPath = path.join(__dirname, '../extractions/spacing-values.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n✅ Saved to: ${outputPath}`);

    // Print summary
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    if (results.desktop.home?.sections?.[0]) {
      console.log('Desktop Home Section 1:');
      console.log(`  paddingTop: ${results.desktop.home.sections[0].paddingTop}`);
      console.log(`  paddingBottom: ${results.desktop.home.sections[0].paddingBottom}`);
    }
    if (results.mobile.home?.sections?.[0]) {
      console.log('Mobile Home Section 1:');
      console.log(`  paddingTop: ${results.mobile.home.sections[0].paddingTop}`);
      console.log(`  paddingBottom: ${results.mobile.home.sections[0].paddingBottom}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }

  return results;
}

extractSpacing();
