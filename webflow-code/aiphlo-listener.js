/* =========================================
   AIPHLO WEBFLOW LISTENER v1.0

   Embed this in Webflow's custom code (before </body>)
   Connects your Webflow template to the AiPhlo API
   ========================================= */

(function() {
  'use strict';

  // =========================================
  // CONFIG - Update these for your deployment
  // =========================================
  const CONFIG = {
    // API endpoint - change to your deployed URL
    API_URL: 'https://your-api.railway.app', // ← UPDATE THIS

    // Your site key (registered with AiPhlo)
    SITE_KEY: 'aiphlo-demo',

    // Enable debug logging
    DEBUG: false
  };

  // =========================================
  // SLOT MAPPING - Maps data-slot to content
  // =========================================
  const SLOT_TYPES = {
    // Text content
    'text': (el, value) => { el.textContent = value; },
    'html': (el, value) => { el.innerHTML = value; },

    // Images
    'image': (el, value) => {
      if (el.tagName === 'IMG') {
        el.src = value;
      } else {
        el.style.backgroundImage = `url(${value})`;
      }
    },

    // Links
    'link': (el, value) => {
      if (typeof value === 'object') {
        el.href = value.url || '#';
        if (value.text) el.textContent = value.text;
      } else {
        el.href = value;
      }
    },

    // Visibility
    'show': (el, value) => { el.style.display = value ? '' : 'none'; },
    'hide': (el, value) => { el.style.display = value ? 'none' : ''; }
  };

  // =========================================
  // CORE FUNCTIONS
  // =========================================

  function log(...args) {
    if (CONFIG.DEBUG) console.log('[AiPhlo]', ...args);
  }

  function getCurrentPage() {
    let path = window.location.pathname;
    if (path === '/' || path === '/index.html') return '/';
    return path;
  }

  // Fetch content from API
  async function fetchContent(page) {
    log('Fetching content for:', page);

    try {
      const response = await fetch(`${CONFIG.API_URL}/v1/populate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_key: CONFIG.SITE_KEY,
          page: page
        })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      log('Received content:', data);
      return data;

    } catch (error) {
      console.error('[AiPhlo] Failed to fetch content:', error);
      return null;
    }
  }

  // Populate a single slot
  function populateSlot(element, value, type = 'text') {
    const handler = SLOT_TYPES[type] || SLOT_TYPES.text;
    handler(element, value);
    log('Populated slot:', element.dataset.slot, '=', value);
  }

  // Populate all slots from block data
  function populateBlock(blockId, slots) {
    const block = document.querySelector(`[data-block="${blockId}"]`);
    if (!block) {
      log('Block not found:', blockId);
      return;
    }

    // Find all slots within this block
    const slotElements = block.querySelectorAll('[data-slot]');

    slotElements.forEach(el => {
      const slotName = el.dataset.slot;
      const slotType = el.dataset.slotType || 'text';

      // Handle nested slot names (e.g., "cta.text")
      const value = getNestedValue(slots, slotName);

      if (value !== undefined) {
        populateSlot(el, value, slotType);
      }
    });

    log('Populated block:', blockId);
  }

  // Get nested value from object (e.g., "cta.text" → slots.cta.text)
  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // Render repeating items (galleries, menus, etc.)
  function renderRepeater(container, items, template) {
    if (!container || !items || !Array.isArray(items)) return;

    // Clear existing items (except template)
    const templateEl = container.querySelector('[data-template]');
    container.innerHTML = '';
    if (templateEl) container.appendChild(templateEl);

    items.forEach((item, index) => {
      const clone = templateEl ? templateEl.cloneNode(true) : document.createElement('div');
      clone.removeAttribute('data-template');
      clone.style.display = '';

      // Populate slots in the clone
      clone.querySelectorAll('[data-slot]').forEach(el => {
        const slotName = el.dataset.slot;
        const slotType = el.dataset.slotType || 'text';
        const value = getNestedValue(item, slotName);
        if (value !== undefined) {
          populateSlot(el, value, slotType);
        }
      });

      container.appendChild(clone);
    });

    log('Rendered repeater with', items.length, 'items');
  }

  // =========================================
  // BLOCK RENDERERS
  // =========================================

  const BLOCK_RENDERERS = {
    // Navigation block
    nav: (block, slots) => {
      // Logo
      const logo = block.querySelector('[data-slot="logo"]');
      if (logo && slots.logo) {
        if (logo.tagName === 'IMG') logo.src = slots.logo;
        else logo.style.backgroundImage = `url(${slots.logo})`;
      }

      // Menu items
      const menuContainer = block.querySelector('[data-repeater="menu"]');
      if (menuContainer && slots.menu) {
        renderRepeater(menuContainer, slots.menu);
      }
    },

    // Hero block
    hero: (block, slots) => {
      if (slots.background) {
        const bgEl = block.querySelector('[data-slot="background"]') || block;
        bgEl.style.backgroundImage = `url(${slots.background})`;
      }
      populateBlock('hero', slots);
    },

    // Gallery block (Tenebre, Photography, etc.)
    gallery: (block, slots) => {
      const container = block.querySelector('[data-repeater="items"]');
      if (container && slots.items) {
        renderRepeater(container, slots.items);
      }
      populateBlock(block.dataset.block, slots);
    },

    // Generic block (fallback)
    default: (block, slots) => {
      populateBlock(block.dataset.block, slots);
    }
  };

  // =========================================
  // MAIN INIT
  // =========================================

  async function init() {
    log('Initializing AiPhlo Listener');

    const page = getCurrentPage();
    const content = await fetchContent(page);

    if (!content || !content.blocks) {
      console.warn('[AiPhlo] No content received');
      return;
    }

    // Process each block
    content.blocks.forEach(blockData => {
      const block = document.querySelector(`[data-block="${blockData.id}"]`);
      if (!block) {
        log('Block element not found:', blockData.id);
        return;
      }

      // Use specific renderer or fallback to default
      const renderer = BLOCK_RENDERERS[blockData.id] || BLOCK_RENDERERS.default;
      renderer(block, blockData.slots);
    });

    // Dispatch event for custom handlers
    document.dispatchEvent(new CustomEvent('aiphlo:loaded', { detail: content }));

    log('Content population complete');
  }

  // =========================================
  // START
  // =========================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.AiPhlo = {
    config: CONFIG,
    refresh: init,
    fetchContent,
    populateBlock
  };

})();
