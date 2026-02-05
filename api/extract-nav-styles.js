#!/usr/bin/env node
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./scripts/export/sqsp.json', 'utf8'));

// Find nav trigger and dropdown elements
const navElements = data.styles.filter(el =>
  el.id === 'pm-nav-trigger' ||
  el.id === 'pm-nav-dropdown' ||
  String(el.className || '').includes('pm-dropdown')
);

console.log('Found', navElements.length, 'nav elements\n');

navElements.forEach(el => {
  console.log('='.repeat(50));
  console.log('Element:', el.id || el.className);
  console.log('Tag:', el.tag);
  console.log('Rect:', JSON.stringify(el.rect));
  console.log('\nKey Styles:');

  const css = el.cssText;
  const props = [
    'position', 'top', 'left', 'right', 'bottom',
    'background-color', 'background', 'color',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-radius', 'box-shadow',
    'font-size', 'font-weight', 'letter-spacing',
    'z-index', 'width', 'height', 'opacity', 'visibility',
    'display', 'flex-direction', 'align-items', 'gap'
  ];

  props.forEach(prop => {
    const regex = new RegExp(prop + ':\\s*([^;]+)');
    const match = css.match(regex);
    if (match) {
      const val = match[1].trim();
      const skip = ['none', 'normal', 'auto', '0px', 'visible', 'row', 'nowrap'];
      if (val && !skip.includes(val)) {
        console.log('  ' + prop + ': ' + val);
      }
    }
  });
  console.log('');
});
