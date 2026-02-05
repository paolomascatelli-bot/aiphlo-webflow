#!/usr/bin/env node
/* =========================================
   EXTRACT RELEVANT CSS
   Pulls just the Paolo-specific styles from raw CSS
   ========================================= */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT = path.join(__dirname, 'export/raw-stylesheets.css');
const OUTPUT = path.join(__dirname, 'export/paolo-styles.css');

// Patterns we care about
const PATTERNS = [
  '#pm-nav-trigger',
  '#pm-nav-dropdown',
  '.pm-dropdown-arrow',
  '#tenebre',
  '.tenebre-',
  '.gallery-grid',
  '.pm-footer',
  'pm-logo',
  'pm-active',
  'pm-open'
];

function extractRules(css) {
  const results = [];

  // Find all rule blocks (simplified regex - handles most cases)
  // This matches: selector { declarations }
  const ruleRegex = /([^{}@]+)\{([^{}]+)\}/g;
  let match;

  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const declarations = match[2].trim();

    // Check if selector matches any of our patterns
    const matches = PATTERNS.some(p => selector.toLowerCase().includes(p.toLowerCase()));

    if (matches && declarations.length > 5) {
      results.push({ selector, declarations });
    }
  }

  return results;
}

function extractKeyframes(css) {
  const keyframes = [];
  const keyframeRegex = /@keyframes\s+([^\s{]+)\s*\{([\s\S]*?)\}\s*\}/g;
  let match;

  while ((match = keyframeRegex.exec(css)) !== null) {
    const name = match[1];
    // Only include tenebre/pm related animations
    if (name.toLowerCase().includes('tenebre') ||
        name.toLowerCase().includes('pm') ||
        name.toLowerCase().includes('fade')) {
      keyframes.push(match[0]);
    }
  }

  return keyframes;
}

function formatCSS(rules, keyframes) {
  let output = `/* =========================================
   PAOLO MASCATELLI - EXTRACTED CSS
   Source: Live Squarespace site
   Includes: hover states, transitions, animations
   Generated: ${new Date().toISOString()}
   ========================================= */

`;

  // Group rules by category
  const navTrigger = rules.filter(r => r.selector.includes('pm-nav-trigger'));
  const navDropdown = rules.filter(r => r.selector.includes('pm-nav-dropdown') || r.selector.includes('pm-dropdown'));
  const tenebre = rules.filter(r => r.selector.toLowerCase().includes('tenebre'));
  const gallery = rules.filter(r => r.selector.includes('gallery'));
  const other = rules.filter(r =>
    !r.selector.includes('pm-nav-trigger') &&
    !r.selector.includes('pm-nav-dropdown') &&
    !r.selector.includes('pm-dropdown') &&
    !r.selector.toLowerCase().includes('tenebre') &&
    !r.selector.includes('gallery')
  );

  if (navTrigger.length > 0) {
    output += '/* ========== Nav Trigger ========== */\n\n';
    for (const rule of navTrigger) {
      output += formatRule(rule);
    }
  }

  if (navDropdown.length > 0) {
    output += '/* ========== Nav Dropdown ========== */\n\n';
    for (const rule of navDropdown) {
      output += formatRule(rule);
    }
  }

  if (tenebre.length > 0) {
    output += '/* ========== Tenebre Section ========== */\n\n';
    for (const rule of tenebre) {
      output += formatRule(rule);
    }
  }

  if (gallery.length > 0) {
    output += '/* ========== Gallery ========== */\n\n';
    for (const rule of gallery) {
      output += formatRule(rule);
    }
  }

  if (other.length > 0) {
    output += '/* ========== Other ========== */\n\n';
    for (const rule of other) {
      output += formatRule(rule);
    }
  }

  if (keyframes.length > 0) {
    output += '/* ========== Animations ========== */\n\n';
    for (const kf of keyframes) {
      output += kf + '\n\n';
    }
  }

  return output;
}

function formatRule(rule) {
  // Format declarations nicely
  const declarations = rule.declarations
    .split(';')
    .map(d => d.trim())
    .filter(d => d.length > 0)
    .map(d => `  ${d};`)
    .join('\n');

  return `${rule.selector} {\n${declarations}\n}\n\n`;
}

// Main
const css = fs.readFileSync(INPUT, 'utf8');
console.log(`\n📂 Loaded ${(css.length / 1024).toFixed(1)} KB of raw CSS\n`);

const rules = extractRules(css);
const keyframes = extractKeyframes(css);

console.log(`🎯 Found ${rules.length} relevant rules`);
console.log(`🎬 Found ${keyframes.length} relevant animations`);

const output = formatCSS(rules, keyframes);
fs.writeFileSync(OUTPUT, output);

console.log(`\n✅ Saved: ${OUTPUT}`);
console.log(`   Size: ${(output.length / 1024).toFixed(1)} KB\n`);

// Also show some stats
const hoverRules = rules.filter(r => r.selector.includes(':hover'));
const activeRules = rules.filter(r => r.selector.includes('.pm-active') || r.selector.includes('.tenebre-active'));
const beforeAfter = rules.filter(r => r.selector.includes('::before') || r.selector.includes('::after'));

console.log('📊 Breakdown:');
console.log(`   Hover rules: ${hoverRules.length}`);
console.log(`   Active states: ${activeRules.length}`);
console.log(`   Pseudo-elements: ${beforeAfter.length}`);
console.log('');
