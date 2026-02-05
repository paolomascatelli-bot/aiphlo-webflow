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
    const { background, headline, subhead, body, cta } = block.slots;
    const bgStyle = background ? `background-image: url('${background}');` : '';
    const bgClass = background ? 'page-hero--with-bg' : '';
    return `
      <section class="page-hero ${bgClass}" style="${bgStyle}">
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

  function renderContactPage(block) {
    // Legacy support for old simple format
    if (block.slots && block.slots.newsletterTitle) {
      const { headline, email, newsletterTitle, newsletterText, locations, logoImage } = block.slots;
      const logoSrc = logoImage ? 'http://localhost:3001/assets/images/' + logoImage : '';
      return `
        <section class="pm-contact-page">
          <div class="pm-contact-newsletter">
            <h2 class="pm-newsletter-title">${newsletterTitle || 'Stay in the loop'}</h2>
            <p class="pm-newsletter-desc">${newsletterText || 'Sign up with your email address to receive news and updates.'}</p>
            <form class="pm-newsletter-form" action="#" method="post">
              <input type="email" name="email" placeholder="Email Address" class="pm-newsletter-input" required>
              <button type="submit" class="pm-newsletter-btn">SIGN UP</button>
            </form>
          </div>
          ${locations ? `<p class="pm-contact-locations">${locations}</p>` : ''}
          <a href="mailto:${email}" class="pm-contact-link">contact us</a>
          ${logoSrc ? `
          <div class="pm-contact-logo">
            <a href="/secret" class="pm-contact-logo-link">
              <img src="${logoSrc}" alt="AiPhlo" class="pm-contact-logo-img">
            </a>
          </div>
          ` : ''}
        </section>
      `;
    }
    return '';
  }

  // Resume/CV Page Block Renderers
  function renderResumeHeader(block) {
    const { logo, name, tagline, summary } = block.slots;
    return `
      <header class="pm-resume-header">
        <div class="pm-resume-logo">${logo || 'PM'}</div>
        <h1 class="pm-resume-name">${name || ''}</h1>
        <p class="pm-resume-tagline">${tagline || ''}</p>
        <p class="pm-resume-summary">${summary || ''}</p>
      </header>
    `;
  }

  function renderQuickActions(block) {
    const { actions } = block.slots;
    if (!actions || !actions.length) return '';

    let html = '<section class="pm-quick-actions">';
    actions.forEach(function(action, i) {
      // First button: cyan, Second: white, Rest: cyan outline
      let btnClass = '';
      if (i === 0) btnClass = ' pm-action-primary';
      else if (i === 1) btnClass = ' pm-action-secondary';
      const icon = action.icon ? `<span class="pm-action-icon">${action.icon}</span>` : '';
      html += `<a href="${action.href || '#'}" class="pm-action-btn${btnClass}">${icon}${action.label}</a>`;
    });
    html += '</section>';
    return html;
  }

  function renderContactCards(block) {
    const { cards } = block.slots;
    if (!cards || !cards.length) return '';

    let html = '<section class="pm-contact-cards">';
    cards.forEach(function(card) {
      html += `
        <div class="pm-contact-card">
          <div class="pm-card-icon">${card.icon || ''}</div>
          <h3 class="pm-card-title">${card.title || ''}</h3>
          <p class="pm-card-desc">${card.description || ''}</p>
          <a href="${card.href || '#'}" class="pm-card-value">${card.value || ''}</a>
        </div>
      `;
    });
    html += '</section>';
    return html;
  }

  function renderResumeDownload(block) {
    const { title, downloadLabel, coverLetterLabel } = block.slots;
    return `
      <div class="pm-resume-actions">
        <h2 class="pm-section-title">${title || 'Resume & Experience'}</h2>
        <div class="pm-resume-buttons">
          <a href="#" class="pm-download-btn">⬇ ${downloadLabel || 'Download PDF'}</a>
          <button class="pm-cover-letter-toggle" data-expanded="false">
            📄 ${coverLetterLabel || 'View Cover Letter'}
            <span class="pm-toggle-arrow">▼</span>
          </button>
        </div>
      </div>
    `;
  }

  function renderCoverLetter(block) {
    const { paragraphs } = block.slots;
    if (!paragraphs || !paragraphs.length) return '';

    let html = '<div class="pm-cover-letter" data-state="closed"><div class="pm-cover-letter-content">';
    paragraphs.forEach(function(p, i) {
      const isSignature = i === paragraphs.length - 1 && p.includes('Warm regards');
      const className = isSignature ? ' class="pm-signature"' : '';
      html += `<p${className}>${p.replace(/\n/g, '<br>')}</p>`;
    });
    html += '</div></div>';
    return html;
  }

  function renderTextBlock(block) {
    const { title, content } = block.slots;
    return `
      <div class="pm-summary-block">
        <h3 class="pm-block-title">${title || ''}</h3>
        <p>${content || ''}</p>
      </div>
    `;
  }

  function renderWorkExperience(block) {
    const { title, jobs } = block.slots;
    if (!jobs || !jobs.length) return '';

    let html = `<div class="pm-experience-block"><h3 class="pm-block-title">${title || 'Work Experience'}</h3>`;
    jobs.forEach(function(job) {
      html += `
        <div class="pm-job">
          <div class="pm-job-header">
            <h4 class="pm-job-title">${job.title || ''}</h4>
            <span class="pm-job-dates">${job.dates || ''}</span>
          </div>
          <p class="pm-job-company">${job.company || ''}${job.location ? ' · ' + job.location : ''}</p>
          <p class="pm-job-desc">${job.description || ''}</p>
        </div>
      `;
    });
    html += '</div>';
    return html;
  }

  function renderSkillsGrid(block) {
    const { title, skills } = block.slots;
    if (!skills || !skills.length) return '';

    let html = `<div class="pm-skills-block"><h3 class="pm-block-title">${title || 'Core Skills'}</h3><div class="pm-skills-grid">`;
    skills.forEach(function(skill) {
      html += `<span class="pm-skill-tag">${skill}</span>`;
    });
    html += '</div></div>';
    return html;
  }

  function renderContactFooter(block) {
    // Only render page-specific copyright/location info
    // Site-wide footer (dark bg + white section) is in accurate.html
    const { copyright, location } = block.slots;
    return `
      </section><!-- end pm-resume-card -->
      <section class="pm-resume-footer-info">
        <p class="pm-copyright">${copyright || ''}</p>
        <p class="pm-location-info">${location || ''}</p>
      </section>
      </main><!-- end pm-resume-page -->
    `;
    // Note: Site-wide footer follows automatically from accurate.html
  }

  function renderFaqsPage(block) {
    const { headline, items } = block.slots;
    if (!items || !items.length) return '';

    let html = `
      <section class="pm-faqs-page">
        <h1 class="pm-faqs-headline">${headline || 'FAQ'}</h1>
        <div class="pm-faqs-list">
    `;

    items.forEach(function(item, index) {
      html += `
        <div class="pm-faq-item" data-state="closed">
          <button class="pm-faq-question" aria-expanded="false" data-index="${index}">
            <span class="pm-faq-text">${item.question}</span>
            <span class="pm-faq-arrow">+</span>
          </button>
          <div class="pm-faq-answer">
            <p>${item.answer}</p>
          </div>
        </div>
      `;
    });

    html += '</div></section>';
    return html;
  }

  // =========================================
  // RENDERER: AiPhlo Product Page
  // Hero, Accordions, Pricing, FAQs, CTA
  // =========================================
  function renderAiphloHero(block) {
    const { headline, subtitle, note, ctas } = block.slots;
    let ctaHtml = '';
    if (ctas && ctas.length) {
      ctaHtml = '<div class="aip-cta-group">';
      ctas.forEach(function(cta) {
        if (cta.type === 'primary') {
          ctaHtml += `<a href="${cta.href}" class="aip-btn aip-btn-primary">${cta.text}</a>`;
        } else {
          // Secondary CTA opens the custom project form
          ctaHtml += `<button type="button" class="aip-btn aip-btn-secondary" onclick="aipOpenForm('custom')">${cta.text}</button>`;
        }
      });
      ctaHtml += '</div>';
    }

    // Modal form HTML
    const modalHtml = `
      <div id="aip-form-modal" class="aip-modal-overlay" style="display: none;">
        <div class="aip-modal">
          <button type="button" class="aip-modal-close" onclick="aipCloseForm()">&times;</button>
          <h2 class="aip-modal-title">Start Your Custom Project</h2>
          <p class="aip-modal-subtitle">Tell us about your vision and we'll create a tailored solution.</p>
          <form id="aip-custom-form" onsubmit="aipSubmitForm(event)">
            <div class="aip-form-group">
              <label for="aip-name">Name</label>
              <input type="text" id="aip-name" name="name" required placeholder="Your name">
            </div>
            <div class="aip-form-group">
              <label for="aip-email">Email</label>
              <input type="email" id="aip-email" name="email" required placeholder="your@email.com">
            </div>
            <div class="aip-form-group">
              <label for="aip-website">Current Website URL</label>
              <input type="url" id="aip-website" name="website" placeholder="https://yoursite.com">
            </div>
            <div class="aip-form-group">
              <label for="aip-project-type">Project Type</label>
              <select id="aip-project-type" name="projectType" required>
                <option value="">Select a project type...</option>
                <option value="migration">Site Migration</option>
                <option value="redesign">Migration + Redesign</option>
                <option value="custom">Full Custom Build</option>
                <option value="enterprise">Enterprise Solution</option>
              </select>
            </div>
            <div class="aip-form-group">
              <label for="aip-details">Project Details</label>
              <textarea id="aip-details" name="details" rows="4" placeholder="Tell us about your project, goals, and any specific requirements..."></textarea>
            </div>
            <button type="submit" class="aip-btn aip-btn-primary aip-btn-full">Submit Request</button>
          </form>
        </div>
      </div>
    `;

    return `
      <section class="aip-hero">
        <div class="aip-bg-animated"></div>
        <div class="aip-hero-content">
          <h1 class="aip-hero-title">${headline || ''}</h1>
          <p class="aip-hero-subtitle">${subtitle || ''}</p>
          <p class="aip-hero-note">${note || ''}</p>
          ${ctaHtml}
        </div>
      </section>
      ${modalHtml}
    `;
  }

  function renderAiphloAccordions(block) {
    const { sections } = block.slots;
    if (!sections || !sections.length) return '';

    let html = '<section class="aip-accordions">';

    sections.forEach(function(section) {
      html += `
        <div class="aip-accordion" data-state="closed">
          <button class="aip-accordion-header">
            <h2>${section.title}</h2>
            <span class="aip-accordion-arrow">▼</span>
          </button>
          <div class="aip-accordion-body">
      `;

      // Regular content paragraphs
      if (section.content && section.content.length) {
        section.content.forEach(function(p) {
          html += `<p>${p}</p>`;
        });
      }

      // Subsections (for Navigation Systems)
      if (section.subsections && section.subsections.length) {
        html += '<div class="aip-nav-systems">';
        section.subsections.forEach(function(sub) {
          html += `
            <div class="aip-nav-system">
              <h3>${sub.title}</h3>
              <p class="aip-nav-tagline">${sub.tagline || ''}</p>
              <p>${sub.description || ''}</p>
          `;
          if (sub.features && sub.features.length) {
            html += '<ul class="aip-feature-list">';
            sub.features.forEach(function(f) {
              html += `<li>${f}</li>`;
            });
            html += '</ul>';
          }
          if (sub.perfectFor) {
            html += `<p class="aip-perfect-for"><strong>Perfect for:</strong> ${sub.perfectFor}</p>`;
          }
          html += '</div>';
        });
        html += '</div>';
      }

      // Steps (for Three Steps section)
      if (section.steps && section.steps.length) {
        html += '<div class="aip-steps">';
        section.steps.forEach(function(step) {
          html += `
            <div class="aip-step">
              <span class="aip-step-number">${step.number}</span>
              <h3>${step.title}</h3>
              <p>${step.description}</p>
            </div>
          `;
        });
        html += '</div>';
      }

      // Features list (for Performance section)
      if (section.features && section.features.length && !section.subsections) {
        html += '<div class="aip-performance-grid">';
        section.features.forEach(function(feat) {
          if (typeof feat === 'object' && feat.title) {
            html += `
              <div class="aip-performance-item">
                <h4><span class="aip-check">${feat.icon || '✓'}</span> ${feat.title}</h4>
                <p>${feat.description || ''}</p>
              </div>
            `;
          } else {
            html += `<li>${feat}</li>`;
          }
        });
        html += '</div>';
      }

      // Badge (for Upgrade section)
      if (section.badge) {
        html = html.replace('<div class="aip-accordion-body">', `<div class="aip-accordion-body"><span class="aip-badge">${section.badge}</span>`);
      }

      // Note and CTA (for Upgrade section)
      if (section.note) {
        html += `<p class="aip-note">${section.note}</p>`;
      }
      if (section.cta) {
        html += `<a href="${section.cta.href}" class="aip-inline-cta">${section.cta.text}</a>`;
      }

      html += '</div></div>';
    });

    html += '</section>';
    return html;
  }

  function renderAiphloPricing(block) {
    const { headline, subhead, tiers } = block.slots;
    if (!tiers || !tiers.length) return '';

    let html = `
      <section id="pricing" class="aip-pricing">
        <h2 class="aip-pricing-headline">${headline || ''}</h2>
        <p class="aip-pricing-subhead">${subhead || ''}</p>
        <div class="aip-pricing-grid">
    `;

    tiers.forEach(function(tier) {
      const popularClass = tier.popular ? ' aip-tier-popular' : '';
      const popularBadge = tier.popular ? '<span class="aip-popular-badge">MOST POPULAR</span>' : '';
      html += `
        <div class="aip-pricing-tier${popularClass}">
          ${popularBadge}
          <h3 class="aip-tier-name">${tier.name}</h3>
          <div class="aip-tier-price">${tier.price}</div>
          <p class="aip-tier-install">${tier.installFee || ''}</p>
          <p class="aip-tier-tagline">${tier.tagline || ''}</p>
          <ul class="aip-tier-features">
      `;
      if (tier.features && tier.features.length) {
        tier.features.forEach(function(f) {
          html += `<li>${f}</li>`;
        });
      }
      const tierSlug = tier.name ? tier.name.toLowerCase().replace(/\s+/g, '-') : 'tier';

      html += `
          </ul>
          <p class="aip-tier-best-for"><strong>Best for:</strong> ${tier.bestFor || ''}</p>
          <button type="button" class="aip-tier-cta" onclick="aipAddToCart('${tier.name}', '${tier.price}', '${tierSlug}')">${tier.cta ? tier.cta.text : 'Add to Cart'}</button>
        </div>
      `;
    });

    html += '</div></section>';

    // Add cart notification element
    html += '<div id="aip-cart-notification" class="aip-cart-notification" style="display: none;"></div>';

    return html;
  }

  function renderAiphloRoadmap(block) {
    const { headline, content, comingSoon, note } = block.slots;
    let html = `
      <section class="aip-roadmap">
        <h2>${headline || ''}</h2>
        <p>${content || ''}</p>
    `;

    if (comingSoon && comingSoon.length) {
      html += '<p class="aip-coming-soon-label">Coming Soon:</p><ul class="aip-coming-soon-list">';
      comingSoon.forEach(function(item) {
        html += `<li>${item}</li>`;
      });
      html += '</ul>';
    }

    if (note) {
      html += `<p class="aip-roadmap-note">${note}</p>`;
    }

    html += '</section>';
    return html;
  }

  function renderAiphloFaqs(block) {
    const { headline, items } = block.slots;
    if (!items || !items.length) return '';

    let html = `
      <section class="aip-faqs">
        <h2>${headline || 'Frequently Asked Questions'}</h2>
        <div class="aip-faqs-list">
    `;

    items.forEach(function(item) {
      html += `
        <div class="aip-faq-item" data-state="closed">
          <button class="aip-faq-question">
            <span>${item.question}</span>
            <span class="aip-faq-arrow">+</span>
          </button>
          <div class="aip-faq-answer">
            <p>${item.answer}</p>
          </div>
        </div>
      `;
    });

    html += '</div></section>';
    return html;
  }

  function renderAiphloCta(block) {
    const { headline, subhead, cta, ctas, stats, guarantee, contact } = block.slots;

    let statsHtml = '';
    if (stats && stats.length) {
      statsHtml = '<div class="aip-cta-stats">';
      stats.forEach(function(stat) {
        statsHtml += `<div class="aip-stat"><span class="aip-stat-value">${stat.value}</span><span class="aip-stat-label">${stat.label}</span></div>`;
      });
      statsHtml += '</div>';
    }

    let ctasHtml = '';
    if (ctas && ctas.length) {
      ctasHtml = '<div class="aip-cta-buttons">';
      ctas.forEach(function(c) {
        const btnClass = c.type === 'primary' ? 'aip-btn-primary' : 'aip-btn-secondary';
        ctasHtml += `<a href="${c.href}" class="aip-btn ${btnClass}">${c.text}</a>`;
      });
      ctasHtml += '</div>';
    } else if (cta) {
      ctasHtml = `<a href="${cta.href}" class="aip-btn aip-btn-primary aip-btn-large">${cta.text}</a>`;
    }

    return `
      <section class="aip-cta-section">
        <h2 class="aip-cta-headline">${headline || ''}</h2>
        <p class="aip-cta-subhead">${subhead || ''}</p>
        ${statsHtml}
        ${ctasHtml}
        <p class="aip-cta-guarantee">${guarantee || ''}</p>
        <p class="aip-cta-contact">${contact || ''}</p>
      </section>
    `;
  }

  // =========================================
  // NEW RENDERERS: Product Sections & Cart
  // =========================================

  function renderAiphloSplit(block) {
    const { headline, content, cards } = block.slots;
    if (!cards || !cards.length) return '';

    let cardsHtml = '';
    cards.forEach(function(card) {
      cardsHtml += `
        <div class="aip-split-card">
          <div class="aip-split-icon aip-icon-${card.icon || 'default'}"></div>
          <h3>${card.title || ''}</h3>
          <p>${card.description || ''}</p>
          <div class="aip-split-price">${card.price || ''}</div>
          ${card.cta ? `<a href="${card.cta.href}" class="aip-btn aip-btn-outline">${card.cta.text}</a>` : ''}
        </div>
      `;
    });

    return `
      <section class="aip-split-section">
        <h2 class="aip-split-headline">${headline || ''}</h2>
        <p class="aip-split-content">${content || ''}</p>
        <div class="aip-split-cards">${cardsHtml}</div>
      </section>
    `;
  }

  function renderAiphloProductSection(block) {
    const { anchor, badge, headline, tagline, description, features, tiers } = block.slots;

    let featuresHtml = '';
    if (features && features.length) {
      featuresHtml = '<div class="aip-product-features">';
      features.forEach(function(group) {
        featuresHtml += `<div class="aip-feature-group"><h4>${group.title}</h4><ul>`;
        if (group.items) {
          group.items.forEach(function(item) {
            featuresHtml += `<li>${item}</li>`;
          });
        }
        featuresHtml += '</ul></div>';
      });
      featuresHtml += '</div>';
    }

    let tiersHtml = '';
    if (tiers && tiers.length) {
      tiersHtml = '<div class="aip-product-tiers">';
      tiers.forEach(function(tier) {
        const popularClass = tier.popular ? ' aip-tier-popular' : '';
        const popularBadge = tier.popular ? '<span class="aip-popular-badge">RECOMMENDED</span>' : '';

        let featuresListHtml = '';
        if (tier.features && tier.features.length) {
          featuresListHtml = '<ul class="aip-tier-features">';
          tier.features.forEach(function(f) {
            featuresListHtml += `<li>${f}</li>`;
          });
          featuresListHtml += '</ul>';
        }

        tiersHtml += `
          <div class="aip-product-tier${popularClass}">
            ${popularBadge}
            <h3 class="aip-tier-name">${tier.name || ''}</h3>
            <div class="aip-tier-price">${tier.price || ''}<span class="aip-tier-period">${tier.period || ''}</span></div>
            <p class="aip-tier-tagline">${tier.tagline || ''}</p>
            <p class="aip-tier-description">${tier.description || ''}</p>
            ${featuresListHtml}
            ${tier.tokenPrice ? `<p class="aip-tier-token-price">${tier.tokenPrice}</p>` : ''}
            <button type="button" class="aip-btn aip-btn-primary aip-add-to-cart" data-product-id="${tier.id || ''}">${tier.cta?.text || 'Add to Cart'}</button>
          </div>
        `;
      });
      tiersHtml += '</div>';
    }

    return `
      <section id="${anchor || ''}" class="aip-product-section">
        <div class="aip-product-header">
          ${badge ? `<span class="aip-product-badge">${badge}</span>` : ''}
          <h2 class="aip-product-headline">${headline || ''}</h2>
          <p class="aip-product-tagline">${tagline || ''}</p>
          <p class="aip-product-description">${description || ''}</p>
        </div>
        ${featuresHtml}
        ${tiersHtml}
      </section>
    `;
  }

  function renderAiphloSteps(block) {
    const { headline, subhead, steps } = block.slots;
    if (!steps || !steps.length) return '';

    let stepsHtml = '<div class="aip-steps-grid">';
    steps.forEach(function(step) {
      stepsHtml += `
        <div class="aip-step">
          <span class="aip-step-number">${step.number || ''}</span>
          <div class="aip-step-icon aip-icon-${step.icon || 'default'}"></div>
          <h3>${step.title || ''}</h3>
          <p>${step.description || ''}</p>
        </div>
      `;
    });
    stepsHtml += '</div>';

    return `
      <section class="aip-steps-section">
        <h2>${headline || ''}</h2>
        <p class="aip-steps-subhead">${subhead || ''}</p>
        ${stepsHtml}
      </section>
    `;
  }

  function renderAiphloComparison(block) {
    const { headline, traditional, aiphlo } = block.slots;

    function renderColumn(data, className) {
      if (!data) return '';
      let itemsHtml = '';
      if (data.items && data.items.length) {
        data.items.forEach(function(item) {
          const itemClass = item.positive ? 'aip-compare-positive' : (item.negative ? 'aip-compare-negative' : '');
          const icon = item.positive ? '✓' : (item.negative ? '✗' : '•');
          itemsHtml += `<li class="${itemClass}"><span class="aip-compare-icon">${icon}</span>${item.text}</li>`;
        });
      }
      return `
        <div class="aip-compare-column ${className}">
          <h3>${data.title || ''}</h3>
          <ul>${itemsHtml}</ul>
        </div>
      `;
    }

    return `
      <section class="aip-comparison-section">
        <h2>${headline || ''}</h2>
        <div class="aip-comparison-grid">
          ${renderColumn(traditional, 'aip-compare-traditional')}
          ${renderColumn(aiphlo, 'aip-compare-aiphlo')}
        </div>
      </section>
    `;
  }

  function renderAiphloTestimonials(block) {
    const { headline, items } = block.slots;
    if (!items || !items.length) return '';

    let testimonialsHtml = '<div class="aip-testimonials-grid">';
    items.forEach(function(item) {
      testimonialsHtml += `
        <div class="aip-testimonial">
          <blockquote>"${item.quote || ''}"</blockquote>
          <div class="aip-testimonial-author">
            <strong>${item.author || ''}</strong>
            <span>${item.role || ''}</span>
          </div>
        </div>
      `;
    });
    testimonialsHtml += '</div>';

    return `
      <section class="aip-testimonials-section">
        <h2>${headline || ''}</h2>
        ${testimonialsHtml}
      </section>
    `;
  }

  // =========================================
  // SHOPPING CART SYSTEM
  // =========================================

  const AiphloCart = {
    sessionId: 'aiphlo-' + Math.random().toString(36).substr(2, 9),
    items: [],

    async init() {
      // Load cart from API
      try {
        const response = await fetch('/v1/cart', {
          headers: { 'X-Session-Id': this.sessionId }
        });
        const data = await response.json();
        this.items = data.items || [];
        this.updateCartUI();
      } catch (e) {
        console.log('[Cart] Init error:', e);
      }
    },

    async addItem(productId) {
      try {
        const response = await fetch('/v1/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': this.sessionId
          },
          body: JSON.stringify({ productId, quantity: 1 })
        });
        const data = await response.json();
        if (data.success) {
          this.showNotification('Added to cart!');
          this.init(); // Refresh cart
          this.openCartDrawer();
        }
      } catch (e) {
        console.error('[Cart] Add error:', e);
      }
    },

    async removeItem(productId) {
      try {
        const response = await fetch('/v1/cart/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': this.sessionId
          },
          body: JSON.stringify({ productId })
        });
        const data = await response.json();
        if (data.success) {
          this.init(); // Refresh cart
        }
      } catch (e) {
        console.error('[Cart] Remove error:', e);
      }
    },

    async checkout(customerData) {
      try {
        const response = await fetch('/v1/cart/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Id': this.sessionId
          },
          body: JSON.stringify({ customer: customerData })
        });
        const data = await response.json();
        if (data.success) {
          this.showCheckoutSuccess(data.order);
          this.items = [];
          this.updateCartUI();
        }
        return data;
      } catch (e) {
        console.error('[Cart] Checkout error:', e);
        return { error: e.message };
      }
    },

    updateCartUI() {
      const cartCount = document.getElementById('aip-cart-count');
      const cartItems = document.getElementById('aip-cart-items');
      const cartTotal = document.getElementById('aip-cart-total');

      const itemCount = this.items.reduce((sum, i) => sum + (i.quantity || 1), 0);

      if (cartCount) {
        cartCount.textContent = itemCount;
        cartCount.style.display = itemCount > 0 ? 'flex' : 'none';
      }

      if (cartItems) {
        if (this.items.length === 0) {
          cartItems.innerHTML = '<p class="aip-cart-empty">Your cart is empty</p>';
        } else {
          let html = '';
          let total = 0;
          this.items.forEach(function(item) {
            if (item.product) {
              total += item.product.price * (item.quantity || 1);
              html += `
                <div class="aip-cart-item">
                  <div class="aip-cart-item-info">
                    <strong>${item.product.name}</strong>
                    <span>$${item.product.price.toFixed(2)} ${item.product.type === 'subscription' ? '/mo' : ''}</span>
                  </div>
                  <button class="aip-cart-item-remove" onclick="AiphloCart.removeItem('${item.productId}')">&times;</button>
                </div>
              `;
            }
          });
          cartItems.innerHTML = html;
          if (cartTotal) cartTotal.textContent = '$' + total.toFixed(2);
        }
      }
    },

    showNotification(message) {
      let notif = document.getElementById('aip-cart-notification');
      if (!notif) {
        notif = document.createElement('div');
        notif.id = 'aip-cart-notification';
        notif.className = 'aip-cart-notification';
        document.body.appendChild(notif);
      }
      notif.textContent = message;
      notif.classList.add('aip-show');
      setTimeout(function() {
        notif.classList.remove('aip-show');
      }, 2000);
    },

    openCartDrawer() {
      const drawer = document.getElementById('aip-cart-drawer');
      if (drawer) drawer.classList.add('aip-open');
    },

    closeCartDrawer() {
      const drawer = document.getElementById('aip-cart-drawer');
      if (drawer) drawer.classList.remove('aip-open');
    },

    showCheckoutSuccess(order) {
      const drawer = document.getElementById('aip-cart-drawer');
      if (drawer) {
        drawer.innerHTML = `
          <div class="aip-checkout-success">
            <div class="aip-success-icon">✓</div>
            <h3>Order Confirmed!</h3>
            <p>Order ID: <strong>${order.id}</strong></p>
            <p>Total: <strong>$${order.subtotal}</strong></p>
            <p>We'll send confirmation to <strong>${order.customer.email}</strong></p>
            <button class="aip-btn aip-btn-primary" onclick="AiphloCart.closeCartDrawer()">Continue</button>
          </div>
        `;
      }
    }
  };

  // Make cart globally accessible
  window.AiphloCart = AiphloCart;

  // Initialize cart on AiPhlo page
  function initAiphloCart() {
    // Inject cart UI into the page
    const cartHtml = renderCartUI();
    document.body.insertAdjacentHTML('beforeend', cartHtml);

    // Initialize cart data
    AiphloCart.init();

    // Add event delegation for "Add to Cart" buttons
    document.addEventListener('click', function(e) {
      const addBtn = e.target.closest('.aip-add-to-cart');
      if (addBtn) {
        const productId = addBtn.getAttribute('data-product-id');
        if (productId) {
          AiphloCart.addItem(productId);
        }
      }
    });

    console.log('[AiPhlo] Cart initialized');
  }

  function renderCartUI() {
    return `
      <!-- Cart Icon (Fixed) -->
      <button id="aip-cart-icon" class="aip-cart-icon" onclick="AiphloCart.openCartDrawer()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <span id="aip-cart-count" class="aip-cart-count" style="display: none;">0</span>
      </button>

      <!-- Cart Drawer -->
      <div id="aip-cart-drawer" class="aip-cart-drawer">
        <div class="aip-cart-header">
          <h3>Your Cart</h3>
          <button class="aip-cart-close" onclick="AiphloCart.closeCartDrawer()">&times;</button>
        </div>
        <div id="aip-cart-items" class="aip-cart-items">
          <p class="aip-cart-empty">Your cart is empty</p>
        </div>
        <div class="aip-cart-footer">
          <div class="aip-cart-total-row">
            <span>Total:</span>
            <span id="aip-cart-total">$0.00</span>
          </div>
          <button class="aip-btn aip-btn-primary aip-btn-full" onclick="AiphloCart.showCheckoutForm()">Checkout</button>
        </div>
      </div>

      <!-- Cart Notification -->
      <div id="aip-cart-notification" class="aip-cart-notification"></div>
    `;
  }

  // Add checkout form show method
  AiphloCart.showCheckoutForm = function() {
    const drawer = document.getElementById('aip-cart-drawer');
    if (!drawer || this.items.length === 0) return;

    const currentContent = drawer.innerHTML;
    drawer.innerHTML = `
      <div class="aip-cart-header">
        <h3>Checkout</h3>
        <button class="aip-cart-close" onclick="AiphloCart.closeCartDrawer()">&times;</button>
      </div>
      <form id="aip-checkout-form" class="aip-checkout-form">
        <div class="aip-form-group">
          <label>Name</label>
          <input type="text" name="name" required placeholder="Your name">
        </div>
        <div class="aip-form-group">
          <label>Email</label>
          <input type="email" name="email" required placeholder="your@email.com">
        </div>
        <div class="aip-form-group">
          <label>Company (optional)</label>
          <input type="text" name="company" placeholder="Company name">
        </div>
        <div class="aip-cart-total-row">
          <span>Total:</span>
          <span id="aip-cart-total">$${this.items.reduce((sum, i) => sum + (i.product?.price || 0), 0).toFixed(2)}</span>
        </div>
        <button type="submit" class="aip-btn aip-btn-primary aip-btn-full">Complete Order</button>
        <button type="button" class="aip-btn aip-btn-outline aip-btn-full" onclick="AiphloCart.init(); AiphloCart.openCartDrawer();">Back to Cart</button>
      </form>
    `;

    document.getElementById('aip-checkout-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const customerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company')
      };
      await AiphloCart.checkout(customerData);
    });
  };

  // AiPhlo accordion toggle interaction
  function initAiphloAccordions() {
    document.querySelectorAll('.aip-accordion-header').forEach(function(header) {
      header.addEventListener('click', function() {
        const accordion = this.closest('.aip-accordion');
        const isOpen = accordion.getAttribute('data-state') === 'open';

        // Close all accordions
        document.querySelectorAll('.aip-accordion').forEach(function(a) {
          a.setAttribute('data-state', 'closed');
        });

        // Open clicked if it was closed
        if (!isOpen) {
          accordion.setAttribute('data-state', 'open');
        }
      });
    });

    // AiPhlo FAQ accordions
    document.querySelectorAll('.aip-faq-question').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const item = this.closest('.aip-faq-item');
        const isOpen = item.getAttribute('data-state') === 'open';

        // Close all FAQ items
        document.querySelectorAll('.aip-faq-item').forEach(function(i) {
          i.setAttribute('data-state', 'closed');
        });

        // Open clicked if it was closed
        if (!isOpen) {
          item.setAttribute('data-state', 'open');
        }
      });
    });
  }

  // =========================================
  // AIPHLO FORM MODAL & CART FUNCTIONS
  // Global functions for modal and cart interactions
  // =========================================

  // Open the custom project form modal
  window.aipOpenForm = function(type) {
    const modal = document.getElementById('aip-form-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // If a tier type was passed, pre-select it
      if (type && type !== 'custom') {
        const projectType = document.getElementById('aip-project-type');
        if (projectType) {
          projectType.value = type;
        }
      }
    }
  };

  // Close the custom project form modal
  window.aipCloseForm = function() {
    const modal = document.getElementById('aip-form-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  // Handle form submission
  window.aipSubmitForm = function(event) {
    event.preventDefault();
    const form = document.getElementById('aip-custom-form');
    if (!form) return;

    const formData = new FormData(form);
    const data = {};
    formData.forEach(function(value, key) {
      data[key] = value;
    });

    console.log('[AiPhlo] Form submitted:', data);

    // Show success message
    aipShowCartNotification('Request submitted! We\'ll be in touch soon.');

    // Close modal and reset form
    aipCloseForm();
    form.reset();
  };

  // Add tier to cart
  window.aipAddToCart = function(tierName, price, slug) {
    console.log('[AiPhlo] Added to cart:', { tierName, price, slug });

    // Store in cart (using localStorage for persistence)
    let cart = JSON.parse(localStorage.getItem('aiphlo-cart') || '[]');
    cart.push({
      name: tierName,
      price: price,
      slug: slug,
      addedAt: new Date().toISOString()
    });
    localStorage.setItem('aiphlo-cart', JSON.stringify(cart));

    // Show notification
    aipShowCartNotification(`${tierName} (${price}) added to cart!`);
  };

  // Show cart notification
  window.aipShowCartNotification = function(message) {
    let notification = document.getElementById('aip-cart-notification');

    // Create notification if it doesn't exist
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'aip-cart-notification';
      notification.className = 'aip-cart-notification';
      document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.display = 'block';
    notification.classList.add('aip-notification-show');

    // Hide after 3 seconds
    setTimeout(function() {
      notification.classList.remove('aip-notification-show');
      setTimeout(function() {
        notification.style.display = 'none';
      }, 300);
    }, 3000);
  };

  // Close modal when clicking outside
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('aip-modal-overlay')) {
      aipCloseForm();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      aipCloseForm();
    }
  });

  // =========================================
  // RENDERER: Unified Gallery Nav (Photography & Social Media)
  // Same pill-based navigation for both pages
  // =========================================
  function renderGalleryNav(block, pageType) {
    const { categories, galleries } = block.slots;
    if (!categories || !categories.length) return '';

    // Store galleries data for later use
    window.galleryData = galleries || {};
    window.galleryPageType = pageType;

    const navId = pageType === 'photography' ? 'pm-photo-nav-v3' : 'pm-social-nav-v3';
    const toggleLabel = pageType === 'photography' ? 'GALLERIES' : 'CAMPAIGNS';

    let html = `<div id="${navId}" class="pm-gallery-nav">`;
    html += '<div class="pm-photo-pill-track">';

    // Toggle button
    html += `
      <button type="button" class="pm-pill pm-pill-toggle" data-role="toggle" aria-label="Toggle navigation visibility">
        <span class="pm-toggle-text">${toggleLabel}</span>
        <svg class="pm-toggle-icon pm-icon-visible" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.2"/>
          <path d="M2 8h2M12 8h2M8 2v2M8 12v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        <svg class="pm-toggle-icon pm-icon-hidden" width="16" height="16" viewBox="0 0 16 16" fill="none" style="display:none">
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.2" opacity="0.3"/>
          <line x1="3" y1="13" x2="13" y2="3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    // Category pill group
    html += '<div class="pm-pill-group">';
    categories.forEach(function(cat, index) {
      const mobileLabel = pageType === 'photography' ? ('G' + (index + 1)) : ('C' + (index + 1));
      html += `
        <button type="button" class="pm-pill" data-target="${cat.id}" data-detail="pm-detail-${index + 1}">
          <span class="pm-pill-label-full">${cat.name}</span>
          <span class="pm-pill-label-mobile">${mobileLabel}</span>
        </button>
      `;
    });
    html += '</div>'; // End pill group
    html += '</div>'; // End pill track

    // Detail labels (subtext captions)
    html += '<div class="pm-detail-track">';
    categories.forEach(function(cat, index) {
      html += `<div id="pm-detail-${index + 1}" class="pm-detail">${cat.detail || cat.description || ''}</div>`;
    });
    html += '</div>';

    html += '</div>'; // End nav

    // Gallery sections (hidden by default, shown when pill clicked)
    categories.forEach(function(cat) {
      const catImages = galleries[cat.id] || [];
      html += `<section id="${cat.id}" class="pm-photo-section" style="display: none;">`;
      html += '<div class="gallery-grid" style="--grid-columns: 3;">';
      catImages.forEach(function(img) {
        html += `
          <div class="gallery-grid-item" style="padding-bottom: 100%; position: relative;">
            <img src="${img.src}" alt="${img.alt || cat.name}" loading="lazy" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
          </div>
        `;
      });
      html += '</div>';
      html += '</section>';
    });

    return html;
  }

  // Photo Nav wrapper (for backward compatibility)
  function renderPhotoNav(block) {
    return renderGalleryNav(block, 'photography');
  }

  // =========================================
  // RENDERER: Campaigns (Social Media Page)
  // Supports multiple layout types per campaign:
  // - phone-mockups: Vertical Instagram-style (AiPhlo feature)
  // - horizontal-slideshow: Landscape images with prev/next
  // =========================================
  function renderCampaigns(block) {
    const { items, fullWidthBackground, pageTitle } = block.slots;
    if (!items || !items.length) return '';

    // Store campaign data for interactions
    window.campaignData = items;

    const containerClass = fullWidthBackground ? 'pm-campaigns-container pm-full-width-bg' : 'pm-campaigns-container';
    let html = `<div class="${containerClass}">`;

    // Page title (shown above campaign cards - replaces hero)
    if (pageTitle) {
      html += `<h1 class="pm-campaigns-page-title">${pageTitle}</h1>`;
    }

    // Campaign cards row (dark boxes with circular icons)
    html += '<div class="pm-campaign-cards">';
    items.forEach(function(campaign) {
      const id = campaign.id || campaign.name.toLowerCase().replace(/\s+/g, '-');
      html += `
        <button type="button" class="pm-campaign-card" data-target="${id}" data-layout="${campaign.layoutType || 'phone-mockups'}">
          <div class="pm-campaign-card-icon">
            ${campaign.icon ? `<img src="${campaign.icon}" alt="${campaign.name}">` : ''}
          </div>
          <span class="pm-campaign-card-name">${campaign.name}</span>
        </button>
      `;
    });
    html += '</div>';

    // Campaign name display (shows when expanded)
    html += '<div class="pm-campaign-title-display"></div>';

    // Campaign galleries (hidden by default) - different layouts per campaign
    items.forEach(function(campaign) {
      const id = campaign.id || campaign.name.toLowerCase().replace(/\s+/g, '-');
      const images = campaign.images || [];
      const layoutType = campaign.layoutType || 'phone-mockups';

      html += `<section id="${id}" class="pm-campaign-gallery pm-layout-${layoutType}" style="display: none;">`;

      if (images.length > 0) {
        if (layoutType === 'horizontal-slideshow') {
          // Horizontal slideshow for landscape content (Victoria-style)
          html += '<div class="pm-horizontal-slideshow" data-campaign="' + id + '">';
          html += '<div class="pm-slideshow-viewport">';
          html += `<img class="pm-slideshow-current" src="${images[0].src}" alt="${images[0].alt || campaign.name}">`;
          html += '</div>';
          html += '<div class="pm-slideshow-controls">';
          html += '<button class="pm-slideshow-prev" aria-label="Previous">&lsaquo;</button>';
          html += `<span class="pm-slideshow-counter"><span class="current">1</span> / ${images.length}</span>`;
          html += '<button class="pm-slideshow-next-btn" aria-label="Next">&rsaquo;</button>';
          html += '</div>';
          html += '<div class="pm-slideshow-thumbs">';
          images.forEach(function(img, idx) {
            html += `<button class="pm-thumb ${idx === 0 ? 'active' : ''}" data-index="${idx}">`;
            html += `<img src="${img.src}" alt="${img.alt || ''}">`;
            html += '</button>';
          });
          html += '</div>';
          html += '</div>';
        } else {
          // Phone mockup gallery for vertical content (Vyayama-style - AiPhlo feature)
          html += '<div class="pm-phone-gallery">';
          html += '<div class="pm-phone-gallery-track">';
          images.forEach(function(img) {
            html += `
              <div class="pm-phone-mockup">
                <div class="pm-phone-frame">
                  <div class="pm-phone-notch"></div>
                  <div class="pm-phone-screen">
                    <img src="${img.src}" alt="${img.alt || campaign.name}">
                  </div>
                  <div class="pm-phone-home-indicator"></div>
                </div>
              </div>
            `;
          });
          html += '</div>';
          html += '</div>';
        }
      } else {
        html += '<p class="pm-no-images">No images available for this campaign.</p>';
      }

      html += '</section>';
    });

    html += '</div>'; // End container

    return html;
  }

  // =========================================
  // RENDERER: Project Showcase (Projects Page)
  // Thumbnail anchor nav + detail sections
  // Faster, simpler layout than gallery pages
  // =========================================
  function renderProjectShowcase(block) {
    const { pageTitle, subtitle, intro, projects } = block.slots;
    if (!projects || !projects.length) return '';

    // Store for interactions
    window.projectShowcaseData = projects;

    let html = '<div class="pm-project-showcase">';

    // Page header
    if (pageTitle) {
      html += `<header class="pm-project-header">`;
      html += `<h1 class="pm-project-title">${pageTitle}</h1>`;
      if (subtitle) html += `<p class="pm-project-subtitle">${subtitle}</p>`;
      if (intro) html += `<p class="pm-project-intro">${intro}</p>`;
      html += `</header>`;
    }

    // Thumbnail nav (floating, anchor-based)
    html += '<nav class="pm-project-thumbs">';
    projects.forEach(function(project) {
      html += `
        <button type="button" class="pm-project-thumb" data-target="${project.id}">
          <img src="${project.thumbnail}" alt="${project.name}">
          <span class="pm-thumb-label">${project.name}</span>
        </button>
      `;
    });
    html += '</nav>';

    // Project sections
    projects.forEach(function(project, index) {
      const isFirst = index === 0;
      html += `<section id="${project.id}" class="pm-project-section${isFirst ? ' pm-active' : ''}" ${isFirst ? '' : 'style="display:none;"'}>`;

      // Section header with optional toggle
      html += '<div class="pm-project-section-header">';
      html += `<h2 class="pm-project-name">${project.name}</h2>`;
      if (project.tagline) {
        html += `<p class="pm-project-tagline">${project.tagline}</p>`;
      }
      if (project.description) {
        html += `<p class="pm-project-desc">${project.description}</p>`;
      }

      // Toggle switch (for Tenebre-style variations)
      if (project.hasToggle) {
        html += `
          <div class="pm-project-toggle" data-project="${project.id}">
            <span class="pm-toggle-label-off">OFF</span>
            <button type="button" class="pm-toggle-switch" aria-pressed="false">
              <span class="pm-toggle-knob"></span>
            </button>
            <span class="pm-toggle-label-on">${project.toggleLabel || 'ON'}</span>
          </div>
        `;
      }
      html += '</div>';

      // Content area
      html += '<div class="pm-project-content">';
      if (project.content) {
        if (project.content.type === 'slideshow' && project.content.images) {
          // Slideshow content
          html += `<div class="pm-project-slideshow" data-project="${project.id}">`;
          html += '<div class="pm-project-slide-container">';
          project.content.images.forEach(function(img, idx) {
            html += `<img class="pm-project-slide${idx === 0 ? ' active' : ''}" src="${img.src}" alt="${img.alt || project.name}">`;
          });
          html += '</div>';
          if (project.content.images.length > 1) {
            html += `<div class="pm-project-slide-dots">`;
            project.content.images.forEach(function(_, idx) {
              html += `<button class="pm-slide-dot${idx === 0 ? ' active' : ''}" data-index="${idx}"></button>`;
            });
            html += '</div>';
          }
          html += '</div>';
        } else if (project.content.type === 'image') {
          // Single image
          html += `<div class="pm-project-image">`;
          html += `<img src="${project.content.src}" alt="${project.name}">`;
          html += '</div>';
        }
      }
      html += '</div>'; // End content

      html += '</section>';
    });

    html += '</div>'; // End showcase

    return html;
  }

  // =========================================
  // INTERACTIONS: Cover Letter Toggle (Resume Page)
  // =========================================
  function initCoverLetterToggle() {
    const toggleBtn = document.querySelector('.pm-cover-letter-toggle');
    const coverLetter = document.querySelector('.pm-cover-letter');

    if (toggleBtn && coverLetter) {
      toggleBtn.addEventListener('click', function() {
        const isExpanded = toggleBtn.getAttribute('data-expanded') === 'true';
        toggleBtn.setAttribute('data-expanded', !isExpanded);
        coverLetter.setAttribute('data-state', isExpanded ? 'closed' : 'open');
        const arrow = toggleBtn.querySelector('.pm-toggle-arrow');
        if (arrow) {
          arrow.textContent = isExpanded ? '▼' : '▲';
        }
      });
    }
  }

  // =========================================
  // INTERACTIONS: Dynamic Page Elements
  // =========================================
  function initDynamicPageInteractions() {
    // FAQ accordions (old class)
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

    // FAQ accordions (new pm- class)
    document.querySelectorAll('.pm-faq-question').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const item = this.closest('.pm-faq-item');
        const isOpen = item.getAttribute('data-state') === 'open';

        // Close all FAQ items
        document.querySelectorAll('.pm-faq-item').forEach(function(i) {
          i.setAttribute('data-state', 'closed');
          const q = i.querySelector('.pm-faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });

        // Open clicked item if it was closed
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

    // Unified Gallery Nav (works for Photography and Social Media)
    initGalleryNav();

    // Campaign slideshows (Social Media page)
    initCampaignSlideshows();

    // Project showcase (Projects page)
    initProjectShowcase();
  }

  // =========================================
  // INTERACTIONS: Project Showcase
  // Thumbnail nav + toggle switches + slideshows
  // =========================================
  function initProjectShowcase() {
    const thumbs = document.querySelectorAll('.pm-project-thumb');
    const sections = document.querySelectorAll('.pm-project-section');
    const toggles = document.querySelectorAll('.pm-project-toggle');

    if (!thumbs.length) return;

    // Thumbnail click - show corresponding section
    thumbs.forEach(function(thumb) {
      thumb.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);

        // Update active states
        thumbs.forEach(function(t) { t.classList.remove('active'); });
        sections.forEach(function(s) {
          s.style.display = 'none';
          s.classList.remove('pm-active');
        });

        this.classList.add('active');
        if (targetSection) {
          targetSection.style.display = 'block';
          targetSection.classList.add('pm-active');

          // Smooth scroll to section
          setTimeout(function() {
            const offset = 180;
            const top = targetSection.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
          }, 100);
        }
      });
    });

    // Toggle switches
    toggles.forEach(function(toggle) {
      const switchBtn = toggle.querySelector('.pm-toggle-switch');
      const projectId = toggle.getAttribute('data-project');

      if (switchBtn) {
        switchBtn.addEventListener('click', function() {
          const isOn = this.getAttribute('aria-pressed') === 'true';
          this.setAttribute('aria-pressed', !isOn);
          toggle.classList.toggle('pm-on', !isOn);

          // Find slideshow and start/stop it
          const slideshow = document.querySelector('.pm-project-slideshow[data-project="' + projectId + '"]');
          if (slideshow) {
            if (!isOn) {
              startProjectSlideshow(slideshow);
            } else {
              stopProjectSlideshow(slideshow);
            }
          }
        });
      }
    });

    // Slideshow dot navigation
    document.querySelectorAll('.pm-slide-dot').forEach(function(dot) {
      dot.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'), 10);
        const slideshow = this.closest('.pm-project-slideshow');
        if (slideshow) {
          showProjectSlide(slideshow, index);
        }
      });
    });

    // Auto-select first project thumbnail
    if (thumbs.length > 0) {
      thumbs[0].classList.add('active');
    }

    console.log('[AiPhlo] Project showcase initialized with', thumbs.length, 'projects');
  }

  // Project slideshow helpers
  let projectSlideshowIntervals = {};

  function startProjectSlideshow(slideshow) {
    const projectId = slideshow.getAttribute('data-project');
    const slides = slideshow.querySelectorAll('.pm-project-slide');
    if (slides.length <= 1) return;

    let currentIndex = 0;
    projectSlideshowIntervals[projectId] = setInterval(function() {
      currentIndex = (currentIndex + 1) % slides.length;
      showProjectSlide(slideshow, currentIndex);
    }, 3000);

    slideshow.classList.add('pm-playing');
  }

  function stopProjectSlideshow(slideshow) {
    const projectId = slideshow.getAttribute('data-project');
    if (projectSlideshowIntervals[projectId]) {
      clearInterval(projectSlideshowIntervals[projectId]);
      delete projectSlideshowIntervals[projectId];
    }
    slideshow.classList.remove('pm-playing');
  }

  function showProjectSlide(slideshow, index) {
    const slides = slideshow.querySelectorAll('.pm-project-slide');
    const dots = slideshow.querySelectorAll('.pm-slide-dot');

    slides.forEach(function(s, i) {
      s.classList.toggle('active', i === index);
    });
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === index);
    });
  }

  // =========================================
  // INTERACTIONS: Unified Gallery Nav Pills
  // Works for both Photography and Social Media pages
  // Matches original site: scroll dim, toggle, pill click
  // =========================================
  function initGalleryNav() {
    // Find any gallery nav (photography or social media)
    const nav = document.querySelector('.pm-gallery-nav') || document.getElementById('pm-photo-nav-v3') || document.getElementById('pm-social-nav-v3');
    const toggle = document.querySelector('.pm-pill-toggle');
    const pillGroup = document.querySelector('.pm-pill-group');
    const pills = document.querySelectorAll('.pm-pill[data-target]');
    const details = document.querySelectorAll('.pm-detail');

    if (!pills.length) return;

    let pillsVisible = true;
    let activeSection = null;

    // Scroll-based dimming (dim after 240px scroll)
    if (nav) {
      window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        if (scrollY > 240) {
          nav.classList.add('dimmed');
        } else {
          nav.classList.remove('dimmed');
        }
      });
    }

    // Toggle button (GALLERIES/CAMPAIGNS)
    if (toggle && pillGroup) {
      toggle.addEventListener('click', function() {
        pillsVisible = !pillsVisible;
        pillGroup.style.display = pillsVisible ? 'flex' : 'none';

        // Toggle icon visibility
        const visibleIcon = this.querySelector('.pm-icon-visible');
        const hiddenIcon = this.querySelector('.pm-icon-hidden');
        if (visibleIcon) visibleIcon.style.display = pillsVisible ? 'inline' : 'none';
        if (hiddenIcon) hiddenIcon.style.display = pillsVisible ? 'none' : 'inline';
      });
    }

    // Hide all details
    function hideAllDetails() {
      details.forEach(function(d) {
        d.style.opacity = '0';
        d.style.visibility = 'hidden';
      });
    }

    // Show specific detail
    function showDetail(detailId) {
      hideAllDetails();
      const detail = document.getElementById(detailId);
      if (detail) {
        detail.style.opacity = '1';
        detail.style.visibility = 'visible';
      }
    }

    // Category pill interactions
    pills.forEach(function(pill) {
      const target = pill.getAttribute('data-target');
      const detailId = pill.getAttribute('data-detail');

      // Hover: show detail text
      pill.addEventListener('mouseenter', function() {
        showDetail(detailId);
      });

      pill.addEventListener('mouseleave', function() {
        if (!this.classList.contains('pm-active')) {
          hideAllDetails();
        }
      });

      // Click: toggle gallery section with animation
      pill.addEventListener('click', function() {
        const section = document.getElementById(target);
        if (!section) {
          console.warn('[AiPhlo] Gallery section not found:', target);
          return;
        }

        // If clicking active pill, close it
        if (activeSection === target) {
          section.style.display = 'none';
          this.classList.remove('pm-active');
          activeSection = null;
          hideAllDetails();
          return;
        }

        // Close any open section
        document.querySelectorAll('.pm-photo-section').forEach(function(s) {
          s.style.display = 'none';
        });
        pills.forEach(function(p) {
          p.classList.remove('pm-active');
        });

        // Open this section with animation
        section.style.display = 'block';
        this.classList.add('pm-active');
        activeSection = target;

        // Keep detail visible while active
        showDetail(detailId);

        // Smooth scroll to section (with offset for fixed nav)
        setTimeout(function() {
          const offset = 160; // More offset to account for fixed nav
          const top = section.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }, 100);
      });
    });

    console.log('[AiPhlo] Gallery nav initialized with', pills.length, 'categories');
  }

  // Alias for backward compatibility
  function initPhotoNav() {
    initGalleryNav();
  }

  // =========================================
  // INTERACTIONS: Campaign Cards
  // For Social Media page - card-based toggle with phone mockup galleries
  // =========================================
  function initCampaignSlideshows() {
    const campaignCards = document.querySelectorAll('.pm-campaign-card');
    if (!campaignCards.length) return;

    const titleDisplay = document.querySelector('.pm-campaign-title-display');
    let activeCard = null;

    // Initialize horizontal slideshows
    initHorizontalSlideshows();

    campaignCards.forEach(function(card) {
      card.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const targetGallery = document.getElementById(targetId);

        // If clicking same card, close it
        if (activeCard === this) {
          this.classList.remove('active');
          if (targetGallery) targetGallery.style.display = 'none';
          if (titleDisplay) titleDisplay.textContent = '';
          activeCard = null;
          return;
        }

        // Close any open gallery
        campaignCards.forEach(function(c) {
          c.classList.remove('active');
        });
        document.querySelectorAll('.pm-campaign-gallery').forEach(function(g) {
          g.style.display = 'none';
        });

        // Open clicked gallery
        this.classList.add('active');
        if (targetGallery) {
          targetGallery.style.display = 'block';
        }

        // Update title display
        const campaignName = this.querySelector('.pm-campaign-card-name');
        if (titleDisplay && campaignName) {
          titleDisplay.textContent = campaignName.textContent;
        }

        activeCard = this;

        console.log('[AiPhlo] Campaign gallery opened:', targetId);
      });
    });

    console.log('[AiPhlo] Campaign cards initialized:', campaignCards.length);
  }

  // Initialize horizontal slideshow controls (Victoria-style)
  function initHorizontalSlideshows() {
    const slideshows = document.querySelectorAll('.pm-horizontal-slideshow');
    if (!slideshows.length) return;

    slideshows.forEach(function(slideshow) {
      const campaignId = slideshow.getAttribute('data-campaign');
      const campaignData = window.campaignData;
      if (!campaignData) return;

      const campaign = campaignData.find(function(c) {
        return (c.id || c.name.toLowerCase().replace(/\s+/g, '-')) === campaignId;
      });

      if (!campaign || !campaign.images || !campaign.images.length) return;

      const images = campaign.images;
      let currentIndex = 0;

      const currentImg = slideshow.querySelector('.pm-slideshow-current');
      const counter = slideshow.querySelector('.pm-slideshow-counter .current');
      const prevBtn = slideshow.querySelector('.pm-slideshow-prev');
      const nextBtn = slideshow.querySelector('.pm-slideshow-next-btn');
      const thumbs = slideshow.querySelectorAll('.pm-thumb');

      function showSlide(index) {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        currentIndex = index;

        // Update main image with fade
        if (currentImg) {
          currentImg.style.opacity = '0';
          setTimeout(function() {
            currentImg.src = images[currentIndex].src;
            currentImg.style.opacity = '1';
          }, 150);
        }

        // Update counter
        if (counter) {
          counter.textContent = currentIndex + 1;
        }

        // Update thumbs
        thumbs.forEach(function(thumb, idx) {
          thumb.classList.toggle('active', idx === currentIndex);
        });
      }

      // Prev/Next buttons
      if (prevBtn) {
        prevBtn.addEventListener('click', function() {
          showSlide(currentIndex - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function() {
          showSlide(currentIndex + 1);
        });
      }

      // Thumbnail clicks
      thumbs.forEach(function(thumb) {
        thumb.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'), 10);
          showSlide(index);
        });
      });

      console.log('[AiPhlo] Horizontal slideshow initialized for', campaignId, 'with', images.length, 'images');
    });
  }

  // Old showPhotoGallery function removed - now using unified gallery sections

  // Old campaign nav functions removed - now using unified gallery nav

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

    // Check if this is the contact/resume page
    const isResumePage = (page === 'contact' || page === '/contact') && content.blocks.some(function(b) {
      return b.type === 'resume-header' || b.id === 'contactHeader';
    });

    // Render blocks
    let html = '';
    if (isResumePage) {
      html += '<main class="pm-resume-page"><section id="resume" class="pm-resume-section">';
    }

    content.blocks.forEach(function(block) {
      // Check both block.id and block.type for matching
      const blockKey = block.type || block.id;
      switch (blockKey) {
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
        case 'project-showcase':
          html += renderProjectShowcase(block);
          break;
        case 'faqs':
          html += renderFAQs(block);
          break;
        case 'contact':
          html += renderContact(block);
          break;
        case 'contactPage':
          html += renderContactPage(block);
          break;
        case 'resume-header':
          html += renderResumeHeader(block);
          break;
        case 'quick-actions':
          html += renderQuickActions(block);
          break;
        case 'contact-cards':
          html += renderContactCards(block);
          break;
        case 'resume-download':
          // Close header section and start the resume card
          html += '</section><!-- end pm-resume-section header -->';
          html += '<section id="resume" class="pm-resume-card">';
          html += renderResumeDownload(block);
          break;
        case 'cover-letter':
          html += renderCoverLetter(block);
          break;
        case 'text-block':
          html += renderTextBlock(block);
          break;
        case 'work-experience':
          html += renderWorkExperience(block);
          break;
        case 'skills-grid':
          html += renderSkillsGrid(block);
          break;
        case 'contact-footer':
          html += renderContactFooter(block);
          break;
        case 'faqsPage':
          html += renderFaqsPage(block);
          break;
        case 'aiphlo-hero':
          html += renderAiphloHero(block);
          break;
        case 'aiphlo-accordions':
          html += renderAiphloAccordions(block);
          break;
        case 'aiphlo-pricing':
          html += renderAiphloPricing(block);
          break;
        case 'aiphlo-roadmap':
          html += renderAiphloRoadmap(block);
          break;
        case 'aiphlo-faqs':
          html += renderAiphloFaqs(block);
          break;
        case 'aiphlo-cta':
          html += renderAiphloCta(block);
          break;
        case 'aiphlo-split':
          html += renderAiphloSplit(block);
          break;
        case 'aiphlo-product-section':
          html += renderAiphloProductSection(block);
          break;
        case 'aiphlo-steps':
          html += renderAiphloSteps(block);
          break;
        case 'aiphlo-comparison':
          html += renderAiphloComparison(block);
          break;
        case 'aiphlo-testimonials':
          html += renderAiphloTestimonials(block);
          break;
      }
    });

    // Note: For resume page, the contact-footer block closes the section and main tags

    // Check if this is the AiPhlo page
    const isAiphloPage = page === '/aiphlo' || page === 'aiphlo';

    if (pageContent) {
      // Wrap AiPhlo page content
      if (isAiphloPage) {
        pageContent.innerHTML = '<main class="pm-aiphlo-page">' + html + '</main>';
      } else {
        pageContent.innerHTML = html;
      }
      initDynamicPageInteractions();

      // Initialize cover letter toggle if on resume page
      if (isResumePage) {
        initCoverLetterToggle();
      }

      // Initialize AiPhlo accordions if on AiPhlo page
      if (isAiphloPage) {
        initAiphloAccordions();
        initAiphloCart();
      }
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

    // Safety: Reset body overflow in case modal/drawer left it stuck
    document.body.style.overflow = '';

    // Close any open modals or drawers
    const modal = document.getElementById('aip-form-modal');
    if (modal) modal.style.display = 'none';
    const drawer = document.getElementById('aip-cart-drawer');
    if (drawer) drawer.classList.remove('aip-open');

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

    // Safety: Ensure body is scrollable on init
    document.body.style.overflow = '';

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
      // Safety: Reset body overflow
      document.body.style.overflow = '';

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
