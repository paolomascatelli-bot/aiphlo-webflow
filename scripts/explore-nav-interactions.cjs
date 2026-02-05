/* Explore Nav Interactions on Social Media Page
   - Site-wide floating nav
   - Campaign card nav (floating above galleries)
   - Interactions, lift, hover states
*/
const puppeteer = require('puppeteer');
const path = require('path');

async function explore() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('\n=== NAV INTERACTIONS EXPLORATION ===\n');

  await page.goto('http://localhost:3001/socialmedia', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Analyze Site-Wide Nav
  console.log('1. SITE-WIDE FLOATING NAV:');
  const siteNavInfo = await page.evaluate(() => {
    const trigger = document.getElementById('pm-nav-trigger');
    const dropdown = document.getElementById('pm-nav-dropdown');

    if (!trigger) return { found: false };

    const triggerStyles = window.getComputedStyle(trigger);
    const triggerRect = trigger.getBoundingClientRect();

    return {
      found: true,
      position: triggerStyles.position,
      zIndex: triggerStyles.zIndex,
      top: triggerRect.top,
      hasDropdown: dropdown !== null,
      boxShadow: triggerStyles.boxShadow,
      background: triggerStyles.background
    };
  });
  console.log('   Trigger:', siteNavInfo);

  // Screenshot initial state
  await page.screenshot({
    path: path.join(__dirname, '../screenshots/nav-1-initial.png'),
    fullPage: false
  });
  console.log('   📷 Screenshot: nav-1-initial.png');

  // 2. Hover on site-wide nav
  console.log('\n2. HOVER ON SITE-WIDE NAV:');
  const navTrigger = await page.$('#pm-nav-trigger');
  if (navTrigger) {
    await navTrigger.hover();
    await new Promise(r => setTimeout(r, 500));

    const hoverState = await page.evaluate(() => {
      const dropdown = document.getElementById('pm-nav-dropdown');
      if (!dropdown) return { visible: false };

      const styles = window.getComputedStyle(dropdown);
      return {
        visible: dropdown.classList.contains('pm-visible'),
        opacity: styles.opacity,
        transform: styles.transform,
        display: styles.display
      };
    });
    console.log('   Dropdown state:', hoverState);

    await page.screenshot({
      path: path.join(__dirname, '../screenshots/nav-2-hover.png'),
      fullPage: false
    });
    console.log('   📷 Screenshot: nav-2-hover.png');
  }

  // 3. Click to lock nav open
  console.log('\n3. CLICK TO LOCK NAV:');
  if (navTrigger) {
    await navTrigger.click();
    await new Promise(r => setTimeout(r, 500));

    const clickState = await page.evaluate(() => {
      const dropdown = document.getElementById('pm-nav-dropdown');
      return {
        visible: dropdown ? dropdown.classList.contains('pm-visible') : false
      };
    });
    console.log('   Nav locked open:', clickState.visible);

    await page.screenshot({
      path: path.join(__dirname, '../screenshots/nav-3-clicked.png'),
      fullPage: false
    });
    console.log('   📷 Screenshot: nav-3-clicked.png');
  }

  // Click elsewhere to close
  await page.click('body');
  await new Promise(r => setTimeout(r, 300));

  // 4. Analyze Campaign Cards (floating nav)
  console.log('\n4. CAMPAIGN CARDS (FLOATING NAV):');
  const cardInfo = await page.evaluate(() => {
    const cards = document.querySelectorAll('.pm-campaign-card');
    const container = document.querySelector('.pm-campaign-cards');

    if (!container) return { found: false };

    const containerStyles = window.getComputedStyle(container);
    const containerRect = container.getBoundingClientRect();

    const cardData = [];
    cards.forEach(card => {
      const styles = window.getComputedStyle(card);
      cardData.push({
        name: card.querySelector('.pm-campaign-card-name')?.textContent,
        boxShadow: styles.boxShadow,
        transform: styles.transform,
        background: styles.backgroundColor
      });
    });

    return {
      found: true,
      cardCount: cards.length,
      containerPosition: containerStyles.position,
      containerTop: containerRect.top,
      cards: cardData
    };
  });
  console.log('   Container:', cardInfo);

  // 5. Hover on campaign card
  console.log('\n5. HOVER ON VYAYAMA CARD:');
  const vyayamaCard = await page.$('.pm-campaign-card[data-target="vyayama"]');
  if (vyayamaCard) {
    await vyayamaCard.hover();
    await new Promise(r => setTimeout(r, 300));

    const hoverCard = await page.evaluate(() => {
      const card = document.querySelector('.pm-campaign-card[data-target="vyayama"]');
      if (!card) return null;
      const styles = window.getComputedStyle(card);
      return {
        transform: styles.transform,
        boxShadow: styles.boxShadow,
        background: styles.backgroundColor
      };
    });
    console.log('   Hover state:', hoverCard);

    await page.screenshot({
      path: path.join(__dirname, '../screenshots/nav-4-card-hover.png'),
      fullPage: false
    });
    console.log('   📷 Screenshot: nav-4-card-hover.png');
  }

  // 6. Click Vyayama - open gallery
  console.log('\n6. CLICK VYAYAMA - GALLERY INTERACTION:');
  if (vyayamaCard) {
    await vyayamaCard.click();
    await new Promise(r => setTimeout(r, 800));

    const galleryState = await page.evaluate(() => {
      const gallery = document.getElementById('vyayama');
      const card = document.querySelector('.pm-campaign-card[data-target="vyayama"]');

      return {
        galleryVisible: gallery ? gallery.style.display !== 'none' : false,
        cardActive: card ? card.classList.contains('active') : false,
        galleryTop: gallery ? gallery.getBoundingClientRect().top : null
      };
    });
    console.log('   Gallery state:', galleryState);

    await page.screenshot({
      path: path.join(__dirname, '../screenshots/nav-5-gallery-open.png'),
      fullPage: false
    });
    console.log('   📷 Screenshot: nav-5-gallery-open.png');
  }

  // 7. Scroll and check nav behavior
  console.log('\n7. SCROLL BEHAVIOR:');
  await page.evaluate(() => window.scrollTo(0, 300));
  await new Promise(r => setTimeout(r, 500));

  const scrollState = await page.evaluate(() => {
    const cards = document.querySelector('.pm-campaign-cards');
    const siteNav = document.getElementById('pm-nav-trigger');

    return {
      cardsPosition: cards ? window.getComputedStyle(cards).position : null,
      cardsTop: cards ? cards.getBoundingClientRect().top : null,
      siteNavTop: siteNav ? siteNav.getBoundingClientRect().top : null,
      scrollY: window.scrollY
    };
  });
  console.log('   After scroll (300px):', scrollState);

  await page.screenshot({
    path: path.join(__dirname, '../screenshots/nav-6-scrolled.png'),
    fullPage: false
  });
  console.log('   📷 Screenshot: nav-6-scrolled.png');

  // 8. Switch to Victoria
  console.log('\n8. SWITCH TO VICTORIA:');
  const victoriaCard = await page.$('.pm-campaign-card[data-target="victoria"]');
  if (victoriaCard) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 300));
    await victoriaCard.click();
    await new Promise(r => setTimeout(r, 800));

    const victoriaState = await page.evaluate(() => {
      const vyayamaGallery = document.getElementById('vyayama');
      const victoriaGallery = document.getElementById('victoria');
      const vyayamaCard = document.querySelector('.pm-campaign-card[data-target="vyayama"]');
      const victoriaCard = document.querySelector('.pm-campaign-card[data-target="victoria"]');

      return {
        vyayamaVisible: vyayamaGallery ? vyayamaGallery.style.display !== 'none' : false,
        victoriaVisible: victoriaGallery ? victoriaGallery.style.display !== 'none' : false,
        vyayamaActive: vyayamaCard ? vyayamaCard.classList.contains('active') : false,
        victoriaActive: victoriaCard ? victoriaCard.classList.contains('active') : false
      };
    });
    console.log('   State after switch:', victoriaState);

    await page.screenshot({
      path: path.join(__dirname, '../screenshots/nav-7-victoria-open.png'),
      fullPage: false
    });
    console.log('   📷 Screenshot: nav-7-victoria-open.png');
  }

  console.log('\n=== EXPLORATION COMPLETE ===');
  console.log('Screenshots saved to /screenshots folder');
  console.log('\nKey findings will be displayed above.\n');

  // Keep browser open for manual inspection
  console.log('Browser left open for inspection. Close manually when done.');
  // await browser.close();
}

explore().catch(console.error);
