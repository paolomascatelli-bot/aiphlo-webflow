#!/usr/bin/env node
const d = require('../scripts/export/sqsp.json');

function parseCss(cssText) {
  const styles = {};
  cssText.split(';').forEach(pair => {
    const i = pair.indexOf(':');
    if (i > 0) {
      const prop = pair.slice(0, i).trim();
      const val = pair.slice(i + 1).trim();
      if (prop && val) styles[prop] = val;
    }
  });
  return styles;
}

// Find specific elements
const targets = ['.tenebre-nav-btn', '.tenebre-nav-text', '.tenebre-toggle-knob', '.pm-dropdown-arrow'];
const skip = ['none', '0px', 'auto', 'normal', 'visible', 'rgba(0, 0, 0, 0)', '0px none rgb(0, 0, 0)', 'static', 'inline'];

targets.forEach(target => {
  const el = d.styles.find(e => {
    const cn = String(e.className || '');
    return cn.includes(target.slice(1));
  });
  if (el) {
    const css = parseCss(el.cssText);
    console.log('\n' + target + ':');
    const props = ['display', 'position', 'background', 'background-color', 'background-image',
      'border', 'border-radius', 'color', 'font-size', 'font-weight', 'letter-spacing',
      'padding', 'width', 'height', 'top', 'left', 'transform', 'transition', 'box-shadow', 'text-transform'];
    props.forEach(p => {
      const v = css[p];
      if (v && !skip.includes(v)) {
        console.log('  ' + p + ': ' + v);
      }
    });
  }
});
