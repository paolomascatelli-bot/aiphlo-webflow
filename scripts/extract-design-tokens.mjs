/**
 * AIPHLO DESIGN TOKEN EXTRACTOR
 * ===============================
 * Extracts colors, typography, spacing, and interaction styles from any source site.
 * Run this BEFORE building to ensure accurate style matching.
 *
 * Usage: node extract-design-tokens.mjs <url> [output-file]
 * Example: node extract-design-tokens.mjs https://www.example.com design-tokens.json
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color categorization helpers
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}

function parseRgb(rgbString) {
  const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
  }
  return null;
}

function categorizeColor(rgb) {
  if (!rgb) return 'unknown';
  const { r, g, b } = rgb;

  // Black/Dark
  if (r < 50 && g < 50 && b < 50) return 'dark';
  // White/Light
  if (r > 200 && g > 200 && b > 200) return 'light';
  // Red
  if (r > 150 && g < 100 && b < 100) return 'red';
  // Orange
  if (r > 200 && g > 100 && g < 180 && b < 100) return 'orange';
  // Yellow
  if (r > 200 && g > 200 && b < 100) return 'yellow';
  // Green
  if (g > r && g > b && g > 150) return 'green';
  // Cyan/Teal (high green + blue, low red)
  if (g > 150 && b > 150 && r < 100) return 'cyan';
  // Blue
  if (b > r && b > g && b > 150) return 'blue';
  // Purple
  if (r > 100 && b > 150 && g < 100) return 'purple';
  // Pink
  if (r > 200 && g < 150 && b > 150) return 'pink';
  // Gray
  if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) return 'gray';

  return 'accent';
}

async function extractDesignTokens(url) {
  console.log('🎨 AIPHLO Design Token Extractor');
  console.log('='.repeat(50));
  console.log(`Source: ${url}\n`);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000)); // Wait for animations

    const tokens = await page.evaluate(() => {
      const results = {
        colors: {
          primary: [],
          accent: [],
          background: [],
          text: [],
          border: [],
          all: {}
        },
        typography: {
          fonts: new Set(),
          sizes: {},
          weights: new Set(),
          lineHeights: new Set()
        },
        spacing: {
          margins: new Set(),
          paddings: new Set(),
          gaps: new Set()
        },
        borders: {
          widths: new Set(),
          radii: new Set(),
          styles: new Set()
        },
        shadows: new Set(),
        transitions: new Set(),
        interactions: []
      };

      // Collect all computed styles
      const allElements = document.querySelectorAll('*');
      const colorCounts = {};

      allElements.forEach(el => {
        const style = window.getComputedStyle(el);

        // Colors
        ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor'].forEach(prop => {
          const value = style[prop];
          if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
            colorCounts[value] = (colorCounts[value] || 0) + 1;
          }
        });

        // Typography
        const fontFamily = style.fontFamily;
        const fontSize = style.fontSize;
        const fontWeight = style.fontWeight;
        const lineHeight = style.lineHeight;

        if (fontFamily) results.typography.fonts.add(fontFamily.split(',')[0].trim().replace(/["']/g, ''));
        if (fontSize && fontSize !== '0px') {
          results.typography.sizes[fontSize] = (results.typography.sizes[fontSize] || 0) + 1;
        }
        if (fontWeight) results.typography.weights.add(fontWeight);
        if (lineHeight && lineHeight !== 'normal') results.typography.lineHeights.add(lineHeight);

        // Spacing
        ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'].forEach(prop => {
          const value = style[prop];
          if (value && value !== '0px') results.spacing.margins.add(value);
        });
        ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].forEach(prop => {
          const value = style[prop];
          if (value && value !== '0px') results.spacing.paddings.add(value);
        });
        const gap = style.gap;
        if (gap && gap !== 'normal') results.spacing.gaps.add(gap);

        // Borders
        const borderWidth = style.borderWidth || style.borderTopWidth;
        const borderRadius = style.borderRadius;
        const borderStyle = style.borderStyle || style.borderTopStyle;

        if (borderWidth && borderWidth !== '0px') results.borders.widths.add(borderWidth);
        if (borderRadius && borderRadius !== '0px') results.borders.radii.add(borderRadius);
        if (borderStyle && borderStyle !== 'none') results.borders.styles.add(borderStyle);

        // Shadows
        const boxShadow = style.boxShadow;
        if (boxShadow && boxShadow !== 'none') results.shadows.add(boxShadow);

        // Transitions
        const transition = style.transition;
        if (transition && transition !== 'none' && transition !== 'all 0s ease 0s') {
          results.transitions.add(transition);
        }
      });

      // Process and categorize colors
      results.colors.all = colorCounts;

      // Find interactive elements
      const buttons = document.querySelectorAll('button, a, [role="button"], .btn, [class*="button"]');
      buttons.forEach(btn => {
        const style = window.getComputedStyle(btn);
        results.interactions.push({
          tag: btn.tagName.toLowerCase(),
          text: btn.textContent?.trim().substring(0, 30),
          background: style.backgroundColor,
          color: style.color,
          border: style.border,
          borderRadius: style.borderRadius,
          padding: style.padding
        });
      });

      // Convert Sets to Arrays for JSON
      results.typography.fonts = Array.from(results.typography.fonts);
      results.typography.weights = Array.from(results.typography.weights);
      results.typography.lineHeights = Array.from(results.typography.lineHeights);
      results.spacing.margins = Array.from(results.spacing.margins);
      results.spacing.paddings = Array.from(results.spacing.paddings);
      results.spacing.gaps = Array.from(results.spacing.gaps);
      results.borders.widths = Array.from(results.borders.widths);
      results.borders.radii = Array.from(results.borders.radii);
      results.borders.styles = Array.from(results.borders.styles);
      results.shadows = Array.from(results.shadows);
      results.transitions = Array.from(results.transitions);

      return results;
    });

    // Post-process colors
    const processedColors = {
      primary: [],
      accent: [],
      cyan: [],
      backgrounds: [],
      text: [],
      borders: []
    };

    // Sort colors by frequency
    const sortedColors = Object.entries(tokens.colors.all)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50); // Top 50 colors

    sortedColors.forEach(([color, count]) => {
      const rgb = parseRgb(color);
      if (rgb) {
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        const category = categorizeColor(rgb);
        const colorEntry = { rgb: color, hex, count, category };

        if (category === 'cyan') {
          processedColors.cyan.push(colorEntry);
        } else if (category === 'dark' || category === 'light') {
          processedColors.backgrounds.push(colorEntry);
        } else if (category !== 'unknown') {
          processedColors.accent.push(colorEntry);
        }
      }
    });

    // Build final output
    const output = {
      source: url,
      extractedAt: new Date().toISOString(),
      colors: {
        // Most important: the primary accent colors
        primaryAccent: processedColors.cyan[0] || processedColors.accent[0] || null,
        allCyan: processedColors.cyan,
        allAccent: processedColors.accent,
        backgrounds: processedColors.backgrounds.slice(0, 10),
        // Raw data for reference
        topColors: sortedColors.slice(0, 20).map(([color, count]) => {
          const rgb = parseRgb(color);
          return {
            rgb: color,
            hex: rgb ? rgbToHex(rgb.r, rgb.g, rgb.b) : null,
            count,
            category: rgb ? categorizeColor(rgb) : 'unknown'
          };
        })
      },
      typography: {
        fonts: tokens.typography.fonts,
        commonSizes: Object.entries(tokens.typography.sizes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([size, count]) => ({ size, count })),
        weights: tokens.typography.weights
      },
      spacing: {
        margins: tokens.spacing.margins.slice(0, 15),
        paddings: tokens.spacing.paddings.slice(0, 15),
        gaps: tokens.spacing.gaps
      },
      borders: {
        radii: tokens.borders.radii.slice(0, 10),
        widths: tokens.borders.widths
      },
      shadows: tokens.shadows.slice(0, 5),
      interactions: tokens.interactions.slice(0, 10)
    };

    await browser.close();
    return output;

  } catch (error) {
    await browser.close();
    throw error;
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node extract-design-tokens.mjs <url> [output-file]');
    console.log('Example: node extract-design-tokens.mjs https://www.example.com tokens.json');
    process.exit(1);
  }

  const url = args[0];
  const outputFile = args[1] || `design-tokens-${new Date().toISOString().split('T')[0]}.json`;
  const outputPath = path.join(__dirname, '..', 'extractions', outputFile);

  try {
    const tokens = await extractDesignTokens(url);

    // Ensure extractions directory exists
    const extractDir = path.join(__dirname, '..', 'extractions');
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }

    // Save to file
    fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));

    // Print summary
    console.log('\n📊 EXTRACTION RESULTS');
    console.log('='.repeat(50));

    console.log('\n🎨 PRIMARY ACCENT COLOR:');
    if (tokens.colors.primaryAccent) {
      console.log(`   ${tokens.colors.primaryAccent.hex} (${tokens.colors.primaryAccent.rgb})`);
      console.log(`   Category: ${tokens.colors.primaryAccent.category}`);
    }

    console.log('\n🔵 CYAN/TEAL COLORS FOUND:');
    tokens.colors.allCyan.forEach(c => {
      console.log(`   ${c.hex} - ${c.count} occurrences`);
    });

    console.log('\n🎯 OTHER ACCENT COLORS:');
    tokens.colors.allAccent.slice(0, 5).forEach(c => {
      console.log(`   ${c.hex} (${c.category}) - ${c.count} occurrences`);
    });

    console.log('\n📝 TYPOGRAPHY:');
    console.log(`   Fonts: ${tokens.typography.fonts.join(', ')}`);
    console.log(`   Common sizes: ${tokens.typography.commonSizes.slice(0, 5).map(s => s.size).join(', ')}`);

    console.log('\n📐 BORDER RADII:');
    console.log(`   ${tokens.borders.radii.join(', ')}`);

    console.log('\n✅ Full results saved to:', outputPath);

    // Generate CSS variables file
    const cssVars = generateCssVariables(tokens);
    const cssPath = path.join(__dirname, '..', 'extractions', outputFile.replace('.json', '-variables.css'));
    fs.writeFileSync(cssPath, cssVars);
    console.log('   CSS variables saved to:', cssPath);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function generateCssVariables(tokens) {
  let css = `/*
 * Design Tokens extracted from: ${tokens.source}
 * Generated: ${tokens.extractedAt}
 *
 * Copy these variables to your stylesheet for consistent styling.
 */

:root {
`;

  // Primary accent
  if (tokens.colors.primaryAccent) {
    css += `  /* Primary Accent Color */\n`;
    css += `  --color-primary: ${tokens.colors.primaryAccent.hex};\n`;
    css += `  --color-primary-rgb: ${tokens.colors.primaryAccent.rgb};\n\n`;
  }

  // Cyan colors
  if (tokens.colors.allCyan.length > 0) {
    css += `  /* Cyan/Teal Colors */\n`;
    tokens.colors.allCyan.forEach((c, i) => {
      css += `  --color-cyan-${i + 1}: ${c.hex};\n`;
    });
    css += '\n';
  }

  // Accent colors
  if (tokens.colors.allAccent.length > 0) {
    css += `  /* Accent Colors */\n`;
    tokens.colors.allAccent.slice(0, 5).forEach((c, i) => {
      css += `  --color-accent-${i + 1}: ${c.hex}; /* ${c.category} */\n`;
    });
    css += '\n';
  }

  // Typography
  css += `  /* Typography */\n`;
  tokens.typography.fonts.forEach((font, i) => {
    css += `  --font-family-${i + 1}: "${font}";\n`;
  });
  css += '\n';

  // Border radii
  if (tokens.borders.radii.length > 0) {
    css += `  /* Border Radii */\n`;
    const uniqueRadii = [...new Set(tokens.borders.radii)].slice(0, 5);
    uniqueRadii.forEach((r, i) => {
      css += `  --radius-${i + 1}: ${r};\n`;
    });
  }

  css += `}\n`;
  return css;
}

main();
