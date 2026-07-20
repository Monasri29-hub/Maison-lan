/**
 * Maison Élan - Interactive Editorial Script (Multi-Page Version)
 * Main Logic for Navigation Highlights, Scroll Animations, Filtering, Lightbox, and WhatsApp Reservations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Splash: only on fresh load / reload — never on internal navigation
  initWelcomeLoader();

  // Intercept internal links so they set the nav flag + fade out gracefully
  initInternalNavLinks();

  // Lightweight entrance fade when arriving via internal navigation
  initPageEntrance();

  // Initialize all modules
  initActiveNavigation();
  initScrollEffects();
  initMobileMenu();
  initScrollReveal();
  initMenuFilter();
  initGalleryLightbox();
  initWhatsAppReservationForm();
  initNewsletterForm();
  initMockMapZoom();
  initTimelineJourney();
  initMenuSlideshow();
  initConciergeStatus();
  initContactSlideshow();
  initMarqueeGallery();
});

/**
 * 1. Dynamic Active Link Highlight based on current path
 */
function initActiveNavigation() {
  let currentPath = window.location.pathname.split('/').pop();
  if (currentPath === '' || currentPath === undefined) {
    currentPath = 'index.html';
  }
  
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * 2. Scroll Progress Bar & Sticky Header
 */
function initScrollEffects() {
  const scrollProgress = document.getElementById('scrollProgress');
  const siteHeader = document.getElementById('siteHeader');
  const premiumCTABgs = document.querySelectorAll('.reserve-premium-bg');
  
  function handleScroll() {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    
    // Progress Bar
    if (scrollProgress) {
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      scrollProgress.style.width = `${scrolled}%`;
    }
    
    // Sticky Header
    if (siteHeader) {
      if (winScroll > 50) {
        siteHeader.classList.add('scrolled');
      } else {
        // Only remove scrolled style if on homepage and near top
        let currentPath = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPath === 'index.html') {
          siteHeader.classList.remove('scrolled');
        }
      }
    }

    // Parallax background for CTA
    if (premiumCTABgs.length > 0) {
      premiumCTABgs.forEach(bg => {
        const rect = bg.parentElement.getBoundingClientRect();
        const winHeight = window.innerHeight;
        if (rect.top < winHeight && rect.bottom > 0) {
          const scrollRange = rect.height + winHeight;
          const scrolledDistance = winHeight - rect.top;
          const scrollPercent = scrolledDistance / scrollRange;
          
          // Move from -12% to 0%
          const yOffset = -12 + (scrollPercent * 12);
          bg.style.transform = `translate3d(0, ${yOffset}%, 0) scale(1.05)`;
        }
      });
    }

    // Parallax scroll behind for Menu slideshow
    const menuSlideshow = document.querySelector('.menu-slideshow-container');
    if (menuSlideshow) {
      const rect = menuSlideshow.parentElement.getBoundingClientRect();
      const winHeight = window.innerHeight;
      if (rect.top < winHeight && rect.bottom > 0) {
        const scrollRange = rect.height + winHeight;
        const scrolledDistance = winHeight - rect.top;
        const scrollPercent = scrolledDistance / scrollRange;
        
        // Move from -15% to 0%
        const yOffset = -15 + (scrollPercent * 15);
        menuSlideshow.style.transform = `translate3d(0, ${yOffset}%, 0)`;
      }
    }
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial run
}

/**
 * 3. Mobile Burger Menu & Overlay Navigation
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileNavOverlay = document.getElementById('mobileNavOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  
  if (!menuToggle || !mobileNavOverlay) return;

  function toggleMenu() {
    const isOpen = mobileNavOverlay.classList.contains('open');
    if (isOpen) {
      mobileNavOverlay.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = ''; // restore scroll
    } else {
      mobileNavOverlay.classList.add('open');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // prevent scroll
    }
  }

  menuToggle.addEventListener('click', toggleMenu);

  // Close menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNavOverlay.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/**
 * 4. Scroll Reveal Animations (Intersection Observer)
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -5% 0px',
    threshold: 0.08 // trigger when 8% of element is visible
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-delay') || '0', 10);

        // For editorial gallery items, set the CSS delay variable immediately
        // so the clip-path transition uses it as its delay prop
        if (el.classList.contains('gallery-editorial-reveal')) {
          el.style.setProperty('--reveal-delay', `${delay}ms`);
          // Small rAF pause ensures the CSS var is committed before class fires
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.classList.add('revealed');
            });
          });
        } else {
          setTimeout(() => {
            el.classList.add('revealed');
          }, delay);
        }

        obs.unobserve(el);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/**
 * 5. Premium Menu Category Filtering & Live Search Engine
 */
function initMenuFilter() {
  const tabs = document.querySelectorAll('.menu-tab-btn');
  const grid = document.getElementById('menuGridPremium');
  const searchInput = document.getElementById('menuSearchInput');
  const track = document.getElementById('categoryTabsTrack');
  const btnLeft = document.getElementById('btnSlideLeft');
  const btnRight = document.getElementById('btnSlideRight');

  if (!grid) return;

  const cards = grid.querySelectorAll('.menu-card-premium');
  
  // Banner elements
  const heroBanner = document.getElementById('categoryHeroBanner');
  const heroBg = document.getElementById('categoryHeroBg');
  const heroSubtitle = document.getElementById('categoryHeroSubtitle');
  const heroTitle = document.getElementById('categoryHeroTitle');
  const heroDesc = document.getElementById('categoryHeroDesc');

  let activeCategory = 'all';
  let searchQuery = '';

  const categoryDetails = {
    all: {
      subtitle: "Maison Élan Classics",
      title: "Complete Culinary Catalog",
      desc: "Explore our full selection of artisan viennoiserie, gourmet desserts, premium coffee brews, and savory house specials.",
      bg: "assets/experience_patisserie.jpg"
    },
    pastries: {
      subtitle: "Viennoiserie & Baked Craft",
      title: "Signature Pastries",
      desc: "Flaky laminated doughs, twice-baked golden croissants, and delicate cream tarts prepared daily at dawn by our pastry chefs.",
      bg: "assets/experience_patisserie.jpg"
    },
    desserts: {
      subtitle: "Gourmet Confectionery",
      title: "Artisan Desserts",
      desc: "Indulgent multi-layered cakes, espresso-soaked classics, and premium dessert collections made with Callebaut chocolate.",
      bg: "assets/story_bg.jpg"
    },
    beverages: {
      subtitle: "Master Brewers",
      title: "Signature Beverages",
      desc: "Rich melted dark chocolate, single-origin hand-poured arabica roasts, and cold-pressed botanical mocktails.",
      bg: "assets/experience_beverages.jpg"
    },
    savory: {
      subtitle: "Evening Salon Craft",
      title: "Savory Collection",
      desc: "Hand-stretched truffle pizzas, fresh-rolled pecorino pasta, and slow pan-seared chef savory creations.",
      bg: "assets/experience_savory.jpg"
    }
  };

  function updateMenuFiltering() {
    cards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      const title = card.querySelector('.menu-card-title').textContent.toLowerCase();
      const desc = card.querySelector('.menu-card-desc').textContent.toLowerCase();
      
      const matchesCategory = (activeCategory === 'all' || cardCat === activeCategory);
      const matchesSearch = (title.includes(searchQuery) || desc.includes(searchQuery));

      if (matchesCategory && matchesSearch) {
        card.classList.remove('filtered-out');
        card.classList.add('revealed'); // Instantly make visible in search/filter results
      } else {
        card.classList.add('filtered-out');
      }
    });
  }

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      activeCategory = tab.getAttribute('data-category');

      // Animate banner change
      if (heroBanner && categoryDetails[activeCategory]) {
        heroBanner.style.opacity = '0.3';
        heroBanner.style.transform = 'translateY(8px)';
        heroBanner.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

        setTimeout(() => {
          const info = categoryDetails[activeCategory];
          if (heroBg) heroBg.style.backgroundImage = `url('${info.bg}')`;
          if (heroSubtitle) heroSubtitle.textContent = info.subtitle;
          if (heroTitle) heroTitle.textContent = info.title;
          if (heroDesc) heroDesc.textContent = info.desc;
          
          heroBanner.style.opacity = '1';
          heroBanner.style.transform = 'translateY(0)';
        }, 400);
      }

      // Animate grid change
      grid.style.opacity = '0';
      grid.style.transform = 'translateY(10px)';
      grid.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

      setTimeout(() => {
        updateMenuFiltering();
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
      }, 400);
    });
  });

  // Search input binding
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      updateMenuFiltering();
    });
  }

  // Scroll arrows
  if (btnLeft && track) {
    btnLeft.addEventListener('click', () => {
      track.scrollBy({ left: -200, behavior: 'smooth' });
    });
  }

  if (btnRight && track) {
    btnRight.addEventListener('click', () => {
      track.scrollBy({ left: 200, behavior: 'smooth' });
    });
  }
}

/**
 * 6. Interactive Atmospheric Gallery Lightbox
 */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  
  if (!lightbox || galleryItems.length === 0) return;

  let currentIndex = 0;
  const imagesData = [];

  // Parse gallery items into data array
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('.gallery-img');
    imagesData.push({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      title: item.getAttribute('data-title') || 'Maison Élan Atmosphere',
      desc: item.getAttribute('data-desc') || ''
    });

    // Add click handler to item
    item.addEventListener('click', (e) => {
      // Prevent zoom if clicking details unless zoom button is specifically targeted
      e.preventDefault();
      openLightbox(index);
    });
  });

  function openLightbox(index) {
    currentIndex = index;
    updateLightboxContent();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateLightboxContent() {
    const data = imagesData[currentIndex];
    lightboxImg.setAttribute('src', data.src);
    lightboxImg.setAttribute('alt', data.alt);
    lightboxTitle.textContent = data.title;
    lightboxDesc.textContent = data.desc;
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % imagesData.length;
    updateLightboxContent();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + imagesData.length) % imagesData.length;
    updateLightboxContent();
  }

  // Event Listeners
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', showNext);
  lightboxPrev.addEventListener('click', showPrev);

  // Close when clicking outside content box
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}

/**
 * 7. Premium Reservation Form Redirecting to WhatsApp (Step-by-Step Flow)
 */
function initWhatsAppReservationForm() {
  const form = document.getElementById('waReservationForm');
  const modal = document.getElementById('waConfirmationModal');
  if (!form || !modal) return;

  const btnConfirmSent = document.getElementById('btnConfirmSent');
  const btnCancelBooking = document.getElementById('btnCancelBooking');
  const btnCloseConfirmModal = document.getElementById('btnCloseConfirmModal');
  const stepAwaiting = document.getElementById('confirmStepAwaiting');
  const stepSuccess = document.getElementById('confirmStepSuccess');

  // Summary elements
  const summaryName = document.getElementById('summaryName');
  const summaryDate = document.getElementById('summaryDate');
  const summaryTime = document.getElementById('summaryTime');
  const summaryGuests = document.getElementById('summaryGuests');
  const summaryNotes = document.getElementById('summaryNotes');

  // Set min date to today
  const dateInput = document.getElementById('resDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Intercept any direct static wa.me links on the page (like nav or CTAs) and use the blank structured template
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const blankMsg = "Hello Maison Élan, I would like to reserve a table.\n\nName: \nDate: \nTime: \nNumber of Guests: \nSpecial Requests: ";
      const whatsappUrl = `https://wa.me/919441424667?text=${encodeURIComponent(blankMsg)}`;
      window.open(whatsappUrl, '_blank');
    });
  });

  // Validation helper
  function validateInput(input, errorEl) {
    let isValid = true;
    if (input.required && !input.value.trim()) {
      isValid = false;
    } else if (input.type === 'email' && input.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(input.value.trim());
    } else if (input.type === 'tel' && input.value.trim()) {
      const phoneRegex = /^[+]?[0-9\s-]{10,15}$/;
      isValid = phoneRegex.test(input.value.trim().replace(/\s/g, ''));
    }

    if (!isValid) {
      input.classList.add('invalid');
      if (errorEl) errorEl.classList.add('visible');
    } else {
      input.classList.remove('invalid');
      if (errorEl) errorEl.classList.remove('visible');
    }
    return isValid;
  }

  // Temporary storage for summary during redirect
  let currentBooking = null;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('resName');
    const phone = document.getElementById('resPhone');
    const email = document.getElementById('resEmail');
    const guests = document.getElementById('resGuests');
    const date = document.getElementById('resDate');
    const time = document.getElementById('resTime');
    const notes = document.getElementById('resNotes');

    const nameErr = document.getElementById('nameError');
    const phoneErr = document.getElementById('phoneError');
    const emailErr = document.getElementById('emailError');
    const guestsErr = document.getElementById('guestsError');
    const dateErr = document.getElementById('dateError');
    const timeErr = document.getElementById('timeError');

    const isNameVal = validateInput(name, nameErr);
    const isPhoneVal = validateInput(phone, phoneErr);
    const isEmailVal = validateInput(email, emailErr);
    const isGuestsVal = validateInput(guests, guestsErr);
    const isDateVal = validateInput(date, dateErr);
    const isTimeVal = validateInput(time, timeErr);

    const isFormValid = isNameVal && isPhoneVal && isEmailVal && isGuestsVal && isDateVal && isTimeVal;

    if (isFormValid) {
      // Store current booking data
      const dateObj = new Date(date.value);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      const timeText = time.options[time.selectedIndex].text;
      const guestsCount = guests.value === '1' ? '1 Guest' : `${guests.value} Guests`;
      const notesVal = notes.value.trim() || 'None';

      currentBooking = {
        name: name.value.trim(),
        date: formattedDate,
        time: timeText,
        guests: guestsCount,
        notes: notesVal
      };

      // Construct pre-filled WhatsApp message matching the template
      const templateMsg = `Hello Maison Élan, I would like to reserve a table.\n\nName: ${currentBooking.name}\nDate: ${currentBooking.date}\nTime: ${currentBooking.time}\nNumber of Guests: ${currentBooking.guests}\nSpecial Requests: ${currentBooking.notes}`;
      
      const whatsappUrl = `https://wa.me/919441424667?text=${encodeURIComponent(templateMsg)}`;
      
      // Open in WhatsApp new tab
      window.open(whatsappUrl, '_blank');

      // Set up the modal overlay step 1 (Awaiting confirmation)
      stepAwaiting.style.display = 'block';
      stepSuccess.style.display = 'none';
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });

  // Action: Confirm sent message
  if (btnConfirmSent) {
    btnConfirmSent.addEventListener('click', () => {
      if (currentBooking) {
        // Populate the summary screen
        summaryName.textContent = currentBooking.name;
        summaryDate.textContent = currentBooking.date;
        summaryTime.textContent = currentBooking.time;
        summaryGuests.textContent = currentBooking.guests;
        summaryNotes.textContent = currentBooking.notes;
      }
      
      // Transition to final success step
      stepAwaiting.style.display = 'none';
      stepSuccess.style.display = 'block';
      
      // Reset form fields
      form.reset();
    });
  }

  // Action: Cancel & Edit info
  if (btnCancelBooking) {
    btnCancelBooking.addEventListener('click', () => {
      // Hide modal, keep form data intact for modifications
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Action: Close final success modal
  if (btnCloseConfirmModal) {
    btnCloseConfirmModal.addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      currentBooking = null;
    });
  }
}

/**
 * 8. Footer Newsletter Subscription
 */
function initNewsletterForm() {
  const form = document.getElementById('subscribeForm');
  const successText = document.getElementById('subscribeSuccess');
  
  if (!form || !successText) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.form-control-subscribe');
    
    if (input && input.value.trim()) {
      successText.classList.add('visible');
      input.value = ''; // clear input
      
      setTimeout(() => {
        successText.classList.remove('visible');
      }, 5000);
    }
  });
}

/**
 * 9. Mock Map Zoom Interaction
 */
function initMockMapZoom() {
  const mapContainer = document.querySelector('.styled-map-container');
  const zoomInBtn = document.querySelector('.map-controls .map-control-btn:first-child');
  const zoomOutBtn = document.querySelector('.map-controls .map-control-btn:last-child');
  
  if (!mapContainer || !zoomInBtn || !zoomOutBtn) return;

  const mapGrid = mapContainer.querySelector('.map-grid-pattern');
  const roads = mapContainer.querySelectorAll('.map-road');
  const landmarks = mapContainer.querySelectorAll('.map-landmark');
  
  let currentZoom = 1;

  function setZoom(factor) {
    currentZoom = factor;
    if (mapGrid) mapGrid.style.transform = `scale(${currentZoom})`;
    roads.forEach(road => {
      if (road.classList.contains('road-horizontal')) {
        road.style.transform = `translateY(-50%) scaleY(${currentZoom})`;
      } else if (road.classList.contains('road-vertical')) {
        road.style.transform = `scaleX(${currentZoom})`;
      } else if (road.classList.contains('road-angled')) {
        road.style.transform = `rotate(-15deg) scale(${currentZoom})`;
      }
    });

    landmarks.forEach(landmark => {
      landmark.style.transform = `scale(${1 / currentZoom + 0.2})`;
    });
  }

  zoomInBtn.addEventListener('click', () => {
    if (currentZoom < 1.4) {
      setZoom(currentZoom + 0.1);
    }
  });

  zoomOutBtn.addEventListener('click', () => {
    if (currentZoom > 0.8) {
      setZoom(currentZoom - 0.1);
    }
  });
}

/**
 * 10. Immersive Vertical Storytelling Timeline
 */
function initTimelineJourney() {
  const container = document.querySelector('.timeline-container');
  const fillLine = document.getElementById('timelineLineFill');
  const rows = document.querySelectorAll('.timeline-row');

  if (!container || !fillLine) return;

  function updateTimeline() {
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Calculate progress of the line drawing
    // Start drawing when the timeline top enters the viewport (e.g. at 85% viewport height)
    const startOffset = viewportHeight * 0.85;
    const elementTop = rect.top;
    const elementHeight = rect.height;

    // Total distance of scrolling range
    const totalDistance = elementHeight;
    // Current relative scroll position inside the element
    const relativeProgress = startOffset - elementTop;

    let progressPercent = (relativeProgress / totalDistance) * 100;
    progressPercent = Math.min(Math.max(progressPercent, 0), 100);

    fillLine.style.height = `${progressPercent}%`;

    // Highlight timeline nodes as the scroll progress passes them
    rows.forEach(row => {
      const node = row.querySelector('.timeline-node');
      if (node) {
        const nodeRect = node.getBoundingClientRect();
        // If the center of the node is above 60% of the viewport height, activate it
        if (nodeRect.top < viewportHeight * 0.6) {
          node.classList.add('active');
        } else {
          node.classList.remove('active');
        }
      }
    });
  }

  // Bind to scroll and resize events
  window.addEventListener('scroll', updateTimeline);
  window.addEventListener('resize', updateTimeline);
  updateTimeline(); // Initial run
}

/**
 * 11. Premium Menu Header Slideshow Cycle
 */
function initMenuSlideshow() {
  const slides = document.querySelectorAll('.menu-slide-bg');
  if (slides.length <= 1) return;

  let currentSlide = 0;
  setInterval(() => {
    // Fade out current
    slides[currentSlide].classList.remove('active');
    // Index step
    currentSlide = (currentSlide + 1) % slides.length;
    // Fade in next
    slides[currentSlide].classList.add('active');
  }, 4000); // cycle every 4 seconds
}

/**
 * 12. Real-time Hyderabad Concierge Status Board
 */
function initConciergeStatus() {
  const statusDot = document.getElementById('statusDot');
  const statusLabel = document.getElementById('statusLabel');
  const statusTime = document.getElementById('statusTime');
  const statusEvent = document.getElementById('statusEvent');

  if (!statusTime) return;

  function updateStatus() {
    // Get current date/time adjusted to India Standard Time (IST)
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      hourCycle: 'h12'
    };
    
    const now = new Date();
    const hydTimeStr = now.toLocaleTimeString('en-US', options);
    statusTime.textContent = hydTimeStr;

    // Get current hour in IST
    const istHourStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false });
    const istMinStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', minute: '2-digit' });
    
    const hour = parseInt(istHourStr, 10);
    const minute = parseInt(istMinStr, 10);
    const timeValue = hour + (minute / 60);

    // Salon hours: 11:00 AM to 11:00 PM (11 to 23)
    const isOpen = (timeValue >= 11 && timeValue < 23);
    
    // High Tea: 3:30 PM to 6:00 PM (15.5 to 18)
    const isHighTea = (timeValue >= 15.5 && timeValue < 18);

    if (isOpen) {
      statusDot.className = 'status-dot-pulse open';
      if (isHighTea) {
        statusLabel.textContent = "Open • Serving Afternoon High Tea";
        statusEvent.textContent = "Afternoon High Tea served right now at Jubilee Hills salon.";
      } else {
        statusLabel.textContent = "Open • Welcoming Guests";
        statusEvent.textContent = "Drop in to experience slow dining or artisan baked goods.";
      }
    } else {
      statusDot.className = 'status-dot-pulse closed';
      statusLabel.textContent = "Closed • Reopens at 11:00 AM";
      statusEvent.textContent = "Our team is preparing at dawn. Connect via reservations above.";
    }
  }

  updateStatus();
  setInterval(updateStatus, 30000); // Update every 30 seconds
}

/**
 * 13. Atmospheric Contact Page Background Slideshow Cycle
 */
function initContactSlideshow() {
  const slides = document.querySelectorAll('.contact-slide-bg');
  if (slides.length <= 1) return;

  let currentSlide = 0;
  setInterval(() => {
    // Fade out current
    slides[currentSlide].classList.remove('active');
    // Index step
    currentSlide = (currentSlide + 1) % slides.length;
    // Fade in next
    slides[currentSlide].classList.add('active');
  }, 5000); // cycle background every 5 seconds
}

/**
 * 15. Premium Luxury Welcome Splash Screen
 *
 * Shows ONLY on:
 *   • First visit in a session (sessionStorage flag absent)
 *   • Hard reload / browser refresh  (navigation type === 'reload')
 *
 * Skipped entirely during internal page-to-page navigation.
 */
function initWelcomeLoader() {
  const loader = document.getElementById('luxuryLoader');
  if (!loader) return;

  // ── Detect navigation type ──────────────────────────────────────────
  // Check whether the user arrived here via an internal link click.
  // initInternalNavLinks() sets this flag before every internal navigation.
  const arrivedViaInternalNav = sessionStorage.getItem('maisonInternalNav') === '1';

  // Also read the Performance Navigation API (reload = type 'reload').
  let navType = 'navigate';
  try {
    const perfNav = performance.getEntriesByType('navigation')[0];
    if (perfNav) navType = perfNav.type; // 'navigate' | 'reload' | 'back_forward'
  } catch (_) {}

  if (arrivedViaInternalNav) {
    // ── Internal navigation: remove flag, skip splash immediately ──
    sessionStorage.removeItem('maisonInternalNav');
    loader.remove();
    return;
  }

  // ── Fresh load or reload: play the full luxury intro ──────────────
  // Lock scroll during the splash
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    loader.classList.add('fade-out');
    document.body.style.overflow = '';

    setTimeout(() => {
      loader.remove();
    }, 1800); // matches CSS transition: opacity 1.6s
  }, 3000); // 3 s — all intro animations settle by ~2.5 s
}

/**
 * 16. Internal Navigation Interceptor
 *
 * Before following any internal link, we:
 *   1. Set the sessionStorage flag so the target page knows to skip the splash.
 *   2. Fade the current page out for a smooth, premium transition.
 */
function initInternalNavLinks() {
  // Pages that belong to this site
  const internalPages = ['index.html', 'menu.html', 'gallery.html', 'story.html', 'contact.html', ''];

  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') ||
        anchor.target === '_blank') return;

    // Determine if this href points to an internal HTML page
    const filename = href.split('/').pop().split('?')[0].split('#')[0];
    if (!internalPages.includes(filename)) return;

    // Mark that the upcoming load is an internal navigation
    sessionStorage.setItem('maisonInternalNav', '1');

    // Fade the body out before navigating
    e.preventDefault();
    document.body.classList.add('page-exit');

    setTimeout(() => {
      window.location.href = href;
    }, 320); // matches --page-exit duration below
  });
}

/**
 * 17. Page Entrance Animation (internal nav only)
 *
 * When arriving via an internal link the splash is skipped, so we
 * play a lightweight fade-in on the body instead.
 */
function initPageEntrance() {
  const arrivedViaInternalNav = sessionStorage.getItem('maisonInternalNav') === '1';
  if (!arrivedViaInternalNav) return;

  // Body starts invisible (set by .page-enter class in CSS)
  document.body.classList.add('page-enter');

  // Trigger reflow so the browser registers the starting opacity
  void document.body.offsetHeight;

  // Fade in
  requestAnimationFrame(() => {
    document.body.classList.remove('page-enter');
    document.body.classList.add('page-entering');
  });
}

/**
 * 18. Three-Column Infinite Vertical Marquee Gallery
 *
 * Each .marquee-track contains 2 identical sets of images (8 total = 4 + 4).
 * The loop works by scrolling exactly one "half" of the total track height,
 * then snapping back silently — creating a seamless infinite scroll.
 *
 * UP columns   → translateY goes 0 → -half, then snaps to 0
 * DOWN columns → translateY goes -half → 0, then snaps to -half
 *
 * Hover pauses that column; resumes after 300 ms mouse-leave delay.
 */
function initMarqueeGallery() {
  const stage = document.querySelector('.marquee-gallery-stage');
  if (!stage) return;

  const cols = stage.querySelectorAll('.marquee-col');
  if (!cols.length) return;

  // px per second — reduced on mobile for comfort
  const SPEED_DESKTOP = 42;
  const SPEED_MOBILE  = 28;

  function speed() {
    return window.matchMedia('(max-width: 580px)').matches
      ? SPEED_MOBILE
      : SPEED_DESKTOP;
  }

  cols.forEach((col, colIndex) => {
    const track = col.querySelector('.marquee-track');
    if (!track) return;

    const goUp = col.dataset.direction === 'up';

    let pos      = 0;
    let paused   = false;
    let lastTime = null;
    let rafId    = null;

    // Wait one frame so the browser has laid out the track and scrollHeight is real
    requestAnimationFrame(() => {
      const half = track.scrollHeight / 2;

      // Starting position:
      // • UP   → start at 0, scroll toward -half
      // • DOWN → start at -half, scroll toward 0 (images appear to fall downward)
      pos = goUp ? 0 : -half;
      track.style.transform = `translateY(${pos}px)`;

      function tick(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const dt   = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50 ms
        lastTime   = timestamp;

        if (!paused) {
          const px = speed() * dt;

          if (goUp) {
            // Move content upward: pos decreases
            pos -= px;
            const half = track.scrollHeight / 2;
            if (pos <= -half) pos += half;   // seamless snap back to 0 region
          } else {
            // Move content downward: pos increases (toward 0)
            pos += px;
            const half = track.scrollHeight / 2;
            if (pos >= 0) pos -= half;       // seamless snap back to -half region
          }

          track.style.transform = `translateY(${pos}px)`;
        }

        rafId = requestAnimationFrame(tick);
      }

      // Stagger column start slightly so they feel independent
      setTimeout(() => {
        lastTime = null;
        rafId = requestAnimationFrame(tick);
      }, colIndex * 150);
    });

    // Pause/resume on hover
    col.querySelectorAll('.marquee-item').forEach(item => {
      item.addEventListener('mouseenter', () => { paused = true; });
      item.addEventListener('mouseleave', () => {
        setTimeout(() => { paused = false; }, 300);
      });
    });
  });
}
