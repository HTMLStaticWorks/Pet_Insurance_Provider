/**
 * PAWSURE - MAIN JAVASCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initNavbar();
  initAnimations();
  initCountUp();
  initBackToTop();
});

/* --------------------------------------------------------------------------
   THEME TOGGLE
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggles = document.querySelectorAll('.theme-toggle');
  if (!themeToggles.length) return; // For auth pages where there's no theme toggle

  const htmlEl = document.documentElement;
  
  // Check local storage or prefers-color-scheme
  const savedTheme = localStorage.getItem('pawsure-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
  } else if (prefersDark) {
    htmlEl.setAttribute('data-theme', 'dark');
  } else {
    htmlEl.setAttribute('data-theme', 'light');
  }

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      htmlEl.setAttribute('data-theme', newTheme);
      localStorage.setItem('pawsure-theme', newTheme);
    });
  });
}

/* --------------------------------------------------------------------------
   RTL TOGGLE
   -------------------------------------------------------------------------- */
function initRTL() {
  const rtlToggles = document.querySelectorAll('.rtl-toggle');
  if (!rtlToggles.length) return;

  const htmlEl = document.documentElement;
  
  const savedRTL = localStorage.getItem('pawsure-rtl');
  if (savedRTL === 'true') {
    htmlEl.setAttribute('dir', 'rtl');
  }

  rtlToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      // Temporarily disable transitions to prevent the drawer from sliding across the viewport
      const drawer = document.querySelector('.nav-drawer');
      if (drawer) {
        drawer.style.transition = 'none';
      }

      const isRtl = htmlEl.getAttribute('dir') === 'rtl';
      if (isRtl) {
        htmlEl.removeAttribute('dir');
        localStorage.setItem('pawsure-rtl', 'false');
      } else {
        htmlEl.setAttribute('dir', 'rtl');
        localStorage.setItem('pawsure-rtl', 'true');
      }

      // Force a reflow and restore transition
      if (drawer) {
        drawer.offsetHeight; // trigger reflow
        setTimeout(() => {
          drawer.style.transition = '';
        }, 50);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   NAVBAR & DRAWER
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.nav-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  
  // Sticky Navbar
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
    // Check initial scroll
    if (window.scrollY > 60) navbar.classList.add('scrolled');
  }

  // Drawer Toggle
  if (hamburger && drawer && overlay) {
    const toggleDrawer = () => {
      drawer.classList.toggle('open');
      overlay.classList.toggle('open');
      
      // Morph SVG (Basic implementation: swap classes/icons or let CSS handle rotation)
      const icon = hamburger.querySelector('i') || hamburger.querySelector('svg');
      if (drawer.classList.contains('open')) {
        hamburger.classList.add('is-active');
        // If using Phosphor icons, swap class
        if (icon && icon.classList.contains('ph-list')) {
          icon.classList.remove('ph-list');
          icon.classList.add('ph-x');
        }
      } else {
        hamburger.classList.remove('is-active');
        if (icon && icon.classList.contains('ph-x')) {
          icon.classList.remove('ph-x');
          icon.classList.add('ph-list');
        }
      }
    };

    hamburger.addEventListener('click', toggleDrawer);
    overlay.addEventListener('click', toggleDrawer);

    // Close on close button click
    const closeBtn = drawer.querySelector('.drawer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', toggleDrawer);
    }
    
    // Close on link click
    const drawerLinks = drawer.querySelectorAll('.drawer-link');
    drawerLinks.forEach(link => {
      link.addEventListener('click', toggleDrawer);
    });
  }
}

/* --------------------------------------------------------------------------
   INTERSECTION OBSERVER (ANIMATIONS)
   -------------------------------------------------------------------------- */
function initAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('.fade-up, .stagger-container');
  animatedElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   COUNT-UP ANIMATION
   -------------------------------------------------------------------------- */
function initCountUp() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetValue = parseInt(el.getAttribute('data-count'), 10);
        if (!isNaN(targetValue)) {
          if (prefersReducedMotion) {
            el.innerText = targetValue;
          } else {
            animateValue(el, 0, targetValue, 1200);
          }
        }
        observer.unobserve(el);
      }
    });
  }, observerOptions);

  const counters = document.querySelectorAll('.count-up');
  counters.forEach(counter => observer.observe(counter));
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // easeOut cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    obj.innerHTML = Math.floor(easeProgress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end;
    }
  };
  window.requestAnimationFrame(step);
}

/* --------------------------------------------------------------------------
   BACK TO TOP BUTTON
   -------------------------------------------------------------------------- */
function initBackToTop() {
  // Create back to top button
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to Top');
  btn.innerHTML = '<i class="ph ph-arrow-up"></i>';
  document.body.appendChild(btn);

  // Monitor scroll height
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  // Scroll smoothly back to top
  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
