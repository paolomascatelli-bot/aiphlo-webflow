/**
 * FIX ALL IMAGE URLs
 * Converts local/localhost image paths to Squarespace CDN URLs
 * across all template and API files
 */

const fs = require('fs');
const path = require('path');

// Load image metadata
const metadataPath = path.join(__dirname, '../assets/image-metadata.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Build mapping: local filename -> Squarespace CDN URL
const urlMap = {};
metadata.forEach(img => {
  if (img.localPath && img.src) {
    // Extract just the filename (e.g., "home_88_DU9A7439.jpg")
    const filename = path.basename(img.localPath);
    urlMap[filename] = img.src;
  }
});

console.log(`✅ Loaded ${Object.keys(urlMap).length} image mappings\n`);

// Files/directories to process
const filesToProcess = [
  // Template files
  '../template/index.html',
  '../template/interactions.js',
  '../template/styles.css',
  '../template/pages.css',
  '../template/aiphlo-unified.js',
  '../template/aiphlo-client.js',
  '../template/accurate.html',
  '../template/accurate.js',
  '../template/accurate.css',
  '../template/skeleton.html',
  // API files
  '../api/gallery-config.js',
  '../api/extract-gallery-layouts.js'
];

// Also process all JSON files in api/content
const contentDir = path.join(__dirname, '../api/content');
if (fs.existsSync(contentDir)) {
  const jsonFiles = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));
  jsonFiles.forEach(f => {
    filesToProcess.push(`../api/content/${f}`);
  });
}

let totalReplaced = 0;
let filesUpdated = 0;

filesToProcess.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);

  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping (not found): ${relPath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let replaced = 0;
  const warnings = [];

  // Pattern 1: http://localhost:3001/assets/images/filename
  content = content.replace(/http:\/\/localhost:3001\/assets\/images\/([^"'\s\)]+)/g, (match, filename) => {
    if (urlMap[filename]) {
      replaced++;
      return urlMap[filename];
    }
    warnings.push(`localhost: ${filename}`);
    return match;
  });

  // Pattern 2: assets/images/filename (relative path)
  content = content.replace(/assets\/images\/([^"'\s\)]+)/g, (match, filename) => {
    if (urlMap[filename]) {
      replaced++;
      return urlMap[filename];
    }
    // Don't warn for .svg files (might be intentionally embedded)
    if (!filename.endsWith('.svg')) {
      warnings.push(`relative: ${filename}`);
    }
    return match;
  });

  // Pattern 3: /assets/images/filename (absolute path)
  content = content.replace(/\/assets\/images\/([^"'\s\)]+)/g, (match, filename) => {
    if (urlMap[filename]) {
      replaced++;
      return urlMap[filename];
    }
    return match;
  });

  if (replaced > 0) {
    fs.writeFileSync(filePath, content);
    filesUpdated++;
    totalReplaced += replaced;
    console.log(`✅ ${relPath}: ${replaced} URLs replaced`);
  } else {
    console.log(`📄 ${relPath}: no changes needed`);
  }

  if (warnings.length > 0) {
    warnings.slice(0, 3).forEach(w => console.log(`   ⚠️  No mapping: ${w}`));
    if (warnings.length > 3) {
      console.log(`   ... and ${warnings.length - 3} more`);
    }
  }
});

console.log(`\n========================================`);
console.log(`📊 SUMMARY:`);
console.log(`   Files updated: ${filesUpdated}`);
console.log(`   Total URLs replaced: ${totalReplaced}`);
console.log(`========================================\n`);

// Create a summary of remaining localhost references
console.log('🔍 Scanning for any remaining localhost references...\n');

const allFiles = [];
function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'assets', 'backups', 'screenshots'].includes(item)) {
        scanDir(fullPath);
      }
    } else if (stat.isFile() && /\.(js|html|css|json)$/.test(item)) {
      allFiles.push(fullPath);
    }
  });
}

scanDir(path.join(__dirname, '..'));

let remainingCount = 0;
allFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(/localhost:3001\/assets/g);
  if (matches) {
    remainingCount += matches.length;
    const relPath = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`⚠️  ${relPath}: ${matches.length} remaining localhost refs`);
  }
});

if (remainingCount === 0) {
  console.log('✅ No remaining localhost asset references found!\n');
} else {
  console.log(`\n⚠️  ${remainingCount} total localhost refs remain (may need manual review)\n`);
}
