/* =========================================
   REBUILD JSON FROM V4 EXTRACTION
   Uses section-aware extraction data
   Maps to local assets where available
   ========================================= */

const fs = require('fs');
const path = require('path');

// Load v4 extraction
const v4Data = require('../assets/extracted-galleries-v4.json');

// Load missing galleries extraction (portrait-headshots, victoria, etc.)
let missingData = { photography: {}, socialmedia: {} };
try {
  missingData = require('../assets/extracted-missing.json');
  console.log('📎 Loaded missing galleries data\n');
} catch (e) {
  console.log('⚠️  No missing galleries file found\n');
}

// Load local images
const assetsDir = path.join(__dirname, '../assets/images');
const localImages = fs.readdirSync(assetsDir).filter(f =>
  f.match(/\.(jpg|jpeg|png|gif|webp)$/i)
);

console.log(`\n📁 Found ${localImages.length} local images\n`);

// Site-wide assets to exclude
const EXCLUDE_PATTERNS = [
  'Aiphloweb1nlk',
  'AiphloLogo',
  'file_000000004dc4622f8117cb41b7d37634',
  'footer4',
  'AiPhlo_Color_Drop',
  'AiPhlo+Color+Drop'
];

function shouldExclude(url) {
  return EXCLUDE_PATTERNS.some(pattern => url.includes(pattern));
}

function getFilename(url) {
  return url.split('?')[0].split('/').pop();
}

// Find local file by URL
function findLocalFile(sqsUrl, prefix) {
  const filename = getFilename(sqsUrl);

  const match = localImages.find(f => {
    if (!f.startsWith(prefix)) return false;
    return f.includes(filename);
  });

  return match;
}

// Process and dedupe images within gallery
function processGalleryImages(images, prefix) {
  const seen = new Set();
  const result = [];

  for (const img of images) {
    if (shouldExclude(img.src)) continue;

    const filename = getFilename(img.src);
    if (seen.has(filename)) continue;
    seen.add(filename);

    const localFile = findLocalFile(img.src, prefix);
    result.push({
      src: localFile
        ? `http://localhost:3001/assets/images/${localFile}`
        : img.src,
      alt: img.alt || '',
      originalSrc: img.src
    });
  }

  return result;
}

// ========== BUILD PHOTOGRAPHY JSON ==========
console.log('📸 Building photography.json...\n');

const photographyGalleries = {};

for (const [galleryId, data] of Object.entries(v4Data.photography)) {
  // Check if v4 has images, otherwise try missing data
  let sourceImages = data.images;
  let source = 'v4';

  if (sourceImages.length === 0 && missingData.photography[galleryId]) {
    sourceImages = missingData.photography[galleryId].images || [];
    source = 'missing';
  }

  const images = processGalleryImages(sourceImages, 'photography_');
  console.log(`  ${galleryId}: ${images.length} images (from ${source})`);
  photographyGalleries[galleryId] = images;
}

const photographyJson = {
  title: "Photography",
  blocks: [
    {
      id: "nav",
      slots: {
        logo: "http://localhost:3001/assets/images/contact_314_Aiphloweb1nlk_red.png",
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
        categories: [
          { id: "fashion-editorial", name: "FASHION EDITORIAL", detail: "Fashion Editorial – NYC winter 2017" },
          { id: "portrait-headshots", name: "PORTRAITS & HEADSHOTS", detail: "Portraits & Headshots – NYC & LA – ongoing" },
          { id: "outdoor-lifestyle", name: "OUTDOOR LIFESTYLE", detail: "Outdoor Lifestyle – Colombia – shot on Android Pixel Pro 7 for social media" },
          { id: "lifestyle-fashion", name: "LIFESTYLE FASHION", detail: "Lifestyle Fashion – Series 1 – LA, Wyoming, Tunisia, NYC" },
          { id: "fashion-boudoir", name: "FASHION BOUDOIR", detail: "Fashion Boudoir – Venezia, L.A." }
        ],
        galleries: photographyGalleries
      }
    },
    {
      id: "footer",
      slots: {
        logo: "http://localhost:3001/assets/images/contact_314_Aiphloweb1nlk_red.png",
        copyright: "ALL RIGHTS RESERVED",
        notice: "NOT FOR PUBLIC USE",
        locations: "L.A.  NYC  MIAMI",
        contact: { text: "contact us", url: "/contact" }
      }
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, '../api/content/photography.json'),
  JSON.stringify(photographyJson, null, 2)
);

// ========== BUILD SOCIAL MEDIA JSON ==========
console.log('\n📱 Building socialmedia.json...\n');

const vyayamaImages = processGalleryImages(v4Data.socialmedia.vyayama.images, 'socialmedia_');

// Victoria: use missing data if v4 is empty
let victoriaSource = v4Data.socialmedia.victoria.images;
let victoriaFrom = 'v4';
if (victoriaSource.length === 0 && missingData.socialmedia.victoria) {
  victoriaSource = missingData.socialmedia.victoria.images || [];
  victoriaFrom = 'missing';
}
const victoriaImages = processGalleryImages(victoriaSource, 'socialmedia_');

console.log(`  vyayama: ${vyayamaImages.length} images (from v4)`);
console.log(`  victoria: ${victoriaImages.length} images (from ${victoriaFrom})`);

const socialmediaJson = {
  title: "Social Media",
  blocks: [
    {
      id: "nav",
      slots: {
        logo: "http://localhost:3001/assets/images/contact_314_Aiphloweb1nlk_red.png",
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
      id: "campaigns",
      slots: {
        fullWidthBackground: true,
        pageTitle: "Social Media",  // Title shown above cards
        items: [
          {
            id: "vyayama",
            name: "VYAYAMA",
            description: "Wellness & Fitness Campaign - Yoga and athleisure aesthetics",
            icon: "http://localhost:3001/assets/images/socialmedia_vyayama.png",
            iconStyle: "circular",
            layoutType: "phone-mockups",  // Vertical social posts - AiPhlo feature
            images: vyayamaImages
          },
          {
            id: "victoria",
            name: "VICTORIA",
            description: "Luxury Lifestyle Campaign - Built influencer relationships, influencer status within multiple niche fashion and lifestyle markets.",
            icon: "http://localhost:3001/assets/images/socialmedia_victoria.png",
            iconStyle: "circular",
            layoutType: "horizontal-slideshow",  // Landscape images - matches original
            images: victoriaImages
          }
        ]
      }
    },
    {
      id: "footer",
      slots: {
        logo: "http://localhost:3001/assets/images/contact_314_Aiphloweb1nlk_red.png",
        copyright: "ALL RIGHTS RESERVED",
        notice: "NOT FOR PUBLIC USE",
        locations: "L.A.  NYC  MIAMI",
        contact: { text: "contact us", url: "/contact" }
      }
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, '../api/content/socialmedia.json'),
  JSON.stringify(socialmediaJson, null, 2)
);

console.log('\n✅ JSON files rebuilt from v4 extraction!\n');

// Summary
console.log('📊 Summary:');
console.log('\nPhotography:');
for (const [id, images] of Object.entries(photographyGalleries)) {
  console.log(`  ${id}: ${images.length} images`);
}
console.log('\nSocial Media:');
console.log(`  vyayama: ${vyayamaImages.length} images`);
console.log(`  victoria: ${victoriaImages.length} images`);

// Note about empty galleries
const emptyGalleries = Object.entries(photographyGalleries).filter(([_, imgs]) => imgs.length === 0);
if (emptyGalleries.length > 0) {
  console.log('\n⚠️  Empty galleries (no section content on live site):');
  emptyGalleries.forEach(([id]) => console.log(`   - ${id}`));
}
