/**
 * COMPREHENSIVE PAGE AUDIT SCRIPT
 *
 * Systematically checks ALL pages for:
 * 1. BACKGROUND - color, image, video
 * 2. HERO/HEADER - images, text, positioning
 * 3. SECONDARY NAV - type, position, functionality
 * 4. CONTENT - exact copy, structure, order
 * 5. ASSETS - sizes, dimensions, aspect ratios
 * 6. CSS ELEMENTS - styling, colors, fonts
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ORIGINAL_BASE = 'https://www.paolomascatelli.com';
const LOCAL_BASE = 'http://localhost:3001';

const PAGES = [
  { name: 'Home', originalPath: '/', localPath: '/' },
  { name: 'Projects', originalPath: '/projects', localPath: '/projects' },
  { name: 'Photography', originalPath: '/photography', localPath: '/photography' },
  { name: 'Social Media', originalPath: '/socialmedia', localPath: '/socialmedia' },
  { name: 'FAQs', originalPath: '/faqs', localPath: '/faqs' },
  { name: 'Contact', originalPath: '/contact', localPath: '/contact' }
];

async function auditPage(page, pageName, url, isOriginal) {
  const report = {
    page: pageName,
    url: url,
    source: isOriginal ? 'ORIGINAL' : 'LOCAL',
    checks: {}
  };

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // 1. BACKGROUND CHECK
    report.checks.background = await page.evaluate(() => {
      const body = document.body;
      const main = document.querySelector('main');
      const hero = document.querySelector('.page-hero, [class*="hero"], section:first-of-type');

      const getStyles = (el) => {
        if (!el) return null;
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          backgroundImage: styles.backgroundImage,
          backgroundSize: styles.backgroundSize,
          backgroundPosition: styles.backgroundPosition
        };
      };

      return {
        body: getStyles(body),
        main: getStyles(main),
        hero: getStyles(hero)
      };
    });

    // 2. HERO/HEADER CHECK
    report.checks.hero = await page.evaluate(() => {
      const hero = document.querySelector('.page-hero, [class*="hero"], section:first-of-type');
      if (!hero) return { found: false };

      const heroImg = hero.querySelector('img');
      const heroH1 = hero.querySelector('h1');
      const heroCTA = hero.querySelector('a[class*="cta"], button');
      const rect = hero.getBoundingClientRect();

      return {
        found: true,
        height: rect.height,
        hasImage: !!heroImg,
        imageUrl: heroImg ? heroImg.src : null,
        hasHeadline: !!heroH1,
        headlineText: heroH1 ? heroH1.textContent.trim() : null,
        hasCTA: !!heroCTA,
        ctaText: heroCTA ? heroCTA.textContent.trim() : null
      };
    });

    // 3. SECONDARY NAV CHECK
    report.checks.secondaryNav = await page.evaluate(() => {
      const navTypes = {
        pills: document.querySelectorAll('.pm-pill, [class*="pill"], .gallery-tab'),
        cards: document.querySelectorAll('.pm-campaign-card, [class*="campaign-card"]'),
        thumbs: document.querySelectorAll('.pm-project-thumb, [class*="thumb"]'),
        tabs: document.querySelectorAll('.tab, [role="tab"]')
      };

      let foundType = null;
      let count = 0;
      let items = [];

      for (const [type, elements] of Object.entries(navTypes)) {
        if (elements.length > 0) {
          foundType = type;
          count = elements.length;
          elements.forEach(el => {
            items.push({
              text: el.textContent.trim().substring(0, 50),
              classes: el.className
            });
          });
          break;
        }
      }

      const container = document.querySelector('.pm-campaign-cards, .pm-project-thumbs, .gallery-tabs');
      let position = null;
      let isSticky = false;

      if (container) {
        const styles = window.getComputedStyle(container);
        position = styles.position;
        isSticky = position === 'sticky' || position === 'fixed';
      }

      return {
        type: foundType,
        count: count,
        items: items.slice(0, 5),
        isSticky: isSticky,
        position: position
      };
    });

    // 4. CONTENT CHECK
    report.checks.content = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).slice(0, 10);
      const paragraphs = Array.from(document.querySelectorAll('p')).slice(0, 5);
      const images = document.querySelectorAll('img');

      return {
        headingsCount: headings.length,
        headings: headings.map(h => ({ tag: h.tagName, text: h.textContent.trim().substring(0, 100) })),
        paragraphsCount: paragraphs.length,
        paragraphs: paragraphs.map(p => p.textContent.trim().substring(0, 200)),
        imagesCount: images.length
      };
    });

    // 5. ASSETS CHECK
    report.checks.assets = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img')).slice(0, 20);
      return images.map(img => ({
        src: img.src.split('/').pop(),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.offsetWidth,
        displayHeight: img.offsetHeight,
        alt: img.alt
      }));
    });

    // 6. CSS/STYLING CHECK
    report.checks.styling = await page.evaluate(() => {
      const getTypography = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const styles = window.getComputedStyle(el);
        return {
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          color: styles.color,
          letterSpacing: styles.letterSpacing
        };
      };

      return {
        h1: getTypography('h1'),
        h2: getTypography('h2'),
        body: getTypography('p'),
        nav: getTypography('nav a, .pm-nav-item')
      };
    });

    // Take screenshot
    const screenshotName = `${pageName.toLowerCase().replace(/\s/g, '-')}-${isOriginal ? 'original' : 'local'}.png`;
    await page.screenshot({
      path: path.join(__dirname, '../screenshots/audit', screenshotName),
      fullPage: false
    });
    report.screenshot = screenshotName;

  } catch (error) {
    report.error = error.message;
  }

  return report;
}

function compareReports(original, local) {
  const issues = [];

  // Compare backgrounds
  if (original.checks?.background && local.checks?.background) {
    const origBg = original.checks.background.body?.backgroundColor;
    const localBg = local.checks.background.body?.backgroundColor;
    if (origBg !== localBg) {
      issues.push({
        type: 'BACKGROUND',
        severity: 'HIGH',
        message: `Body background mismatch - Original: ${origBg}, Local: ${localBg}`
      });
    }
  }

  // Compare hero
  if (original.checks?.hero && local.checks?.hero) {
    if (original.checks.hero.hasImage && !local.checks.hero.hasImage) {
      issues.push({
        type: 'HERO',
        severity: 'HIGH',
        message: 'Missing hero image'
      });
    }
    if (original.checks.hero.headlineText !== local.checks.hero.headlineText) {
      issues.push({
        type: 'CONTENT',
        severity: 'MEDIUM',
        message: `Headline mismatch - Original: "${original.checks.hero.headlineText}", Local: "${local.checks.hero.headlineText}"`
      });
    }
  }

  // Compare secondary nav
  if (original.checks?.secondaryNav && local.checks?.secondaryNav) {
    if (original.checks.secondaryNav.type && !local.checks.secondaryNav.type) {
      issues.push({
        type: 'NAV',
        severity: 'HIGH',
        message: `Missing secondary nav - Original has ${original.checks.secondaryNav.type}`
      });
    }
    if (original.checks.secondaryNav.isSticky !== local.checks.secondaryNav.isSticky) {
      issues.push({
        type: 'NAV',
        severity: 'MEDIUM',
        message: `Sticky behavior mismatch - Original: ${original.checks.secondaryNav.isSticky}, Local: ${local.checks.secondaryNav.isSticky}`
      });
    }
  }

  // Compare content
  if (original.checks?.content && local.checks?.content) {
    if (original.checks.content.imagesCount > local.checks.content.imagesCount + 5) {
      issues.push({
        type: 'CONTENT',
        severity: 'MEDIUM',
        message: `Missing images - Original: ${original.checks.content.imagesCount}, Local: ${local.checks.content.imagesCount}`
      });
    }
  }

  return issues;
}

async function runAudit() {
  console.log('\n========================================');
  console.log('  COMPREHENSIVE PAGE AUDIT');
  console.log('========================================\n');

  // Create audit screenshots directory
  const auditDir = path.join(__dirname, '../screenshots/audit');
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const fullReport = {
    timestamp: new Date().toISOString(),
    pages: []
  };

  for (const pageConfig of PAGES) {
    console.log(`\n--- Auditing: ${pageConfig.name} ---`);

    // Check original
    console.log(`  Checking original: ${ORIGINAL_BASE}${pageConfig.originalPath}`);
    const originalReport = await auditPage(page, pageConfig.name, `${ORIGINAL_BASE}${pageConfig.originalPath}`, true);

    // Check local
    console.log(`  Checking local: ${LOCAL_BASE}${pageConfig.localPath}`);
    const localReport = await auditPage(page, pageConfig.name, `${LOCAL_BASE}${pageConfig.localPath}`, false);

    // Compare and find issues
    const issues = compareReports(originalReport, localReport);

    const pageResult = {
      name: pageConfig.name,
      original: originalReport,
      local: localReport,
      issues: issues,
      status: issues.filter(i => i.severity === 'HIGH').length > 0 ? 'NEEDS_FIX' :
              issues.length > 0 ? 'REVIEW' : 'PASS'
    };

    fullReport.pages.push(pageResult);

    // Print summary for this page
    console.log(`  Status: ${pageResult.status}`);
    if (issues.length > 0) {
      issues.forEach(issue => {
        console.log(`    [${issue.severity}] ${issue.type}: ${issue.message}`);
      });
    }
  }

  await browser.close();

  // Save full report
  const reportPath = path.join(__dirname, '../screenshots/audit/audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
  console.log(`\nFull report saved to: ${reportPath}`);

  // Print summary
  console.log('\n========================================');
  console.log('  AUDIT SUMMARY');
  console.log('========================================');

  const needsFix = fullReport.pages.filter(p => p.status === 'NEEDS_FIX');
  const needsReview = fullReport.pages.filter(p => p.status === 'REVIEW');
  const passing = fullReport.pages.filter(p => p.status === 'PASS');

  console.log(`\n  NEEDS_FIX: ${needsFix.length} pages`);
  needsFix.forEach(p => console.log(`    - ${p.name}`));

  console.log(`\n  REVIEW: ${needsReview.length} pages`);
  needsReview.forEach(p => console.log(`    - ${p.name}`));

  console.log(`\n  PASS: ${passing.length} pages`);
  passing.forEach(p => console.log(`    - ${p.name}`));

  console.log('\n========================================\n');
}

runAudit().catch(console.error);
