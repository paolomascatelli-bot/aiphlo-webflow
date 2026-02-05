#!/usr/bin/env node
/* =========================================
   UNIVERSAL GALLERY LAYOUT EXTRACTOR
   Extracts layout metadata from any Squarespace site
   ========================================= */

const fs = require('fs');
const path = require('path');

// Squarespace aspect ratio mappings
const ASPECT_RATIOS = {
  'square': { ratio: '1:1', padding: '100%' },
  'standard-vertical': { ratio: '2:3', padding: '150%' },
  'standard-horizontal': { ratio: '3:2', padding: '66.67%' },
  'four-three': { ratio: '4:3', padding: '75%' },
  'three-two': { ratio: '3:2', padding: '66.67%' },
  'sixteen-nine': { ratio: '16:9', padding: '56.25%' },
  'two-three': { ratio: '2:3', padding: '150%' },
  'nine-sixteen': { ratio: '9:16', padding: '177.78%' }
};

function extractGalleryLayouts(html) {
  const galleries = {};

  // Find data-gallery attributes from nav buttons
  const navMatches = [...html.matchAll(/data-gallery="([^"]+)"[^>]*data-section="#([^"]+)"/g)];
  const sectionIds = navMatches.map(m => m[2]);

  // For each nav button, extract layout info from its target section
  for (const match of navMatches) {
    const galleryId = match[1];
    const sectionId = match[2];

    // Find the section content - look for content after this section ID until next section or footer
    const otherIds = sectionIds.filter(id => id !== sectionId).join('|');
    const sectionRegex = new RegExp(
      `id="${sectionId}"[\\s\\S]*?(?=id="(?:${otherIds})"|\\/main|pm-footer|$)`,
      'i'
    );
    const sectionMatch = html.match(sectionRegex);

    if (sectionMatch) {
      const sectionContent = sectionMatch[0];

      // Extract columns from grid-template-columns
      const colsMatch = sectionContent.match(/grid-template-columns:\s*repeat\((\d+)/);
      const columns = colsMatch ? parseInt(colsMatch[1]) : 3;

      // Extract aspect ratio from data-aspect-ratio attribute
      const aspectMatch = sectionContent.match(/data-aspect-ratio="([^"]+)"/);
      const aspect = aspectMatch ? aspectMatch[1] : 'square';

      // Count unique images
      const imgPaths = sectionContent.match(/\/assets\/images\/img_\d+\.(?:jpg|png)/g) || [];
      const uniqueImages = [...new Set(imgPaths)];

      galleries[galleryId] = {
        sectionId,
        columns,
        aspect,
        aspectRatio: ASPECT_RATIOS[aspect]?.ratio || '1:1',
        paddingBottom: ASPECT_RATIOS[aspect]?.padding || '100%',
        imageCount: uniqueImages.length
      };

      console.log(`  ✓ ${galleryId}: ${columns} cols, ${aspect}, ${uniqueImages.length} images`);
    } else {
      console.log(`  ✗ ${galleryId}: section not found`);
    }
  }

  return galleries;
}

function extractImagesByGallery(html, galleries) {
  const imagesByGallery = {};
  const sectionIds = Object.values(galleries).map(g => g.sectionId);

  for (const [galleryId, gallery] of Object.entries(galleries)) {
    const sectionRegex = new RegExp(
      `id="${gallery.sectionId}"[\\s\\S]*?(?=id="(?:${sectionIds.join('|')})"|\\/main|pm-footer)`,
      'i'
    );
    const match = html.match(sectionRegex);

    if (match) {
      // Extract unique image paths
      const imgPaths = match[0].match(/\/assets\/images\/img_\d+\.(?:jpg|png|gif|webp)/g) || [];
      imagesByGallery[galleryId] = [...new Set(imgPaths)];
    }
  }

  return imagesByGallery;
}

function run() {
  const inputPath = process.argv[2] || path.join(__dirname, '../scripts/export/multipage.json');

  console.log(`\n📂 Loading: ${inputPath}\n`);

  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const html = data.pages['/']?.html || '';

  // Extract gallery layouts
  const galleries = extractGalleryLayouts(html);
  console.log('📊 Gallery Layouts Extracted:');
  console.log('─'.repeat(60));

  for (const [id, layout] of Object.entries(galleries)) {
    console.log(`  ${id.toUpperCase()}`);
    console.log(`    Columns: ${layout.columns}`);
    console.log(`    Aspect:  ${layout.aspect} (${layout.aspectRatio})`);
    console.log(`    Images:  ~${layout.imageCount}`);
  }

  // Extract images by gallery
  const imagesByGallery = extractImagesByGallery(html, galleries);

  // Output combined data
  const output = {
    layouts: galleries,
    images: imagesByGallery,
    aspectRatios: ASPECT_RATIOS
  };

  const outputPath = path.join(__dirname, 'gallery-layouts.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n📝 Output: ${outputPath}`);

  // Generate JS config
  const jsConfig = `// Auto-generated gallery configuration
const galleryLayouts = ${JSON.stringify(galleries, null, 2)};

const galleryImages = ${JSON.stringify(
    Object.fromEntries(
      Object.entries(imagesByGallery).map(([id, paths]) => [
        id,
        paths.map(p => ({ src: 'http://localhost:3001' + p, alt: galleries[id]?.sectionId || id }))
      ])
    ),
    null,
    2
  )};
`;

  const jsPath = path.join(__dirname, 'gallery-config.js');
  fs.writeFileSync(jsPath, jsConfig);
  console.log(`📝 JS Config: ${jsPath}`);

  return output;
}

if (require.main === module) {
  run();
}

module.exports = { extractGalleryLayouts, extractImagesByGallery, ASPECT_RATIOS };
