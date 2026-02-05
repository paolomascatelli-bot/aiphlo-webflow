#!/usr/bin/env node
/* =========================================
   UNIVERSAL CSS BUILD PIPELINE
   Complete pipeline from scraped data to production CSS

   Usage: node api/build-css.js [input.json] [output.css]

   Steps:
   1. Load scraped Squarespace data (computed styles)
   2. Extract relevant visual properties
   3. Group by selectors (IDs and classes)
   4. Generate raw CSS
   5. Post-process (centering, cleanup, transitions)
   6. Output production-ready CSS
   ========================================= */

const path = require('path');

// Import our pipeline modules
const { generateCSS, groupElements } = require('./universal-css-generator.js');
const { processCss } = require('./css-postprocessor.js');

const fs = require('fs');

function build(inputPath, outputPath) {
  console.log('\n🔧 UNIVERSAL CSS BUILD PIPELINE\n');
  console.log('=' .repeat(50));

  // Step 1: Load scraped data
  console.log('\n📥 Step 1: Loading scraped data...');
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`   Found ${data.styles.length} elements`);

  // Step 2 & 3: Generate raw CSS (handled by universal-css-generator)
  console.log('\n🎨 Step 2-3: Extracting and grouping styles...');
  const groups = groupElements(data.styles);
  console.log(`   IDs: ${Object.keys(groups.ids).length}`);
  console.log(`   Classes: ${Object.keys(groups.classes).length}`);

  // Step 4: Generate CSS
  console.log('\n📝 Step 4: Generating CSS...');
  const importantPatterns = ['nav', 'header', 'footer', 'toggle', 'gallery', 'slide', 'dropdown'];
  const classPatterns = ['tenebre-', 'pm-', 'gallery-grid', 'nav-btn', 'toggle-'];

  const targetIds = Object.keys(groups.ids).filter(sel => {
    const lower = sel.toLowerCase();
    return importantPatterns.some(p => lower.includes(p)) ||
           lower.includes('pm-') ||
           lower.includes('tenebre');
  });

  const targetClasses = Object.keys(groups.classes).filter(sel => {
    const lower = sel.toLowerCase();
    return classPatterns.some(p => lower.includes(p));
  });

  const rawCss = generateCSS(data, {
    includeComments: true,
    targetSelectors: [...targetIds, ...targetClasses]
  });

  const rawPath = outputPath.replace('.css', '-raw.css');
  fs.writeFileSync(rawPath, rawCss);
  console.log(`   Raw CSS: ${rawPath} (${(rawCss.length / 1024).toFixed(1)} KB)`);

  // Step 5 & 6: Post-process
  console.log('\n⚙️  Step 5-6: Post-processing...');
  processCss(rawPath, outputPath);

  console.log('\n' + '=' .repeat(50));
  console.log('✅ BUILD COMPLETE\n');

  return outputPath;
}

function run() {
  const inputPath = global.process.argv[2] || path.join(__dirname, '../scripts/export/sqsp.json');
  const outputPath = global.process.argv[3] || path.join(__dirname, '../template/production.css');

  build(inputPath, outputPath);
}

module.exports = { build };

if (require.main === module) {
  run();
}
