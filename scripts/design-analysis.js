
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.paolomascatelli.com';
const OUTPUT_DIR = path.join(__dirname, '../assets/design-analysis');
const ANALYSIS_FILE = path.join(OUTPUT_DIR, 'design-system.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function analyzeDesign() {
  console.log('🎨 Starting comprehensive design analysis...');
  console.log('   Focus: Navigation systems, motion, colors, AiPhlo branding\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const designSystem = {
    brand: 'AiPhlo',
    colors: {},
    typography: {},
    spacing: {},
    navigation: {
      siteWide: {},
      pageSpecific: []
    },
    animations: [],
    interactions: [],
    layout: {},
    components: []
  };

  console.log('📱 Analyzing Home page for design system...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Extract comprehensive design tokens
  const designTokens = await page.evaluate(() => {
    const result = {
      colors: {
        brand: {},
        ui: {},
        extracted: []
      },
      typography: {
        fonts: [],
        headings: [],
        body: {}
      },
      spacing: {},
      layout: {
        maxWidth: '',
        columns: {},
        gaps: []
      }
    };

    // Extract all colors from CSS
    const allElements = document.querySelectorAll('*');
    const colorSet = new Set();

    allElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const bgColor = styles.backgroundColor;
      const color = styles.color;
      const borderColor = styles.borderColor;

      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') colorSet.add(bgColor);
      if (color && color !== 'rgba(0, 0, 0, 0)') colorSet.add(color);
      if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') colorSet.add(borderColor);
    });

    result.colors.extracted = Array.from(colorSet);

    // Identify brand colors (gold and green from analysis)
    result.colors.brand = {
      gold: '#d4af37',
      green: '#6fb886',
      black: '#000000',
      white: '#ffffff'
    };

    // Extract typography
    const fontFamilies = new Set();
    allElements.forEach(el => {
      const font = window.getComputedStyle(el).fontFamily;
      if (font) fontFamilies.add(font);
    });
    result.typography.fonts = Array.from(fontFamilies);

    // Analyze headings
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
      const heading = document.querySelector(tag);
      if (heading) {
        const styles = window.getComputedStyle(heading);
        result.typography.headings.push({
          tag: tag,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          lineHeight: styles.lineHeight,
          letterSpacing: styles.letterSpacing,
          textTransform: styles.textTransform,
          fontFamily: styles.fontFamily
        });
      }
    });

    // Analyze body text
    const body = document.querySelector('body');
    if (body) {
      const styles = window.getComputedStyle(body);
      result.typography.body = {
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
        fontFamily: styles.fontFamily,
        color: styles.color
      };
    }

    // Extract layout constraints
    const container = document.querySelector('.container, [class*="container"], main');
    if (container) {
      const styles = window.getComputedStyle(container);
      result.layout.maxWidth = styles.maxWidth;
      result.layout.padding = styles.padding;
    }

    // Extract grid information
    const grids = document.querySelectorAll('[style*="grid"], [class*="grid"]');
    grids.forEach((grid, i) => {
      const styles = window.getComputedStyle(grid);
      if (styles.display === 'grid') {
        result.layout.columns[`grid-${i}`] = {
          columns: styles.gridTemplateColumns,
          rows: styles.gridTemplateRows,
          gap: styles.gap || styles.gridGap
        };
      }
    });

    return result;
  });

  designSystem.colors = designTokens.colors;
  designSystem.typography = designTokens.typography;
  designSystem.spacing = designTokens.spacing;
  designSystem.layout = designTokens.layout;

  console.log('   ✓ Extracted design tokens');
  console.log(`      - ${designTokens.colors.extracted.length} unique colors`);
  console.log(`      - ${designTokens.typography.fonts.length} font families`);
  console.log(`      - ${designTokens.typography.headings.length} heading styles`);

  // Analyze site-wide navigation
  console.log('\n🧭 Analyzing site-wide navigation system...');
  const navAnalysis = await page.evaluate(() => {
    const nav = {
      structure: {},
      items: [],
      mobileMenu: {},
      animations: [],
      customClasses: []
    };

    // Find main navigation
    const navElement = document.querySelector('nav, [class*="nav"], [class*="menu"], header nav');
    if (navElement) {
      const styles = window.getComputedStyle(navElement);
      nav.structure = {
        position: styles.position,
        display: styles.display,
        backgroundColor: styles.backgroundColor,
        height: styles.height,
        padding: styles.padding,
        zIndex: styles.zIndex,
        className: navElement.className,
        id: navElement.id
      };

      // Extract nav items
      const links = navElement.querySelectorAll('a');
      links.forEach(link => {
        const linkStyles = window.getComputedStyle(link);
        nav.items.push({
          text: link.innerText?.trim(),
          href: link.href,
          fontSize: linkStyles.fontSize,
          fontWeight: linkStyles.fontWeight,
          letterSpacing: linkStyles.letterSpacing,
          textTransform: linkStyles.textTransform,
          color: linkStyles.color,
          className: link.className
        });
      });

      // Check for custom classes indicating special behavior
      const classNames = navElement.className.split(' ');
      nav.customClasses = classNames.filter(c =>
        c.includes('phantom') ||
        c.includes('custom') ||
        c.includes('special')
      );
    }

    // Find mobile menu/hamburger
    const hamburger = document.querySelector('[class*="hamburger"], [class*="mobile-menu"], .burger');
    if (hamburger) {
      nav.mobileMenu = {
        className: hamburger.className,
        exists: true
      };
    }

    // Look for nav-related animations in CSS
    const styleSheets = Array.from(document.styleSheets);
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule.cssText && (
            rule.cssText.includes('transition') ||
            rule.cssText.includes('animation') ||
            rule.cssText.includes('transform')
          ) && (
            rule.selectorText?.includes('nav') ||
            rule.selectorText?.includes('menu')
          )) {
            nav.animations.push({
              selector: rule.selectorText,
              cssText: rule.cssText
            });
          }
        });
      } catch (e) {
        // Cross-origin stylesheets will throw errors, skip them
      }
    });

    return nav;
  });

  designSystem.navigation.siteWide = navAnalysis;
  console.log('   ✓ Analyzed site-wide navigation');
  console.log(`      - ${navAnalysis.items.length} navigation items`);
  console.log(`      - Custom classes: ${navAnalysis.customClasses.join(', ') || 'none'}`);
  console.log(`      - Mobile menu: ${navAnalysis.mobileMenu.exists ? 'Yes' : 'No'}`);

  // Analyze page-specific navigation on each page
  console.log('\n📄 Analyzing page-specific navigation systems...');
  const pagesToAnalyze = [
    { name: 'Projects', url: `${BASE_URL}/projects` },
    { name: 'Photography', url: `${BASE_URL}/photography` }
  ];

  for (const pageInfo of pagesToAnalyze) {
    console.log(`   Analyzing: ${pageInfo.name}`);
    await page.goto(pageInfo.url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const pageNav = await page.evaluate(() => {
      const result = {
        filters: [],
        toggles: [],
        tabs: [],
        customControls: []
      };

      // Find filter buttons
      const filterButtons = document.querySelectorAll(
        'button[class*="filter"], [class*="category"], [data-filter], [class*="tab"]'
      );
      filterButtons.forEach(btn => {
        const styles = window.getComputedStyle(btn);
        result.filters.push({
          text: btn.innerText?.trim(),
          className: btn.className,
          id: btn.id,
          styles: {
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            border: styles.border,
            padding: styles.padding,
            borderRadius: styles.borderRadius
          },
          dataAttributes: Array.from(btn.attributes)
            .filter(attr => attr.name.startsWith('data-'))
            .map(attr => ({ name: attr.name, value: attr.value }))
        });
      });

      // Find toggle switches
      const toggles = document.querySelectorAll('[class*="toggle"], .switch, input[type="checkbox"][class*="toggle"]');
      toggles.forEach(toggle => {
        const styles = window.getComputedStyle(toggle);
        const label = toggle.labels?.[0] || toggle.closest('label') || toggle.parentElement;
        const labelText = label?.innerText?.trim() || '';

        result.toggles.push({
          label: labelText,
          className: toggle.className,
          id: toggle.id,
          type: toggle.tagName.toLowerCase(),
          styles: {
            width: styles.width,
            height: styles.height,
            backgroundColor: styles.backgroundColor,
            borderRadius: styles.borderRadius
          }
        });
      });

      // Look for custom controls (Tenebre, etc.)
      const customControls = document.querySelectorAll('[class*="tenebre"], [class*="mode"], [class*="custom-control"]');
      customControls.forEach(control => {
        result.customControls.push({
          className: control.className,
          id: control.id,
          innerHTML: control.innerHTML.substring(0, 200) // First 200 chars
        });
      });

      return result;
    });

    designSystem.navigation.pageSpecific.push({
      page: pageInfo.name,
      ...pageNav
    });

    console.log(`      - ${pageNav.filters.length} filter buttons`);
    console.log(`      - ${pageNav.toggles.length} toggle controls`);
    console.log(`      - ${pageNav.customControls.length} custom controls`);
  }

  // Analyze animations and interactions
  console.log('\n✨ Analyzing animations and interactions...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 2000));

  const animations = await page.evaluate(() => {
    const result = {
      cssAnimations: [],
      transitions: [],
      transforms: [],
      scrollEffects: []
    };

    // Extract CSS animations and transitions from computed styles
    const animatedElements = document.querySelectorAll('*');
    const seenAnimations = new Set();

    animatedElements.forEach(el => {
      const styles = window.getComputedStyle(el);

      // CSS Animations
      if (styles.animationName && styles.animationName !== 'none') {
        const key = `${styles.animationName}-${styles.animationDuration}`;
        if (!seenAnimations.has(key)) {
          seenAnimations.add(key);
          result.cssAnimations.push({
            name: styles.animationName,
            duration: styles.animationDuration,
            timingFunction: styles.animationTimingFunction,
            delay: styles.animationDelay,
            iterationCount: styles.animationIterationCount,
            direction: styles.animationDirection,
            element: el.className || el.tagName.toLowerCase()
          });
        }
      }

      // Transitions
      if (styles.transition && styles.transition !== 'none' && styles.transition !== 'all 0s ease 0s') {
        result.transitions.push({
          transition: styles.transition,
          element: el.className || el.tagName.toLowerCase()
        });
      }
    });

    // Look for scroll-triggered elements
    const scrollElements = document.querySelectorAll('[data-scroll], [class*="fade"], [class*="reveal"]');
    scrollElements.forEach(el => {
      result.scrollEffects.push({
        className: el.className,
        dataAttributes: Array.from(el.attributes)
          .filter(attr => attr.name.startsWith('data-'))
          .map(attr => ({ name: attr.name, value: attr.value }))
      });
    });

    return result;
  });

  designSystem.animations = animations.cssAnimations;
  designSystem.interactions = [
    ...animations.transitions,
    ...animations.scrollEffects
  ];

  console.log('   ✓ Analyzed animations');
  console.log(`      - ${animations.cssAnimations.length} CSS animations`);
  console.log(`      - ${animations.transitions.length} transitions`);
  console.log(`      - ${animations.scrollEffects.length} scroll effects`);

  // Take screenshots of key pages
  console.log('\n📸 Taking screenshots for reference...');
  const screenshotPages = [
    { name: 'home', url: BASE_URL },
    { name: 'projects', url: `${BASE_URL}/projects` },
    { name: 'photography', url: `${BASE_URL}/photography` }
  ];

  for (const pageInfo of screenshotPages) {
    await page.goto(pageInfo.url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Desktop screenshot
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${pageInfo.name}-desktop.png`),
      fullPage: true
    });
    console.log(`   ✓ ${pageInfo.name}-desktop.png`);

    // Mobile screenshot
    await page.setViewport({ width: 375, height: 812 });
    await page.goto(pageInfo.url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${pageInfo.name}-mobile.png`),
      fullPage: true
    });
    console.log(`   ✓ ${pageInfo.name}-mobile.png`);

    // Reset viewport
    await page.setViewport({ width: 1920, height: 1080 });
  }

  await browser.close();

  // Save design system
  fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(designSystem, null, 2));

  console.log('\n✨ Design analysis complete!');
  console.log(`   📁 Saved to: ${ANALYSIS_FILE}`);
  console.log(`   📸 Screenshots saved to: ${OUTPUT_DIR}/`);

  // Generate markdown report
  generateMarkdownReport(designSystem);
}

function generateMarkdownReport(designSystem) {
  let report = `# AiPhlo Design System Analysis\n\n`;
  report += `**Brand:** ${designSystem.brand}\n`;
  report += `**Purpose:** Webflow marketplace template (luxury, customizable)\n\n`;
  report += `---\n\n`;

  // Colors
  report += `## Brand Colors\n\n`;
  report += `- **Gold:** ${designSystem.colors.brand.gold}\n`;
  report += `- **Green:** ${designSystem.colors.brand.green}\n`;
  report += `- **Black:** ${designSystem.colors.brand.black}\n`;
  report += `- **White:** ${designSystem.colors.brand.white}\n\n`;

  // Typography
  report += `## Typography\n\n`;
  report += `### Fonts\n`;
  designSystem.typography.fonts.forEach(font => {
    report += `- ${font}\n`;
  });
  report += `\n### Headings\n`;
  designSystem.typography.headings.forEach(h => {
    report += `\n**${h.tag.toUpperCase()}**\n`;
    report += `- Font Size: ${h.fontSize}\n`;
    report += `- Font Weight: ${h.fontWeight}\n`;
    report += `- Line Height: ${h.lineHeight}\n`;
    report += `- Letter Spacing: ${h.letterSpacing}\n`;
    report += `- Text Transform: ${h.textTransform}\n`;
  });

  // Navigation
  report += `\n## Site-Wide Navigation\n\n`;
  report += `**Structure:**\n`;
  report += `- Position: ${designSystem.navigation.siteWide.structure?.position}\n`;
  report += `- Background: ${designSystem.navigation.siteWide.structure?.backgroundColor}\n`;
  report += `- Height: ${designSystem.navigation.siteWide.structure?.height}\n`;
  report += `- Z-Index: ${designSystem.navigation.siteWide.structure?.zIndex}\n\n`;

  report += `**Navigation Items (${designSystem.navigation.siteWide.items?.length}):**\n`;
  designSystem.navigation.siteWide.items?.forEach(item => {
    report += `- ${item.text}\n`;
    report += `  - Font Size: ${item.fontSize}\n`;
    report += `  - Letter Spacing: ${item.letterSpacing}\n`;
    report += `  - Text Transform: ${item.textTransform}\n`;
  });

  // Page-specific navigation
  report += `\n## Page-Specific Navigation\n\n`;
  designSystem.navigation.pageSpecific.forEach(pageNav => {
    report += `### ${pageNav.page}\n\n`;
    if (pageNav.filters.length > 0) {
      report += `**Filters (${pageNav.filters.length}):**\n`;
      pageNav.filters.forEach(filter => {
        report += `- ${filter.text}\n`;
      });
      report += `\n`;
    }
    if (pageNav.toggles.length > 0) {
      report += `**Toggles (${pageNav.toggles.length}):**\n`;
      pageNav.toggles.forEach(toggle => {
        report += `- ${toggle.label} (${toggle.type})\n`;
      });
      report += `\n`;
    }
    if (pageNav.customControls.length > 0) {
      report += `**Custom Controls:** ${pageNav.customControls.length} found\n\n`;
    }
  });

  // Animations
  report += `## Animations\n\n`;
  report += `**Total CSS Animations:** ${designSystem.animations.length}\n\n`;
  if (designSystem.animations.length > 0) {
    report += `**Key Animations:**\n`;
    designSystem.animations.slice(0, 10).forEach(anim => {
      report += `- ${anim.name} (${anim.duration}, ${anim.timingFunction})\n`;
    });
  }

  report += `\n**Total Transitions:** ${designSystem.interactions.length}\n\n`;

  // Layout
  report += `## Layout System\n\n`;
  report += `- Max Width: ${designSystem.layout.maxWidth || 'Full width'}\n`;
  report += `- Padding: ${designSystem.layout.padding || 'N/A'}\n\n`;

  const reportFile = path.join(OUTPUT_DIR, 'DESIGN_SYSTEM.md');
  fs.writeFileSync(reportFile, report);
  console.log(`   📄 Design report: ${reportFile}`);
}

// Run analysis
analyzeDesign().catch(console.error);
