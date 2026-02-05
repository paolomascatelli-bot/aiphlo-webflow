#!/usr/bin/env node
/* =========================================
   STYLESHEET EXTRACTOR
   Extracts actual CSS files from Squarespace
   Gets: hover states, transitions, animations, media queries
   ========================================= */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = process.argv[2] || 'https://www.paolomascatelli.com';
const OUTPUT_DIR = path.join(__dirname, 'export');

async function extractStylesheets(url) {
  console.log('\n🎨 STYLESHEET EXTRACTOR\n');
  console.log('='.repeat(50));
  console.log(`Target: ${url}\n`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Collect all CSS responses
  const cssFiles = [];

  page.on('response', async (response) => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';

    if (contentType.includes('text/css') || url.endsWith('.css')) {
      try {
        const css = await response.text();
        cssFiles.push({
          url,
          css,
          size: css.length
        });
        console.log(`📥 Captured: ${url.substring(0, 80)}...`);
      } catch (e) {
        console.log(`⚠️  Failed to capture: ${url}`);
      }
    }
  });

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

  // Also extract inline styles and style tags
  const inlineStyles = await page.evaluate(() => {
    const styles = [];

    // Get all <style> tags
    document.querySelectorAll('style').forEach((style, i) => {
      if (style.textContent.trim()) {
        styles.push({
          type: 'inline',
          index: i,
          css: style.textContent
        });
      }
    });

    // Get all stylesheet links (for reference)
    const links = [];
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      links.push(link.href);
    });

    return { styles, links };
  });

  await browser.close();

  console.log(`\n✅ Captured ${cssFiles.length} external stylesheets`);
  console.log(`✅ Found ${inlineStyles.styles.length} inline style blocks`);
  console.log(`✅ Found ${inlineStyles.links.length} stylesheet links`);

  return { cssFiles, inlineStyles };
}

function parseCSS(css) {
  // Extract different rule types
  const rules = {
    regular: [],
    hover: [],
    active: [],
    focus: [],
    before: [],
    after: [],
    mediaQueries: [],
    keyframes: []
  };

  // Extract @keyframes
  const keyframeRegex = /@keyframes\s+([^\s{]+)\s*\{([^}]+\{[^}]*\})+\s*\}/g;
  let match;
  while ((match = keyframeRegex.exec(css)) !== null) {
    rules.keyframes.push(match[0]);
  }

  // Extract @media queries
  const mediaRegex = /@media[^{]+\{([\s\S]+?\})\s*\}/g;
  while ((match = mediaRegex.exec(css)) !== null) {
    rules.mediaQueries.push(match[0]);
  }

  // Extract regular rules (simplified - real parsing would use a CSS parser)
  const ruleRegex = /([^{}@]+)\{([^{}]+)\}/g;
  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const declarations = match[2].trim();

    if (selector.includes(':hover')) {
      rules.hover.push({ selector, declarations });
    } else if (selector.includes(':active')) {
      rules.active.push({ selector, declarations });
    } else if (selector.includes(':focus')) {
      rules.focus.push({ selector, declarations });
    } else if (selector.includes('::before')) {
      rules.before.push({ selector, declarations });
    } else if (selector.includes('::after')) {
      rules.after.push({ selector, declarations });
    } else if (!selector.startsWith('@')) {
      rules.regular.push({ selector, declarations });
    }
  }

  return rules;
}

function filterRelevantCSS(allRules, patterns) {
  // Filter rules that match our target patterns
  const relevant = {
    regular: [],
    hover: [],
    active: [],
    focus: [],
    before: [],
    after: [],
    mediaQueries: [],
    keyframes: []
  };

  const matchesPattern = (selector) => {
    const lower = selector.toLowerCase();
    return patterns.some(p => lower.includes(p.toLowerCase()));
  };

  for (const type of ['regular', 'hover', 'active', 'focus', 'before', 'after']) {
    relevant[type] = allRules[type].filter(r => matchesPattern(r.selector));
  }

  // Keep all keyframes and media queries for now (they're harder to filter)
  relevant.keyframes = allRules.keyframes;
  relevant.mediaQueries = allRules.mediaQueries;

  return relevant;
}

function generateOutput(relevant) {
  let output = `/* =========================================
   EXTRACTED SQUARESPACE CSS
   Includes: hover, transitions, animations, pseudo-elements
   Generated: ${new Date().toISOString()}
   ========================================= */

`;

  // Regular rules
  if (relevant.regular.length > 0) {
    output += '/* ========== Base Styles ========== */\n\n';
    for (const rule of relevant.regular) {
      output += `${rule.selector} {\n  ${rule.declarations.replace(/;/g, ';\n  ').trim()}\n}\n\n`;
    }
  }

  // Hover states
  if (relevant.hover.length > 0) {
    output += '/* ========== Hover States ========== */\n\n';
    for (const rule of relevant.hover) {
      output += `${rule.selector} {\n  ${rule.declarations.replace(/;/g, ';\n  ').trim()}\n}\n\n`;
    }
  }

  // Active states
  if (relevant.active.length > 0) {
    output += '/* ========== Active States ========== */\n\n';
    for (const rule of relevant.active) {
      output += `${rule.selector} {\n  ${rule.declarations.replace(/;/g, ';\n  ').trim()}\n}\n\n`;
    }
  }

  // Focus states
  if (relevant.focus.length > 0) {
    output += '/* ========== Focus States ========== */\n\n';
    for (const rule of relevant.focus) {
      output += `${rule.selector} {\n  ${rule.declarations.replace(/;/g, ';\n  ').trim()}\n}\n\n`;
    }
  }

  // Pseudo-elements
  if (relevant.before.length > 0 || relevant.after.length > 0) {
    output += '/* ========== Pseudo-elements ========== */\n\n';
    for (const rule of [...relevant.before, ...relevant.after]) {
      output += `${rule.selector} {\n  ${rule.declarations.replace(/;/g, ';\n  ').trim()}\n}\n\n`;
    }
  }

  // Keyframes
  if (relevant.keyframes.length > 0) {
    output += '/* ========== Animations ========== */\n\n';
    for (const kf of relevant.keyframes) {
      output += kf + '\n\n';
    }
  }

  // Media queries
  if (relevant.mediaQueries.length > 0) {
    output += '/* ========== Media Queries ========== */\n\n';
    for (const mq of relevant.mediaQueries) {
      output += mq + '\n\n';
    }
  }

  return output;
}

async function run() {
  try {
    // Extract stylesheets
    const { cssFiles, inlineStyles } = await extractStylesheets(TARGET_URL);

    // Combine all CSS
    let allCSS = '';
    for (const file of cssFiles) {
      allCSS += file.css + '\n';
    }
    for (const style of inlineStyles.styles) {
      allCSS += style.css + '\n';
    }

    // Save raw combined CSS
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const rawPath = path.join(OUTPUT_DIR, 'raw-stylesheets.css');
    fs.writeFileSync(rawPath, allCSS);
    console.log(`\n📁 Raw CSS saved: ${rawPath} (${(allCSS.length / 1024).toFixed(1)} KB)`);

    // Parse all CSS
    console.log('\n🔍 Parsing CSS rules...');
    const allRules = parseCSS(allCSS);

    console.log(`   Regular rules: ${allRules.regular.length}`);
    console.log(`   Hover rules: ${allRules.hover.length}`);
    console.log(`   Active rules: ${allRules.active.length}`);
    console.log(`   Focus rules: ${allRules.focus.length}`);
    console.log(`   ::before rules: ${allRules.before.length}`);
    console.log(`   ::after rules: ${allRules.after.length}`);
    console.log(`   @keyframes: ${allRules.keyframes.length}`);
    console.log(`   @media queries: ${allRules.mediaQueries.length}`);

    // Filter to relevant selectors
    const patterns = [
      'pm-nav', 'pm-dropdown', 'pm-footer',
      'tenebre', 'gallery', 'toggle', 'slide',
      'nav-btn', 'nav-trigger', 'dropdown-arrow'
    ];

    console.log('\n🎯 Filtering relevant rules...');
    const relevant = filterRelevantCSS(allRules, patterns);

    console.log(`   Relevant regular: ${relevant.regular.length}`);
    console.log(`   Relevant hover: ${relevant.hover.length}`);
    console.log(`   Relevant active: ${relevant.active.length}`);
    console.log(`   Relevant pseudo: ${relevant.before.length + relevant.after.length}`);

    // Generate output
    const output = generateOutput(relevant);
    const outputPath = path.join(OUTPUT_DIR, 'extracted-styles.css');
    fs.writeFileSync(outputPath, output);

    console.log(`\n✅ Extracted CSS: ${outputPath} (${(output.length / 1024).toFixed(1)} KB)`);

    // Also save the full parsed data as JSON for inspection
    const jsonPath = path.join(OUTPUT_DIR, 'css-rules.json');
    fs.writeFileSync(jsonPath, JSON.stringify({
      stats: {
        totalRaw: allCSS.length,
        regular: allRules.regular.length,
        hover: allRules.hover.length,
        active: allRules.active.length,
        focus: allRules.focus.length,
        before: allRules.before.length,
        after: allRules.after.length,
        keyframes: allRules.keyframes.length,
        mediaQueries: allRules.mediaQueries.length
      },
      relevant: {
        regular: relevant.regular.length,
        hover: relevant.hover.length,
        active: relevant.active.length,
        before: relevant.before.length,
        after: relevant.after.length
      },
      patterns
    }, null, 2));

    console.log(`📊 Stats saved: ${jsonPath}`);
    console.log('\n' + '='.repeat(50));
    console.log('✅ EXTRACTION COMPLETE\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

run();
