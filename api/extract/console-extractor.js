/* =========================================
   AIPHLO CONSOLE EXTRACTOR
   User pastes this into browser console
   while on their Squarespace site
   Returns JSON of all galleries, images, videos
   ========================================= */

(function() {
  'use strict';

  const AIPHLO_EXTRACTOR = {
    version: '1.0.0',
    results: {
      site: window.location.origin,
      extractedAt: new Date().toISOString(),
      pages: []
    },

    // Utility: wait for element or timeout
    waitFor: function(selector, timeout = 5000) {
      return new Promise((resolve) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver(() => {
          const el = document.querySelector(selector);
          if (el) {
            observer.disconnect();
            resolve(el);
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, timeout);
      });
    },

    // Utility: delay
    delay: function(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Extract all images from current view
    extractImages: function(container = document) {
      const images = [];
      const seen = new Set();

      container.querySelectorAll('img').forEach(img => {
        const src = img.src || img.dataset.src || img.dataset.image;
        if (!src || seen.has(src)) return;

        // Skip tiny images, logos, icons
        const isLogo = src.includes('logo') ||
                       src.includes('icon') ||
                       src.includes('favicon') ||
                       img.width < 50 || img.height < 50;

        if (!isLogo) {
          seen.add(src);
          images.push({
            src: src.split('?')[0],
            alt: img.alt || '',
            width: img.naturalWidth || img.width || 0,
            height: img.naturalHeight || img.height || 0,
            classes: img.className,
            parent: img.parentElement?.className || ''
          });
        }
      });

      // Also check background images
      container.querySelectorAll('[style*="background"]').forEach(el => {
        const style = el.style.backgroundImage || getComputedStyle(el).backgroundImage;
        const match = style.match(/url\(["']?([^"')]+)["']?\)/);
        if (match && match[1] && !seen.has(match[1])) {
          seen.add(match[1]);
          images.push({
            src: match[1].split('?')[0],
            alt: '',
            width: el.offsetWidth,
            height: el.offsetHeight,
            type: 'background',
            classes: el.className
          });
        }
      });

      return images;
    },

    // Extract videos
    extractVideos: function(container = document) {
      const videos = [];

      // Native video elements
      container.querySelectorAll('video').forEach(video => {
        const sources = [];
        if (video.src) sources.push(video.src);
        video.querySelectorAll('source').forEach(s => {
          if (s.src) sources.push(s.src);
        });

        if (sources.length) {
          videos.push({
            type: 'native',
            sources: sources,
            poster: video.poster || '',
            autoplay: video.autoplay,
            loop: video.loop
          });
        }
      });

      // Iframes (YouTube, Vimeo)
      container.querySelectorAll('iframe').forEach(iframe => {
        const src = iframe.src || iframe.dataset.src;
        if (src && (src.includes('youtube') || src.includes('vimeo') || src.includes('wistia'))) {
          videos.push({
            type: 'embed',
            platform: src.includes('youtube') ? 'youtube' : src.includes('vimeo') ? 'vimeo' : 'other',
            src: src,
            width: iframe.width,
            height: iframe.height
          });
        }
      });

      // Squarespace video blocks
      container.querySelectorAll('[data-block-type="video"], .sqs-video-wrapper').forEach(block => {
        const videoUrl = block.dataset.videoUrl || block.querySelector('[data-src]')?.dataset.src;
        if (videoUrl) {
          videos.push({
            type: 'squarespace',
            src: videoUrl
          });
        }
      });

      return videos;
    },

    // Find clickable gallery buttons/pills
    findGalleryButtons: function() {
      const buttons = [];
      const selectors = [
        '.pm-pill',
        '.pm-photo-pill',
        '.pm-campaign-btn',
        '[data-target]',
        '[data-category]',
        '[data-gallery]',
        'button[class*="gallery"]',
        'button[class*="filter"]',
        '.sqs-block-button-element'
      ];

      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(btn => {
          const text = btn.innerText?.trim();
          if (text && text.length > 0 && text.length < 100) {
            buttons.push({
              text: text,
              selector: btn.id ? `#${btn.id}` : null,
              target: btn.dataset.target || btn.dataset.category || btn.dataset.gallery || '',
              element: btn
            });
          }
        });
      });

      return buttons;
    },

    // Click through galleries and extract
    extractGalleries: async function() {
      console.log('🔍 Finding gallery buttons...');
      const buttons = this.findGalleryButtons();
      console.log(`   Found ${buttons.length} buttons`);

      const galleries = [];
      const baseImages = this.extractImages();

      for (const btn of buttons) {
        if (!btn.element || !btn.text) continue;

        console.log(`📂 Clicking: ${btn.text}`);

        try {
          // Click the button
          btn.element.click();
          await this.delay(1500);

          // Scroll to load lazy images
          window.scrollTo(0, document.body.scrollHeight);
          await this.delay(500);
          window.scrollTo(0, 0);

          // Extract images that appeared
          const images = this.extractImages();
          const videos = this.extractVideos();

          // Find new images (not in base)
          const baseSrcs = new Set(baseImages.map(i => i.src));
          const newImages = images.filter(i => !baseSrcs.has(i.src));

          galleries.push({
            name: btn.text,
            target: btn.target,
            images: newImages.length > 0 ? newImages : images,
            videos: videos
          });

          console.log(`   ✓ ${newImages.length || images.length} images, ${videos.length} videos`);

          // Click again to close (toggle behavior)
          btn.element.click();
          await this.delay(500);

        } catch (err) {
          console.log(`   ✗ Error: ${err.message}`);
        }
      }

      return galleries;
    },

    // Extract current page
    extractCurrentPage: async function() {
      console.log('\n═══════════════════════════════════════');
      console.log('   AIPHLO CONTENT EXTRACTOR v' + this.version);
      console.log('═══════════════════════════════════════\n');

      const pageData = {
        url: window.location.href,
        path: window.location.pathname,
        title: document.title,
        images: [],
        videos: [],
        galleries: [],
        nav: [],
        text: {}
      };

      // Basic images and videos
      console.log('📸 Extracting images...');
      pageData.images = this.extractImages();
      console.log(`   Found ${pageData.images.length} images`);

      console.log('🎬 Extracting videos...');
      pageData.videos = this.extractVideos();
      console.log(`   Found ${pageData.videos.length} videos`);

      // Gallery extraction (click through)
      console.log('\n🖼️ Extracting galleries...');
      pageData.galleries = await this.extractGalleries();
      console.log(`   Found ${pageData.galleries.length} gallery sections`);

      // Navigation links
      console.log('\n🔗 Extracting navigation...');
      document.querySelectorAll('nav a, header a, [class*="nav"] a').forEach(a => {
        if (a.href && a.innerText?.trim()) {
          pageData.nav.push({
            text: a.innerText.trim(),
            href: a.href,
            path: new URL(a.href).pathname
          });
        }
      });
      console.log(`   Found ${pageData.nav.length} nav links`);

      // Key text content
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      const hero = document.querySelector('[class*="hero"]');
      pageData.text = {
        h1: h1?.innerText?.trim() || '',
        h2: h2?.innerText?.trim() || '',
        heroText: hero?.innerText?.trim().substring(0, 500) || ''
      };

      return pageData;
    },

    // Upload results to AiPhlo API
    upload: async function(apiUrl = 'http://localhost:3001') {
      if (this.results.pages.length === 0) {
        console.log('⚠️ No data to upload. Run extraction first.');
        return null;
      }

      console.log(`\n📤 Uploading to ${apiUrl}/v1/extract/upload...`);

      try {
        const response = await fetch(`${apiUrl}/v1/extract/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.results)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Upload successful!');
        console.log(`   Filename: ${result.filename}`);
        console.log(`   Pages: ${result.pagesReceived}`);
        console.log(`   Images: ${result.totalImages}`);
        console.log(`   Videos: ${result.totalVideos}`);
        return result;

      } catch (err) {
        console.error('❌ Upload failed:', err.message);
        console.log('\n💡 Make sure AiPhlo API is running on localhost:3001');
        console.log('   Or copy the JSON manually from the console output above.');
        return null;
      }
    },

    // Main extraction function
    run: async function(autoUpload = false) {
      try {
        const pageData = await this.extractCurrentPage();
        this.results.pages.push(pageData);

        console.log('\n═══════════════════════════════════════');
        console.log('   EXTRACTION COMPLETE');
        console.log('═══════════════════════════════════════');
        console.log(`\n📊 Summary for ${pageData.path}:`);
        console.log(`   • ${pageData.images.length} images`);
        console.log(`   • ${pageData.videos.length} videos`);
        console.log(`   • ${pageData.galleries.length} galleries`);

        // Output JSON
        console.log('\n📋 Copy the JSON below and send to AiPhlo:\n');
        const json = JSON.stringify(this.results, null, 2);
        console.log(json);

        // Try to copy to clipboard
        try {
          await navigator.clipboard.writeText(json);
          console.log('\n✅ JSON copied to clipboard!');
        } catch (e) {
          console.log('\n⚠️ Could not copy to clipboard. Please copy the JSON above manually.');
        }

        // Auto-upload if requested
        if (autoUpload) {
          await this.upload();
        } else {
          console.log('\n💡 To upload directly: AIPHLO.upload()');
        }

        return this.results;

      } catch (err) {
        console.error('❌ Extraction failed:', err);
        return null;
      }
    }
  };

  // Auto-run
  window.AIPHLO = AIPHLO_EXTRACTOR;
  AIPHLO_EXTRACTOR.run();

})();
