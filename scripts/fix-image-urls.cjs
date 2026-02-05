const fs = require('fs');
const path = require('path');

// Load image metadata
const metadata = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/image-metadata.json'), 'utf8'));

// Build mapping: local filename -> original URL
const urlMap = {};
metadata.forEach(img => {
  if (img.localPath && img.src) {
    const filename = path.basename(img.localPath);
    urlMap[filename] = img.src;
  }
});

console.log(`Loaded ${Object.keys(urlMap).length} image mappings`);

// Process all JSON files in api/content
const contentDir = path.join(__dirname, '../api/content');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(contentDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let replaced = 0;

  // Replace localhost URLs with Squarespace URLs
  content = content.replace(/http:\/\/localhost:3001\/assets\/images\/([^"]+)/g, (match, filename) => {
    if (urlMap[filename]) {
      replaced++;
      return urlMap[filename];
    }
    console.log(`  Warning: No mapping for ${filename}`);
    return match;
  });

  fs.writeFileSync(filePath, content);
  console.log(`${file}: ${replaced} URLs replaced`);
});

console.log('\nDone! Image URLs updated to Squarespace CDN.');
