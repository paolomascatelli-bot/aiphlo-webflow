/* =========================================
   CONTENT GENERATOR V2
   Uses gallery-structure.json for EXACT image placement
   Maps Squarespace URLs → Local paths
   This is the site-wide solution for AiPhlo migration
   ========================================= */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:3001';

// =========================================
// LOAD DATA SOURCES
// =========================================

// Gallery structure from Squarespace extraction (exact image order)
const galleryStructure = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../assets/content/gallery-structure.json'), 'utf8')
);

// Image metadata with local paths
const imageMetadata = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../assets/image-metadata.json'), 'utf8')
);

// =========================================
// URL → LOCAL PATH MAPPING
// =========================================

// Create a map from Squarespace URL → local image path
function createUrlToLocalMap() {
  const urlMap = new Map();

  imageMetadata.forEach(img => {
    if (img.src && img.localPath) {
      // Normalize the URL (remove query params for matching)
      const normalizedUrl = normalizeUrl(img.src);
      const localFilename = path.basename(img.localPath);
      urlMap.set(normalizedUrl, {
        localPath: `${API_BASE}/assets/images/${localFilename}`,
        alt: img.alt || '',
        width: img.width || 0,
        height: img.height || 0,
        page: img.page
      });
    }
  });

  return urlMap;
}

function normalizeUrl(url) {
  // Remove query parameters and normalize
  return url.split('?')[0].toLowerCase();
}

const urlToLocalMap = createUrlToLocalMap();
console.log(`Loaded ${urlToLocalMap.size} URL→Local mappings\n`);

// =========================================
// GET PAGE FROM GALLERY STRUCTURE
// =========================================

function getPageStructure(pageName) {
  return galleryStructure.pages.find(p =>
    p.name.toLowerCase() === pageName.toLowerCase()
  );
}

// =========================================
// MAP SQUARESPACE IMAGE TO LOCAL
// =========================================

function mapToLocalImage(sqsImage) {
  const normalizedUrl = normalizeUrl(sqsImage.src);
  const localData = urlToLocalMap.get(normalizedUrl);

  if (localData) {
    return {
      src: localData.localPath,
      alt: sqsImage.alt || localData.alt || '',
      width: sqsImage.width || localData.width,
      height: sqsImage.height || localData.height,
      originalSrc: sqsImage.src,
      index: sqsImage.index,
      parentClasses: sqsImage.parentClasses || ''
    };
  }

  // Fallback: try to find by filename match
  const urlFilename = extractFilename(sqsImage.src);
  for (const [url, data] of urlToLocalMap) {
    if (extractFilename(url) === urlFilename) {
      return {
        src: data.localPath,
        alt: sqsImage.alt || data.alt || '',
        width: sqsImage.width || data.width,
        height: sqsImage.height || data.height,
        originalSrc: sqsImage.src,
        index: sqsImage.index,
        parentClasses: sqsImage.parentClasses || ''
      };
    }
  }

  // Not found - return null
  return null;
}

function extractFilename(url) {
  const urlPath = url.split('?')[0];
  return path.basename(urlPath).toLowerCase();
}

// =========================================
// FILTER GALLERY IMAGES
// Using parentClasses to identify actual gallery images
// =========================================

function isGalleryImage(img) {
  const classes = (img.parentClasses || '').toLowerCase();

  // These classes indicate actual gallery images
  if (classes.includes('gallery-grid-lightbox') ||
      classes.includes('gallery-masonry-lightbox') ||
      classes.includes('gallery-slideshow') ||
      classes.includes('lightbox-link')) {
    return true;
  }

  // Filter out nav/logo images
  const src = (img.src || '').toLowerCase();
  if (src.includes('aiphloweb') ||
      src.includes('aiphlologo') ||
      src.includes('file_000000004dc4')) {
    return false;
  }

  // Filter out very small images (likely icons)
  if (img.width < 200 || img.height < 200) {
    return false;
  }

  return true;
}

// =========================================
// COMMON STRUCTURES
// =========================================

const commonNav = {
  id: 'nav',
  slots: {
    logo: `${API_BASE}/assets/images/contact_314_Aiphloweb1nlk_red.png`,
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

const commonFooter = {
  id: 'footer',
  slots: {
    logo: `${API_BASE}/assets/images/contact_314_Aiphloweb1nlk_red.png`,
    copyright: 'ALL RIGHTS RESERVED',
    notice: 'NOT FOR PUBLIC USE',
    locations: 'L.A.  NYC  MIAMI',
    contact: { text: 'contact us', url: '/contact' }
  }
};

// =========================================
// GENERATE PHOTOGRAPHY PAGE
// Using exact structure from gallery-structure.json
// DEDUPLICATES images by source URL
// =========================================

function generatePhotography() {
  const pageData = getPageStructure('Photography');

  if (!pageData) {
    console.error('Photography page not found in gallery-structure.json');
    return null;
  }

  console.log(`Photography: Found ${pageData.galleries.length} galleries`);

  // Use the first gallery (main gallery) and deduplicate by source URL
  const seenUrls = new Set();
  const allImages = [];

  // Use first gallery which typically has the complete structure
  const mainGallery = pageData.galleries[0];
  if (mainGallery) {
    mainGallery.images.forEach(img => {
      const normalizedUrl = normalizeUrl(img.src);
      if (!seenUrls.has(normalizedUrl) && isGalleryImage(img)) {
        seenUrls.add(normalizedUrl);
        const localImg = mapToLocalImage(img);
        if (localImg) {
          allImages.push(localImg);
        }
      }
    });
  }

  // Sort by original index
  allImages.sort((a, b) => a.index - b.index);

  console.log(`Photography: ${allImages.length} gallery images after filtering`);

  // Create category groupings matching original site structure
  // Original categories: Fashion Editorial, Portraits & Headshots, Outdoor Lifestyle, Lifestyle Fashion, Fashion Boudoir
  const galleries = {
    'fashion-editorial': [],
    'portrait-headshots': [],
    'outdoor-lifestyle': [],
    'lifestyle-fashion': [],
    'fashion-boudoir': []
  };

  // Category metadata matching original site
  const categoryMeta = {
    'fashion-editorial': {
      name: 'FASHION EDITORIAL',
      detail: 'Fashion Editorial – NYC winter 2017'
    },
    'portrait-headshots': {
      name: 'PORTRAITS & HEADSHOTS',
      detail: 'Portraits & Headshots – NYC & LA – ongoing'
    },
    'outdoor-lifestyle': {
      name: 'OUTDOOR LIFESTYLE',
      detail: 'Outdoor Lifestyle – Colombia – shot on Android Pixel Pro 7 for social media'
    },
    'lifestyle-fashion': {
      name: 'LIFESTYLE FASHION',
      detail: 'Lifestyle Fashion – Series 1 – LA, Wyoming, Tunisia, NYC'
    },
    'fashion-boudoir': {
      name: 'FASHION BOUDOIR',
      detail: 'Fashion Boudoir – Venezia, L.A.'
    }
  };

  // Distribute images across categories based on filename patterns and order
  // Since we can't reliably extract category associations, use index-based distribution
  const categoryKeys = Object.keys(galleries);
  const imagesPerCategory = Math.ceil(allImages.length / categoryKeys.length);

  allImages.forEach((img, idx) => {
    const altLower = (img.alt || '').toLowerCase();
    const srcLower = (img.src || '').toLowerCase();

    // Try to categorize by keywords first
    let assigned = false;

    // Fashion editorial: look for fashion/edit keywords
    if (!assigned && (srcLower.includes('edit') || altLower.includes('editorial') || altLower.includes('winter'))) {
      galleries['fashion-editorial'].push(img);
      assigned = true;
    }
    // Portraits: DSC_ prefix typically indicates DSLR portrait shots
    if (!assigned && (srcLower.includes('dsc_') || altLower.includes('portrait') || altLower.includes('headshot'))) {
      galleries['portrait-headshots'].push(img);
      assigned = true;
    }
    // Outdoor lifestyle: PXL_ prefix (Pixel phone), colombia, outdoor keywords
    if (!assigned && (srcLower.includes('pxl_') || altLower.includes('outdoor') || altLower.includes('colombia') || altLower.includes('lifestyle'))) {
      galleries['outdoor-lifestyle'].push(img);
      assigned = true;
    }
    // Fashion boudoir: boudoir, venezia keywords
    if (!assigned && (altLower.includes('boudoir') || altLower.includes('venezia') || altLower.includes('intimate'))) {
      galleries['fashion-boudoir'].push(img);
      assigned = true;
    }

    // If not assigned by keywords, distribute by index
    if (!assigned) {
      const catIndex = Math.floor(idx / imagesPerCategory);
      const catKey = categoryKeys[Math.min(catIndex, categoryKeys.length - 1)];
      galleries[catKey].push(img);
    }
  });

  // Build categories array with proper structure
  const categories = categoryKeys.map(key => ({
    id: key,
    name: categoryMeta[key].name,
    detail: categoryMeta[key].detail
  }));

  // Log category distribution
  Object.entries(galleries).forEach(([key, imgs]) => {
    console.log(`  ${categoryMeta[key].name}: ${imgs.length} images`);
  });

  // Clean up galleries - remove alt category if it has everything
  const cleanGalleries = {};
  Object.entries(galleries).forEach(([key, imgs]) => {
    if (imgs.length > 0) {
      cleanGalleries[key] = imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height,
        originalSrc: img.originalSrc
      }));
    }
  });

  const content = {
    title: 'Photography',
    blocks: [
      commonNav,
      {
        id: 'hero',
        slots: {
          headline: 'Photography',
          subhead: 'Professional portraiture, fashion, fine art and commercial photography',
          body: 'Capturing luxury in every frame. Film | DSLR | Mirrorless'
        }
      },
      {
        id: 'photo-nav',
        slots: {
          categories: categories,
          galleries: cleanGalleries
        }
      },
      commonFooter
    ]
  };

  return content;
}

// =========================================
// GENERATE SOCIAL MEDIA PAGE
// Social Media images from image-metadata (not in gallery-structure)
// NOTE: Limited images available - may need re-extraction
// =========================================

function generateSocialMedia() {
  // Social Media page uses image-metadata.json since it's not in gallery-structure
  const socialImages = imageMetadata
    .filter(img => img.page === 'Social Media' && img.localPath)
    .map((img, index) => ({
      src: `${API_BASE}/assets/images/${path.basename(img.localPath)}`,
      alt: img.alt || '',
      width: img.width || 0,
      height: img.height || 0,
      originalSrc: img.src,
      className: img.className || '',
      index: index
    }));

  // More lenient filter - only remove exact logo matches
  const galleryImages = socialImages.filter(img => {
    const filename = path.basename(img.src).toLowerCase();
    // Skip exact logo matches
    if (filename.includes('aiphloweb1nlk')) return false;
    if (filename.includes('aiphlologo2')) return false;
    if (filename.startsWith('file_000000004dc4')) return false;
    return true;
  });

  console.log(`Social Media: ${socialImages.length} total, ${galleryImages.length} gallery images`);

  // Create VYAYAMA and VICTORIA campaigns (matching original site)
  // VYAYAMA: Wellness & yoga slideshow
  // VICTORIA: Luxury lifestyle with video
  const midpoint = Math.ceil(galleryImages.length / 2);

  const campaigns = [
    {
      id: 'vyayama',
      name: 'VYAYAMA',
      description: 'Wellness & Fitness Campaign - Yoga and athleisure aesthetics',
      type: 'slideshow',
      // Icon should be the vyayama logo if we have it
      icon: `${API_BASE}/assets/images/socialmedia_vyayama.png`,
      iconStyle: 'circular',
      images: galleryImages.slice(0, midpoint).map(img => ({
        src: img.src,
        alt: 'VYAYAMA Campaign',
        width: img.width,
        height: img.height,
        originalSrc: img.originalSrc
      }))
    },
    {
      id: 'victoria',
      name: 'VICTORIA',
      description: 'Luxury Lifestyle Campaign - Built influencer relationships, influencer status within multiple niche fashion and lifestyle markets. Athleisure, high fashion, yoga and wellness.',
      type: 'slideshow-video',
      icon: `${API_BASE}/assets/images/socialmedia_victoria.png`,
      iconStyle: 'circular',
      video: {
        src: '', // Video needs to be provided by user (unpublished in Squarespace)
        poster: galleryImages[midpoint]?.src || '',
        description: 'Luxury lifestyle video campaign showcasing elegant visual storytelling'
      },
      images: galleryImages.slice(midpoint).map(img => ({
        src: img.src,
        alt: 'VICTORIA Campaign',
        width: img.width,
        height: img.height,
        originalSrc: img.originalSrc
      }))
    }
  ].filter(c => c.images.length > 0);

  const content = {
    title: 'Social Media',
    blocks: [
      commonNav,
      {
        id: 'hero',
        slots: {
          headline: 'Social Media',
          subhead: 'Campaign content and brand storytelling',
          body: 'Social Media & P.R. Rooted Creative Marketing. Brand Identity, Design, Social Media Management, Video Production.'
        }
      },
      {
        id: 'campaigns',
        slots: {
          items: campaigns
        }
      },
      commonFooter
    ]
  };

  return content;
}

// =========================================
// GENERATE PROJECTS PAGE
// Using exact structure from gallery-structure.json
// =========================================

function generateProjects() {
  const pageData = getPageStructure('Projects');

  if (!pageData) {
    console.error('Projects page not found in gallery-structure.json');
    return null;
  }

  console.log(`Projects: Found ${pageData.galleries.length} galleries`);

  // Get all images
  const allImages = [];
  pageData.galleries.forEach(gallery => {
    gallery.images.forEach(img => {
      const localImg = mapToLocalImage(img);
      if (localImg) {
        allImages.push(localImg);
      }
    });
  });

  // Sort by original index
  allImages.sort((a, b) => a.index - b.index);

  // Filter for project images (larger, not logos)
  const projectImages = allImages.filter(img => {
    const src = img.src.toLowerCase();
    if (src.includes('aiphloweb') || src.includes('aiphlologo')) return false;
    if (src.includes('file_000000004dc4')) return false;
    // Keep project circle images
    if (img.parentClasses && img.parentClasses.includes('pm-project-circle')) return true;
    // Keep images above a certain size
    if (img.width >= 300 && img.height >= 300) return true;
    return false;
  });

  console.log(`Projects: ${allImages.length} total, ${projectImages.length} project images`);

  // Create project cards
  const projects = projectImages.slice(0, 12).map((img, i) => ({
    title: img.alt || `Project ${i + 1}`,
    description: img.alt || 'Creative project',
    image: img.src,
    width: img.width,
    height: img.height,
    url: '#'
  }));

  const content = {
    title: 'Projects',
    blocks: [
      commonNav,
      {
        id: 'hero',
        slots: {
          headline: 'Projects',
          subhead: 'Selected work and creative endeavors',
          body: 'Boutique creative agency, scalable production, Luxury art direction.'
        }
      },
      {
        id: 'projects',
        slots: {
          items: projects
        }
      },
      commonFooter
    ]
  };

  return content;
}

// =========================================
// MAIN - GENERATE ALL CONTENT
// =========================================

function main() {
  console.log('===========================================');
  console.log('CONTENT GENERATOR V2 - Gallery Structure');
  console.log('===========================================\n');

  // List available pages in gallery structure
  const structuredPages = galleryStructure.pages.map(p => p.name);
  console.log('Pages in gallery-structure.json:', structuredPages.join(', '));

  // List pages in image metadata
  const metadataPages = [...new Set(imageMetadata.map(i => i.page))];
  console.log('Pages in image-metadata.json:', metadataPages.join(', '));
  console.log('');

  // Generate content
  const photography = generatePhotography();
  const socialmedia = generateSocialMedia();
  const projects = generateProjects();

  // Write content files
  const outputDir = path.join(__dirname, '../api/content');

  if (photography) {
    fs.writeFileSync(
      path.join(outputDir, 'photography.json'),
      JSON.stringify(photography, null, 2)
    );
    console.log('✓ Generated photography.json');
  }

  if (socialmedia) {
    fs.writeFileSync(
      path.join(outputDir, 'socialmedia.json'),
      JSON.stringify(socialmedia, null, 2)
    );
    console.log('✓ Generated socialmedia.json');
  }

  if (projects) {
    fs.writeFileSync(
      path.join(outputDir, 'projects.json'),
      JSON.stringify(projects, null, 2)
    );
    console.log('✓ Generated projects.json');
  }

  console.log('\n===========================================');
  console.log('Content generation complete!');
  console.log('Images are served from: /assets/images/');
  console.log('===========================================');
}

main();
