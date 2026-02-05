/* AiPhlo Navigation Systems v1.0 */
/* GitHub Pages Hosted - For Webflow Integration */

(function() {
  'use strict';

  /* 1. SITEWIDE FLOATING NAV */
  function initFloatingNav() {
    const trigger = document.getElementById('pm-nav-trigger');
    const dropdown = document.getElementById('pm-nav-dropdown');
    if (!trigger || !dropdown) return;

    let isLocked = false;
    let hoverTimeout = null;
    const HOVER_DELAY = 300;

    trigger.addEventListener('mouseenter', function() {
      if (isLocked) return;
      clearTimeout(hoverTimeout);
      dropdown.classList.add('pm-visible');
    });

    trigger.addEventListener('mouseleave', function() {
      if (isLocked) return;
      hoverTimeout = setTimeout(function() {
        if (!dropdown.matches(':hover')) dropdown.classList.remove('pm-visible');
      }, HOVER_DELAY);
    });

    dropdown.addEventListener('mouseleave', function() {
      if (isLocked) return;
      hoverTimeout = setTimeout(function() {
        dropdown.classList.remove('pm-visible');
      }, HOVER_DELAY);
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
        dropdown.classList.remove('pm-locked', 'pm-visible');
      } else {
        isLocked = true;
        dropdown.classList.add('pm-locked', 'pm-visible');
      }
    });

    document.addEventListener('click', function(e) {
      if (isLocked && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
        isLocked = false;
        dropdown.classList.remove('pm-locked', 'pm-visible');
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isLocked) {
        isLocked = false;
        dropdown.classList.remove('pm-locked', 'pm-visible');
      }
    });
  }

  /* 2. PHOTOGRAPHY NAV */
  function initPhotographyNav() {
    const nav = document.getElementById('pm-photo-nav-v3');
    if (!nav) return;

    const toggle = nav.querySelector('[data-role="toggle"]');
    const pillGroup = nav.querySelector('.pm-pill-group');
    const pills = nav.querySelectorAll('.pm-pill[data-target]');
    const details = nav.querySelectorAll('.pm-detail');

    let isHidden = false;
    const SCROLL_THRESHOLD = 240;
    const MOBILE_THRESHOLD = 220;

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

    pills.forEach(function(pill) {
      pill.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        const detailId = this.getAttribute('data-detail');

        pills.forEach(function(p) { p.classList.remove('active'); });
        this.classList.add('active');

        details.forEach(function(d) { d.classList.remove('visible'); });
        if (detailId) {
          const detail = document.getElementById(detailId);
          if (detail) detail.classList.add('visible');
        }

        openSection(target);
      });
    });

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

  /* 3. LOGO SCROLL FADE */
  function initLogoScrollFade() {
    const logo = document.querySelector('.pm-scroll-fade-logo');
    if (!logo) return;
    const FADE_THRESHOLD = 150;

    function updateLogoFade() {
      const scrollY = window.scrollY || window.pageYOffset;
      logo.style.opacity = Math.max(0, 1 - (scrollY / FADE_THRESHOLD));
    }

    window.addEventListener('scroll', updateLogoFade, { passive: true });
    updateLogoFade();
  }

  /* 4. SOCIAL MEDIA NAV */
  function initSocialMediaNav() {
    const buttons = document.querySelectorAll('.pm-campaign-btn');
    if (!buttons.length) return;

    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const target = this.getAttribute('data-target');

        buttons.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

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

  /* 5. PROJECTS NAV */
  function initProjectsNav() {
    const nav = document.getElementById('pm-project-nav');
    const toggle = nav ? nav.querySelector('[data-role="toggle"]') : null;
    const group = nav ? nav.querySelector('.pm-project-group') : null;
    const circles = document.querySelectorAll('.pm-project-circle');

    if (!circles.length) return;

    let isHidden = false;
    const SCROLL_THRESHOLD = 300;

    if (toggle && group) {
      toggle.addEventListener('click', function() {
        isHidden = !isHidden;
        if (isHidden) {
          group.classList.add('pm-hidden');
          toggle.querySelector('.pm-icon-visible').style.display = 'none';
          toggle.querySelector('.pm-icon-hidden').style.display = 'block';
        } else {
          group.classList.remove('pm-hidden');
          toggle.querySelector('.pm-icon-visible').style.display = 'block';
          toggle.querySelector('.pm-icon-hidden').style.display = 'none';
        }
      });
    }

    function luxuryScrollTo(targetY, duration) {
      const startY = window.scrollY || window.pageYOffset;
      const diff = targetY - startY;
      const startTime = performance.now();

      function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

      function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + (diff * easeOutCubic(progress)));
        if (progress < 1) requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    }

    circles.forEach(function(circle) {
      circle.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('data-target');
        const section = document.getElementById(target) ||
                        document.querySelector('[data-project="' + target + '"]');

        if (section) {
          luxuryScrollTo(section.offsetTop - 100, 800);
        }

        circles.forEach(function(c) { c.classList.remove('active'); });
        this.classList.add('active');
      });
    });

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

  /* 6. TENEBRE SYSTEM */
  function initTenebreSystem() {
    const slideshowImages = [
      'https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/696f3680485a1e5a2af0ae4f/1768896132195/DU9A7439.jpg',
      'https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/696f38ae129eed6323d4c0f4/1768896690285/DU9A7383.jpg',
      'https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/696f3721c0dfef2b3bc0bd41/1768896298117/bathbronze.jpg',
      'https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/696f3c2ecbdddb1db3b6edce/1768897583206/DU9A4760.jpg',
      'https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/696f3ca91fd37c57a1c2f43f/1768897706213/DU9A4790.jpg',
      'https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/696f3cf4129eed6323d4d32a/1768897782125/DU9A4794.png',
      'https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/696f3d4b9a34ff0e18aea168/1768897870509/RUGCLEAN.png',
      'https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/696f3db1cc32c06e47dbbab9/1768897970337/DU9A4764.png',
      'https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/696f3df8129eed6323d4d6cb/1768898042673/DU9A4773.png',
      'https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/696f3e5b24fcc27f34bfb86b/1768898139793/DU9A4788.png',
      'https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/696f3eb0c0dfef2b3bc0c6cb/1768898224421/DU9A3975.png',
      'https://static1.squarespace.com/static/559bdae3e4b00228d055250c/t/696f3f04129eed6323d4d869/1768898309949/handle3.png'
    ];

    const container = document.getElementById('tenebre-slideshow-container');
    const toggle = document.getElementById('tenebre-toggle');
    const labelOff = document.getElementById('tenebre-label-off');
    const labelOn = document.getElementById('tenebre-label-on');
    const slideCurrent = document.getElementById('tenebre-slide-current');
    const slideNext = document.getElementById('tenebre-slide-next');

    if (!container || !toggle) return;

    let isOn = false;
    let currentIndex = 0;
    let slideshowInterval = null;
    const SLIDE_DURATION = 4000;
    const FADE_DURATION = 2180;

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
      if (!slideCurrent || !slideNext) return;

      slideCurrent.src = slideshowImages[currentIndex];
      slideCurrent.classList.add('tenebre-visible');

      slideshowInterval = setInterval(function() {
        const nextIndex = (currentIndex + 1) % slideshowImages.length;
        slideNext.src = slideshowImages[nextIndex];

        setTimeout(function() { slideNext.classList.add('tenebre-visible'); }, 50);
        setTimeout(function() { slideCurrent.classList.remove('tenebre-visible'); }, 100);

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

    initTenebreGalleryNav();
  }

  function initTenebreGalleryNav() {
    const galleryButtons = document.querySelectorAll('.tenebre-nav-btn');
    if (!galleryButtons.length) return;

    let activeGallery = null;

    galleryButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const gallery = this.getAttribute('data-gallery');
        const section = this.getAttribute('data-section');

        if (activeGallery === gallery) {
          this.classList.remove('tenebre-active');
          activeGallery = null;
          hideAllGallerySections();
          return;
        }

        galleryButtons.forEach(function(b) { b.classList.remove('tenebre-active'); });
        this.classList.add('tenebre-active');
        activeGallery = gallery;

        showGallerySection(section);

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
      sections.forEach(function(section) { section.classList.remove('visible'); });
    }
  }

  /* 7. ACCORDION */
  function initAccordion() {
    const items = document.querySelectorAll('.pm-accordion-item');
    if (!items.length) return;

    items.forEach(function(item) {
      const header = item.querySelector('.pm-accordion-header');
      if (header) {
        header.addEventListener('click', function() {
          const isOpen = item.classList.contains('open');
          items.forEach(function(i) { i.classList.remove('open'); });
          if (!isOpen) item.classList.add('open');
        });
      }
    });
  }

  /* INIT */
  function init() {
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
    console.log('AiPhlo navigation systems initialized');
  }

  init();
})();
