#!/usr/bin/env node
/* all-in-one squarespace scraper → webflow starter pack
   run: node scrape-and-package.js https://yoursite.squarespace.com
   outputs: export/ folder with (1) sqsp.json (2) images/ (3) ready-to-paste CSS + HTML */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, createWriteStream, existsSync } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import fetch from 'node-fetch';

const [,, url] = process.argv;
if (!url) {
  console.log('usage: node scrape-and-package.js <squarespace-url>');
  process.exit(1);
}

const outDir = 'export';
mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, 'images'), { recursive: true });

console.log(`\n🔍 Scraping: ${url}\n`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

console.log('⏳ Loading page...');
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

console.log('📸 Extracting DOM + computed styles...');
const data = await page.evaluate(() => {
  const body = document.body.cloneNode(true);

  // Remove scripts
  body.querySelectorAll('script').forEach(s => s.remove());

  // Get computed styles for all elements
  const elements = [...document.body.querySelectorAll('*')];
  const styles = elements.map(el => {
    const c = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      className: el.className,
      id: el.id,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      cssText: [...c].map(k => `${k}:${c.getPropertyValue(k)}`).join(';')
    };
  });

  // Get all images
  const imgs = [...document.querySelectorAll('img')]
    .map(i => i.src)
    .filter(u => u && (u.includes('squarespace-cdn') || u.includes('static1.squarespace')));

  // Get all background images
  elements.forEach(el => {
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none' && bg.includes('url(')) {
      const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
      if (match && match[1] && (match[1].includes('squarespace-cdn') || match[1].includes('static1.squarespace'))) {
        imgs.push(match[1]);
      }
    }
  });

  return {
    html: body.innerHTML,
    styles,
    imgs: [...new Set(imgs)], // dedupe
    title: document.title,
    meta: {
      description: document.querySelector('meta[name="description"]')?.content || '',
      viewport: document.querySelector('meta[name="viewport"]')?.content || ''
    }
  };
});

console.log(`📦 Found ${data.styles.length} elements, ${data.imgs.length} images`);

// Download images
console.log('⬇️  Downloading images...');
const imageMap = {};
let cnt = 0;

for (const imgUrl of data.imgs) {
  try {
    const ext = imgUrl.match(/\.(\w+)(\?|$)/)?.[1] || 'jpg';
    const name = `img_${cnt++}.${ext}`;
    const res = await fetch(imgUrl);

    if (res.ok) {
      const dest = createWriteStream(join(outDir, 'images', name));
      await pipeline(res.body, dest);
      imageMap[imgUrl] = `./images/${name}`;
      process.stdout.write(`\r   Downloaded: ${cnt}/${data.imgs.length}`);
    }
  } catch (e) {
    console.warn(`\n   ⚠️  Failed: ${imgUrl.slice(0, 50)}...`);
  }
}
console.log('\n');

// Add image mapping to data
data.imageMap = imageMap;

// Write JSON
writeFileSync(join(outDir, 'sqsp.json'), JSON.stringify(data, null, 2));
console.log('✅ Scraped → export/sqsp.json');
console.log('✅ Images  → export/images/');
console.log(`\n📊 Summary:`);
console.log(`   - Elements: ${data.styles.length}`);
console.log(`   - Images: ${Object.keys(imageMap).length}`);
console.log(`   - Title: ${data.title}`);

await browser.close();
console.log('\n🎉 Done! Check the export/ folder.\n');
