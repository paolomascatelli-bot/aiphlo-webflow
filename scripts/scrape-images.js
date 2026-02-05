const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const BASE_URL = 'https://www.paolomascatelli.com';
const OUTPUT_DIR = path.join(__dirname, '../assets/images');
const METADATA_FILE = path.join(__dirname, '../assets/image-metadata.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

// Sanitize filename
function sanitizeFilename(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const filename = pathname.split('/').pop() || 'image.jpg';
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function scrapeImages() {
  console.log('🚀 Starting image scraper...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport for desktop
  await page.setViewport({ width: 1920, height: 1080 });

  const allImages = [];
  const pages = [
    { name: 'Home', url: BASE_URL },
    { name: 'Projects', url: `${BASE_URL}/projects` },
    { name: 'Photography', url: `${BASE_URL}/photography` },
    { name: 'Social Media', url: `${BASE_URL}/social-media` },
    { name: 'FAQs', url: `${BASE_URL}/faqs` },
    { name: 'Contact', url: `${BASE_URL}/contact` }
  ];

  for (const pageInfo of pages) {
    console.log(`\n📄 Scraping images from: ${pageInfo.name}`);

    try {
      await page.goto(pageInfo.url, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Scroll to load lazy images
      await autoScroll(page);

      // Extract all image information
      const images = await page.evaluate(() => {
        const imageElements = document.querySelectorAll('img');
        const imageData = [];

        imageElements.forEach((img) => {
          const src = img.src || img.dataset.src || img.getAttribute('data-src');
          if (src && !src.includes('data:image')) {
            imageData.push({
              src: src,
              alt: img.alt || '',
              title: img.title || '',
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height,
              className: img.className,
              id: img.id
            });
          }
        });

        // Also check for background images
        const elementsWithBg = document.querySelectorAll('[style*="background-image"]');
        elementsWithBg.forEach((el) => {
          const style = el.style.backgroundImage;
          const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (match && match[1] && !match[1].includes('data:image')) {
            imageData.push({
              src: match[1],
              alt: '',
              title: '',
              width: el.offsetWidth,
              height: el.offsetHeight,
              className: el.className,
              id: el.id,
              isBackground: true
            });
          }
        });

        return imageData;
      });

      console.log(`   Found ${images.length} images`);

      // Add page context to each image
      images.forEach(img => {
        img.page = pageInfo.name;
        allImages.push(img);
      });

    } catch (error) {
      console.error(`   ❌ Error scraping ${pageInfo.name}:`, error.message);
    }
  }

  await browser.close();

  console.log(`\n✅ Total images found: ${allImages.length}`);
  console.log('📥 Downloading images...');

  // Download images
  let downloaded = 0;
  let failed = 0;

  for (let i = 0; i < allImages.length; i++) {
    const img = allImages[i];
    const filename = `${img.page.toLowerCase().replace(/\s+/g, '-')}_${i}_${sanitizeFilename(img.src)}`;
    const filepath = path.join(OUTPUT_DIR, filename);

    try {
      // Skip if already downloaded
      if (fs.existsSync(filepath)) {
        console.log(`   ⏭️  Skipping (already exists): ${filename}`);
        img.localPath = filepath;
        downloaded++;
        continue;
      }

      await downloadImage(img.src, filepath);
      img.localPath = filepath;
      console.log(`   ✓ Downloaded [${i + 1}/${allImages.length}]: ${filename}`);
      downloaded++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`   ✗ Failed to download ${img.src}:`, error.message);
      failed++;
    }
  }

  // Save metadata
  fs.writeFileSync(METADATA_FILE, JSON.stringify(allImages, null, 2));
  console.log(`\n📊 Metadata saved to: ${METADATA_FILE}`);

  console.log(`\n✨ Download complete!`);
  console.log(`   ✓ Successfully downloaded: ${downloaded}`);
  console.log(`   ✗ Failed: ${failed}`);
  console.log(`   📁 Images saved to: ${OUTPUT_DIR}`);
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

// Run the scraper
scrapeImages().catch(console.error);
