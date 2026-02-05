/* =========================================
   VIDEO SCRAPER
   Extracts video URLs from Squarespace pages
   Handles: native videos, embeds, iframes
   ========================================= */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.paolomascatelli.com';
const OUTPUT_DIR = path.join(__dirname, '../assets/videos');
const METADATA_FILE = path.join(__dirname, '../assets/video-metadata.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Download video from URL
function downloadVideo(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    console.log(`  Downloading: ${url.substring(0, 80)}...`);

    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`  Redirecting to: ${response.headers.location}`);
        downloadVideo(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize) {
          const percent = Math.round((downloadedSize / totalSize) * 100);
          process.stdout.write(`\r  Progress: ${percent}%`);
        }
      });

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('\n  Download complete');
        resolve(filepath);
      });
    });

    request.on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });

    request.setTimeout(120000, () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

// Sanitize filename
function sanitizeFilename(url, index) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    let filename = pathname.split('/').pop() || `video_${index}`;
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    // Ensure video extension
    if (!filename.match(/\.(mp4|webm|mov|m4v|ogg)$/i)) {
      filename += '.mp4';
    }
    return filename;
  } catch {
    return `video_${index}.mp4`;
  }
}

// Auto-scroll to trigger lazy loading
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          // Scroll back to top
          window.scrollTo(0, 0);
          resolve();
        }
      }, 200);
    });
  });
}

async function scrapeVideos() {
  console.log('🎬 Starting video scraper...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Intercept network requests to catch video URLs
  const capturedVideoUrls = new Set();

  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = request.url();
    // Capture video file requests
    if (url.match(/\.(mp4|webm|m4v|mov|ogg)(\?|$)/i) ||
        url.includes('video') && url.includes('squarespace')) {
      capturedVideoUrls.add(url);
    }
    request.continue();
  });

  const allVideos = [];
  const pages = [
    { name: 'Home', url: BASE_URL },
    { name: 'Projects', url: `${BASE_URL}/projects` },
    { name: 'Photography', url: `${BASE_URL}/photography` },
    { name: 'Social Media', url: `${BASE_URL}/social-media` },
    { name: 'FAQs', url: `${BASE_URL}/faqs` },
    { name: 'Contact', url: `${BASE_URL}/contact` }
  ];

  for (const pageInfo of pages) {
    console.log(`📄 Scraping videos from: ${pageInfo.name}`);
    capturedVideoUrls.clear();

    try {
      await page.goto(pageInfo.url, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Scroll to trigger lazy loading
      await autoScroll(page);

      // Wait more for videos to initialize
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Click on any accordion/toggle buttons to reveal hidden content
      const clickableSelectors = [
        '.accordion-toggle',
        '.accordion-button',
        '.sqs-block-accordion-header',
        '[data-accordion]',
        '.campaign-btn',
        '.pm-campaign-btn',
        '.gallery-nav-item',
        '[data-toggle]',
        '.toggle-button',
        'button[class*="accordion"]',
        'button[class*="toggle"]',
        '.collapsible-header',
        '.section-toggle',
        // Squarespace specific
        '.sqs-block-button-element',
        '.code-block button',
        '.sqs-layout button'
      ];

      for (const selector of clickableSelectors) {
        const buttons = await page.$$(selector);
        for (const btn of buttons) {
          try {
            await btn.click();
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (e) {
            // Ignore click errors
          }
        }
      }

      // Wait after clicking
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract video information from the DOM
      const videos = await page.evaluate(() => {
        const videoData = [];

        // 1. Native HTML5 video elements
        document.querySelectorAll('video').forEach((video, index) => {
          const sources = [];

          // Direct src
          if (video.src) sources.push(video.src);

          // Source elements
          video.querySelectorAll('source').forEach(source => {
            if (source.src) sources.push(source.src);
          });

          // Data attributes (Squarespace often uses these)
          const dataSrc = video.getAttribute('data-src') ||
                          video.getAttribute('data-video-src') ||
                          video.getAttribute('data-original');
          if (dataSrc) sources.push(dataSrc);

          if (sources.length > 0) {
            videoData.push({
              type: 'native',
              sources: [...new Set(sources)],
              poster: video.poster || '',
              width: video.videoWidth || video.width || 0,
              height: video.videoHeight || video.height || 0,
              autoplay: video.autoplay,
              loop: video.loop,
              muted: video.muted,
              className: video.className,
              parentId: video.closest('[data-block-type]')?.getAttribute('data-block-type') || ''
            });
          }
        });

        // 2. Squarespace video blocks
        document.querySelectorAll('[data-block-type="video"], .sqs-video-wrapper, .sqs-native-video').forEach((block) => {
          const videoUrl = block.getAttribute('data-video-url') ||
                          block.getAttribute('data-src') ||
                          block.querySelector('[data-src]')?.getAttribute('data-src');

          if (videoUrl) {
            videoData.push({
              type: 'squarespace-block',
              sources: [videoUrl],
              poster: block.querySelector('img')?.src || '',
              className: block.className
            });
          }
        });

        // 3. Background videos
        document.querySelectorAll('[data-video-loaded], .background-video, .section-background video').forEach((el) => {
          const video = el.tagName === 'VIDEO' ? el : el.querySelector('video');
          if (video && video.src) {
            videoData.push({
              type: 'background',
              sources: [video.src],
              poster: video.poster || '',
              className: el.className
            });
          }
        });

        // 3b. Squarespace native video blocks (more selectors)
        document.querySelectorAll('.sqs-video-container, .sqs-block-video, [data-block-type="52"]').forEach((el) => {
          // Check for data attributes
          const attrs = ['data-video-url', 'data-src', 'data-video', 'data-html', 'data-config'];
          attrs.forEach(attr => {
            const val = el.getAttribute(attr);
            if (val && (val.includes('.mp4') || val.includes('video') || val.includes('vimeo') || val.includes('youtube'))) {
              videoData.push({
                type: 'squarespace-native',
                sources: [val],
                className: el.className,
                blockType: el.getAttribute('data-block-type') || ''
              });
            }
          });

          // Check nested elements
          const nested = el.querySelector('[data-src], [data-video-url], video');
          if (nested) {
            const src = nested.getAttribute('data-src') || nested.getAttribute('data-video-url') || nested.src;
            if (src) {
              videoData.push({
                type: 'squarespace-native-nested',
                sources: [src],
                className: el.className
              });
            }
          }
        });

        // 3c. Any element with video-related data attributes
        document.querySelectorAll('[data-video-url], [data-video-src], [data-video]').forEach((el) => {
          const url = el.getAttribute('data-video-url') || el.getAttribute('data-video-src') || el.getAttribute('data-video');
          if (url) {
            videoData.push({
              type: 'data-attribute',
              sources: [url],
              className: el.className
            });
          }
        });

        // 4. Iframes (YouTube, Vimeo, etc.)
        document.querySelectorAll('iframe').forEach((iframe) => {
          const src = iframe.src || iframe.getAttribute('data-src');
          if (src && (src.includes('youtube') || src.includes('vimeo') || src.includes('wistia'))) {
            videoData.push({
              type: 'embed',
              embedType: src.includes('youtube') ? 'youtube' :
                        src.includes('vimeo') ? 'vimeo' : 'other',
              sources: [src],
              width: iframe.width || 0,
              height: iframe.height || 0
            });
          }
        });

        // 5. JSON-LD data (sometimes contains video info)
        document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
          try {
            const data = JSON.parse(script.textContent);
            if (data.video || data['@type'] === 'VideoObject') {
              const videoObj = data.video || data;
              if (videoObj.contentUrl || videoObj.embedUrl) {
                videoData.push({
                  type: 'json-ld',
                  sources: [videoObj.contentUrl || videoObj.embedUrl],
                  thumbnail: videoObj.thumbnailUrl || '',
                  name: videoObj.name || '',
                  description: videoObj.description || ''
                });
              }
            }
          } catch (e) {}
        });

        return videoData;
      });

      // Add captured network requests
      const networkVideos = [...capturedVideoUrls].map(url => ({
        type: 'network-capture',
        sources: [url]
      }));

      // Combine and dedupe
      const pageVideos = [...videos, ...networkVideos];

      console.log(`   Found ${pageVideos.length} video elements`);

      pageVideos.forEach(video => {
        video.page = pageInfo.name;
        video.pageUrl = pageInfo.url;
        allVideos.push(video);
      });

    } catch (err) {
      console.error(`   Error scraping ${pageInfo.name}: ${err.message}`);
    }
  }

  await browser.close();

  // Deduplicate by source URL
  const uniqueVideos = [];
  const seenSources = new Set();

  allVideos.forEach(video => {
    const key = video.sources.join('|');
    if (!seenSources.has(key)) {
      seenSources.add(key);
      uniqueVideos.push(video);
    }
  });

  console.log(`\n📊 Total unique videos found: ${uniqueVideos.length}`);

  // Download videos
  console.log('\n📥 Downloading videos...\n');

  for (let i = 0; i < uniqueVideos.length; i++) {
    const video = uniqueVideos[i];

    // Skip embeds (YouTube, Vimeo) - we'll keep the embed URL
    if (video.type === 'embed') {
      console.log(`   [${i + 1}/${uniqueVideos.length}] Embed (${video.embedType}): ${video.sources[0].substring(0, 60)}...`);
      video.localPath = null;
      continue;
    }

    // Try to download native videos
    for (const source of video.sources) {
      if (source.match(/\.(mp4|webm|m4v|mov)(\?|$)/i) ||
          source.includes('squarespace') && source.includes('video')) {
        try {
          const filename = `${video.page.toLowerCase().replace(/\s+/g, '-')}_${i}_${sanitizeFilename(source, i)}`;
          const filepath = path.join(OUTPUT_DIR, filename);

          console.log(`   [${i + 1}/${uniqueVideos.length}] Downloading: ${source.substring(0, 60)}...`);

          await downloadVideo(source, filepath);
          video.localPath = filepath;
          break;
        } catch (err) {
          console.error(`   Failed to download: ${err.message}`);
        }
      }
    }
  }

  // Save metadata
  fs.writeFileSync(METADATA_FILE, JSON.stringify(uniqueVideos, null, 2));
  console.log(`\n✅ Video metadata saved to: ${METADATA_FILE}`);

  // Summary
  const downloaded = uniqueVideos.filter(v => v.localPath).length;
  const embeds = uniqueVideos.filter(v => v.type === 'embed').length;

  console.log('\n📊 Summary:');
  console.log(`   Total videos: ${uniqueVideos.length}`);
  console.log(`   Downloaded: ${downloaded}`);
  console.log(`   Embeds (not downloaded): ${embeds}`);

  return uniqueVideos;
}

scrapeVideos().catch(console.error);
