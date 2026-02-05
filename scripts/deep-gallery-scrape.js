/* =========================================
   DEEP GALLERY SCRAPER
   Takes screenshots and captures all images
   when each category button is clicked
   ========================================= */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.paolomascatelli.com';
const OUTPUT_DIR = path.join(__dirname, '../assets/content');
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots/galleries');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function deepScrapePhotography() {
  console.log('📸 Deep scraping Photography galleries...\n');

  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const photographyData = {
    page: 'Photography',
    url: `${BASE_URL}/photography`,
    categories: [],
    totalImages: 0
  };

  try {
    console.log('Loading Photography page...');
    await page.goto(`${BASE_URL}/photography`, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for page to fully render
    await new Promise(r => setTimeout(r, 5000));

    // Take initial screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '00-initial.png'), fullPage: true });
    console.log('Saved initial screenshot');

    // First, find and click the GALLERIES toggle to reveal the pills
    console.log('\nLooking for GALLERIES toggle...');
    const galleriesClicked = await page.evaluate(() => {
      // Look for elements containing "GALLERIES" text
      const elements = Array.from(document.querySelectorAll('*'));
      for (const el of elements) {
        if (el.innerText === 'GALLERIES' ||
            el.textContent?.trim() === 'GALLERIES' ||
            el.querySelector?.('.pm-toggle-text')?.textContent === 'GALLERIES') {
          el.click();
          return true;
        }
      }
      return false;
    });

    if (galleriesClicked) {
      console.log('Clicked GALLERIES toggle');
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-galleries-open.png'), fullPage: true });
    }

    // Category definitions with exact button text to look for
    const categories = [
      { name: 'FASHION EDITORIAL', buttonText: 'FASHION EDITORIAL' },
      { name: 'PORTRAITS & HEADSHOTS', buttonText: 'PORTRAITS' },
      { name: 'OUTDOOR LIFESTYLE', buttonText: 'OUTDOOR' },
      { name: 'LIFESTYLE FASHION', buttonText: 'LIFESTYLE FASHION' },
      { name: 'FASHION BOUDOIR', buttonText: 'BOUDOIR' }
    ];

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      console.log(`\n📂 [${i + 1}/${categories.length}] Extracting: ${cat.name}`);

      // Click the category pill
      const clicked = await page.evaluate((searchText) => {
        const pills = document.querySelectorAll('.pm-pill, button[class*="pill"], [data-target]');
        for (const pill of pills) {
          const text = pill.textContent || pill.innerText || '';
          if (text.includes(searchText)) {
            pill.click();
            return { found: true, text: text.trim() };
          }
        }
        // Also try broader search
        const allButtons = document.querySelectorAll('button');
        for (const btn of allButtons) {
          if (btn.textContent?.includes(searchText)) {
            btn.click();
            return { found: true, text: btn.textContent?.trim() };
          }
        }
        return { found: false };
      }, cat.buttonText);

      if (!clicked.found) {
        console.log(`   ⚠️ Could not find button for: ${cat.name}`);
        continue;
      }

      console.log(`   Clicked: "${clicked.text}"`);

      // Wait for gallery to animate open
      await new Promise(r => setTimeout(r, 3000));

      // Scroll down to see gallery
      await page.evaluate(() => {
        window.scrollTo(0, 500);
      });
      await new Promise(r => setTimeout(r, 1000));

      // Take screenshot of this category
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${String(i + 2).padStart(2, '0')}-${cat.name.toLowerCase().replace(/\s+/g, '-')}.png`),
        fullPage: true
      });
      console.log(`   Saved screenshot`);

      // Extract all visible images
      const images = await page.evaluate(() => {
        const imgs = [];
        const seenSrcs = new Set();

        // Get all images on page
        document.querySelectorAll('img').forEach(img => {
          const src = img.src || img.dataset.src || img.dataset.image;
          if (!src) return;

          // Skip logos, icons, and duplicates
          const srcBase = src.split('?')[0];
          if (seenSrcs.has(srcBase)) return;
          if (src.includes('Aiphloweb1nlk') ||
              src.includes('AiphloLogo') ||
              src.includes('file_000000004dc4') ||
              src.includes('footer') ||
              src.includes('Color+Drop')) return;

          // Check if image is visible (in viewport or visible section)
          const rect = img.getBoundingClientRect();
          const style = window.getComputedStyle(img);
          const parent = img.closest('section, [class*="gallery"], [class*="section"]');
          const parentStyle = parent ? window.getComputedStyle(parent) : null;

          // Include if visible or in a visible container
          const isVisible = rect.height > 50 && rect.width > 50;
          const parentVisible = !parentStyle ||
            (parentStyle.display !== 'none' && parentStyle.visibility !== 'hidden');

          if (isVisible && parentVisible && img.naturalWidth > 100) {
            seenSrcs.add(srcBase);
            imgs.push({
              src: srcBase,
              alt: img.alt || '',
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height,
              visible: rect.top < window.innerHeight && rect.bottom > 0
            });
          }
        });

        return imgs;
      });

      console.log(`   Found ${images.length} images`);

      if (images.length > 0) {
        photographyData.categories.push({
          id: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: cat.name,
          images: images.map((img, idx) => ({ index: idx, ...img }))
        });
        photographyData.totalImages += images.length;
      }

      // Close the gallery by clicking the same button again
      await page.evaluate((searchText) => {
        const pills = document.querySelectorAll('.pm-pill, button[class*="pill"]');
        for (const pill of pills) {
          if (pill.textContent?.includes(searchText)) {
            pill.click();
            return;
          }
        }
      }, cat.buttonText);

      await new Promise(r => setTimeout(r, 1000));
    }

    // Save photography data
    const photoFile = path.join(OUTPUT_DIR, 'photography-deep.json');
    fs.writeFileSync(photoFile, JSON.stringify(photographyData, null, 2));
    console.log(`\n✅ Photography data saved to: ${photoFile}`);
    console.log(`   Categories: ${photographyData.categories.length}`);
    console.log(`   Total images: ${photographyData.totalImages}`);

  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
  return photographyData;
}

deepScrapePhotography().catch(console.error);
