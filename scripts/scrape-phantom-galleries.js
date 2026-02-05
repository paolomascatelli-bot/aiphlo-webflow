/* =========================================
   PHANTOM GALLERY SCRAPER
   Clicks through category buttons to extract
   images associated with each gallery section
   ========================================= */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.paolomascatelli.com';
const OUTPUT_DIR = path.join(__dirname, '../assets/content');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function scrapePhotographyGalleries() {
  console.log('📸 Scraping Photography galleries with phantom nav interaction...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Track image URLs loaded during each category
  const imageUrlsPerCategory = new Map();
  let currentCategory = null;

  // Intercept network requests to capture image URLs
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (currentCategory && url.match(/\.(jpg|jpeg|png|webp|gif)/i) &&
        url.includes('squarespace-cdn') &&
        !url.includes('Aiphloweb1nlk') &&
        !url.includes('AiphloLogo') &&
        !url.includes('footer')) {
      if (!imageUrlsPerCategory.has(currentCategory)) {
        imageUrlsPerCategory.set(currentCategory, new Set());
      }
      imageUrlsPerCategory.get(currentCategory).add(url.split('?')[0]);
    }
    request.continue();
  });

  const photographyData = {
    page: 'Photography',
    url: `${BASE_URL}/photography`,
    categories: [],
    totalImages: 0
  };

  try {
    console.log('Loading Photography page...');
    await page.goto(`${BASE_URL}/photography`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await new Promise(r => setTimeout(r, 3000));

    // Find the category buttons - look for the pill nav buttons
    const categoryButtons = await page.evaluate(() => {
      const buttons = [];

      // Look for buttons with gallery-related text
      const allButtons = document.querySelectorAll('button, [role="button"], .pm-photo-pill, [class*="pill"], [class*="category"], [class*="nav-btn"]');

      allButtons.forEach(btn => {
        const text = btn.innerText?.trim();
        // Match the known photography categories
        if (text && (
          text.includes('FASHION EDITORIAL') ||
          text.includes('PORTRAITS') ||
          text.includes('HEADSHOTS') ||
          text.includes('OUTDOOR LIFESTYLE') ||
          text.includes('LIFESTYLE FASHION') ||
          text.includes('FASHION BOUDOIR') ||
          text.includes('GALLERIES')
        )) {
          buttons.push({
            text: text,
            selector: btn.id ? `#${btn.id}` : null,
            className: btn.className,
            tagName: btn.tagName
          });
        }
      });

      return buttons;
    });

    console.log(`Found ${categoryButtons.length} category buttons:`, categoryButtons.map(b => b.text));

    // First, click GALLERIES toggle if it exists
    try {
      const galleriesToggle = await page.$('button:has-text("GALLERIES"), [class*="galleries-toggle"]');
      if (galleriesToggle) {
        await galleriesToggle.click();
        console.log('Clicked GALLERIES toggle');
        await new Promise(r => setTimeout(r, 1500));
      }
    } catch (e) {
      console.log('No GALLERIES toggle found or already open');
    }

    // Extract each category by clicking its button
    const categoryNames = [
      'FASHION EDITORIAL',
      'PORTRAITS & HEADSHOTS',
      'OUTDOOR LIFESTYLE',
      'LIFESTYLE FASHION',
      'FASHION BOUDOIR'
    ];

    for (const categoryName of categoryNames) {
      console.log(`\n📂 Extracting: ${categoryName}`);
      currentCategory = categoryName;

      try {
        // Click the category button
        const clicked = await page.evaluate((catName) => {
          const buttons = document.querySelectorAll('button, [role="button"], [class*="pill"], [class*="btn"]');
          for (const btn of buttons) {
            if (btn.innerText?.trim().includes(catName) ||
                btn.innerText?.trim().includes(catName.split(' ')[0])) {
              btn.click();
              return true;
            }
          }
          return false;
        }, categoryName);

        if (!clicked) {
          console.log(`   Could not find button for: ${categoryName}`);
          continue;
        }

        console.log(`   Clicked button, waiting for gallery...`);
        await new Promise(r => setTimeout(r, 2000));

        // Scroll to load lazy images
        await page.evaluate(async () => {
          const scrollContainer = document.querySelector('[class*="gallery-section"], [class*="photo-section"], main');
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
          window.scrollTo(0, document.body.scrollHeight);
        });
        await new Promise(r => setTimeout(r, 1000));

        // Get the target section ID for this category
        const sectionId = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
        const altSectionId = categoryName.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');

        console.log(`   Looking for section: #${sectionId} or #${altSectionId}`);

        // Extract images from the specific gallery section
        const images = await page.evaluate((secId, altSecId) => {
          const imgs = [];

          // Try to find the gallery section by various ID patterns
          const possibleIds = [
            secId,
            altSecId,
            secId.replace('portraits-headshots', 'portrait-headshots'),
            'fashion-editorial', 'portrait-headshots', 'outdoor-lifestyle',
            'lifestyle-fashion', 'fashion-boudoir'
          ];

          let section = null;
          for (const id of possibleIds) {
            section = document.getElementById(id) ||
                      document.querySelector(`[data-section-id="${id}"]`) ||
                      document.querySelector(`section[id*="${id.split('-')[0]}"]`);
            if (section) break;
          }

          // If no specific section, look for visible gallery containers
          if (!section) {
            section = document.querySelector('.pm-photo-section:not([style*="display: none"])') ||
                      document.querySelector('[class*="gallery"]:not([style*="display: none"])');
          }

          // Get images from section or all visible gallery images
          const imgElements = section ?
            section.querySelectorAll('img') :
            document.querySelectorAll('.sqs-gallery img, [class*="gallery"] img');

          imgElements.forEach((img) => {
            const src = img.src || img.dataset.src || img.dataset.image;

            // Skip logos and small images
            if (src &&
                !src.includes('Aiphloweb1nlk') &&
                !src.includes('AiphloLogo') &&
                !src.includes('file_000000004dc4') &&
                !src.includes('footer') &&
                !src.includes('Color+Drop') &&
                !src.includes('ColorDrop') &&
                img.naturalWidth > 200) {
              imgs.push({
                src: src,
                alt: img.alt || '',
                width: img.naturalWidth || img.width,
                height: img.naturalHeight || img.height
              });
            }
          });

          return imgs;
        }, sectionId, altSectionId);

        // Also get network-captured images
        const networkImages = imageUrlsPerCategory.get(categoryName) || new Set();
        console.log(`   Found ${images.length} DOM images, ${networkImages.size} network images`);

        // Combine DOM and network images, prefer DOM for metadata
        const allImages = new Map();
        images.forEach(img => allImages.set(img.src.split('?')[0], img));
        networkImages.forEach(url => {
          if (!allImages.has(url)) {
            allImages.set(url, { src: url, alt: '', width: 0, height: 0 });
          }
        });

        const finalImages = Array.from(allImages.values());
        console.log(`   Total unique: ${finalImages.length} images`);

        if (finalImages.length > 0) {
          photographyData.categories.push({
            id: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: categoryName,
            images: finalImages.map((img, idx) => ({
              index: idx,
              ...img
            }))
          });
          photographyData.totalImages += finalImages.length;
        }

        // Close the gallery (click again or wait)
        await page.evaluate((catName) => {
          const buttons = document.querySelectorAll('button, [role="button"], [class*="pill"], [class*="btn"]');
          for (const btn of buttons) {
            if (btn.innerText?.trim().includes(catName) ||
                btn.innerText?.trim().includes(catName.split(' ')[0])) {
              btn.click();
              return;
            }
          }
        }, categoryName);
        await new Promise(r => setTimeout(r, 500));

      } catch (err) {
        console.log(`   Error extracting ${categoryName}: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('Error scraping Photography:', error.message);
  }

  // Save Photography data
  const photoFile = path.join(OUTPUT_DIR, 'photography-galleries.json');
  fs.writeFileSync(photoFile, JSON.stringify(photographyData, null, 2));
  console.log(`\n✅ Photography data saved to: ${photoFile}`);
  console.log(`   Total categories: ${photographyData.categories.length}`);
  console.log(`   Total images: ${photographyData.totalImages}`);

  await browser.close();
  return photographyData;
}

async function scrapeSocialMediaCampaigns() {
  console.log('\n\n📱 Scraping Social Media campaigns...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const socialData = {
    page: 'Social Media',
    url: `${BASE_URL}/socialmedia`,
    campaigns: [],
    totalImages: 0
  };

  try {
    console.log('Loading Social Media page...');
    await page.goto(`${BASE_URL}/socialmedia`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await new Promise(r => setTimeout(r, 3000));

    const campaignNames = ['VYAYAMA', 'VICTORIA'];

    for (const campaignName of campaignNames) {
      console.log(`\n📂 Extracting: ${campaignName}`);

      try {
        // Click the campaign button
        const clicked = await page.evaluate((name) => {
          const buttons = document.querySelectorAll('button, [role="button"], [class*="campaign"], [class*="btn"]');
          for (const btn of buttons) {
            if (btn.innerText?.trim().includes(name)) {
              btn.click();
              return true;
            }
          }
          return false;
        }, campaignName);

        if (!clicked) {
          console.log(`   Could not find button for: ${campaignName}`);
          continue;
        }

        console.log(`   Clicked button, waiting for content...`);
        await new Promise(r => setTimeout(r, 2500));

        // Scroll to load content
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await new Promise(r => setTimeout(r, 1000));

        // Extract campaign content
        const content = await page.evaluate(() => {
          const result = {
            images: [],
            video: null,
            description: ''
          };

          // Get visible images
          document.querySelectorAll('img').forEach(img => {
            const rect = img.getBoundingClientRect();
            const src = img.src || img.dataset.src;

            if (src && rect.width > 50 && rect.height > 50 &&
                !src.includes('Aiphloweb1nlk') &&
                !src.includes('AiphloLogo') &&
                !src.includes('file_000000004dc4') &&
                !src.includes('footer')) {
              result.images.push({
                src: src,
                alt: img.alt || '',
                width: img.naturalWidth || img.width,
                height: img.naturalHeight || img.height
              });
            }
          });

          // Look for video
          const video = document.querySelector('video');
          if (video) {
            result.video = {
              src: video.src || video.querySelector('source')?.src || '',
              poster: video.poster || ''
            };
          }

          // Look for description text
          const descEl = document.querySelector('[class*="description"], [class*="campaign-text"], p');
          if (descEl) {
            result.description = descEl.innerText?.trim().substring(0, 500) || '';
          }

          return result;
        });

        console.log(`   Found ${content.images.length} images`);
        if (content.video?.src) {
          console.log(`   Found video: ${content.video.src.substring(0, 50)}...`);
        }

        socialData.campaigns.push({
          id: campaignName.toLowerCase(),
          name: campaignName,
          type: content.video?.src ? 'slideshow-video' : 'slideshow',
          images: content.images.map((img, idx) => ({ index: idx, ...img })),
          video: content.video,
          description: content.description
        });
        socialData.totalImages += content.images.length;

        // Close the campaign
        await page.evaluate((name) => {
          const buttons = document.querySelectorAll('button, [role="button"], [class*="campaign"], [class*="btn"]');
          for (const btn of buttons) {
            if (btn.innerText?.trim().includes(name)) {
              btn.click();
              return;
            }
          }
        }, campaignName);
        await new Promise(r => setTimeout(r, 500));

      } catch (err) {
        console.log(`   Error extracting ${campaignName}: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('Error scraping Social Media:', error.message);
  }

  // Save Social Media data
  const socialFile = path.join(OUTPUT_DIR, 'socialmedia-campaigns.json');
  fs.writeFileSync(socialFile, JSON.stringify(socialData, null, 2));
  console.log(`\n✅ Social Media data saved to: ${socialFile}`);
  console.log(`   Total campaigns: ${socialData.campaigns.length}`);
  console.log(`   Total images: ${socialData.totalImages}`);

  await browser.close();
  return socialData;
}

// Run both scrapers
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   PHANTOM GALLERY SCRAPER - Extracts by clicking nav');
  console.log('═══════════════════════════════════════════════════════\n');

  await scrapePhotographyGalleries();
  await scrapeSocialMediaCampaigns();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   EXTRACTION COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
}

main().catch(console.error);
