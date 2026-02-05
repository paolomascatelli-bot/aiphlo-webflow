#!/usr/bin/env node
/**
 * AIPHLO URL REWRITER v2
 * Replaces Squarespace image URLs with local paths
 * Matches by filename since Squarespace URLs vary
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const TEMPLATE_DIR = path.join(PROJECT_ROOT, 'template');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'assets', 'images');

// Get all local image filenames
console.log('Scanning local images...');
const localImages = fs.readdirSync(IMAGES_DIR);
console.log(`Found ${localImages.length} local images`);

// Build filename → local path map (strip the page_index_ prefix for matching)
const filenameMap = new Map();
localImages.forEach(filename => {
  // Extract original filename (after page_index_ prefix)
  // Format: home_0_Aiphloweb1nlk_red.png → Aiphloweb1nlk_red.png
  const match = filename.match(/^[a-z]+_\d+_(.+)$/i);
  if (match) {
    const originalName = match[1];
    filenameMap.set(originalName.toLowerCase(), `assets/images/${filename}`);
  }
});
console.log(`Mapped ${filenameMap.size} filenames`);

// Find all HTML and JS files in template
function getFiles(dir, extensions) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== 'assets') {
      files.push(...getFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getFiles(TEMPLATE_DIR, ['.html', '.js']);
console.log(`Found ${files.length} files to process\n`);

let totalReplacements = 0;
let unmappedUrls = [];

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;

  // Match all Squarespace URLs
  const patterns = [
    /https:\/\/static1\.squarespace\.com\/[^\s"')\]>]+/g,
    /https:\/\/images\.squarespace-cdn\.com\/[^\s"')\]>]+/g
  ];

  patterns.forEach(pattern => {
    content = content.replace(pattern, (url) => {
      // Extract filename from URL
      // URL might be: .../filename.png or .../filename.png?format=1500w
      const urlPath = url.split('?')[0]; // Remove query string
      const filename = path.basename(urlPath);

      // Look up in our map (case insensitive)
      const localPath = filenameMap.get(filename.toLowerCase());

      if (localPath) {
        fileReplacements++;
        return localPath;
      } else {
        unmappedUrls.push({ file: path.relative(PROJECT_ROOT, filePath), url: url.substring(0, 80) });
        return url; // Keep original if no mapping
      }
    });
  });

  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${path.relative(PROJECT_ROOT, filePath)}: ${fileReplacements} replacements`);
    totalReplacements += fileReplacements;
  } else {
    console.log(`  ${path.relative(PROJECT_ROOT, filePath)}: no Squarespace URLs found`);
  }
});

console.log(`\n✓ Total: ${totalReplacements} URLs rewritten to local paths`);

if (unmappedUrls.length > 0) {
  console.log(`\n⚠ ${unmappedUrls.length} URLs could not be mapped (no local file found):`);
  // Show unique unmapped filenames
  const uniqueFilenames = [...new Set(unmappedUrls.map(u => {
    const urlPath = u.url.split('?')[0];
    return path.basename(urlPath);
  }))];
  uniqueFilenames.slice(0, 20).forEach(f => console.log(`  - ${f}`));
  if (uniqueFilenames.length > 20) {
    console.log(`  ... and ${uniqueFilenames.length - 20} more`);
  }
}
