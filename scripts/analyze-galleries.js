const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.paolomascatelli.com';
const OUTPUT_DIR = path.join(__dirname, '../assets/content');
const GALLERY_FILE = path.join(OUTPUT_DIR, 'gallery-structure.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function analyzeGalleries() {
  console.log('🚀 Starting gallery analysis...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const galleryData = {
    pages: [],
    categories: [],
    totalImages: 0
  };

  const galleryPages = [
    { name: 'Projects', url: `${BASE_URL}/projects` },
    { name: 'Photography', url: `${BASE_URL}/photography` }
  ];

  for (const pageInfo of galleryPages) {
    console.log(`\n📸 Analyzing galleries on: ${pageInfo.name}`);

    try {
      await page.goto(pageInfo.url, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Scroll to load all images
      await autoScroll(page);

      // Extract gallery structure
      const galleries = await page.evaluate(() => {
        const result = {
          galleries: [],
          categories: [],
          filterButtons: [],
          toggles: []
        };

        // Find filter/category buttons
        const buttons = document.querySelectorAll('button, [class*="filter"], [class*="category"], [class*="tab"]');
        buttons.forEach(btn => {
          const text = btn.innerText?.trim();
          if (text && text.length > 0 && text.length < 50) {
            result.filterButtons.push({
              text: text,
              className: btn.className,
              id: btn.id,
              dataAttributes: Array.from(btn.attributes)
                .filter(attr => attr.name.startsWith('data-'))
                .map(attr => ({ name: attr.name, value: attr.value }))
            });
          }
        });

        // Find toggle switches
        const toggles = document.querySelectorAll('[class*="toggle"], input[type="checkbox"]');
        toggles.forEach(toggle => {
          const label = toggle.labels?.[0]?.innerText || toggle.getAttribute('aria-label') || '';
          result.toggles.push({
            label: label,
            className: toggle.className,
            id: toggle.id,
            checked: toggle.checked || false
          });
        });

        // Find gallery containers
        const galleryContainers = document.querySelectorAll(
          '[class*="gallery"], [class*="grid"], [class*="masonry"], [class*="slideshow"], .sqs-gallery'
        );

        galleryContainers.forEach((container, index) => {
          const images = container.querySelectorAll('img');
          const galleryImages = [];

          images.forEach((img, imgIndex) => {
            const src = img.src || img.dataset.src || img.getAttribute('data-image');
            if (src && !src.includes('data:image')) {
              galleryImages.push({
                index: imgIndex,
                src: src,
                alt: img.alt || '',
                title: img.title || '',
                width: img.naturalWidth || img.width,
                height: img.naturalHeight || img.height,
                parentClasses: img.parentElement?.className || '',
                category: img.dataset.category || img.closest('[data-category]')?.dataset.category || ''
              });
            }
          });

          if (galleryImages.length > 0) {
            result.galleries.push({
              index: index,
              className: container.className,
              id: container.id,
              imageCount: galleryImages.length,
              images: galleryImages,
              layout: container.style.display || getComputedStyle(container).display,
              gridColumns: getComputedStyle(container).gridTemplateColumns || 'auto'
            });
          }
        });

        // Extract unique categories
        const categorySet = new Set();
        result.galleries.forEach(gallery => {
          gallery.images.forEach(img => {
            if (img.category) {
              categorySet.add(img.category);
            }
          });
        });
        result.filterButtons.forEach(btn => {
          if (btn.text && !['All', 'View All', 'Show All'].includes(btn.text)) {
            categorySet.add(btn.text);
          }
        });

        result.categories = Array.from(categorySet);

        return result;
      });

      console.log(`   ✓ Found ${galleries.galleries.length} gallery containers`);
      console.log(`   ✓ Found ${galleries.filterButtons.length} filter buttons`);
      console.log(`   ✓ Found ${galleries.toggles.length} toggle switches`);
      console.log(`   ✓ Found ${galleries.categories.length} categories:`, galleries.categories);

      // Count total images
      const pageImageCount = galleries.galleries.reduce((sum, g) => sum + g.imageCount, 0);
      galleryData.totalImages += pageImageCount;

      // Add categories
      galleries.categories.forEach(cat => {
        if (!galleryData.categories.includes(cat)) {
          galleryData.categories.push(cat);
        }
      });

      galleryData.pages.push({
        name: pageInfo.name,
        url: pageInfo.url,
        ...galleries,
        totalImages: pageImageCount
      });

    } catch (error) {
      console.error(`   ❌ Error analyzing ${pageInfo.name}:`, error.message);
    }
  }

  await browser.close();

  // Save gallery data
  fs.writeFileSync(GALLERY_FILE, JSON.stringify(galleryData, null, 2));

  console.log(`\n✨ Gallery analysis complete!`);
  console.log(`   📁 Analysis saved to: ${GALLERY_FILE}`);
  console.log(`   📊 Summary:`);
  console.log(`      - Total pages analyzed: ${galleryData.pages.length}`);
  console.log(`      - Total categories found: ${galleryData.categories.length}`);
  console.log(`      - Total images: ${galleryData.totalImages}`);
  console.log(`\n   📋 Categories found:`);
  galleryData.categories.forEach(cat => {
    console.log(`      - ${cat}`);
  });

  // Create a simplified CMS structure recommendation
  const cmsStructure = {
    collections: [
      {
        name: 'Projects',
        fields: [
          { name: 'Name', type: 'Plain Text' },
          { name: 'Category', type: 'Option', options: galleryData.categories },
          { name: 'Description', type: 'Rich Text' },
          { name: 'Featured Image', type: 'Image' },
          { name: 'Gallery Images', type: 'Multi-Image' },
          { name: 'Tenebre Mode', type: 'Switch' },
          { name: 'Order', type: 'Number' },
          { name: 'Slug', type: 'Plain Text' }
        ]
      },
      {
        name: 'Photography',
        fields: [
          { name: 'Title', type: 'Plain Text' },
          { name: 'Type', type: 'Option', options: ['Film', 'DSLR', 'Mirrorless'] },
          { name: 'Category', type: 'Option', options: galleryData.categories },
          { name: 'Image', type: 'Image' },
          { name: 'Caption', type: 'Plain Text' },
          { name: 'Featured', type: 'Switch' },
          { name: 'Order', type: 'Number' }
        ]
      }
    ]
  };

  const cmsFile = path.join(OUTPUT_DIR, 'webflow-cms-structure.json');
  fs.writeFileSync(cmsFile, JSON.stringify(cmsStructure, null, 2));
  console.log(`\n   📁 CMS structure recommendation saved to: ${cmsFile}`);
}

// Auto-scroll to load lazy images
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// Run the analyzer
analyzeGalleries().catch(console.error);
