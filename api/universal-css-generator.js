#!/usr/bin/env node
/* =========================================
   UNIVERSAL CSS GENERATOR
   Converts scraped computed styles to production CSS
   ========================================= */

const fs = require('fs');
const path = require('path');

// Default/ignored values that shouldn't be included in output
const DEFAULT_VALUES = {
  'display': ['inline'],
  'position': ['static'],
  'visibility': ['visible'],
  'opacity': ['1'],
  'overflow': ['visible'],
  'overflow-x': ['visible'],
  'overflow-y': ['visible'],
  'float': ['none'],
  'clear': ['none'],
  'z-index': ['auto', '0'],
  'top': ['auto', '0px'],
  'right': ['auto', '0px'],
  'bottom': ['auto', '0px'],
  'left': ['auto', '0px'],
  'margin': ['0px'],
  'margin-top': ['0px'],
  'margin-right': ['0px'],
  'margin-bottom': ['0px'],
  'margin-left': ['0px'],
  'padding': ['0px'],
  'padding-top': ['0px'],
  'padding-right': ['0px'],
  'padding-bottom': ['0px'],
  'padding-left': ['0px'],
  'border': ['none', '0px none rgb(0, 0, 0)'],
  'border-width': ['0px'],
  'border-style': ['none'],
  'border-color': ['rgb(0, 0, 0)'],
  'border-radius': ['0px'],
  'border-top-left-radius': ['0px'],
  'border-top-right-radius': ['0px'],
  'border-bottom-left-radius': ['0px'],
  'border-bottom-right-radius': ['0px'],
  'background': ['none', 'rgba(0, 0, 0, 0)'],
  'background-color': ['rgba(0, 0, 0, 0)', 'transparent'],
  'background-image': ['none'],
  'background-position': ['0% 0%'],
  'background-repeat': ['repeat'],
  'background-size': ['auto'],
  'background-attachment': ['scroll'],
  'background-clip': ['border-box'],
  'box-shadow': ['none'],
  'text-shadow': ['none'],
  'transform': ['none'],
  'transform-origin': [], // Always skip, it's computed from element dimensions
  'transition': ['all 0s ease 0s', 'none'],
  'cursor': ['auto'],
  'pointer-events': ['auto'],
  'user-select': ['auto'],
  'font-weight': ['400', 'normal'],
  'font-style': ['normal'],
  'text-decoration': ['none', 'none solid rgb(0, 0, 0)'],
  'text-transform': ['none'],
  'letter-spacing': ['normal'],
  'line-height': ['normal'],
  'text-align': ['start'],
  'text-indent': ['0px'],
  'vertical-align': ['baseline'],
  'white-space': ['normal'],
  'word-spacing': ['0px'],
  'flex-direction': ['row'],
  'flex-wrap': ['nowrap'],
  'justify-content': ['normal', 'flex-start'],
  'align-items': ['normal', 'stretch'],
  'align-content': ['normal'],
  'align-self': ['auto'],
  'gap': ['normal', '0px'],
  'row-gap': ['normal', '0px'],
  'column-gap': ['normal', '0px'],
  'flex-grow': ['0'],
  'flex-shrink': ['1'],
  'flex-basis': ['auto'],
  'order': ['0'],
  'grid-template-columns': ['none'],
  'grid-template-rows': ['none'],
  'grid-template-areas': ['none'],
  'grid-column': ['auto'],
  'grid-row': ['auto'],
  'grid-auto-columns': ['auto'],
  'grid-auto-rows': ['auto'],
  'grid-auto-flow': ['row'],
  'justify-items': ['normal'],
  'object-fit': ['fill'],
  'object-position': ['50% 50%'],
  'filter': ['none'],
  'backdrop-filter': ['none'],
  'mix-blend-mode': ['normal'],
  'isolation': ['auto'],
  'will-change': ['auto'],
  'contain': ['none'],
  'content-visibility': ['visible'],
  'min-width': ['0px', 'auto'],
  'min-height': ['0px', 'auto'],
  'max-width': ['none'],
  'max-height': ['none'],
  'width': ['auto'],
  'height': ['auto'],
  'perspective': ['none'],
  'box-sizing': ['content-box'], // Skip content-box as it's default
};

// Properties to always skip (computed/internal)
const SKIP_PROPERTIES = [
  'transform-origin', // Computed from element dimensions
  'perspective', // Usually not needed
];

// Properties that should not have viewport-specific values
const SKIP_VIEWPORT_VALUES = [
  'width', 'height', 'right', 'bottom'
];

// Properties we care about for visual styling
const VISUAL_PROPERTIES = [
  // Layout & Position
  'display', 'position', 'top', 'right', 'bottom', 'left',
  'z-index', 'float', 'clear', 'overflow', 'overflow-x', 'overflow-y',

  // Box Model
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'box-sizing',

  // Border
  'border', 'border-width', 'border-style', 'border-color',
  'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-radius', 'border-top-left-radius', 'border-top-right-radius',
  'border-bottom-left-radius', 'border-bottom-right-radius',

  // Background
  'background', 'background-color', 'background-image', 'background-position',
  'background-repeat', 'background-size', 'background-attachment', 'background-clip',

  // Effects
  'box-shadow', 'text-shadow', 'opacity', 'visibility',
  'filter', 'backdrop-filter', 'mix-blend-mode',
  'transform', 'transform-origin', 'perspective',

  // Typography
  'color', 'font-family', 'font-size', 'font-weight', 'font-style',
  'line-height', 'letter-spacing', 'word-spacing', 'text-align',
  'text-decoration', 'text-transform', 'text-indent', 'white-space',
  'vertical-align',

  // Flexbox
  'flex', 'flex-direction', 'flex-wrap', 'flex-flow',
  'justify-content', 'align-items', 'align-content', 'align-self',
  'flex-grow', 'flex-shrink', 'flex-basis', 'order', 'gap', 'row-gap', 'column-gap',

  // Grid
  'grid', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas',
  'grid-column', 'grid-row', 'grid-area', 'grid-auto-columns', 'grid-auto-rows',
  'grid-auto-flow', 'grid-gap', 'justify-items', 'place-items', 'place-content',

  // Other
  'cursor', 'pointer-events', 'user-select', 'object-fit', 'object-position',
  'transition', 'animation', 'outline', 'list-style',
];

function parseCssText(cssText) {
  const styles = {};
  // Split by semicolon and parse each property
  const pairs = cssText.split(';');
  for (const pair of pairs) {
    const colonIndex = pair.indexOf(':');
    if (colonIndex > 0) {
      const prop = pair.slice(0, colonIndex).trim();
      const value = pair.slice(colonIndex + 1).trim();
      if (prop && value) {
        styles[prop] = value;
      }
    }
  }
  return styles;
}

function isDefaultValue(prop, value) {
  // Always skip certain properties
  if (SKIP_PROPERTIES.includes(prop)) return true;

  const defaults = DEFAULT_VALUES[prop];
  if (!defaults) return false;
  if (defaults.length === 0) return true; // Empty array means always skip
  return defaults.includes(value);
}

function isViewportSpecificValue(prop, value) {
  // Skip viewport-specific computed values (e.g., width: 1920px from a 1920px viewport)
  if (!SKIP_VIEWPORT_VALUES.includes(prop)) return false;

  // Skip very large pixel values that are likely viewport-derived
  const match = value.match(/^(\d+(?:\.\d+)?)(px)?$/);
  if (match) {
    const num = parseFloat(match[1]);
    // Skip values > 1000px for width/height/right/bottom (likely viewport-derived)
    if (num > 1000) return true;
  }
  return false;
}

function cleanTransform(value) {
  // Convert matrix transforms back to translateX/Y where possible
  const matrixMatch = value.match(/matrix\(1,\s*0,\s*0,\s*1,\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/);
  if (matrixMatch) {
    const x = parseFloat(matrixMatch[1]);
    const y = parseFloat(matrixMatch[2]);
    if (y === 0 && x !== 0) {
      return `translateX(${x}px)`;
    } else if (x === 0 && y !== 0) {
      return `translateY(${y}px)`;
    } else if (x !== 0 && y !== 0) {
      return `translate(${x}px, ${y}px)`;
    }
    return 'none';
  }
  return value;
}

function extractRelevantStyles(cssText) {
  const allStyles = parseCssText(cssText);
  const relevant = {};

  for (const prop of VISUAL_PROPERTIES) {
    let value = allStyles[prop];
    if (!value) continue;
    if (isDefaultValue(prop, value)) continue;
    if (isViewportSpecificValue(prop, value)) continue;

    // Clean up transforms
    if (prop === 'transform') {
      value = cleanTransform(value);
      if (value === 'none') continue;
    }

    relevant[prop] = value;
  }

  return relevant;
}

function generateSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  // Handle SVG className objects and ensure string conversion
  const className = String(element.className || '').trim();
  if (className) {
    const classes = className.split(/\s+/).filter(Boolean);
    if (classes.length > 0) {
      return `.${classes.join('.')}`;
    }
  }
  return element.tag;
}

function formatCssBlock(selector, styles) {
  const entries = Object.entries(styles);
  if (entries.length === 0) return '';

  const props = entries.map(([prop, value]) => `  ${prop}: ${value};`).join('\n');
  return `${selector} {\n${props}\n}`;
}

function groupElements(styles) {
  const groups = {
    ids: {},      // Elements with IDs
    classes: {},  // Elements with classes (no ID)
    tags: {}      // Elements with only tags
  };

  for (const el of styles) {
    const selector = generateSelector(el);
    const relevantStyles = extractRelevantStyles(el.cssText);

    if (Object.keys(relevantStyles).length === 0) continue;

    if (el.id) {
      // IDs are unique, store directly
      groups.ids[selector] = {
        element: el,
        styles: relevantStyles
      };
    } else if (String(el.className || '').trim()) {
      // Group by class selector, merge styles (take first occurrence)
      if (!groups.classes[selector]) {
        groups.classes[selector] = {
          element: el,
          styles: relevantStyles,
          count: 1
        };
      } else {
        groups.classes[selector].count++;
      }
    } else {
      // Tag-only elements (less useful, but track them)
      const tagSelector = el.tag;
      if (!groups.tags[tagSelector]) {
        groups.tags[tagSelector] = [];
      }
      groups.tags[tagSelector].push({
        element: el,
        styles: relevantStyles
      });
    }
  }

  return groups;
}

function generateCSS(data, options = {}) {
  const { includeComments = true, targetSelectors = null } = options;
  const groups = groupElements(data.styles);

  let css = '';

  if (includeComments) {
    css += `/* =========================================
   AUTO-GENERATED CSS
   Extracted from Squarespace computed styles
   Generated: ${new Date().toISOString()}
   ========================================= */\n\n`;
  }

  // Process ID selectors (highest priority)
  const idSelectors = Object.keys(groups.ids).sort();
  if (idSelectors.length > 0) {
    if (includeComments) css += '/* ========== ID Selectors ========== */\n\n';

    for (const selector of idSelectors) {
      if (targetSelectors && !targetSelectors.includes(selector)) continue;

      const { element, styles } = groups.ids[selector];
      const block = formatCssBlock(selector, styles);
      if (block) {
        if (includeComments) {
          css += `/* ${element.tag}${selector} */\n`;
        }
        css += block + '\n\n';
      }
    }
  }

  // Process class selectors
  const classSelectors = Object.keys(groups.classes).sort();
  if (classSelectors.length > 0) {
    if (includeComments) css += '/* ========== Class Selectors ========== */\n\n';

    for (const selector of classSelectors) {
      if (targetSelectors && !targetSelectors.includes(selector)) continue;

      const { element, styles, count } = groups.classes[selector];
      const block = formatCssBlock(selector, styles);
      if (block) {
        if (includeComments && count > 1) {
          css += `/* ${element.tag}${selector} (${count} elements) */\n`;
        }
        css += block + '\n\n';
      }
    }
  }

  return css;
}

function findElementsByPattern(styles, pattern) {
  const regex = new RegExp(pattern, 'i');
  return styles.filter(el => {
    const selector = generateSelector(el);
    return regex.test(selector) || regex.test(el.tag);
  });
}

function run() {
  const inputPath = process.argv[2] || path.join(__dirname, '../scripts/export/sqsp.json');
  const outputPath = process.argv[3] || path.join(__dirname, '../template/generated.css');

  console.log('\n📂 Loading:', inputPath);

  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  console.log(`📊 Found ${data.styles.length} elements with computed styles\n`);

  // Group and analyze
  const groups = groupElements(data.styles);

  console.log('📋 Element Summary:');
  console.log(`   IDs: ${Object.keys(groups.ids).length}`);
  console.log(`   Classes: ${Object.keys(groups.classes).length}`);
  console.log(`   Tag-only: ${Object.keys(groups.tags).length}`);

  // Show important ID selectors
  console.log('\n🎯 Key ID Selectors Found:');
  const importantPatterns = ['nav', 'header', 'footer', 'toggle', 'gallery', 'slide', 'dropdown'];
  for (const [selector, data] of Object.entries(groups.ids)) {
    for (const pattern of importantPatterns) {
      if (selector.toLowerCase().includes(pattern)) {
        const styleCount = Object.keys(data.styles).length;
        console.log(`   ${selector} (${styleCount} properties)`);
        break;
      }
    }
  }

  // Generate full CSS
  const css = generateCSS(data, { includeComments: true });

  fs.writeFileSync(outputPath, css);
  console.log(`\n✅ Generated CSS: ${outputPath}`);
  console.log(`   Size: ${(css.length / 1024).toFixed(1)} KB`);

  // Also generate a filtered version with just the important selectors
  const targetIds = Object.keys(groups.ids).filter(sel => {
    const lower = sel.toLowerCase();
    return importantPatterns.some(p => lower.includes(p)) ||
           lower.includes('pm-') ||
           lower.includes('tenebre');
  });

  // Also include important class selectors
  const classPatterns = ['tenebre-', 'pm-', 'gallery-grid', 'nav-btn', 'toggle-'];
  const targetClasses = Object.keys(groups.classes).filter(sel => {
    const lower = sel.toLowerCase();
    return classPatterns.some(p => lower.includes(p));
  });

  const allTargets = [...targetIds, ...targetClasses];

  const filteredCss = generateCSS(data, {
    includeComments: true,
    targetSelectors: allTargets
  });

  const filteredPath = outputPath.replace('.css', '-core.css');
  fs.writeFileSync(filteredPath, filteredCss);
  console.log(`\n✅ Core CSS (filtered): ${filteredPath}`);
  console.log(`   Size: ${(filteredCss.length / 1024).toFixed(1)} KB`);
  console.log(`   IDs: ${targetIds.length}, Classes: ${targetClasses.length}`);

  return { css, filteredCss, groups };
}

// Export for programmatic use
module.exports = {
  parseCssText,
  extractRelevantStyles,
  generateSelector,
  formatCssBlock,
  groupElements,
  generateCSS,
  findElementsByPattern,
  VISUAL_PROPERTIES,
  DEFAULT_VALUES
};

if (require.main === module) {
  run();
}
