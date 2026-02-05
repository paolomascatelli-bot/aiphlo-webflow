/* =========================================
   AIPHLO SITE DETECTOR
   Automated detection of site structure,
   navs, interactive elements, shapes, positions
   ========================================= */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../assets/site-detection');
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function detectSite(siteUrl) {
  console.log('🔍 AIPHLO SITE DETECTOR');
  console.log('   Analyzing: ' + siteUrl);
  console.log('   Detecting unique elements, navs, shapes, positions...\n');

  const browser = await puppeteer.launch({
    headless: false, // Show browser so we can see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1200']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const siteAnalysis = {
    url: siteUrl,
    analyzedAt: new Date().toISOString(),
    pages: [],
    globalElements: {
      siteNav: null,
      footer: null,
      logo: null
    },
    uniqueFeatures: []
  };

  // Pages to analyze
  const pagesToAnalyze = [
    { name: 'Home', path: '/' },
    { name: 'Photography', path: '/photography' },
    { name: 'Social Media', path: '/social-media' },
    { name: 'Projects', path: '/projects' }
  ];

  for (const pageInfo of pagesToAnalyze) {
    const pageUrl = siteUrl + pageInfo.path;
    console.log(`\n📄 Analyzing: ${pageInfo.name} (${pageUrl})`);

    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await new Promise(r => setTimeout(r, 3000));

      // Take initial screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${pageInfo.name.toLowerCase()}-initial.png`),
        fullPage: true
      });

      // Analyze page structure
      const pageAnalysis = await page.evaluate((pageName) => {
        const analysis = {
          name: pageName,
          primaryNav: null,
          secondaryNav: null,
          interactiveElements: [],
          galleries: [],
          toggles: [],
          uniqueShapes: [],
          measurements: {}
        };

        // DETECT PRIMARY NAVIGATION
        const navSelectors = [
          'nav', 'header nav', '[role="navigation"]',
          '[class*="nav-trigger"]', '[class*="nav-dropdown"]',
          '.pm-nav-trigger', '#pm-nav-trigger'
        ];

        for (const selector of navSelectors) {
          const nav = document.querySelector(selector);
          if (nav) {
            const rect = nav.getBoundingClientRect();
            const styles = window.getComputedStyle(nav);
            analysis.primaryNav = {
              selector: selector,
              className: nav.className,
              id: nav.id,
              position: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
              },
              styles: {
                position: styles.position,
                zIndex: styles.zIndex,
                background: styles.backgroundColor
              }
            };
            break;
          }
        }

        // DETECT SECONDARY/PAGE-SPECIFIC NAVIGATION
        const secondaryNavSelectors = [
          '[id*="photo-nav"]', '[id*="gallery-nav"]',
          '[class*="pill-track"]', '[class*="phantom"]',
          '[class*="category-nav"]', '[class*="filter-nav"]',
          '.pm-pill-group', '[class*="campaign-nav"]'
        ];

        for (const selector of secondaryNavSelectors) {
          const secNav = document.querySelector(selector);
          if (secNav) {
            const rect = secNav.getBoundingClientRect();
            const styles = window.getComputedStyle(secNav);
            const parent = secNav.parentElement;
            const parentRect = parent ? parent.getBoundingClientRect() : null;

            analysis.secondaryNav = {
              selector: selector,
              className: secNav.className,
              id: secNav.id,
              position: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                parentTop: parentRect?.top
              },
              styles: {
                position: styles.position,
                zIndex: styles.zIndex,
                background: styles.backgroundColor,
                borderRadius: styles.borderRadius,
                padding: styles.padding
              }
            };
            break;
          }
        }

        // DETECT ALL INTERACTIVE BUTTONS/PILLS
        const buttons = document.querySelectorAll('button, [role="button"], [class*="pill"], [class*="btn"]');
        buttons.forEach(btn => {
          const rect = btn.getBoundingClientRect();
          const styles = window.getComputedStyle(btn);
          const text = btn.innerText?.trim() || btn.getAttribute('aria-label') || '';

          // Only include visible buttons
          if (rect.width > 10 && rect.height > 10 && text) {
            analysis.interactiveElements.push({
              type: 'button',
              text: text.substring(0, 50),
              className: btn.className,
              id: btn.id,
              position: {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              shape: {
                borderRadius: styles.borderRadius,
                aspectRatio: (rect.width / rect.height).toFixed(2)
              },
              styles: {
                background: styles.backgroundColor,
                color: styles.color,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
                border: styles.border,
                padding: styles.padding
              },
              dataAttributes: Array.from(btn.attributes)
                .filter(a => a.name.startsWith('data-'))
                .map(a => ({ [a.name]: a.value }))
            });
          }
        });

        // DETECT CIRCULAR/UNIQUE SHAPES (campaign icons, avatars)
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          const rect = img.getBoundingClientRect();
          const styles = window.getComputedStyle(img);
          const parent = img.parentElement;
          const parentStyles = parent ? window.getComputedStyle(parent) : null;

          // Detect circular images
          const isCircular = styles.borderRadius === '50%' ||
            styles.borderRadius === '9999px' ||
            (parentStyles && parentStyles.borderRadius === '50%');

          if (isCircular && rect.width > 30) {
            analysis.uniqueShapes.push({
              type: 'circular-image',
              src: img.src?.substring(0, 100),
              alt: img.alt,
              position: {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                size: Math.round(rect.width)
              },
              parentClass: parent?.className
            });
          }
        });

        // DETECT TOGGLE SWITCHES
        const toggles = document.querySelectorAll('[class*="toggle"], [class*="switch"]');
        toggles.forEach(toggle => {
          const rect = toggle.getBoundingClientRect();
          const styles = window.getComputedStyle(toggle);
          const labels = toggle.querySelectorAll('[class*="label"], span');
          const labelTexts = Array.from(labels).map(l => l.innerText?.trim()).filter(Boolean);

          if (rect.width > 20) {
            analysis.toggles.push({
              className: toggle.className,
              labels: labelTexts,
              position: {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              styles: {
                background: styles.backgroundColor,
                borderRadius: styles.borderRadius
              }
            });
          }
        });

        // DETECT GALLERIES
        const galleries = document.querySelectorAll('[class*="gallery"], [class*="grid"]');
        galleries.forEach(gallery => {
          const rect = gallery.getBoundingClientRect();
          const images = gallery.querySelectorAll('img');
          if (images.length > 2) {
            analysis.galleries.push({
              className: gallery.className,
              imageCount: images.length,
              position: {
                top: Math.round(rect.top),
                height: Math.round(rect.height)
              }
            });
          }
        });

        // KEY MEASUREMENTS (for accurate reproduction)
        analysis.measurements = {
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          scrollHeight: document.body.scrollHeight
        };

        return analysis;
      }, pageInfo.name);

      // CLICK THROUGH INTERACTIVE ELEMENTS
      console.log(`   Found ${pageAnalysis.interactiveElements.length} interactive elements`);

      // Click on pills/buttons and capture changes
      if (pageAnalysis.interactiveElements.length > 0) {
        console.log('   Clicking through elements to detect behavior...');

        for (let i = 0; i < Math.min(pageAnalysis.interactiveElements.length, 8); i++) {
          const element = pageAnalysis.interactiveElements[i];
          if (element.className.includes('pill') || element.dataAttributes.some(d => d['data-target'])) {
            try {
              // Click the element
              await page.click(`#${element.id}` || `.${element.className.split(' ')[0]}` || `button:nth-of-type(${i + 1})`);
              await new Promise(r => setTimeout(r, 1500));

              // Screenshot after click
              await page.screenshot({
                path: path.join(SCREENSHOT_DIR, `${pageInfo.name.toLowerCase()}-clicked-${i}.png`),
                fullPage: true
              });

              // Check what changed
              const afterClick = await page.evaluate(() => {
                const visibleSections = document.querySelectorAll('section:not([style*="display: none"])');
                return {
                  visibleSectionCount: visibleSections.length,
                  newContent: Array.from(visibleSections).map(s => ({
                    id: s.id,
                    className: s.className,
                    top: s.getBoundingClientRect().top
                  }))
                };
              });

              element.clickResult = afterClick;
              console.log(`      Clicked: ${element.text} → ${afterClick.visibleSectionCount} sections visible`);

            } catch (e) {
              console.log(`      Could not click: ${element.text}`);
            }
          }
        }
      }

      siteAnalysis.pages.push(pageAnalysis);

    } catch (error) {
      console.log(`   Error analyzing ${pageInfo.name}: ${error.message}`);
    }
  }

  await browser.close();

  // Save analysis
  const outputFile = path.join(OUTPUT_DIR, 'site-detection.json');
  fs.writeFileSync(outputFile, JSON.stringify(siteAnalysis, null, 2));
  console.log(`\n✅ Analysis saved to: ${outputFile}`);

  // Generate summary report
  generateReport(siteAnalysis);

  return siteAnalysis;
}

function generateReport(analysis) {
  let report = `# Site Detection Report\n\n`;
  report += `**URL:** ${analysis.url}\n`;
  report += `**Analyzed:** ${analysis.analyzedAt}\n\n`;

  analysis.pages.forEach(page => {
    report += `---\n\n## ${page.name}\n\n`;

    if (page.primaryNav) {
      report += `### Primary Navigation\n`;
      report += `- Position: top ${page.primaryNav.position.top}px\n`;
      report += `- z-index: ${page.primaryNav.styles.zIndex}\n\n`;
    }

    if (page.secondaryNav) {
      report += `### Secondary Navigation (Page-Specific)\n`;
      report += `- Selector: \`${page.secondaryNav.selector}\`\n`;
      report += `- Position: top ${page.secondaryNav.position.top}px\n`;
      report += `- Size: ${page.secondaryNav.position.width}x${page.secondaryNav.position.height}\n`;
      report += `- Border Radius: ${page.secondaryNav.styles.borderRadius}\n\n`;
    }

    if (page.interactiveElements.length > 0) {
      report += `### Interactive Elements (${page.interactiveElements.length})\n`;
      page.interactiveElements.slice(0, 10).forEach(el => {
        report += `- **${el.text}**\n`;
        report += `  - Position: ${el.position.top}px from top\n`;
        report += `  - Shape: ${el.shape.borderRadius} (ratio ${el.shape.aspectRatio})\n`;
        report += `  - Size: ${el.position.width}x${el.position.height}\n`;
      });
      report += `\n`;
    }

    if (page.uniqueShapes.length > 0) {
      report += `### Unique Shapes (${page.uniqueShapes.length})\n`;
      page.uniqueShapes.forEach(shape => {
        report += `- ${shape.type}: ${shape.position.size}px at (${shape.position.left}, ${shape.position.top})\n`;
      });
      report += `\n`;
    }

    if (page.toggles.length > 0) {
      report += `### Toggles (${page.toggles.length})\n`;
      page.toggles.forEach(toggle => {
        report += `- Labels: ${toggle.labels.join(' / ')}\n`;
        report += `  - Size: ${toggle.position.width}x${toggle.position.height}\n`;
      });
      report += `\n`;
    }
  });

  const reportFile = path.join(OUTPUT_DIR, 'SITE_DETECTION_REPORT.md');
  fs.writeFileSync(reportFile, report);
  console.log(`📄 Report saved to: ${reportFile}`);
}

// Run detection
const targetUrl = process.argv[2] || 'https://www.paolomascatelli.com';
detectSite(targetUrl).catch(console.error);
