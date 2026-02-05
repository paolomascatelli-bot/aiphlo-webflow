/* =========================================
   REBUILD PHOTOGRAPHY JSON
   Maps extracted images to local assets
   ========================================= */

const fs = require('fs');
const path = require('path');

const EXTRACTED_FILE = path.join(__dirname, '../assets/content/photography-extracted.json');
const ASSETS_DIR = path.join(__dirname, '../assets/images');
const OUTPUT_FILE = path.join(__dirname, '../api/content/photography.json');
const BASE_URL = 'http://localhost:3001/assets/images';

// Read extracted data
const extracted = JSON.parse(fs.readFileSync(EXTRACTED_FILE, 'utf-8'));
console.log('Loaded extracted data with', extracted.categories.length, 'categories');

// Get list of local image files
const localFiles = fs.readdirSync(ASSETS_DIR).filter(f =>
  f.startsWith('photography_') && /\.(jpg|jpeg|png)$/i.test(f)
);
console.log('Found', localFiles.length, 'local photography images');

// Create a map of original URLs to local files
const urlToLocalMap = {};
localFiles.forEach(file => {
  // Extract the original filename from the local file
  // Format: photography_XXX_originalname.ext
  const match = file.match(/^photography_\d+_(.+)$/);
  if (match) {
    const originalName = match[1];
    // Store multiple mappings for flexibility
    urlToLocalMap[originalName.toLowerCase()] = `${BASE_URL}/${file}`;
    urlToLocalMap[originalName] = `${BASE_URL}/${file}`;
  }
});

// Build the galleries object with correct mappings
const galleries = {};

extracted.categories.forEach(cat => {
  const catId = cat.id;
  const images = [];

  cat.images.forEach(img => {
    // Extract filename from Squarespace URL
    const urlParts = img.src.split('/');
    const originalFilename = urlParts[urlParts.length - 1];

    // Try to find matching local file
    let localUrl = urlToLocalMap[originalFilename] || urlToLocalMap[originalFilename.toLowerCase()];

    // If not found, try partial match
    if (!localUrl) {
      const baseName = originalFilename.replace(/\.[^.]+$/, '');
      for (const [key, value] of Object.entries(urlToLocalMap)) {
        if (key.includes(baseName) || baseName.includes(key.replace(/\.[^.]+$/, ''))) {
          localUrl = value;
          break;
        }
      }
    }

    // If still not found, use the original Squarespace URL
    if (!localUrl) {
      console.log(`  Warning: No local file for ${originalFilename} in ${catId}`);
      localUrl = img.src; // Use original URL as fallback
    }

    images.push({
      src: localUrl,
      alt: img.alt || cat.name,
      originalSrc: img.src
    });
  });

  galleries[catId] = images;
  console.log(`  ${catId}: ${images.length} images`);
});

// Build the complete photography.json
const photographyJson = {
  title: "Photography",
  blocks: [
    {
      id: "nav",
      slots: {
        logo: `${BASE_URL}/contact_314_Aiphloweb1nlk_red.png`,
        menu: [
          { text: "Home", url: "/" },
          { text: "Projects", url: "/projects" },
          { text: "Photography", url: "/photography" },
          { text: "Social Media", url: "/socialmedia" },
          { text: "FAQs", url: "/faqs" },
          { text: "Contact", url: "/contact" }
        ]
      }
    },
    {
      id: "hero",
      slots: {
        headline: "Photography",
        subhead: "Professional portraiture, fashion, fine art and commercial photography",
        body: "Capturing luxury in every frame. Film | DSLR | Mirrorless"
      }
    },
    {
      id: "photo-nav",
      slots: {
        categories: extracted.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          detail: cat.detail
        })),
        galleries: galleries
      }
    },
    {
      id: "footer",
      slots: {
        logo: `${BASE_URL}/contact_314_Aiphloweb1nlk_red.png`,
        copyright: "ALL RIGHTS RESERVED",
        notice: "NOT FOR PUBLIC USE",
        locations: "L.A.  NYC  MIAMI",
        contact: {
          text: "contact us",
          url: "/contact"
        }
      }
    }
  ]
};

// Write the updated photography.json
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(photographyJson, null, 2));
console.log('\n✅ Written to:', OUTPUT_FILE);

// Summary
console.log('\nSummary:');
Object.entries(galleries).forEach(([cat, imgs]) => {
  console.log(`  ${cat}: ${imgs.length} images`);
});
