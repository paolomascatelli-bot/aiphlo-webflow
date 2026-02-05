/* =========================================
   CONVERT EXTRACTED DATA TO API FORMAT
   Transforms scanner output into API content
   ========================================= */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets');
const CONTENT_DIR = path.join(ASSETS_DIR, 'content');
const IMAGES_DIR = path.join(ASSETS_DIR, 'images');
const API_CONTENT_DIR = path.join(__dirname, '../api/content');

// Base URL for serving local images
const IMAGE_BASE = 'http://localhost:3001/assets/images/';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Converting Extracted Data → API Format                    ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Load extracted data
function loadExtracted() {
  const siteContent = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'site-content.json'), 'utf8'));
  const galleryStructure = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'gallery-structure.json'), 'utf8'));

  // Get list of downloaded images
  const localImages = fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

  return { siteContent, galleryStructure, localImages };
}

// Map remote URL to local image
function mapToLocal(remoteUrl, localImages) {
  if (!remoteUrl) return null;

  // Extract filename from URL
  const urlParts = remoteUrl.split('/');
  const filename = urlParts[urlParts.length - 1].split('?')[0];

  // Find matching local file
  const match = localImages.find(local => local.includes(filename));

  if (match) {
    return IMAGE_BASE + match;
  }

  // Fuzzy match by partial name
  const baseName = filename.replace(/\.[^.]+$/, '').toLowerCase();
  const fuzzyMatch = localImages.find(local =>
    local.toLowerCase().includes(baseName.slice(0, 10))
  );

  return fuzzyMatch ? IMAGE_BASE + fuzzyMatch : null;
}

// Build navigation block (shared across all pages)
function buildNavBlock(localImages) {
  const logo = localImages.find(f => f.includes('Aiphloweb1nlk_red'));

  return {
    id: 'nav',
    slots: {
      logo: logo ? IMAGE_BASE + logo : '',
      menu: [
        { text: 'Home', url: '/' },
        { text: 'Projects', url: '/projects' },
        { text: 'Photography', url: '/photography' },
        { text: 'Social Media', url: '/socialmedia' },
        { text: 'FAQs', url: '/faqs' },
        { text: 'Contact', url: '/contact' }
      ]
    }
  };
}

// Build footer block (shared)
function buildFooterBlock(localImages) {
  const logo = localImages.find(f => f.includes('Aiphloweb1nlk_red'));

  return {
    id: 'footer',
    slots: {
      logo: logo ? IMAGE_BASE + logo : '',
      copyright: 'ALL RIGHTS RESERVED',
      notice: 'NOT FOR PUBLIC USE',
      locations: 'L.A.  NYC  MIAMI',
      contact: { text: 'contact us', url: '/contact' }
    }
  };
}

// Build home page from extracted data
function buildHomePage(data) {
  const { localImages, galleryStructure } = data;

  // Find Tenebre logo
  const tenebreLogo = localImages.find(f => f.includes('TENEBRE-WHITE'));

  // Find slideshow images (DU9A series are the interior shots)
  const slideshowImages = localImages
    .filter(f => f.includes('DU9A') && !f.includes('Edit'))
    .slice(0, 12)
    .map(f => IMAGE_BASE + f);

  // Build gallery categories with real images
  const categories = [
    {
      id: 'seating',
      name: 'SEAT STYLES',
      preview: IMAGE_BASE + (localImages.find(f => f.includes('DU9A1989')) || ''),
      images: localImages
        .filter(f => f.includes('DU9A1') || f.includes('DU9A2'))
        .slice(0, 6)
        .map((f, i) => ({
          src: IMAGE_BASE + f,
          alt: 'Seating collection',
          productId: `seat-${i+1}`
        }))
    },
    {
      id: 'lighting',
      name: 'CHANDELIERS',
      preview: IMAGE_BASE + (localImages.find(f => f.includes('file_00000000bde')) || ''),
      images: localImages
        .filter(f => f.includes('DU9A06') || f.includes('DU9A3'))
        .slice(0, 4)
        .map((f, i) => ({
          src: IMAGE_BASE + f,
          alt: 'Lighting collection',
          productId: `light-${i+1}`
        }))
    },
    {
      id: 'outdoor',
      name: 'PATIO & POOL',
      preview: IMAGE_BASE + (localImages.find(f => f.includes('poolswing')) || ''),
      images: localImages
        .filter(f => f.includes('swing') || f.includes('pool') || f.includes('outdoor'))
        .slice(0, 6)
        .map((f, i) => ({
          src: IMAGE_BASE + f,
          alt: 'Outdoor collection',
          productId: `outdoor-${i+1}`
        }))
    },
    {
      id: 'kingbed',
      name: 'KING BED/BATH',
      preview: IMAGE_BASE + (localImages.find(f => f.includes('floorbed')) || ''),
      images: localImages
        .filter(f => f.includes('bed') || f.includes('bath'))
        .slice(0, 6)
        .map((f, i) => ({
          src: IMAGE_BASE + f,
          alt: 'Bedroom collection',
          productId: `king-${i+1}`
        }))
    },
    {
      id: 'guestbed',
      name: 'GUEST BED/BATH',
      preview: IMAGE_BASE + (localImages.find(f => f.includes('DU9A2621')) || ''),
      images: localImages
        .filter(f => f.includes('DU9A5') || f.includes('DU9A26'))
        .slice(0, 4)
        .map((f, i) => ({
          src: IMAGE_BASE + f,
          alt: 'Guest room collection',
          productId: `guest-${i+1}`
        }))
    }
  ];

  return {
    title: 'Paolo Mascatelli | AIPHLO',
    blocks: [
      buildNavBlock(localImages),
      {
        id: 'hero',
        slots: {
          headline: 'PAOLO MASCATELLI | AIPHLO',
          subhead: 'Creative and Art Direction, Photography & Design',
          body: 'Boutique creative agency, scalable production, Luxury art direction. Custom AIPHLO Navigation Systems in development.',
          cta: { text: 'View Projects', url: '/projects' }
        }
      },
      {
        id: 'tenebre',
        slots: {
          logo: tenebreLogo ? IMAGE_BASE + tenebreLogo : '',
          toggle: 'off',
          slideshow: slideshowImages,
          categories: categories
        }
      },
      buildFooterBlock(localImages)
    ]
  };
}

// Main conversion
function convert() {
  const data = loadExtracted();

  console.log(`Found ${data.localImages.length} local images`);
  console.log(`Processing extracted content...\n`);

  // Build and save home page
  const homePage = buildHomePage(data);
  fs.writeFileSync(
    path.join(API_CONTENT_DIR, 'home.json'),
    JSON.stringify(homePage, null, 2)
  );
  console.log('✅ home.json updated with extracted data');

  // Update other pages with nav/footer
  const pages = ['projects', 'photography', 'socialmedia', 'faqs', 'contact'];

  pages.forEach(page => {
    const filePath = path.join(API_CONTENT_DIR, `${page}.json`);
    if (fs.existsSync(filePath)) {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Update nav and footer with correct images
      const navIndex = content.blocks.findIndex(b => b.id === 'nav');
      const footerIndex = content.blocks.findIndex(b => b.id === 'footer');

      if (navIndex >= 0) {
        content.blocks[navIndex] = buildNavBlock(data.localImages);
      }
      if (footerIndex >= 0) {
        content.blocks[footerIndex] = buildFooterBlock(data.localImages);
      }

      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`✅ ${page}.json updated`);
    }
  });

  console.log('\n🎉 Conversion complete!');
  console.log('   Restart the API server to see changes.');
}

convert();
