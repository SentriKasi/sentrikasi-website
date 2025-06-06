// Initialize particles.js with error handling and performance optimizations
const initParticles = () => {
  try {
    if (typeof particlesJS !== 'undefined') {
      // Detect device capabilities
      const isLowPower = window.matchMedia('(prefers-reduced-motion: reduce)').matches || 
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      particlesJS('particles-js', {
        particles: {
          number: { 
            value: isLowPower ? 40 : 80, 
            density: { enable: true, value_area: 800 } 
          },
          color: { value: '#00f5d4' },
          shape: { type: 'circle' },
          opacity: { 
            value: isLowPower ? 0.3 : 0.5, 
            random: true 
          },
          size: { 
            value: isLowPower ? 2 : 3, 
            random: true 
          },
          line_linked: {
            enable: !isLowPower,
            distance: 150,
            color: '#00f5d4',
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: isLowPower ? 1 : 2,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false,
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { 
              enable: !isLowPower, 
              mode: 'repulse' 
            },
            resize: true
          }
        },
        retina_detect: !isLowPower
      });

      // Add resize handler with debounce
      let resizeTimeout;
      window.addEventListener('resize', () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          particlesJS.destroy();
          initParticles();
        }, 250);
      });

    } else {
      console.warn('particles.js not loaded');
    }
  } catch (error) {
    console.error('Error initializing particles.js:', error);
    // Hide particles container if there's an error
    const particlesContainer = document.getElementById('particles-js');
    if (particlesContainer) {
      particlesContainer.style.display = 'none';
    }
  }
};

// Navigation
const initNavigation = () => {
  const toggle = document.getElementById('menu-toggle');
  const closeMenu = document.getElementById('close-menu');
  const sidebar = document.getElementById('sidebar');

  const closeSidebar = () => {
    sidebar.classList.add('translate-x-full');
    document.removeEventListener('keydown', handleEscKey);
  };

  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      closeSidebar();
    }
  };

  toggle?.addEventListener('click', () => {
    sidebar.classList.remove('translate-x-full');
    document.addEventListener('keydown', handleEscKey);
  });

  closeMenu?.addEventListener('click', closeSidebar);

  document.querySelectorAll('#sidebar a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });
};

// Scroll animations with performance optimization
const initScrollAnimations = () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // If reduced motion is preferred, show all elements without animation
    document.querySelectorAll('.reveal').forEach(element => {
      element.classList.add('active');
    });
    return;
  }

  // Initialize GSAP with performance optimizations
  const revealElements = document.querySelectorAll('.reveal');
  gsap.registerPlugin(ScrollTrigger);

  // Create a single ScrollTrigger for better performance
  ScrollTrigger.batch(revealElements, {
    onEnter: batch => gsap.to(batch, {
      autoAlpha: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power2.out'
    }),
    start: 'top 85%',
    once: true
  });

  // Cleanup on page unload
  return () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };
};

// Counter animations
const animateCounters = () => {
  const counters = document.querySelectorAll('.stat-counter');
  counters.forEach(counter => {
    const targetValue = parseInt(counter.textContent);
    const unit = counter.textContent.replace(/[0-9.]/g, '');
    let current = 0;
    const duration = 1500; // Animation duration in ms
    const frameDuration = 1000/60; // 60fps
    const totalFrames = duration/frameDuration;
    const increment = targetValue/totalFrames;
    
    const animation = () => {
      current += increment;
      if (current <= targetValue) {
        counter.textContent = Math.round(current) + unit;
        requestAnimationFrame(animation);
      } else {
        counter.textContent = targetValue + unit;
      }
    };
    
    requestAnimationFrame(animation);
  });
};

// Intersection observers with performance optimizations
const initObservers = () => {
  // Check for IntersectionObserver support and reduced motion preference
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers that don't support IntersectionObserver
    const showAllElements = () => {
      document.querySelectorAll('[data-animate], .reveal').forEach(el => {
        el.classList.add('opacity-100', 'active');
      });
      animateCounters();
    };
    showAllElements();
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Create a single observer for multiple purposes
  const mainObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Get animation type from data attribute
          const el = entry.target;
          const animationType = el.dataset.animate || 'fade';

          switch (animationType) {
            case 'counter':
              if (!prefersReducedMotion) {
                animateCounters();
              }
              break;
            case 'reveal':
              el.classList.add('active');
              break;
            default:
              el.classList.add('opacity-100');
          }

          // Unobserve after animation
          mainObserver.unobserve(el);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  // Batch observe elements for better performance
  const elementsToObserve = [
    ...document.querySelectorAll('[data-animate]'),
    ...document.querySelectorAll('.reveal')
  ];

  const farmingSection = document.getElementById('precision-farming');
  if (farmingSection) {
    farmingSection.dataset.animate = 'counter';
    elementsToObserve.push(farmingSection);
  }

  // Use requestIdleCallback if available, otherwise use setTimeout
  const observeElements = () => {
    elementsToObserve.forEach(el => mainObserver.observe(el));
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(observeElements);
  } else {
    setTimeout(observeElements, 1);
  }
};
};

// Smooth scrolling
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
};

// Parallax effect
const initParallax = () => {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    document.querySelectorAll('.parallax').forEach(element => {
      const speed = element.dataset.speed || 0.5;
      element.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
};

// Initialize everything with performance optimizations
const init = () => {
  // Initialize critical features first
  initNavigation();
  
  // Initialize non-critical features with requestIdleCallback
  const initNonCritical = () => {
    initParticles();
    initScrollAnimations();
    initObservers();
    initSmoothScroll();
    initParallax();
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initNonCritical, { timeout: 2000 });
  } else {
    setTimeout(initNonCritical, 100);
  }

  // Clean up on page unload
  window.addEventListener('unload', () => {
    // Clean up GSAP
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
    // Clean up particles.js
    if (window.pJSDom && window.pJSDom[0]) {
      window.pJSDom[0].pJS.fn.vendors.destroypJS();
    }
  });
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
