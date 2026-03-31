window.loadVideo = function() {
  const wrapper = document.getElementById('videoWrapper');
  if (wrapper.classList.contains('loaded')) return;
  wrapper.classList.add('loaded', 'hidden');
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
  iframe.title = 'witbaynaturals Product Demo';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  wrapper.appendChild(iframe);
}

document.addEventListener('DOMContentLoaded', function() {
  const progressBar = document.getElementById('scrollProgress');
  const navLinks = document.querySelectorAll('.nav-links a');
  const pageNavLinks = document.querySelectorAll('.page-nav a');
  const sections = document.querySelectorAll('section[id]');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPopup = document.getElementById('settingsPopup');
  const fontToggle = document.getElementById('fontToggle');
  const htmlEl = document.documentElement;

  window.addEventListener('scroll', function() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';

    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (scrollTop >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });

    pageNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  const lazyImages = document.querySelectorAll('.lazy-image');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('loaded');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '50px' });

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    lazyImages.forEach(img => img.classList.add('loaded'));
  }

  const slider = document.querySelector('.before-after-slider');
  if (slider) {
    const handle = slider.querySelector('.slider-handle');
    const afterImage = slider.querySelector('.after-image');

    let isDragging = false;

    const updateSlider = (x) => {
      const rect = slider.getBoundingClientRect();
      let percent = ((x - rect.left) / rect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));
      handle.style.left = percent + '%';
      afterImage.style.clipPath = 'inset(0 ' + (100 - percent) + '% 0 0)';
    };

    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        updateSlider(e.clientX);
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    handle.addEventListener('touchstart', (e) => {
      isDragging = true;
    });

    document.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        updateSlider(e.touches[0].clientX);
      }
    });

    document.addEventListener('touchend', () => {
      isDragging = false;
    });

    slider.addEventListener('click', (e) => {
      updateSlider(e.clientX);
    });
  }

  const form = document.getElementById('contactForm');
  const formTimestamp = document.getElementById('formTimestamp');
  const formNonce = document.getElementById('formNonce');
  const formStatus = document.getElementById('formStatus');

  if (formTimestamp) {
    formTimestamp.value = Date.now().toString();
  }
  if (formNonce) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    formNonce.value = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const statusEl = document.getElementById('formStatus');
      const honeypot = form.querySelector('input[name="website"]');
      const tsField = form.querySelector('input[name="_timestamp"]');
      const nonceField = form.querySelector('input[name="_nonce"]');
      const timestamp = parseInt(tsField?.value || '0');
      const timeDiff = Date.now() - timestamp;

      if (honeypot?.value) {
        return;
      }

      if (timeDiff < 3000) {
        statusEl.className = 'form-status error';
        statusEl.textContent = 'Please take your time filling out the form.';
        statusEl.style.display = 'block';
        return;
      }

      statusEl.className = 'form-status sending';
      statusEl.textContent = 'Sending...';
      statusEl.style.display = 'block';

      const formData = new FormData(form);
      formData.delete('website');
      formData.delete('_timestamp');
      formData.delete('_nonce');

      try {
        await fetch(form.action || '#', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        statusEl.className = 'form-status success';
        statusEl.textContent = 'Thank you! Your message has been sent. We will reply within 1 business day.';
        form.reset();
        if (formNonce) {
          const array = new Uint8Array(16);
          crypto.getRandomValues(array);
          formNonce.value = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
        }
      } catch (error) {
        statusEl.className = 'form-status error';
        statusEl.textContent = 'Something went wrong. Please try again or email us directly.';
      }
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  // Font toggle
  const storedFonts = localStorage.getItem('witbaynaturals_fonts');
  console.log('Font toggle element:', fontToggle);
  console.log('Stored fonts preference:', storedFonts);

  function loadGoogleFonts() {
    if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Cormorant+Garamond:wght@300;400;600&display=swap';
      document.head.appendChild(link);
    }
  }

  function applyFonts(useCustom) {
    if (useCustom) {
      htmlEl.setAttribute('data-fonts', 'custom');
      loadGoogleFonts();
    } else {
      htmlEl.removeAttribute('data-fonts');
    }
    localStorage.setItem('witbaynaturals_fonts', useCustom ? 'custom' : 'system');
  }

  // Initialize from stored preference or checkbox state
  if (storedFonts) {
    applyFonts(storedFonts === 'custom');
    if (fontToggle) fontToggle.checked = storedFonts === 'custom';
  }

  if (fontToggle) {
    fontToggle.addEventListener('change', function(e) {
      e.stopPropagation();
      applyFonts(this.checked);
    });
  }

  // Settings popup
  if (settingsBtn && settingsPopup) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsPopup.classList.toggle('open');
    });

    settingsPopup.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.addEventListener('click', (e) => {
      if (!settingsPopup.contains(e.target) && e.target !== settingsBtn) {
        settingsPopup.classList.remove('open');
      }
    });
  }
});
