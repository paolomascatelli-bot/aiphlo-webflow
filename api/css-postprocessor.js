#!/usr/bin/env node
/* =========================================
   CSS POST-PROCESSOR
   Converts computed styles to production-ready CSS
   - Fixes centering patterns
   - Adds responsive breakpoints
   - Adds transitions and interactions
   ========================================= */

const fs = require('fs');
const path = require('path');

// Patterns to detect centering (half viewport width + half element transform)
function detectCentering(rule) {
  // Pattern: left: ~960px (half of 1920), transform: translateX(-half_width)
  const leftMatch = rule.match(/left:\s*(\d+(?:\.\d+)?)px/);
  const transformMatch = rule.match(/transform:\s*translateX\((-?\d+(?:\.\d+)?)px\)/);

  if (leftMatch && transformMatch) {
    const left = parseFloat(leftMatch[1]);
    const translateX = parseFloat(transformMatch[1]);

    // If left is around half viewport (960 ± tolerance) and translate is negative half of element width
    if (left > 800 && left < 1100 && translateX < 0) {
      return {
        isCentered: true,
        origLeft: left,
        origTranslate: translateX
      };
    }
  }
  return { isCentered: false };
}

function fixCenteringInRule(rule) {
  const centering = detectCentering(rule);
  if (centering.isCentered) {
    // Replace left: 960px with left: 50%
    rule = rule.replace(/left:\s*\d+(?:\.\d+)?px/, 'left: 50%');
    // Replace translateX(-Xpx) with translateX(-50%)
    rule = rule.replace(/transform:\s*translateX\(-?\d+(?:\.\d+)?px\)/, 'transform: translateX(-50%)');
    // Remove right: Xpx and bottom: Xpx (computed values that don't make sense with centering)
    rule = rule.replace(/\s*right:\s*\d+(?:\.\d+)?px;\n?/g, '\n');
    rule = rule.replace(/\s*bottom:\s*\d+(?:\.\d+)?px;\n?/g, '\n');
  }
  return rule;
}

function cleanUpRule(rule) {
  // Remove display: block (it's often default)
  // Keep display: flex, display: grid, display: none
  // rule = rule.replace(/\s*display:\s*block;\n?/g, '\n');

  // Remove computed font colors that inherit (rgba(0, 0, 0, 0.94))
  // rule = rule.replace(/\s*color:\s*rgba\(0,\s*0,\s*0,\s*0\.94\);\n?/g, '\n');

  // Collapse individual border-radius to shorthand where all same
  const radiusMatch = rule.match(/border-top-left-radius:\s*(\d+(?:\.\d+)?(?:px|%)?);[\s\S]*?border-top-right-radius:\s*(\d+(?:\.\d+)?(?:px|%)?);[\s\S]*?border-bottom-left-radius:\s*(\d+(?:\.\d+)?(?:px|%)?);[\s\S]*?border-bottom-right-radius:\s*(\d+(?:\.\d+)?(?:px|%)?)/);
  if (radiusMatch) {
    const [, tl, tr, bl, br] = radiusMatch;
    if (tl === tr && tr === bl && bl === br) {
      rule = rule.replace(/border-top-left-radius:\s*\d+(?:\.\d+)?(?:px|%)?;[\s\S]*?border-top-right-radius:\s*\d+(?:\.\d+)?(?:px|%)?;[\s\S]*?border-bottom-left-radius:\s*\d+(?:\.\d+)?(?:px|%)?;[\s\S]*?border-bottom-right-radius:\s*\d+(?:\.\d+)?(?:px|%)?;?/, `border-radius: ${tl};`);
    }
  }

  // Clean up empty lines
  rule = rule.replace(/\n{3,}/g, '\n\n');

  return rule;
}

function addInteractionStates(css) {
  // Add hover/active states for interactive elements
  const additions = `
/* =========================================
   INTERACTION STATES
   Hover, focus, and active states
   ========================================= */

#pm-nav-trigger:hover {
  background: rgba(55, 58, 62, 0.98);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
}

#pm-nav-dropdown.pm-visible {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

#pm-nav-dropdown a:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgb(212, 175, 55);
}

.tenebre-toggle-switch:hover {
  background-color: rgba(212, 175, 55, 0.3);
  border-color: rgba(212, 175, 55, 0.5);
  transform: scale(1.05);
}

.tenebre-toggle-switch.active {
  background-color: rgba(111, 184, 134, 0.3);
  border-color: rgba(111, 184, 134, 0.6);
  box-shadow: rgba(0, 0, 0, 0.3) 0px 2px 8px 0px inset, 0 0 16px rgba(111, 184, 134, 0.3);
}

.tenebre-toggle-switch.active .tenebre-toggle-knob {
  left: 35px;
  background-image: linear-gradient(135deg, rgb(111, 184, 134), rgb(80, 160, 104));
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 6px 0px, rgba(111, 184, 134, 0.6) 0px 0px 12px 0px;
}

.tenebre-toggle-label.active {
  opacity: 1;
  color: rgb(111, 184, 134);
}

.tenebre-nav-btn:hover {
  transform: scale(1.05);
}

.tenebre-nav-btn:hover .tenebre-nav-text {
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
}

.tenebre-nav-btn.tenebre-active .tenebre-nav-text {
  color: rgb(111, 184, 134);
  text-shadow: 0 0 14px rgba(111, 184, 134, 0.4);
}

.tenebre-slide-layer.tenebre-visible {
  opacity: 1;
}

#tenebre-slideshow-container.expanded {
  height: calc(85vh - 8px);
  min-height: 500px;
}

.tenebre-gallery-section.visible {
  display: block;
  opacity: 1;
}

.gallery-grid img:hover {
  transform: scale(1.02);
  opacity: 0.95;
}
`;

  return css + additions;
}

function addTransitions(css) {
  // Add transition properties where appropriate
  const transitionAdditions = `
/* =========================================
   TRANSITIONS
   Smooth animation timing
   ========================================= */

#pm-nav-trigger {
  transition: all 0.3s ease;
}

#pm-nav-dropdown {
  transition: all 0.3s ease;
}

#pm-nav-dropdown a {
  transition: all 0.25s ease;
}

.tenebre-toggle-switch {
  transition: all 0.5s ease;
}

.tenebre-toggle-knob {
  transition: all 0.5s ease;
}

.tenebre-toggle-label {
  transition: all 0.4s ease;
}

.tenebre-nav-btn {
  transition: all 0.5s ease;
}

.tenebre-nav-text {
  transition: all 0.4s ease;
}

.tenebre-slide-layer {
  transition: opacity 2.18s ease;
}

#tenebre-slideshow-container {
  transition: height 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

#tenebre-black-overlay {
  transition: opacity 1s ease;
}

.tenebre-gallery-section {
  transition: opacity 2s ease;
}

.gallery-grid img {
  transition: transform 0.4s ease, opacity 0.3s ease;
}
`;

  return css + transitionAdditions;
}

function addResponsiveStyles(css) {
  const responsive = `
/* =========================================
   RESPONSIVE BREAKPOINTS
   Mobile-first responsive styles
   ========================================= */

@media (max-width: 767px) {
  #pm-nav-trigger {
    top: 12px;
    padding: 8px 14px;
  }

  #pm-nav-trigger img {
    width: 18px;
    height: 18px;
  }

  #pm-nav-trigger span {
    font-size: 10px;
  }

  #pm-nav-dropdown {
    top: 52px;
    min-width: 160px;
  }

  #tenebre-header-logo {
    padding: 30px 0 15px 0;
    height: auto;
  }

  #tenebre-header-logo img {
    width: 110px;
  }

  #tenebre-slideshow-container.expanded {
    height: 70vh;
    min-height: 400px;
  }

  .tenebre-toggle-switch {
    width: 56px;
    height: 28px;
  }

  .tenebre-toggle-knob {
    width: 22px;
    height: 22px;
  }

  .tenebre-toggle-switch.active .tenebre-toggle-knob {
    left: 30px;
  }

  #tenebre-gallery-nav {
    gap: 20px;
  }

  .tenebre-nav-btn {
    padding: 12px 16px;
  }

  .tenebre-nav-text {
    font-size: 11px;
    letter-spacing: 1.5px;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
`;

  return css + responsive;
}

function addBaseStyles() {
  return `/* =========================================
   PRODUCTION CSS
   Auto-generated from Squarespace computed styles
   Post-processed for production use
   ========================================= */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background: #000000;
  color: #ffffff;
  font-family: "Nunito Sans", sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  min-height: 100vh;
}

/* ========== Critical Overrides ========== */
/* Styles that may not have been captured in computed styles */

#pm-nav-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(45, 48, 52, 0.95);
  border-radius: 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

#pm-nav-trigger img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

#pm-nav-trigger span {
  color: #ffffff;
  font-family: "Nunito Sans", sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

#pm-nav-dropdown {
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background-color: rgba(45, 48, 52, 0.98);
  border-radius: 12px;
  min-width: 160px;
}

#pm-nav-dropdown a {
  display: block;
  padding: 10px 28px;
  color: #ffffff;
  text-decoration: none;
  font-family: "Nunito Sans", sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-align: center;
}

.pm-dropdown-arrow {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid rgba(45, 48, 52, 0.98);
}

.tenebre-nav-btn {
  background: transparent;
  border: none;
}

.tenebre-nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1.5px solid transparent;
  border-radius: 6px;
  transition: all 0.5s ease;
  opacity: 0;
  transform: scale(0.95);
}

.tenebre-nav-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 8px;
  width: 7px;
  height: 7px;
  background: transparent;
  border-radius: 50%;
  transform: translateY(-50%) scale(0);
  transition: all 0.5s ease;
}

.tenebre-nav-btn:hover::after {
  background: rgb(212, 175, 55);
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.8);
  transform: translateY(-50%) scale(1.3);
}

.tenebre-nav-btn.tenebre-active::before {
  border-color: rgba(111, 184, 134, 0.8);
  opacity: 1;
  transform: scale(1);
  box-shadow: 0 0 20px rgba(111, 184, 134, 0.5);
}

.tenebre-nav-btn.tenebre-active::after {
  background: rgb(111, 184, 134);
  box-shadow: 0 0 16px rgba(111, 184, 134, 1);
  transform: translateY(-50%) scale(1.4);
}

.tenebre-toggle-switch {
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.tenebre-slide-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 100%;
  max-width: 100%;
  height: auto;
  width: auto;
  object-fit: contain;
  opacity: 0;
}

.tenebre-gallery-section {
  width: 100%;
  min-height: 60vh;
  opacity: 0;
  display: none;
  background: #000000;
}

.gallery-grid {
  --grid-columns: 3;
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: 8px;
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.gallery-grid-item {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #0a0a0a;
}

.gallery-grid img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
}

.pm-footer {
  background: #000000;
  padding: 60px 20px 40px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pm-footer-film,
.pm-footer-notice,
.pm-footer-rights {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.pm-footer-locations {
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 0.3em;
  color: rgb(212, 175, 55);
  margin-top: 30px;
}

`;
}

function processCss(inputPath, outputPath) {
  console.log('\n📂 Loading:', inputPath);

  let css = fs.readFileSync(inputPath, 'utf8');

  // Remove the auto-generated header (we'll add our own)
  css = css.replace(/\/\* =+[\s\S]*?=+ \*\/\n\n/, '');
  css = css.replace(/\/\* =+ ID Selectors =+ \*\/\n\n/, '');
  css = css.replace(/\/\* =+ Class Selectors =+ \*\/\n\n/, '');

  // Process each rule
  const rules = css.split('\n\n').filter(r => r.trim());
  const processedRules = rules.map(rule => {
    // Remove inline comments like /* div#pm-nav-trigger */
    rule = rule.replace(/\/\*[^*]+\*\/\n?/g, '');

    rule = fixCenteringInRule(rule);
    rule = cleanUpRule(rule);
    return rule;
  }).filter(r => r.trim());

  // Rebuild CSS
  let output = addBaseStyles();
  output += '/* ========== Generated Styles ========== */\n\n';
  output += processedRules.join('\n\n');
  output = addTransitions(output);
  output = addInteractionStates(output);
  output = addResponsiveStyles(output);

  fs.writeFileSync(outputPath, output);
  console.log(`✅ Production CSS: ${outputPath}`);
  console.log(`   Size: ${(output.length / 1024).toFixed(1)} KB`);

  return output;
}

function run() {
  const inputPath = global.process.argv[2] || path.join(__dirname, '../template/generated-core.css');
  const outputPath = global.process.argv[3] || path.join(__dirname, '../template/production.css');

  return processCss(inputPath, outputPath);
}

module.exports = { processCss, detectCentering, fixCenteringInRule, cleanUpRule };

if (require.main === module) {
  run();
}
