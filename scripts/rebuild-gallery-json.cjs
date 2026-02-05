/* =========================================
   REBUILD GALLERY JSON
   Maps extracted gallery images to local assets
   Using EXACT URL matching like Tenebre
   ========================================= */

const fs = require('fs');
const path = require('path');

// Load extracted data
const extractedData = require('../assets/extracted-galleries.json');

// Load existing local images
const assetsDir = path.join(__dirname, '../assets/images');
const localImages = fs.readdirSync(assetsDir).filter(f =>
  f.match(/\.(jpg|jpeg|png|gif|webp)$/i)
);

console.log(`\n📁 Found ${localImages.length} local images\n`);

// Site-wide images to exclude
const EXCLUDE_PATTERNS = [
  'Aiphloweb1nlk',
  'AiphloLogo',
  'file_000000004dc4622f8117cb41b7d37634',
  'footer4',
  'AiPhlo_Color_Drop',
];

function shouldExclude(url) {
  return EXCLUDE_PATTERNS.some(pattern => url.includes(pattern));
}

// Extract unique identifier from URL
function getImageId(url) {
  const cleaned = url.split('?')[0];
  const filename = cleaned.split('/').pop();
  return filename;
}

// Find local file by matching the filename portion
function findLocalFile(sqsUrl, prefix) {
  const filename = getImageId(sqsUrl);

  // Find local file that contains this filename
  const match = localImages.find(f => {
    // Must start with the right prefix
    if (!f.startsWith(prefix)) return false;
    // Must contain the exact filename
    return f.includes(filename);
  });

  return match;
}

// Deduplicate by filename (keep first occurrence)
function deduplicateImages(images) {
  const seen = new Set();
  return images.filter(img => {
    const filename = getImageId(img.src || img.originalSrc);
    if (seen.has(filename)) return false;
    seen.add(filename);
    return true;
  });
}

// Process Photography galleries - keep each gallery's images (allow overlap)
console.log('📸 Processing Photography galleries...\n');

const photographyGalleries = {};

const photoGalleryOrder = ['fashion-editorial', 'portrait-headshots', 'outdoor-lifestyle', 'lifestyle-fashion', 'fashion-boudoir'];

for (const galleryId of photoGalleryOrder) {
  const gallery = extractedData.photography[galleryId];
  if (!gallery) continue;

  console.log(`  ${galleryId} (${gallery.name}):`);

  // Filter: exclude site assets, dedupe within this gallery only
  const seen = new Set();
  const filteredImages = gallery.images.filter(img => {
    if (shouldExclude(img.src)) return false;
    const filename = getImageId(img.src);
    if (seen.has(filename)) return false;
    seen.add(filename);
    return true;
  });

  console.log(`    Raw: ${gallery.images.length}, After filter: ${filteredImages.length}`);

  const mappedImages = [];

  for (const img of filteredImages) {
    const localFile = findLocalFile(img.src, 'photography_');
    if (localFile) {
      mappedImages.push({
        src: `http://localhost:3001/assets/images/${localFile}`,
        alt: img.alt || gallery.name,
        originalSrc: img.src
      });
    } else {
      mappedImages.push({
        src: img.src,
        alt: img.alt || gallery.name,
        originalSrc: img.src
      });
    }
  }

  console.log(`    Mapped: ${mappedImages.length}`);
  photographyGalleries[galleryId] = mappedImages;
}

// Process Social Media galleries - keep each gallery's images
console.log('\n📱 Processing Social Media galleries...\n');

const socialmediaGalleries = {};

const socialGalleryOrder = ['vyayama', 'victoria'];

for (const galleryId of socialGalleryOrder) {
  const gallery = extractedData.socialmedia[galleryId];
  if (!gallery) continue;

  console.log(`  ${galleryId} (${gallery.name}):`);

  // Filter: exclude site assets, dedupe within this gallery only
  const seen = new Set();
  const filteredImages = gallery.images.filter(img => {
    if (shouldExclude(img.src)) return false;
    const filename = getImageId(img.src);
    if (seen.has(filename)) return false;
    seen.add(filename);
    return true;
  });

  console.log(`    Raw: ${gallery.images.length}, After filter: ${filteredImages.length}`);

  const mappedImages = [];

  for (const img of filteredImages) {
    let localFile = findLocalFile(img.src, 'social-media_');
    if (!localFile) localFile = findLocalFile(img.src, 'socialmedia_');

    if (localFile) {
      mappedImages.push({
        src: `http://localhost:3001/assets/images/${localFile}`,
        alt: img.alt || gallery.name,
        originalSrc: img.src
      });
    } else {
      mappedImages.push({
        src: img.src,
        alt: img.alt || gallery.name,
        originalSrc: img.src
      });
    }
  }

  console.log(`    Mapped: ${mappedImages.length}`);
  socialmediaGalleries[galleryId] = mappedImages;
}

// Build Photography JSON
console.log('\n📝 Building photography.json...');

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

// Build Social Media JSON
console.log('📝 Building socialmedia.json...');

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
      id: "hero",
      slots: {
        headline: "Social Media",
        subhead: "Campaign content and brand storytelling",
        body: "Social Media & P.R. Rooted Creative Marketing. Brand Identity, Design, Social Media Management, Video Production."
      }
    },
    {
      id: "campaigns",
      slots: {
        items: [
          {
            id: "vyayama",
            name: "VYAYAMA",
            description: "Wellness & Fitness Campaign - Yoga and athleisure aesthetics",
            icon: "http://localhost:3001/assets/images/socialmedia_vyayama.png",
            iconStyle: "circular",
            images: socialmediaGalleries.vyayama || []
          },
          {
            id: "victoria",
            name: "VICTORIA",
            description: "Luxury Lifestyle Campaign - Built influencer relationships, influencer status within multiple niche fashion and lifestyle markets.",
            icon: "http://localhost:3001/assets/images/socialmedia_victoria.png",
            iconStyle: "circular",
            images: socialmediaGalleries.victoria || []
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

console.log('\n✅ Done! JSON files rebuilt.\n');

// Detailed summary
console.log('📊 Summary:');
console.log('\nPhotography:');
for (const [id, images] of Object.entries(photographyGalleries)) {
  console.log(`  ${id}: ${images.length} images`);
  if (images.length > 0) {
    const firstFile = images[0].src.split('/').pop();
    const lastFile = images[images.length-1].src.split('/').pop();
    console.log(`    First: ${firstFile.substring(0, 50)}`);
    console.log(`    Last:  ${lastFile.substring(0, 50)}`);
  }
}
console.log('\nSocial Media:');
for (const [id, images] of Object.entries(socialmediaGalleries)) {
  console.log(`  ${id}: ${images.length} images`);
}
