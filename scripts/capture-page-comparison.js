import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - can be passed via command line args
const args = process.argv.slice(2);
const PAGE_PATH = args[0] || '/aiphlo';  // Default to /aiphlo
const PAGE_NAME = args[1] || PAGE_PATH.replace('/', '') || 'home';

const ORIGINAL_URL = `https://www.paolomascatelli.com${PAGE_PATH}`;
const LOCAL_URL = `http://localhost:3001${PAGE_PATH}`;
const OUTPUT_DIR = path.join(__dirname, '../screenshots');
const VIEWPORT = { width: 1440, height: 900 };

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function capturePage(page, url, outputPrefix, position = 'FULL') {
  console.log(`📸 Capturing from: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for page to fully load
    await new Promise(r => setTimeout(r, 2000));

    // Capture full page screenshot
    const fullPath = path.join(OUTPUT_DIR, `${outputPrefix}_${position}_full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`  ✅ Full page saved: ${outputPrefix}_${position}_full.png`);

    // Capture viewport (above the fold)
    const viewportPath = path.join(OUTPUT_DIR, `${outputPrefix}_TOP_viewport.png`);
    await page.screenshot({ path: viewportPath });
    console.log(`  ✅ Top viewport saved: ${outputPrefix}_TOP_viewport.png`);

    // Scroll to bottom and capture
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(r => setTimeout(r, 1500));

    const bottomPath = path.join(OUTPUT_DIR, `${outputPrefix}_BOTTOM_viewport.png`);
    await page.screenshot({ path: bottomPath });
    console.log(`  ✅ Bottom viewport saved: ${outputPrefix}_BOTTOM_viewport.png`);

    // Get page title and content info
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent || 'No H1',
        bodyClass: document.body.className,
        mainContent: document.querySelector('main, #page-content, .main-content')?.innerHTML?.slice(0, 500) || 'No main content found'
      };
    });

    return { success: true, pageInfo };
  } catch (error) {
    console.error(`  ❌ Error capturing ${url}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Page Comparison Screenshot Capture');
  console.log('=' .repeat(50));
  console.log(`Page: ${PAGE_PATH}`);
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
  console.log(`URL: ${ORIGINAL_URL}`);
  const originalResult = await capturePage(page, ORIGINAL_URL, `original_${PAGE_NAME}`);

  // Capture local build
  console.log('\n📍 LOCAL BUILD');
  console.log(`URL: ${LOCAL_URL}`);
  const localResult = await capturePage(page, LOCAL_URL, `local_${PAGE_NAME}`);

  await browser.close();

  console.log('\n' + '=' .repeat(50));
  console.log('📊 RESULTS:');
  console.log(`  Original: ${originalResult.success ? '✅ Success' : '❌ Failed'}`);
  if (originalResult.pageInfo) {
    console.log(`    Title: ${originalResult.pageInfo.title}`);
    console.log(`    H1: ${originalResult.pageInfo.h1}`);
  }
  console.log(`  Local: ${localResult.success ? '✅ Success' : '❌ Failed'}`);
  if (localResult.pageInfo) {
    console.log(`    Title: ${localResult.pageInfo.title}`);
    console.log(`    H1: ${localResult.pageInfo.h1}`);
  }

  // Generate comparison report
  const report = {
    timestamp: new Date().toISOString(),
    page: PAGE_PATH,
    viewport: VIEWPORT,
    original: {
      url: ORIGINAL_URL,
      ...originalResult
    },
    local: {
      url: LOCAL_URL,
      ...localResult
    },
    files: {
      original_full: `original_${PAGE_NAME}_FULL_full.png`,
      original_top: `original_${PAGE_NAME}_TOP_viewport.png`,
      original_bottom: `original_${PAGE_NAME}_BOTTOM_viewport.png`,
      local_full: `local_${PAGE_NAME}_FULL_full.png`,
      local_top: `local_${PAGE_NAME}_TOP_viewport.png`,
      local_bottom: `local_${PAGE_NAME}_BOTTOM_viewport.png`
    }
  };

  const reportPath = path.join(OUTPUT_DIR, `${PAGE_NAME}-comparison-report.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved: ${PAGE_NAME}-comparison-report.json`);

  if (!localResult.success && originalResult.success) {
    console.log('\n⚠️  LOCAL PAGE NOT FOUND OR ERROR');
    console.log('   The original page exists but local version may not be built yet.');
    console.log('   Check if this page needs to be added to the routing/content.');
  }
}

main().catch(console.error);
