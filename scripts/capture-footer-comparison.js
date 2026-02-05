import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORIGINAL_URL = 'https://www.paolomascatelli.com';
const LOCAL_URL = 'http://localhost:3001';
const OUTPUT_DIR = path.join(__dirname, '../screenshots');
const VIEWPORT = { width: 1440, height: 900 };

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureFooter(page, url, outputName) {
  console.log(`📸 Capturing footer from: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for page to fully load
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to bottom of page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for any animations/lazy loading
    await new Promise(r => setTimeout(r, 1500));

    // Get footer element or page bottom
    const footerSelector = 'footer, .pm-footer, [class*="footer"]';
    const footer = await page.$(footerSelector);

    if (footer) {
      // Screenshot just the footer
      const footerPath = path.join(OUTPUT_DIR, `${outputName}_footer.png`);
      await footer.screenshot({ path: footerPath });
      console.log(`  ✅ Footer saved: ${outputName}_footer.png`);
    }

    // Also capture full viewport at bottom (for context)
    const fullPath = path.join(OUTPUT_DIR, `${outputName}_BOTTOM_viewport.png`);
    await page.screenshot({ path: fullPath });
    console.log(`  ✅ Bottom viewport saved: ${outputName}_BOTTOM_viewport.png`);

    // Get the dark footer section specifically
    const darkFooterSelector = '.pm-footer-bg, [class*="footer-bg"], .footer-dark';
    const darkFooter = await page.$(darkFooterSelector);

    if (darkFooter) {
      const darkPath = path.join(OUTPUT_DIR, `${outputName}_footer-dark.png`);
      await darkFooter.screenshot({ path: darkPath });
      console.log(`  ✅ Dark footer section saved: ${outputName}_footer-dark.png`);
    }

    return true;
  } catch (error) {
    console.error(`  ❌ Error capturing ${url}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Footer Comparison Screenshot Capture');
  console.log('=' .repeat(50));
  console.log(`Viewport: ${VIEWPORT.width}x${VIEWPORT.height}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Capture original site
  console.log('\n📍 ORIGINAL SITE');
  const originalSuccess = await captureFooter(page, ORIGINAL_URL, 'original_home_BOTTOM');

  // Capture local build
  console.log('\n📍 LOCAL BUILD');
  const localSuccess = await captureFooter(page, LOCAL_URL, 'local_home_BOTTOM');

  await browser.close();

  console.log('\n' + '=' .repeat(50));
  console.log('📊 RESULTS:');
  console.log(`  Original: ${originalSuccess ? '✅ Success' : '❌ Failed'}`);
  console.log(`  Local: ${localSuccess ? '✅ Success' : '❌ Failed'}`);

  if (originalSuccess && localSuccess) {
    console.log('\n📋 Next steps:');
    console.log('  1. Open both screenshots');
    console.log('  2. Overlay at 50% opacity in image editor');
    console.log('  3. Compare positioning and sizing');
    console.log('  4. Document pixel differences');
  }

  // Generate comparison report
  const report = {
    timestamp: new Date().toISOString(),
    viewport: VIEWPORT,
    captures: {
      original: originalSuccess,
      local: localSuccess
    },
    files: {
      original_footer: 'original_home_BOTTOM_footer.png',
      original_viewport: 'original_home_BOTTOM_BOTTOM_viewport.png',
      local_footer: 'local_home_BOTTOM_footer.png',
      local_viewport: 'local_home_BOTTOM_BOTTOM_viewport.png'
    }
  };

  const reportPath = path.join(OUTPUT_DIR, 'footer-comparison-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved: footer-comparison-report.json`);
}

main().catch(console.error);
