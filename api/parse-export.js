#!/usr/bin/env node
/* =========================================
   PARSE SQUARESPACE EXPORT
   Extracts usable CSS from computed styles
   ========================================= */

const fs = require('fs');
const path = require('path');

// Visual CSS properties we care about (not all 200+ computed properties)
const VISUAL_PROPS = [
  'position', 'top', 'right', 'bottom', 'left', 'z-index',
  'display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'gap',
  'grid-template-columns', 'grid-template-rows', 'grid-gap',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border', 'border-width', 'border-style', 'border-color', 'border-radius',
  'border-top', 'border-right', 'border-bottom', 'border-left',
  'background', 'background-color', 'background-image', 'background-size', 'background-position',
  'color', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'text-transform', 'text-decoration',
  'opacity', 'visibility', 'overflow', 'overflow-x', 'overflow-y',
  'box-shadow', 'text-shadow',
  'transform', 'transition',
  'cursor', 'pointer-events',
  'filter', 'backdrop-filter'
];

// Target selectors we want to extract
const TARGET_SELECTORS = [
  { id: 'pm-nav-trigger', type: 'id' },
  { id: 'pm-nav-dropdown', type: 'id' },
  { className: 'pm-dropdown-arrow', type: 'class' },
  { id: 'tenebre-header-logo', type: 'id' },
  { id: 'tenebre-slideshow-container', type: 'id' },
  { id: 'tenebre-slideshow-canvas', type: 'id' },
  { id: 'tenebre-toggle-container', type: 'id' },
  { id: 'tenebre-toggle', type: 'id' },
  { id: 'tenebre-gallery-nav-wrapper', type: 'id' },
  { id: 'tenebre-gallery-nav', type: 'id' },
  { className: 'tenebre-toggle-wrapper', type: 'class' },
  { className: 'tenebre-toggle-label', type: 'class' },
  { className: 'tenebre-toggle-switch', type: 'class' },
  { className: 'tenebre-toggle-knob', type: 'class' },
  { className: 'tenebre-nav-btn', type: 'class' },
  { className: 'tenebre-nav-text', type: 'class' },
  { className: 'tenebre-gallery-section', type: 'class' },
  { className: 'tenebre-slide-layer', type: 'class' },
  { className: 'pm-footer', type: 'class' },
  { className: 'pm-footer-rights', type: 'class' },
  { className: 'pm-footer-locations', type: 'class' },
  { className: 'pm-campaign-btn', type: 'class' },
  { className: 'pm-campaign-icon', type: 'class' },
  { className: 'pm-campaign-name', type: 'class' },
  { className: 'pm-photo-pill', type: 'class' },
  { className: 'pm-project-circle', type: 'class' },
  { className: 'pm-pill', type: 'class' },
  { className: 'pm-pill-group', type: 'class' }
];

function parseComputedStyles(cssText) {
  const styles = {};
  const pairs = cssText.split(';');

  for (const pair of pairs) {
    const colonIndex = pair.indexOf(':');
    if (colonIndex === -1) continue;

    const prop = pair.slice(0, colonIndex).trim();
    const value = pair.slice(colonIndex + 1).trim();

    // Skip default/empty values
    if (!VISUAL_PROPS.includes(prop)) continue;
    if (!value || value === 'none' || value === 'normal' || value === 'auto') continue;
    if (value === '0px' || value === '0px 0px 0px 0px') continue;
    if (value === 'rgba(0, 0, 0, 0)' || value === 'rgb(0, 0, 0)') continue;
    if (value === 'start' || value === 'stretch') continue;

    styles[prop] = value;
  }

  return styles;
}

function stylesToCSS(styles) {
  return Object.entries(styles)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n');
}

function run() {
  const exportPath = process.argv[2] || path.join(__dirname, '../scripts/export/sqsp.json');

  console.log(`\n📂 Loading: ${exportPath}\n`);

  const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));

  console.log(`📊 Total elements: ${data.styles.length}`);

  // Find target elements
  const extracted = {};

  for (const target of TARGET_SELECTORS) {
    const matches = data.styles.filter(el => {
      if (target.type === 'id') {
        return el.id === target.id;
      } else {
        const cn = String(el.className || '');
        return cn.includes(target.className);
      }
    });

    if (matches.length > 0) {
      const selector = target.type === 'id' ? `#${target.id}` : `.${target.className}`;
      const styles = parseComputedStyles(matches[0].cssText);

      if (Object.keys(styles).length > 0) {
        extracted[selector] = {
          tag: matches[0].tag,
          rect: matches[0].rect,
          styles
        };
        console.log(`✅ Found: ${selector} (${Object.keys(styles).length} props)`);
      }
    } else {
      const selector = target.type === 'id' ? `#${target.id}` : `.${target.className}`;
      console.log(`⚠️  Not found: ${selector}`);
    }
  }

  // Generate CSS
  let css = `/* =========================================
   EXTRACTED CSS FROM SQUARESPACE
   Generated: ${new Date().toISOString()}
   Source: ${data.title}
   ========================================= */

:root {
  --aiphlo-gold: #d4af37;
  --aiphlo-green: #6fb886;
  --aiphlo-black: #000000;
  --aiphlo-white: #ffffff;
  --pm-nav-bg: rgba(70, 76, 82, 0.96);
}

`;

  for (const [selector, info] of Object.entries(extracted)) {
    css += `${selector} {\n${stylesToCSS(info.styles)}\n}\n\n`;
  }

  // Write CSS output
  const outputPath = path.join(__dirname, 'extracted-styles.css');
  fs.writeFileSync(outputPath, css);
  console.log(`\n📝 CSS written: ${outputPath}`);

  // Output JSON for API use
  const jsonPath = path.join(__dirname, 'extracted-styles.json');
  fs.writeFileSync(jsonPath, JSON.stringify(extracted, null, 2));
  console.log(`📝 JSON written: ${jsonPath}`);

  // Also save the HTML structure
  const htmlPath = path.join(__dirname, 'extracted-html.html');
  fs.writeFileSync(htmlPath, data.html);
  console.log(`📝 HTML written: ${htmlPath}`);

  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`   - Selectors extracted: ${Object.keys(extracted).length}/${TARGET_SELECTORS.length}`);
  console.log(`   - Image mappings: ${Object.keys(data.imageMap || {}).length}`);

  return extracted;
}

run();
