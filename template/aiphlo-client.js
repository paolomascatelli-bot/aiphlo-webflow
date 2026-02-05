/* =========================================
   AIPHLO CLIENT
   Handles routing, API calls, and dynamic rendering
   ========================================= */

(function() {
  'use strict';

  const API_BASE = 'http://localhost:3001';
  const SITE_KEY = document.querySelector('meta[name="aiphlo-key"]')?.content || 'aiphlo-demo';

  // Aspect ratio mappings
  const aspectRatios = {
    'square': '100%',
    'standard-vertical': '150%',
    'four-three': '75%',
    'three-two': '66.67%',
    'sixteen-nine': '56.25%'
  };

  /* =========================================
     ROUTER
     ========================================= */
  function getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html' || path === '/home' || path.includes('accurate.html')) {
      return '/';
    }
    return path;
  }

  /* =========================================
     API
     ========================================= */
  async function fetchPageContent(page) {
    try {
      const response = await fetch(`${API_BASE}/v1/populate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_key: SITE_KEY, page })
      });
      if (!response.ok) throw new Error('API error');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch page content:', error);
      return null;
    }
  }

  /* =========================================
     SECTION RENDERERS
     ========================================= */

  // Hero Section
  function renderHero(block) {
    const { headline, subhead, body, cta } = block.slots;
    let html = `
      <section class="page-hero">
        <div class="hero-content">
          <h1 class="hero-headline">${headline || ''}</h1>
          ${subhead ? `<p class="hero-subhead">${subhead}</p>` : ''}
          ${body ? `<p class="hero-body">${body}</p>` : ''}
          ${cta ? `<a href="${cta.url}" class="hero-cta">${cta.text}</a>` : ''}
        </div>
      </section>
    `;
    return html;
  }

  // Projects Grid
  function renderProjects(block) {
    const { items } = block.slots;
    if (!items || !items.length) return '';

    let html = '<section class="projects-section"><div class="projects-grid">';
    items.forEach(item => {
      html += `
        <a href="${item.url || '#'}" class="project-card">
          <div class="project-image">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
          </div>
          <div class="project-info">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </div>
        </a>
      `;
    });
    html += '</div></section>';
    return html;
  }

  // Gallery Section
  function renderGallery(block) {
    const { categories, images } = block.slots;
    if (!images || !images.length) return '';

    let html = '<section class="gallery-section">';

    // Category tabs if present
    if (categories && categories.length) {
      html += '<div class="gallery-tabs">';
      html += '<button class="gallery-tab active" data-category="all">All</button>';
      categories.forEach(cat => {
        html += `<button class="gallery-tab" data-category="${cat.id}">${cat.name}</button>`;
      });
      html += '</div>';
    }

    // Image grid
    html += '<div class="gallery-grid" style="--grid-columns: 3;">';
    images.forEach(img => {
      html += `
        <div class="gallery-grid-item" data-category="${img.category || 'all'}" style="padding-bottom: 100%;">
          <img src="${img.src}" alt="${img.alt}" loading="lazy">
        </div>
      `;
    });
    html += '</div></section>';

    return html;
  }

  // FAQs Accordion
  function renderFAQs(block) {
    const { items } = block.slots;
    if (!items || !items.length) return '';

    let html = '<section class="faqs-section"><div class="faqs-list">';
    items.forEach((item, i) => {
      html += `
        <div class="faq-item" data-state="closed">
          <button class="faq-question" aria-expanded="false">
            <span class="faq-arrow">▾</span>
            ${item.question}
          </button>
          <div class="faq-answer">
            <p>${item.answer}</p>
          </div>
        </div>
      `;
    });
    html += '</div></section>';
    return html;
  }

  // Contact Section
  function renderContact(block) {
    const { email, locations, social } = block.slots;

    let html = '<section class="contact-section"><div class="contact-grid">';

    // Email
    if (email) {
      html += `
        <div class="contact-block">
          <h3>Email</h3>
          <a href="mailto:${email}" class="contact-email">${email}</a>
        </div>
      `;
    }

    // Locations
    if (locations && locations.length) {
      html += '<div class="contact-block"><h3>Locations</h3><div class="locations-grid">';
      locations.forEach(loc => {
        html += `
          <div class="location-item">
            <strong>${loc.city}</strong>
            <span>${loc.address}</span>
          </div>
        `;
      });
      html += '</div></div>';
    }

    // Social
    if (social && social.length) {
      html += '<div class="contact-block"><h3>Connect</h3><div class="social-links">';
      social.forEach(s => {
        html += `<a href="${s.url}" target="_blank" rel="noopener" class="social-link">${s.platform}</a>`;
      });
      html += '</div></div>';
    }

    html += '</div></section>';
    return html;
  }

  // Tenebre Section (special - uses existing accurate.js logic)
  function renderTenebre(block) {
    // For Tenebre, we return the static HTML structure
    // The interactions are handled by accurate.js
    return `
      <section class="tenebre-section">
        <div id="tenebre-header-logo">
          <img src="${block.slots.logo}" alt="Tenebre">
        </div>

        <div id="tenebre-slideshow-container">
          <div id="tenebre-slideshow-canvas">
            <div id="tenebre-black-overlay"></div>
            <img class="tenebre-slide-layer" id="tenebre-slide-current" src="" alt="Tenebre Collection">
            <img class="tenebre-slide-layer" id="tenebre-slide-next" src="" alt="Tenebre Collection">
          </div>
        </div>

        <div id="tenebre-toggle-container">
          <div class="tenebre-toggle-wrapper">
            <span class="tenebre-toggle-label active" id="tenebre-label-off">OFF</span>
            <div class="tenebre-toggle-switch" id="tenebre-toggle">
              <div class="tenebre-toggle-knob"></div>
            </div>
            <span class="tenebre-toggle-label" id="tenebre-label-on">ON</span>
          </div>
        </div>

        <div id="tenebre-gallery-nav-wrapper">
          <div id="tenebre-gallery-nav">
            ${block.slots.categories.map(cat => `
              <button class="tenebre-nav-btn" data-gallery="${cat.id}" data-section="#${cat.id}">
                <span class="tenebre-nav-text">${cat.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        ${block.slots.categories.map(cat => `
          <div id="${cat.id}" class="tenebre-gallery-section"></div>
        `).join('')}
      </section>
    `;
  }

  /* =========================================
     PAGE RENDERER
     ========================================= */
  function renderPage(content, isHomePage) {
    if (!content || !content.blocks) return;

    const pageContent = document.getElementById('page-content');
    const homeContent = document.getElementById('home-content');

    // Update title
    if (content.title) {
      document.title = content.title;
    }

    // Handle home page vs other pages
    if (isHomePage) {
      // Show home content (Tenebre), hide dynamic content
      if (homeContent) homeContent.style.display = 'block';
      if (pageContent) pageContent.innerHTML = '';
      return; // Use the static HTML for home page
    } else {
      // Hide home content, show dynamic content
      if (homeContent) homeContent.style.display = 'none';
    }

    if (!pageContent) {
      console.warn('No #page-content element found');
      return;
    }

    // Render blocks for non-home pages
    let html = '';
    content.blocks.forEach(block => {
      switch (block.id) {
        case 'hero':
          html += renderHero(block);
          break;
        case 'projects':
          html += renderProjects(block);
          break;
        case 'gallery':
          html += renderGallery(block);
          break;
        case 'faqs':
          html += renderFAQs(block);
          break;
        case 'contact':
          html += renderContact(block);
          break;
        case 'tenebre':
          html += renderTenebre(block);
          break;
        // nav and footer are handled in the HTML template
      }
    });

    pageContent.innerHTML = html;

    // Initialize interactions after render
    initPageInteractions();
  }

  /* =========================================
     PAGE INTERACTIONS
     ========================================= */
  function initPageInteractions() {
    // FAQ accordions
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', function() {
        const item = this.closest('.faq-item');
        const isOpen = item.getAttribute('data-state') === 'open';

        // Close all others
        document.querySelectorAll('.faq-item').forEach(i => {
          i.setAttribute('data-state', 'closed');
          i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Toggle this one
        if (!isOpen) {
          item.setAttribute('data-state', 'open');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Gallery tabs
    document.querySelectorAll('.gallery-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        const category = this.getAttribute('data-category');

        // Update active tab
        document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // Filter images
        document.querySelectorAll('.gallery-grid-item').forEach(item => {
          if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // Re-init Tenebre if present (for home page)
    if (document.getElementById('tenebre-toggle')) {
      initTenebreSystem();
      initTenebreGalleryNav();
    }
  }

  /* =========================================
     TENEBRE SYSTEM (for home page)
     ========================================= */
  const slideshowImages = [
    'http://localhost:3001/assets/images/img_3.png',
    'http://localhost:3001/assets/images/img_4.png',
    'http://localhost:3001/assets/images/img_5.jpg',
    'http://localhost:3001/assets/images/img_6.jpg',
    'http://localhost:3001/assets/images/img_7.jpg',
    'http://localhost:3001/assets/images/img_8.jpg'
  ];

  const galleryLayouts = {
    seating: { columns: 3, aspect: 'square' },
    lighting: { columns: 3, aspect: 'standard-vertical' },
    outdoor: { columns: 4, aspect: 'square' },
    kingbed: { columns: 3, aspect: 'square' },
    guestbed: { columns: 3, aspect: 'four-three' }
  };

  function initTenebreSystem() {
    const container = document.getElementById('tenebre-slideshow-container');
    const toggle = document.getElementById('tenebre-toggle');
    const labelOff = document.getElementById('tenebre-label-off');
    const labelOn = document.getElementById('tenebre-label-on');
    const slideCurrent = document.getElementById('tenebre-slide-current');
    const slideNext = document.getElementById('tenebre-slide-next');

    if (!toggle) return;

    let isOn = false;
    let currentIndex = 0;
    let slideshowInterval = null;

    toggle.addEventListener('click', function() {
      isOn = !isOn;

      if (isOn) {
        toggle.classList.add('active');
        labelOff.classList.remove('active');
        labelOn.classList.add('active');
        container.classList.add('expanded');
        setTimeout(startSlideshow, 1200);
      } else {
        toggle.classList.remove('active');
        labelOff.classList.add('active');
        labelOn.classList.remove('active');
        stopSlideshow();
        container.classList.remove('expanded');
      }
    });

    function startSlideshow() {
      if (!slideCurrent || !slideNext) return;
      slideCurrent.src = slideshowImages[currentIndex];
      slideCurrent.classList.add('tenebre-visible');

      slideshowInterval = setInterval(function() {
        const nextIndex = (currentIndex + 1) % slideshowImages.length;
        slideNext.src = slideshowImages[nextIndex];
        setTimeout(() => slideNext.classList.add('tenebre-visible'), 50);
        setTimeout(() => slideCurrent.classList.remove('tenebre-visible'), 100);
        setTimeout(() => {
          slideCurrent.src = slideshowImages[nextIndex];
          slideCurrent.classList.add('tenebre-visible');
          slideNext.classList.remove('tenebre-visible');
          currentIndex = nextIndex;
        }, 2380);
      }, 4000);
    }

    function stopSlideshow() {
      if (slideshowInterval) clearInterval(slideshowInterval);
      if (slideCurrent) slideCurrent.classList.remove('tenebre-visible');
      if (slideNext) slideNext.classList.remove('tenebre-visible');
    }
  }

  function initTenebreGalleryNav() {
    const buttons = document.querySelectorAll('.tenebre-nav-btn');
    let activeGallery = null;

    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        const gallery = this.getAttribute('data-gallery');
        const sectionId = this.getAttribute('data-section').replace('#', '');
        const section = document.getElementById(sectionId);

        if (activeGallery === gallery) {
          this.classList.remove('tenebre-active');
          activeGallery = null;
          hideAllGalleries();
          return;
        }

        buttons.forEach(b => b.classList.remove('tenebre-active'));
        this.classList.add('tenebre-active');
        activeGallery = gallery;
        showGallery(section, gallery);
      });
    });

    function showGallery(section, galleryId) {
      hideAllGalleries();
      if (!section) return;

      const layout = galleryLayouts[galleryId] || { columns: 3, aspect: 'square' };
      const aspectPadding = aspectRatios[layout.aspect] || '100%';

      // TODO: Load images from API content
      section.innerHTML = `
        <div class="gallery-grid" style="--grid-columns: ${layout.columns};">
          <div class="gallery-grid-item" style="padding-bottom: ${aspectPadding};">
            <img src="http://localhost:3001/assets/images/img_52.png" alt="Gallery" loading="lazy">
          </div>
        </div>
      `;
      section.classList.add('visible');
      setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

    function hideAllGalleries() {
      document.querySelectorAll('.tenebre-gallery-section').forEach(s => {
        s.classList.remove('visible');
        s.innerHTML = '';
      });
    }
  }

  /* =========================================
     FLOATING NAV
     ========================================= */
  function initFloatingNav() {
    const trigger = document.getElementById('pm-nav-trigger');
    const dropdown = document.getElementById('pm-nav-dropdown');
    if (!trigger || !dropdown) return;

    let isLocked = false;
    let hoverTimeout = null;

    trigger.addEventListener('mouseenter', () => {
      if (isLocked) return;
      clearTimeout(hoverTimeout);
      dropdown.classList.add('pm-visible');
    });

    trigger.addEventListener('mouseleave', () => {
      if (isLocked) return;
      hoverTimeout = setTimeout(() => {
        if (!dropdown.matches(':hover')) dropdown.classList.remove('pm-visible');
      }, 300);
    });

    dropdown.addEventListener('mouseleave', () => {
      if (isLocked) return;
      hoverTimeout = setTimeout(() => dropdown.classList.remove('pm-visible'), 300);
    });

    dropdown.addEventListener('mouseenter', () => {
      if (isLocked) return;
      clearTimeout(hoverTimeout);
    });

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isLocked) {
        isLocked = false;
        dropdown.classList.remove('pm-visible');
      } else {
        isLocked = true;
        dropdown.classList.add('pm-visible');
      }
    });

    document.addEventListener('click', (e) => {
      if (isLocked && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
        isLocked = false;
        dropdown.classList.remove('pm-visible');
      }
    });

    // Handle nav link clicks for SPA-style navigation
    dropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');

        // Update URL
        history.pushState({}, '', href);

        // Close dropdown
        isLocked = false;
        dropdown.classList.remove('pm-visible');

        // Load new page content
        await loadPage(href);
      });
    });
  }

  /* =========================================
     PAGE LOADING
     ========================================= */
  async function loadPage(page) {
    const isHomePage = page === '/' || page === '/home';
    const content = await fetchPageContent(page);
    if (content) {
      renderPage(content, isHomePage);
    }
  }

  /* =========================================
     INIT
     ========================================= */
  async function init() {
    initFloatingNav();

    // Load current page content
    const currentPage = getCurrentPage();
    await loadPage(currentPage);

    // Handle browser back/forward
    window.addEventListener('popstate', async () => {
      const page = getCurrentPage();
      await loadPage(page);
    });

    console.log('AiPhlo client initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
