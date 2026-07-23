/**
 * CSB Bistro • Sport Bar
 * Interaction & Motion Choreography
 */

// Paste your Google Apps Script web app URL here after following GOOGLE_FORMS_SETUP.md
const GSHEET_FORM_URL = '';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initMenuCategoryTabs();
  initContactForm();
  initFanClubForm();
  initSmoothScroll();
  initMenuLightbox();
  initHeroLoad();
  initMagneticButtons();
  initParallax();
  initNavHideShow();
  initImageReveal();
  initSplitText();
});

/* --------------------------------------------------------------------------
   Navigation
   -------------------------------------------------------------------------- */
function initNavigation() {
  const nav = document.querySelector('.nav-island');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-menu-link');
  
  function openMenu() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  
  function closeMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  
  // Scroll state
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
  
  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
    
    if (mobileClose) {
      mobileClose.addEventListener('click', closeMenu);
    }
    
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }
}

/* --------------------------------------------------------------------------
   Scroll Reveal (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .stagger-children');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.08
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  revealElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Menu Category Tabs (Menu Page)
   -------------------------------------------------------------------------- */
function initMenuCategoryTabs() {
  const tabButtons = document.querySelectorAll('.menu-tab-btn');
  const tabPanels = document.querySelectorAll('.menu-tab-panel');

  if (!tabButtons.length) return;

  function activateTab(target) {
    const targetBtn = document.querySelector(`.menu-tab-btn[data-target="${target}"]`);
    if (!targetBtn) return;

    tabButtons.forEach(b => b.classList.remove('active'));
    targetBtn.classList.add('active');

    tabPanels.forEach(panel => {
      if (panel.dataset.category === target) {
        panel.style.display = 'block';
        setTimeout(() => {
          panel.style.opacity = '1';
          panel.style.transform = 'translateY(0)';
        }, 50);
      } else {
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(1rem)';
        setTimeout(() => {
          panel.style.display = 'none';
        }, 400);
      }
    });
  }

  // Handle hash-based tab switching for menu.html#happy-hour
  if (window.location.hash === '#happy-hour') {
    setTimeout(() => activateTab('happy-hour'), 100);
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      activateTab(target);
      
      // Scroll to menu grid on mobile
      if (window.innerWidth < 768) {
        const menuGrid = document.querySelector('.menu-tabs-content');
        if (menuGrid) {
          menuGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Contact / Reservation Form
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('.contact-form-element');
  
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitToSheet(form, 'reservation');
  });
}

/* --------------------------------------------------------------------------
   Fan Club Email Signup Form
   -------------------------------------------------------------------------- */
function initFanClubForm() {
  const form = document.querySelector('.fan-club-form');
  
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitToSheet(form, 'fanClub');
  });
}

/* --------------------------------------------------------------------------
   Shared Google Sheets Form Submission
   -------------------------------------------------------------------------- */
function submitToSheet(form, formType) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.formType = formType;
  data.source = window.location.href;
  
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span>Sending...</span>
    <span class="btn-icon">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    </span>
  `;
  
  function showSuccess() {
    submitBtn.innerHTML = `
      <span>You're In</span>
      <span class="btn-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </span>
    `;
    submitBtn.style.background = '#4ade80';
    form.reset();
    
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      submitBtn.style.background = '';
    }, 3000);
  }
  
  function showError() {
    submitBtn.innerHTML = `
      <span>Try Again</span>
      <span class="btn-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </span>
    `;
    submitBtn.style.background = '#ef4444';
    
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      submitBtn.style.background = '';
    }, 3000);
  }
  
  if (!GSHEET_FORM_URL) {
    console.warn('GSHEET_FORM_URL is not set. Form will not submit to Google Sheets.');
    // Still show success UI until the backend is connected
    setTimeout(showSuccess, 800);
    return;
  }
  
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    params.append(key, value);
  });
  
  fetch(GSHEET_FORM_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  })
  .then(() => showSuccess())
  .catch(() => showError());
}

/* --------------------------------------------------------------------------
   Smooth Scroll for Anchor Links
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Menu Image Lightbox
   -------------------------------------------------------------------------- */
function initMenuLightbox() {
  const lightbox = document.getElementById('menuLightbox');
  if (!lightbox) return;
  
  const lightboxImg = document.getElementById('menuLightboxImg');
  const lightboxCaption = document.getElementById('menuLightboxCaption');
  const closeBtn = lightbox.querySelector('.menu-lightbox-close');
  const triggers = document.querySelectorAll('.js-lightbox-trigger');
  
  if (!triggers.length) return;
  
  function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      openLightbox(trigger.dataset.src, trigger.dataset.caption);
    });
    
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(trigger.dataset.src, trigger.dataset.caption);
      }
    });
  });
  
  closeBtn.addEventListener('click', closeLightbox);
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.closest('.menu-lightbox-content') === null) {
      closeLightbox();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* --------------------------------------------------------------------------
   Hero Load Sequence
   -------------------------------------------------------------------------- */
function initHeroLoad() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  hero.classList.add('hero-load');
}

/* --------------------------------------------------------------------------
   Magnetic Buttons
   -------------------------------------------------------------------------- */
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  
  const buttons = document.querySelectorAll('.btn, .nav-logo');
  
  buttons.forEach(btn => {
    btn.classList.add('btn-magnetic');
    
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.setProperty('--magnetic-x', `${x * 0.2}px`);
      btn.style.setProperty('--magnetic-y', `${y * 0.2}px`);
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--magnetic-x', '0px');
      btn.style.setProperty('--magnetic-y', '0px');
    });
  });
}

/* --------------------------------------------------------------------------
   Parallax Images
   -------------------------------------------------------------------------- */
function initParallax() {
  const parallaxImages = document.querySelectorAll('.parallax-img, .about-image-main img, .about-image-accent img, .feature-card img');
  if (!parallaxImages.length) return;
  
  let ticking = false;
  
  function updateParallax() {
    const scrollY = window.pageYOffset;
    const viewportHeight = window.innerHeight;
    
    parallaxImages.forEach(img => {
      const rect = img.getBoundingClientRect();
      const centerOffset = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
      
      if (rect.top < viewportHeight && rect.bottom > 0) {
        const speed = img.classList.contains('parallax-img') ? 30 : 15;
        img.style.transform = `translateY(${centerOffset * speed}px)`;
      }
    });
    
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
  
  updateParallax();
}

/* --------------------------------------------------------------------------
   Nav Hide/Show on Scroll
   -------------------------------------------------------------------------- */
function initNavHideShow() {
  const nav = document.querySelector('.nav-island');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!nav) return;
  
  let lastScroll = 0;
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScroll = window.pageYOffset;
        const menuOpen = mobileMenu && mobileMenu.classList.contains('open');
        
        if (!menuOpen && currentScroll > lastScroll && currentScroll > 150) {
          nav.classList.add('hidden');
        } else {
          nav.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   Image Reveal on Scroll
   -------------------------------------------------------------------------- */
function initImageReveal() {
  const revealImages = document.querySelectorAll('.img-reveal');
  if (!revealImages.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
  
  revealImages.forEach(img => observer.observe(img));
}

/* --------------------------------------------------------------------------
   Split Text Reveal
   -------------------------------------------------------------------------- */
function initSplitText() {
  const splitElements = document.querySelectorAll('.split-text');
  if (!splitElements.length) return;
  
  splitElements.forEach(el => {
    const text = el.textContent;
    el.innerHTML = text.split(' ').map(word => 
      `<span class="word"><span>${word}</span></span>`
    ).join(' ');
  });
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  splitElements.forEach(el => observer.observe(el));
}


/* --------------------------------------------------------------------------
   Sports Calendar Filters
   -------------------------------------------------------------------------- */
let selectedSport = 'all';
let selectedMonth = 'all';

function filterSport(sport, button) {
  selectedSport = sport;
  const parent = button.closest('.filter-buttons');
  if (parent) {
    parent.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  }
  applyCalendarFilters();
}

function filterMonth(month, button) {
  selectedMonth = month;
  const parent = button.closest('.filter-buttons');
  if (parent) {
    parent.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  }
  applyCalendarFilters();
}

function searchEvents() {
  applyCalendarFilters();
}

function applyCalendarFilters() {
  const searchInput = document.getElementById('calendarSearch');
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  const months = document.querySelectorAll('.month-section');
  const noResults = document.querySelector('.no-results');
  let anyVisible = false;

  months.forEach(monthSection => {
    const monthName = monthSection.classList[1];
    const monthVisible = selectedMonth === 'all' || selectedMonth === monthName;
    let visibleEvents = 0;
    const events = monthSection.querySelectorAll('.event');

    events.forEach(event => {
      const sport = event.dataset.sport || '';
      const text = event.innerText.toLowerCase();
      const sportMatch = selectedSport === 'all' || sport === selectedSport;
      const searchMatch = text.includes(search);

      if (monthVisible && sportMatch && searchMatch) {
        event.style.display = 'grid';
        visibleEvents++;
      } else {
        event.style.display = 'none';
      }
    });

    if (visibleEvents > 0) {
      monthSection.style.display = 'block';
      anyVisible = true;
    } else {
      monthSection.style.display = 'none';
    }
  });

  if (noResults) {
    noResults.style.display = anyVisible ? 'none' : 'block';
  }
}
