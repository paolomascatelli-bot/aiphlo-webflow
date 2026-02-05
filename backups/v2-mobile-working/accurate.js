/* =========================================
   ACCURATE JS - Interactions
   Matches original Squarespace behavior
   ========================================= */

(function() {
  'use strict';

  // Slideshow images (Grid 1 - Tenebre collection)
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

  // Aspect ratio mappings (Squarespace naming convention)
  const aspectRatios = {
    'square': '100%',           // 1:1
    'standard-vertical': '150%', // 2:3
    'four-three': '75%',        // 4:3
    'three-two': '66.67%',      // 3:2
    'sixteen-nine': '56.25%',   // 16:9
    'standard-horizontal': '66.67%' // 3:2
  };

  // Gallery layout metadata (extracted from Squarespace)
  const galleryLayouts = {
    seating: { columns: 3, aspect: 'square' },
    lighting: { columns: 3, aspect: 'standard-vertical' },
    outdoor: { columns: 4, aspect: 'square' },
    kingbed: { columns: 3, aspect: 'square' },
    guestbed: { columns: 3, aspect: 'four-three' }
  };

  // Gallery images by category (extracted from section IDs in multipage.json)
  const galleryImages = {
    // SEAT STYLES → #seating (img_52-77)
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
    // CHANDELIERS → #lighting (img_21-28)
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
    // PATIO & POOL → #waterfall (img_29-43)
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
    // KING BED/BATH → #kingbedbath (img_3-20)
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
    // GUEST BED/BATH → #guest-bedroom (img_44-51)
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

  /* =========================================
     1. FLOATING NAV
     ========================================= */
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
  }

  /* =========================================
     2. TENEBRE SYSTEM
     ========================================= */
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
    const SLIDE_DURATION = 4000;
    const FADE_DURATION = 2180;

    // Preload images
    slideshowImages.forEach(function(src) {
      const img = new Image();
      img.src = src;
    });

    // Toggle click
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

  /* =========================================
     3. GALLERY NAV
     ========================================= */
  function initGalleryNav() {
    const buttons = document.querySelectorAll('.tenebre-nav-btn');
    if (!buttons.length) return;

    let activeGallery = null;

    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const gallery = this.getAttribute('data-gallery');
        const sectionId = this.getAttribute('data-section').replace('#', '');
        const section = document.getElementById(sectionId);

        // Toggle off if same
        if (activeGallery === gallery) {
          this.classList.remove('tenebre-active');
          activeGallery = null;
          hideAllGalleries();
          return;
        }

        // Deactivate others
        buttons.forEach(function(b) {
          b.classList.remove('tenebre-active');
        });

        // Activate this
        this.classList.add('tenebre-active');
        activeGallery = gallery;

        // Show gallery
        showGallery(section, gallery);
      });
    });

    function showGallery(section, galleryId) {
      hideAllGalleries();

      if (!section || !galleryImages[galleryId]) return;

      // Get layout metadata for this gallery
      const layout = galleryLayouts[galleryId] || { columns: 3, aspect: 'square' };
      const aspectPadding = aspectRatios[layout.aspect] || '100%';

      // Build grid with dynamic layout
      let html = '<div class="gallery-grid" style="--grid-columns: ' + layout.columns + ';">';
      galleryImages[galleryId].forEach(function(img) {
        html += '<div class="gallery-grid-item" style="padding-bottom: ' + aspectPadding + ';">';
        html += '<img src="' + img.src + '" alt="' + img.alt + '" loading="lazy">';
        html += '</div>';
      });
      html += '</div>';

      section.innerHTML = html;
      section.classList.add('visible');

      // Scroll to section
      setTimeout(function() {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    function hideAllGalleries() {
      document.querySelectorAll('.tenebre-gallery-section').forEach(function(s) {
        s.classList.remove('visible');
        s.innerHTML = '';
      });
    }
  }

  /* =========================================
     INIT
     ========================================= */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }
  }

  function initAll() {
    initFloatingNav();
    initTenebreSystem();
    initGalleryNav();
    console.log('AiPhlo accurate template initialized');
  }

  init();
})();
