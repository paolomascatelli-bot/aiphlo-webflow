/* =========================================
   AIPHLO UNIFIED SCRIPT
   Single source of truth for all interactions
   ========================================= */

(function() {
  'use strict';

  const API_BASE = 'http://localhost:3001';
  const SITE_KEY = document.querySelector('meta[name="aiphlo-key"]')?.content || 'aiphlo-demo';

  // =========================================
  // DATA: Slideshow Images
  // =========================================
  const slideshowImages = [
    'http://localhost:3001/assets/images/img_3.png',
    'http://localhost:3001/assets/images/img_4.png',
    'http://localhost:3001/assets/images/img_5.jpg',
    'http://localhost:3001/assets/images/img_6.jpg',
    'http://localhost:3001/assets/images/img_7.jpg',
    'http://localhost:3001/assets/images/img_8.jpg',
    'http://localhost:3001/assets/images/img_9.jpg',
    'http://localhost:3001/assets/images/img_10.png',
    'http://localhost:3001/assets/images/img_11.png',
    'http://localhost:3001/assets/images/img_12.png',
    'http://localhost:3001/assets/images/img_13.png',
    'http://localhost:3001/assets/images/img_14.png',
    'http://localhost:3001/assets/images/img_15.png',
    'http://localhost:3001/assets/images/img_16.png',
    'http://localhost:3001/assets/images/img_17.png',
    'http://localhost:3001/assets/images/img_18.png'
  ];

  // =========================================
  // DATA: Aspect Ratios
  // =========================================
  const aspectRatios = {
    'square': '100%',
    'standard-vertical': '150%',
    'four-three': '75%',
    'three-two': '66.67%',
    'sixteen-nine': '56.25%',
    'standard-horizontal': '66.67%'
  };

  // =========================================
  // DATA: Gallery Layouts
  // =========================================
  const galleryLayouts = {
    seating: { columns: 3, aspect: 'square' },
    lighting: { columns: 3, aspect: 'standard-vertical' },
    outdoor: { columns: 4, aspect: 'square' },
    kingbed: { columns: 3, aspect: 'square' },
    guestbed: { columns: 3, aspect: 'four-three' }
  };

  // =========================================
  // DATA: Gallery Images
  // =========================================
  const galleryImages = {
    seating: [
      { src: 'http://localhost:3001/assets/images/img_52.png', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_53.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_54.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_55.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_56.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_57.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_58.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_59.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_60.png', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_61.png', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_62.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_63.png', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_64.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_65.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_66.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_67.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_68.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_69.png', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_70.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_71.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_72.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_73.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_74.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_75.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_76.jpg', alt: 'Seat Styles' },
      { src: 'http://localhost:3001/assets/images/img_77.jpg', alt: 'Seat Styles' }
    ],
    lighting: [
      { src: 'http://localhost:3001/assets/images/img_21.jpg', alt: 'Chandeliers' },
      { src: 'http://localhost:3001/assets/images/img_22.jpg', alt: 'Chandeliers' },
      { src: 'http://localhost:3001/assets/images/img_23.png', alt: 'Chandeliers' },
      { src: 'http://localhost:3001/assets/images/img_24.png', alt: 'Chandeliers' },
      { src: 'http://localhost:3001/assets/images/img_25.png', alt: 'Chandeliers' },
      { src: 'http://localhost:3001/assets/images/img_26.jpg', alt: 'Chandeliers' },
      { src: 'http://localhost:3001/assets/images/img_27.jpg', alt: 'Chandeliers' },
      { src: 'http://localhost:3001/assets/images/img_28.jpg', alt: 'Chandeliers' }
    ],
    outdoor: [
      { src: 'http://localhost:3001/assets/images/img_29.png', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_30.png', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_31.png', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_32.png', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_33.png', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_34.png', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_35.jpg', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_36.jpg', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_37.jpg', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_38.jpg', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_39.jpg', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_40.png', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_41.jpg', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_42.png', alt: 'Patio & Pool' },
      { src: 'http://localhost:3001/assets/images/img_43.png', alt: 'Patio & Pool' }
    ],
    kingbed: [
      { src: 'http://localhost:3001/assets/images/img_3.png', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_4.png', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_5.jpg', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_6.jpg', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_7.jpg', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_8.jpg', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_9.jpg', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_10.png', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_11.png', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_12.png', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_13.png', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_14.png', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_15.png', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_16.png', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_17.png', alt: 'King Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_18.png', alt: 'King Bed/Bath' }
    ],
    guestbed: [
      { src: 'http://localhost:3001/assets/images/img_44.jpg', alt: 'Guest Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_45.png', alt: 'Guest Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_46.jpg', alt: 'Guest Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_47.png', alt: 'Guest Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_48.png', alt: 'Guest Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_49.png', alt: 'Guest Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_50.png', alt: 'Guest Bed/Bath' },
      { src: 'http://localhost:3001/assets/images/img_51.png', alt: 'Guest Bed/Bath' }
    ]
  };

  // =========================================
  // STATE
  // =========================================
  let tenebreInitialized = false;
  let slideshowInterval = null;

  // =========================================
  // UTILITY: Detect Current Page
  // =========================================
  function isHomePage() {
    const path = window.location.pathname;
    return path === '/' || path === '/home' || path === '/index.html' || path.includes('accurate.html');
  }

  function getCurrentPage() {
    const path = window.location.pathname;
    if (isHomePage()) return '/';
    return path;
  }

  // =========================================
  // API: Fetch Page Content
  // =========================================
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

  // =========================================
  // NAV: Floating Navigation
  // =========================================
  function initFloatingNav() {
    const trigger = document.getElementById('pm-nav-trigger');
    const dropdown = document.getElementById('pm-nav-dropdown');
    if (!trigger || !dropdown) return;

    let isLocked = false;
    let hoverTimeout = null;

    trigger.addEventListener('mouseenter', function() {
      if (isLocked) return;
      clearTimeout(hoverTimeout);
      dropdown.classList.add('pm-visible');
    });

    trigger.addEventListener('mouseleave', function() {
      if (isLocked) return;
      hoverTimeout = setTimeout(function() {
        if (!dropdown.matches(':hover')) {
          dropdown.classList.remove('pm-visible');
        }
      }, 300);
    });

    dropdown.addEventListener('mouseleave', function() {
      if (isLocked) return;
      hoverTimeout = setTimeout(function() {
        dropdown.classList.remove('pm-visible');
      }, 300);
    });

    dropdown.addEventListener('mouseenter', function() {
      if (isLocked) return;
      clearTimeout(hoverTimeout);
    });

    trigger.addEventListener('click', function(e) {
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

    document.addEventListener('click', function(e) {
      if (isLocked && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
        isLocked = false;
        dropdown.classList.remove('pm-visible');
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isLocked) {
        isLocked = false;
        dropdown.classList.remove('pm-visible');
      }
    });

    // SPA Navigation - intercept link clicks
    dropdown.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const href = link.getAttribute('href');

        // Close dropdown
        isLocked = false;
        dropdown.classList.remove('pm-visible');

        // Navigate
        navigateToPage(href);
      });
    });
  }

  // =========================================
  // TENEBRE: Toggle Switch
  // =========================================
  function initTenebreToggle() {
    const container = document.getElementById('tenebre-slideshow-container');
    const toggle = document.getElementById('tenebre-toggle');
    const labelOff = document.getElementById('tenebre-label-off');
    const labelOn = document.getElementById('tenebre-label-on');
    const slideCurrent = document.getElementById('tenebre-slide-current');
    const slideNext = document.getElementById('tenebre-slide-next');

    if (!toggle) return;

    let isOn = false;
    let currentIndex = 0;
    const SLIDE_DURATION = 4000;
    const FADE_DURATION = 2180;

    // Preload images
    slideshowImages.forEach(function(src) {
      const img = new Image();
      img.src = src;
    });

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
      if (!slideCurrent || !slideNext || !slideshowImages.length) return;

      slideCurrent.src = slideshowImages[currentIndex];
      slideCurrent.classList.add('tenebre-visible');

      slideshowInterval = setInterval(function() {
        const nextIndex = (currentIndex + 1) % slideshowImages.length;
        slideNext.src = slideshowImages[nextIndex];

        setTimeout(function() {
          slideNext.classList.add('tenebre-visible');
        }, 50);

        setTimeout(function() {
          slideCurrent.classList.remove('tenebre-visible');
        }, 100);

        setTimeout(function() {
          slideCurrent.src = slideshowImages[nextIndex];
          slideCurrent.classList.add('tenebre-visible');
          slideNext.classList.remove('tenebre-visible');
          currentIndex = nextIndex;
        }, FADE_DURATION + 200);
      }, SLIDE_DURATION);
    }

    function stopSlideshow() {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
      }
      if (slideCurrent) slideCurrent.classList.remove('tenebre-visible');
      if (slideNext) slideNext.classList.remove('tenebre-visible');
      currentIndex = 0;
    }
  }

  // =========================================
  // TENEBRE: Gallery Navigation
  // =========================================
  function initTenebreGalleryNav() {
    const buttons = document.querySelectorAll('.tenebre-nav-btn');
    if (!buttons.length) return;

    let activeGallery = null;

    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const gallery = this.getAttribute('data-gallery');
        const sectionId = this.getAttribute('data-section').replace('#', '');
        const section = document.getElementById(sectionId);

        if (activeGallery === gallery) {
          this.classList.remove('tenebre-active');
          activeGallery = null;
          hideAllTenebreGalleries();
          return;
        }

        buttons.forEach(function(b) {
          b.classList.remove('tenebre-active');
        });

        this.classList.add('tenebre-active');
        activeGallery = gallery;
        showTenebreGallery(section, gallery);
      });
    });
  }

  function showTenebreGallery(section, galleryId) {
    hideAllTenebreGalleries();

    if (!section || !galleryImages[galleryId]) return;

    const layout = galleryLayouts[galleryId] || { columns: 3, aspect: 'square' };
    const aspectPadding = aspectRatios[layout.aspect] || '100%';

    let html = '<div class="gallery-grid" style="--grid-columns: ' + layout.columns + ';">';
    galleryImages[galleryId].forEach(function(img) {
      html += '<div class="gallery-grid-item" style="padding-bottom: ' + aspectPadding + ';">';
      html += '<img src="' + img.src + '" alt="' + img.alt + '" loading="lazy">';
      html += '</div>';
    });
    html += '</div>';

    section.innerHTML = html;
    section.classList.add('visible');

    setTimeout(function() {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function hideAllTenebreGalleries() {
    document.querySelectorAll('.tenebre-gallery-section').forEach(function(s) {
      s.classList.remove('visible');
      s.innerHTML = '';
    });
  }

  // =========================================
  // RENDERERS: Section Types
  // =========================================
  function renderHero(block) {
    const { headline, subhead, body, cta } = block.slots;
    return `
      <section class="page-hero">
        <div class="hero-content">
          <h1 class="hero-headline">${headline || ''}</h1>
          ${subhead ? `<p class="hero-subhead">${subhead}</p>` : ''}
          ${body ? `<p class="hero-body">${body}</p>` : ''}
          ${cta ? `<a href="${cta.url}" class="hero-cta">${cta.text}</a>` : ''}
        </div>
      </section>
    `;
  }

  function renderProjects(block) {
    const { items } = block.slots;
    if (!items || !items.length) return '';

    let html = '<section class="projects-section"><div class="projects-grid">';
    items.forEach(function(item) {
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

  function renderGallery(block) {
    const { categories, images } = block.slots;
    if (!images || !images.length) return '';

    let html = '<section class="gallery-section">';

    if (categories && categories.length) {
      html += '<div class="gallery-tabs">';
      html += '<button class="gallery-tab active" data-category="all">All</button>';
      categories.forEach(function(cat) {
        html += `<button class="gallery-tab" data-category="${cat.id}">${cat.name}</button>`;
      });
      html += '</div>';
    }

    html += '<div class="gallery-grid" style="--grid-columns: 3;">';
    images.forEach(function(img) {
      html += `
        <div class="gallery-grid-item" data-category="${img.category || 'all'}" style="padding-bottom: 100%;">
          <img src="${img.src}" alt="${img.alt || ''}" loading="lazy">
        </div>
      `;
    });
    html += '</div></section>';

    return html;
  }

  function renderFAQs(block) {
    const { items } = block.slots;
    if (!items || !items.length) return '';

    let html = '<section class="faqs-section"><div class="faqs-list">';
    items.forEach(function(item) {
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

  function renderContact(block) {
    const { email, locations, social } = block.slots;

    let html = '<section class="contact-section"><div class="contact-grid">';

    if (email) {
      html += `
        <div class="contact-block">
          <h3>Email</h3>
          <a href="mailto:${email}" class="contact-email">${email}</a>
        </div>
      `;
    }

    if (locations && locations.length) {
      html += '<div class="contact-block"><h3>Locations</h3><div class="locations-grid">';
      locations.forEach(function(loc) {
        html += `
          <div class="location-item">
            <strong>${loc.city}</strong>
            <span>${loc.address || ''}</span>
          </div>
        `;
      });
      html += '</div></div>';
    }

    if (social && social.length) {
      html += '<div class="contact-block"><h3>Connect</h3><div class="social-links">';
      social.forEach(function(s) {
        html += `<a href="${s.url}" target="_blank" rel="noopener" class="social-link">${s.platform}</a>`;
      });
      html += '</div></div>';
    }

    html += '</div></section>';
    return html;
  }

  // =========================================
  // RENDERER: Photo Nav (Photography Page)
  // =========================================
  function renderPhotoNav(block) {
    const { categories, galleries } = block.slots;
    if (!categories || !categories.length) return '';

    // Store galleries data for later use
    window.photoGalleries = galleries || {};

    let html = '<div id="pm-photo-nav-v3">';
    categories.forEach(function(cat, index) {
      html += `<button class="pm-photo-pill${index === 0 ? ' pm-active' : ''}" data-category="${cat.id}">${cat.name}</button>`;
    });
    html += '</div>';

    // Add gallery container
    html += '<div id="pm-photo-gallery"><div class="gallery-grid" style="--grid-columns: 3;"></div></div>';

    return html;
  }

  // =========================================
  // RENDERER: Campaigns (Social Media Page)
  // =========================================
  function renderCampaigns(block) {
    const { items } = block.slots;
    if (!items || !items.length) return '';

    // Store campaign data
    window.campaignData = items;

    let html = '<div id="pm-campaign-nav">';
    items.forEach(function(campaign) {
      html += `
        <button class="pm-campaign-btn" data-campaign="${campaign.id || campaign.name.toLowerCase()}">
          <div class="pm-campaign-icon">
            <img src="${campaign.icon || campaign.image}" alt="${campaign.name}">
          </div>
          <div class="pm-campaign-info">
            <span class="pm-campaign-name">${campaign.name}</span>
            <span class="pm-campaign-desc">${campaign.description || ''}</span>
          </div>
          <span class="pm-campaign-arrow">▾</span>
        </button>
      `;
    });
    html += '</div>';

    // Add campaign gallery container
    html += '<div id="pm-campaign-gallery"><div class="gallery-grid" style="--grid-columns: 3;"></div></div>';

    return html;
  }

  // =========================================
  // INTERACTIONS: Dynamic Page Elements
  // =========================================
  function initDynamicPageInteractions() {
    // FAQ accordions
    document.querySelectorAll('.faq-question').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const item = this.closest('.faq-item');
        const isOpen = item.getAttribute('data-state') === 'open';

        document.querySelectorAll('.faq-item').forEach(function(i) {
          i.setAttribute('data-state', 'closed');
          i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.setAttribute('data-state', 'open');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Gallery tabs
    document.querySelectorAll('.gallery-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        const category = this.getAttribute('data-category');

        document.querySelectorAll('.gallery-tab').forEach(function(t) {
          t.classList.remove('active');
        });
        this.classList.add('active');

        document.querySelectorAll('.gallery-grid-item').forEach(function(item) {
          if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // Photo Nav (Photography page)
    initPhotoNav();

    // Campaign Nav (Social Media page)
    initCampaignNav();
  }

  // =========================================
  // INTERACTIONS: Photo Nav Pills
  // =========================================
  function initPhotoNav() {
    const pills = document.querySelectorAll('.pm-photo-pill');
    const galleryContainer = document.querySelector('#pm-photo-gallery .gallery-grid');
    if (!pills.length || !galleryContainer) return;

    let activeCategory = null;

    pills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        const category = this.getAttribute('data-category');

        // Toggle if same category
        if (activeCategory === category) {
          this.classList.remove('pm-active');
          activeCategory = null;
          galleryContainer.innerHTML = '';
          return;
        }

        // Update active state
        pills.forEach(function(p) {
          p.classList.remove('pm-active');
        });
        this.classList.add('pm-active');
        activeCategory = category;

        // Show gallery images for this category
        showPhotoGallery(category, galleryContainer);
      });
    });

    // Show first category by default
    const firstPill = pills[0];
    if (firstPill) {
      const firstCategory = firstPill.getAttribute('data-category');
      showPhotoGallery(firstCategory, galleryContainer);
    }
  }

  function showPhotoGallery(category, container) {
    const galleries = window.photoGalleries || {};
    const images = galleries[category] || [];

    if (!images.length) {
      container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 40px;">No images in this category</p>';
      return;
    }

    let html = '';
    images.forEach(function(img) {
      html += `
        <div class="gallery-grid-item" style="padding-bottom: 100%;">
          <img src="${img.src}" alt="${img.alt || ''}" loading="lazy">
        </div>
      `;
    });
    container.innerHTML = html;

    // Scroll to gallery
    setTimeout(function() {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // =========================================
  // INTERACTIONS: Campaign Nav Buttons
  // =========================================
  function initCampaignNav() {
    const buttons = document.querySelectorAll('.pm-campaign-btn');
    const galleryContainer = document.querySelector('#pm-campaign-gallery .gallery-grid');
    if (!buttons.length || !galleryContainer) return;

    let activeCampaign = null;

    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const campaignId = this.getAttribute('data-campaign');

        // Toggle if same campaign
        if (activeCampaign === campaignId) {
          this.classList.remove('pm-active', 'pm-open');
          activeCampaign = null;
          galleryContainer.innerHTML = '';
          return;
        }

        // Update active state
        buttons.forEach(function(b) {
          b.classList.remove('pm-active', 'pm-open');
        });
        this.classList.add('pm-active', 'pm-open');
        activeCampaign = campaignId;

        // Show campaign gallery
        showCampaignGallery(campaignId, galleryContainer);
      });
    });
  }

  function showCampaignGallery(campaignId, container) {
    const campaigns = window.campaignData || [];
    const campaign = campaigns.find(function(c) {
      return (c.id || c.name.toLowerCase()) === campaignId;
    });

    if (!campaign || !campaign.images || !campaign.images.length) {
      container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 40px;">No images for this campaign</p>';
      return;
    }

    let html = '';
    campaign.images.forEach(function(img) {
      const imgSrc = typeof img === 'string' ? img : img.src;
      const imgAlt = typeof img === 'string' ? '' : (img.alt || '');
      html += `
        <div class="gallery-grid-item" style="padding-bottom: 100%;">
          <img src="${imgSrc}" alt="${imgAlt}" loading="lazy">
        </div>
      `;
    });
    container.innerHTML = html;

    // Scroll to gallery
    setTimeout(function() {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // =========================================
  // PAGE: Switch Between Pages
  // =========================================
  function showHomePage() {
    const homeContent = document.getElementById('home-content');
    const pageContent = document.getElementById('page-content');

    // Use hidden attribute (cleaner than display)
    if (homeContent) homeContent.hidden = false;
    if (pageContent) {
      pageContent.hidden = true;
      pageContent.innerHTML = '';
    }

    // Initialize Tenebre if not already done
    if (!tenebreInitialized) {
      initTenebreToggle();
      initTenebreGalleryNav();
      tenebreInitialized = true;
    }

    document.title = 'Paolo Mascatelli';
    console.log('[AiPhlo] Showing home page');
  }

  async function showDynamicPage(page) {
    const homeContent = document.getElementById('home-content');
    const pageContent = document.getElementById('page-content');

    // Hide home content, show page content
    if (homeContent) homeContent.hidden = true;
    if (pageContent) pageContent.hidden = false;

    // Fetch and render page content
    const content = await fetchPageContent(page);
    if (!content || !content.blocks) {
      if (pageContent) pageContent.innerHTML = '<section class="page-hero"><div class="hero-content"><h1 class="hero-headline">Page Not Found</h1></div></section>';
      return;
    }

    // Update title
    if (content.title) {
      document.title = content.title + ' | Paolo Mascatelli';
    }

    // Render blocks
    let html = '';
    content.blocks.forEach(function(block) {
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
        case 'photo-nav':
          html += renderPhotoNav(block);
          break;
        case 'campaigns':
          html += renderCampaigns(block);
          break;
        case 'faqs':
          html += renderFAQs(block);
          break;
        case 'contact':
          html += renderContact(block);
          break;
      }
    });

    if (pageContent) {
      pageContent.innerHTML = html;
      initDynamicPageInteractions();
    }

    console.log('[AiPhlo] Showing dynamic page:', page);
  }

  // =========================================
  // NAVIGATION: SPA Router
  // =========================================
  async function navigateToPage(href) {
    // Normalize href
    let page = href;
    if (page === '/home' || page === '/index.html') page = '/';

    // Update URL without reload
    history.pushState({}, '', href);

    // Show appropriate content
    if (page === '/' || page === '/home') {
      showHomePage();
    } else {
      await showDynamicPage(page);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  // =========================================
  // INIT: Entry Point
  // =========================================
  async function init() {
    console.log('[AiPhlo] Initializing unified script');

    // Always init nav (works on all pages)
    initFloatingNav();

    // Determine current page and show appropriate content
    if (isHomePage()) {
      showHomePage();
    } else {
      await showDynamicPage(getCurrentPage());
    }

    // Handle browser back/forward
    window.addEventListener('popstate', async function() {
      if (isHomePage()) {
        showHomePage();
      } else {
        await showDynamicPage(getCurrentPage());
      }
    });

    console.log('[AiPhlo] Unified script ready');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
