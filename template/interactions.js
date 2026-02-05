/* =========================================
   AIPHLO WEBFLOW - FOOTER JS INJECTION
   All sitewide scripts go in Webflow:
   Project Settings > Custom Code > Footer Code
   Wrap in <script> tags when pasting
   ========================================= */

(function() {
  'use strict';

  /* =========================================
     1. SITEWIDE FLOATING NAV
     Hover reveal + click lock behavior
     ========================================= */
  function initFloatingNav() {
    const trigger = document.getElementById('pm-nav-trigger');
    const dropdown = document.getElementById('pm-nav-dropdown');

    if (!trigger || !dropdown) return;

    let isLocked = false;
    let hoverTimeout = null;
    const HOVER_DELAY = 300;

    // Helper: Sync secondary navs when main nav opens/closes
    // This shifts secondary navs down so they don't overlap with main nav dropdown
    function syncSecondaryNavs(isOpen) {
      if (isOpen) {
        document.body.classList.add('main-nav-open');
      } else {
        document.body.classList.remove('main-nav-open');
      }
    }

    // Watch for visibility changes on dropdown
    const navObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
          const isVisible = dropdown.classList.contains('pm-visible');
          syncSecondaryNavs(isVisible);
        }
      });
    });
    navObserver.observe(dropdown, { attributes: true });

    // Hover enter
    trigger.addEventListener('mouseenter', function() {
      if (isLocked) return;
      clearTimeout(hoverTimeout);
      dropdown.classList.add('pm-visible');
    });

    // Hover leave trigger
    trigger.addEventListener('mouseleave', function() {
      if (isLocked) return;
      hoverTimeout = setTimeout(function() {
        if (!dropdown.matches(':hover')) {
          dropdown.classList.remove('pm-visible');
        }
      }, HOVER_DELAY);
    });

    // Hover leave dropdown
    dropdown.addEventListener('mouseleave', function() {
      if (isLocked) return;
      hoverTimeout = setTimeout(function() {
        dropdown.classList.remove('pm-visible');
      }, HOVER_DELAY);
    });

    // Hover enter dropdown (cancel close)
    dropdown.addEventListener('mouseenter', function() {
      if (isLocked) return;
      clearTimeout(hoverTimeout);
    });

    // Click to lock/unlock
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (isLocked) {
        isLocked = false;
        dropdown.classList.remove('pm-locked');
        dropdown.classList.remove('pm-visible');
      } else {
        isLocked = true;
        dropdown.classList.add('pm-locked');
        dropdown.classList.add('pm-visible');
      }
    });

    // Click outside to close
    document.addEventListener('click', function(e) {
      if (isLocked && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
        isLocked = false;
        dropdown.classList.remove('pm-locked');
        dropdown.classList.remove('pm-visible');
      }
    });

    // Escape key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isLocked) {
        isLocked = false;
        dropdown.classList.remove('pm-locked');
        dropdown.classList.remove('pm-visible');
      }
    });
  }

  /* =========================================
     2. PHOTOGRAPHY NAV
     Pill groups, section show/hide, scroll dim
     ========================================= */
  function initPhotographyNav() {
    const nav = document.getElementById('pm-photo-nav-v3');
    if (!nav) return;

    const toggle = nav.querySelector('[data-role="toggle"]');
    const pillGroup = nav.querySelector('.pm-pill-group');
    const pills = nav.querySelectorAll('.pm-pill[data-target]');
    const details = nav.querySelectorAll('.pm-detail');

    let isHidden = false;
    let activeTarget = null;
    const SCROLL_THRESHOLD = 240;
    const MOBILE_THRESHOLD = 220;

    // Toggle visibility
    if (toggle) {
      toggle.addEventListener('click', function() {
        isHidden = !isHidden;

        if (isHidden) {
          pillGroup.classList.add('pm-hidden');
          toggle.querySelector('.pm-icon-visible').style.display = 'none';
          toggle.querySelector('.pm-icon-hidden').style.display = 'block';
        } else {
          pillGroup.classList.remove('pm-hidden');
          toggle.querySelector('.pm-icon-visible').style.display = 'block';
          toggle.querySelector('.pm-icon-hidden').style.display = 'none';
        }
      });
    }

    // Pill clicks - section navigation
    pills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        const detailId = this.getAttribute('data-detail');

        // Update active states
        pills.forEach(function(p) { p.classList.remove('active'); });
        this.classList.add('active');

        // Show detail
        details.forEach(function(d) { d.classList.remove('visible'); });
        if (detailId) {
          const detail = document.getElementById(detailId);
          if (detail) detail.classList.add('visible');
        }

        // Show/hide sections
        openSection(target);
        activeTarget = target;
      });
    });

    // Scroll dim behavior
    function updateScrollDim() {
      const threshold = window.innerWidth <= 767 ? MOBILE_THRESHOLD : SCROLL_THRESHOLD;
      const scrollY = window.scrollY || window.pageYOffset;

      if (scrollY > threshold) {
        nav.classList.add('dimmed');
        nav.classList.remove('bright');
      } else {
        nav.classList.remove('dimmed');
        nav.classList.add('bright');
      }
    }

    window.addEventListener('scroll', updateScrollDim, { passive: true });
    updateScrollDim();
  }

  // Show/hide photo sections
  function openSection(targetId) {
    const sections = document.querySelectorAll('.pm-photo-section');
    sections.forEach(function(section) {
      if (section.id === targetId || section.getAttribute('data-section') === targetId) {
        section.classList.add('visible');
      } else {
        section.classList.remove('visible');
      }
    });
  }

  function closeGallery() {
    const sections = document.querySelectorAll('.pm-photo-section');
    sections.forEach(function(section) {
      section.classList.remove('visible');
    });
  }

  /* =========================================
     3. LOGO SCROLL FADE
     ========================================= */
  function initLogoScrollFade() {
    const logo = document.querySelector('.pm-scroll-fade-logo');
    if (!logo) return;

    const FADE_THRESHOLD = 150;

    function updateLogoFade() {
      const scrollY = window.scrollY || window.pageYOffset;
      const opacity = Math.max(0, 1 - (scrollY / FADE_THRESHOLD));
      logo.style.opacity = opacity;
    }

    window.addEventListener('scroll', updateLogoFade, { passive: true });
    updateLogoFade();
  }

  /* =========================================
     4. SOCIAL MEDIA NAV
     Campaign buttons with section reveal
     ========================================= */
  function initSocialMediaNav() {
    const buttons = document.querySelectorAll('.pm-campaign-btn');
    if (!buttons.length) return;

    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const target = this.getAttribute('data-target');

        // Update active states
        buttons.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        // Show/hide sections
        const sections = document.querySelectorAll('.pm-social-section');
        sections.forEach(function(section) {
          if (section.id === target || section.getAttribute('data-campaign') === target) {
            section.classList.add('visible');
          } else {
            section.classList.remove('visible');
          }
        });
      });
    });
  }

  /* =========================================
     5. PROJECTS NAV
     Luxury scroll with easeOutCubic
     ========================================= */
  function initProjectsNav() {
    const circles = document.querySelectorAll('.pm-project-circle');
    const nav = document.querySelector('.pm-projects-nav');
    if (!circles.length) return;

    const SCROLL_THRESHOLD = 300;

    // Luxury scroll function
    function luxuryScrollTo(targetY, duration) {
      const startY = window.scrollY || window.pageYOffset;
      const diff = targetY - startY;
      const startTime = performance.now();

      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        window.scrollTo(0, startY + (diff * eased));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
    }

    // Circle clicks
    circles.forEach(function(circle) {
      circle.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        const section = document.getElementById(target) ||
                        document.querySelector('[data-project="' + target + '"]');

        if (section) {
          const targetY = section.offsetTop - 100;
          luxuryScrollTo(targetY, 800);
        }

        // Update active states
        circles.forEach(function(c) { c.classList.remove('active'); });
        this.classList.add('active');
      });
    });

    // Scroll dim behavior
    if (nav) {
      function updateNavDim() {
        const scrollY = window.scrollY || window.pageYOffset;

        if (scrollY > SCROLL_THRESHOLD) {
          nav.classList.add('dimmed');
          nav.classList.remove('bright');
        } else {
          nav.classList.remove('dimmed');
          nav.classList.add('bright');
        }
      }

      window.addEventListener('scroll', updateNavDim, { passive: true });
      updateNavDim();
    }
  }

  /* =========================================
     6. TENEBRE SLIDESHOW + TOGGLE + GALLERY
     12-image engine, ON/OFF toggle, gallery nav
     ========================================= */
  function initTenebreSystem() {
    // Slideshow images
    const slideshowImages = [
      'https://images.squarespace-cdn.com/content/v1/559bdae3e4b00228d055250c/c281a47d-82d2-4ca7-9935-6e64238b737f/DU9A7439.jpg',
      'https://images.squarespace-cdn.com/content/v1/559bdae3e4b00228d055250c/b4129fc7-3080-4bdc-bcac-c60d41af1a00/DU9A7383.jpg',
      'https://images.squarespace-cdn.com/content/v1/559bdae3e4b00228d055250c/a0c0ca31-e8df-4fa3-b2f1-330fa1815836/bathbronze.jpg',
      'https://images.squarespace-cdn.com/content/v1/559bdae3e4b00228d055250c/15d7bf53-15cf-4f58-8581-ac65532b3f55/DU9A4760.jpg',
      'https://images.squarespace-cdn.com/content/v1/559bdae3e4b00228d055250c/1763210110407-JV8RT00V5Q85C2HRX2E9/DU9A4790.jpg',
      'https://images.squarespace-cdn.com/content/v1/559bdae3e4b00228d055250c/c6c5f9fd-406d-45a8-888d-355b0d4e8adb/DU9A4794.png',
      'https://images.squarespace-cdn.com/content/v1/559bdae3e4b00228d055250c/d15c2806-d254-4945-87fd-5ff57fc62f3c/RUGCLEAN.png',
      'https://images.squarespace-cdn.com/content/v1/559bdae3e4b00228d055250c/d4c44de0-5d3e-4529-978b-788f68839141/DU9A4764.png',
      'https://images.squarespace-cdn.com/content/v1/559bdae3e4b00228d055250c/ae21bb24-f939-4685-9c64-b6f016f067ec/DU9A4773.png',
      'https://images.squarespace-cdn.com/content/v1/559bdae3e4b00228d055250c/d62fa7e4-34f7-40a1-bc2f-79a24509f795/DU9A4788.png',
      'https://images.squarespace-cdn.com/content/v1/559bdae3e4b00228d055250c/847e2968-efbd-4c9e-b550-4ac4307eca65/DU9A3975.png',
      'https://images.squarespace-cdn.com/content/v1/559bdae3e4b00228d055250c/a79268fd-3820-4eee-b925-6d5b47fe8a13/handle3.png'
    ];

    const container = document.getElementById('tenebre-slideshow-container');
    const toggle = document.getElementById('tenebre-toggle');
    const labelOff = document.getElementById('tenebre-label-off');
    const labelOn = document.getElementById('tenebre-label-on');
    const slideCurrent = document.getElementById('tenebre-slide-current');
    const slideNext = document.getElementById('tenebre-slide-next');
    const overlay = document.getElementById('tenebre-black-overlay');

    if (!container || !toggle) return;

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
        // Turn ON
        toggle.classList.add('active');
        labelOff.classList.remove('active');
        labelOn.classList.add('active');

        // Expand container
        container.classList.add('expanded');

        // Start slideshow after expansion
        setTimeout(function() {
          startSlideshow();
        }, 1200);

      } else {
        // Turn OFF
        toggle.classList.remove('active');
        labelOff.classList.add('active');
        labelOn.classList.remove('active');

        // Stop slideshow
        stopSlideshow();

        // Collapse container
        container.classList.remove('expanded');
      }
    });

    function startSlideshow() {
      if (!slideCurrent || !slideNext) return;

      // Show first image
      slideCurrent.src = slideshowImages[currentIndex];
      slideCurrent.classList.add('tenebre-visible');

      // Start interval
      slideshowInterval = setInterval(function() {
        const nextIndex = (currentIndex + 1) % slideshowImages.length;

        // Preload next
        slideNext.src = slideshowImages[nextIndex];

        // Crossfade
        setTimeout(function() {
          slideNext.classList.add('tenebre-visible');
        }, 50);

        setTimeout(function() {
          slideCurrent.classList.remove('tenebre-visible');
        }, 100);

        // Swap roles after transition
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

    // Gallery navigation
    initTenebreGalleryNav();
  }

  function initTenebreGalleryNav() {
    const galleryButtons = document.querySelectorAll('.tenebre-gallery-btn');
    if (!galleryButtons.length) return;

    let activeGallery = null;

    galleryButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const gallery = this.getAttribute('data-gallery');
        const section = this.getAttribute('data-section');
        const previewImage = this.getAttribute('data-image');

        // Toggle behavior - click same = deselect
        if (activeGallery === gallery) {
          this.classList.remove('active');
          activeGallery = null;
          hideAllGallerySections();
          return;
        }

        // Update active states
        galleryButtons.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        activeGallery = gallery;

        // Show section
        showGallerySection(section);

        // Optional: scroll to section
        const sectionEl = document.querySelector(section);
        if (sectionEl) {
          setTimeout(function() {
            sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      });
    });

    function showGallerySection(sectionId) {
      const sections = document.querySelectorAll('.tenebre-gallery-section');
      sections.forEach(function(section) {
        if ('#' + section.id === sectionId || section.getAttribute('data-gallery') === sectionId.replace('#', '')) {
          section.classList.add('visible');
        } else {
          section.classList.remove('visible');
        }
      });
    }

    function hideAllGallerySections() {
      const sections = document.querySelectorAll('.tenebre-gallery-section');
      sections.forEach(function(section) {
        section.classList.remove('visible');
      });
    }
  }

  /* =========================================
     7. ACCORDION SYSTEM
     ========================================= */
  function initAccordion() {
    const items = document.querySelectorAll('.pm-accordion-item');
    if (!items.length) return;

    items.forEach(function(item) {
      const header = item.querySelector('.pm-accordion-header');

      if (header) {
        header.addEventListener('click', function() {
          const isOpen = item.classList.contains('open');

          // Close all others (optional - remove for multi-open)
          items.forEach(function(i) { i.classList.remove('open'); });

          // Toggle current
          if (!isOpen) {
            item.classList.add('open');
          }
        });
      }
    });
  }

  /* =========================================
     8. DROPDOWN POSITION UPDATE
     Updates dropdown position on scroll/resize only
     (Removed MutationObserver - caused infinite loop crash)
     ========================================= */
  function initDropdownObserver() {
    const dropdown = document.getElementById('pm-nav-dropdown');
    const trigger = document.getElementById('pm-nav-trigger');

    if (!dropdown || !trigger) return;

    // Update position on scroll and resize only (no MutationObserver)
    function updateDropdownPosition() {
      if (dropdown.classList.contains('pm-visible')) {
        const triggerRect = trigger.getBoundingClientRect();
        dropdown.style.top = (triggerRect.bottom + 8) + 'px';
      }
    }

    window.addEventListener('scroll', updateDropdownPosition, { passive: true });
    window.addEventListener('resize', updateDropdownPosition, { passive: true });
  }

  /* =========================================
     9. GRACE PERIOD MANAGER
     Prevents interaction stutter during transitions
     ========================================= */
  const GracePeriod = {
    active: false,
    timeout: null,

    start: function(duration) {
      this.active = true;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(function() {
        GracePeriod.active = false;
      }, duration || 500);
    },

    isActive: function() {
      return this.active;
    }
  };

  /* =========================================
     INITIALIZATION
     ========================================= */
  function init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }
  }

  function initAll() {
    initFloatingNav();
    initPhotographyNav();
    initLogoScrollFade();
    initSocialMediaNav();
    initProjectsNav();
    initTenebreSystem();
    initAccordion();
    initDropdownObserver();

    console.log('AiPhlo navigation systems initialized');
  }

  // Start
  init();

})();
