/* app.js */
document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  /* ====================== MY INFO PAGE ====================== */
if (document.body.classList.contains('page-info')) {
  // Left arrow on My Info should go to DIGITAL (then you can keep going left on index)
  const leftAnchor = document.querySelector('.to-pictures');
  if (leftAnchor) leftAnchor.setAttribute('href', 'index.html#digital');

  // Keyboard ← from My Info goes to DIGITAL first
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') window.location.href = 'index.html#digital';
  });

  return; // Skip the index logic
}

  /* ====================== INDEX PAGE ONLY ====================== */
  const videoSection = document.getElementById('feature-video');
  const gallery = document.getElementById('gallery');
  const toRight = document.querySelector('.to-gallery');
  const toLeft = document.querySelector('.to-video');
  const videoEl = document.getElementById('reel');
  const tabsList = document.querySelector('.header-nav .tabs');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Filters shown in the UI (SELECTION replaces ALL)
  const filters = ['selection', 'tvdocs', 'institucional', 'digital'];
  let currentFilter = 'selection';

  // Map UI filters to data tags
  const resolveFilter = (f) => {
    if (f === 'selection') return 'all';        // curated “all”
    if (f === 'tvdocs') return 'corporate';     // reuse existing corporate-tagged items
    return f;
  };

  const isGalleryVisible = () => !gallery.classList.contains('is-hidden');

  function keepScrollPosition(run) {
    const y = window.scrollY;
    run();
    requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'auto' }));
  }

  function collapseSection(el, onDone) {
    if (prefersReduced) {
      el.classList.add('is-display-none');
      onDone?.();
      return;
    }
    el.classList.remove('is-display-none');
    el.style.maxHeight = el.scrollHeight + 'px';
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';
    void el.offsetHeight;
    el.style.maxHeight = '0px';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.98)';
    const handler = (e) => {
      if (e.propertyName !== 'max-height') return;
      el.removeEventListener('transitionend', handler);
      el.classList.add('is-display-none');
      el.style.maxHeight = el.style.opacity = el.style.transform = '';
      onDone?.();
    };
    el.addEventListener('transitionend', handler);
  }

  function expandSection(el, onDone) {
    if (prefersReduced) {
      el.classList.remove('is-display-none');
      onDone?.();
      return;
    }
    el.classList.remove('is-display-none');
    el.style.maxHeight = '0px';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.98)';
    void el.offsetHeight;
    el.style.maxHeight = el.scrollHeight + 'px';
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';
    const handler = (e) => {
      if (e.propertyName !== 'max-height') return;
      el.removeEventListener('transitionend', handler);
      el.style.maxHeight = el.style.opacity = el.style.transform = '';
      onDone?.();
    };
    el.addEventListener('transitionend', handler);
  }

  function showGalleryAndSet(filter = 'selection') {
    keepScrollPosition(() => {
      if (videoEl && !videoEl.paused) videoEl.pause();
      collapseSection(videoSection, () => {
        gallery.classList.remove('is-hidden');
        toLeft?.classList.remove('is-hidden');
        applyFilter(filter);
        requestAnimationFrame(() => toRight?.classList.remove('is-hidden'));
      });
    });
  }

  function showVideo() {
    keepScrollPosition(() => {
      gallery.classList.add('is-hidden');
      expandSection(videoSection, () => {
        toLeft?.classList.add('is-hidden');
        toRight?.classList.remove('is-hidden');
      });
    });
  }

  /* =================== Gallery data (with modal fields) =================== */
  window.galleryData = [
    {
      src: 'https://picsum.photos/seed/corp1/1200/800',
      alt: 'Corporate shoot 1',
      tags: ['corporate'],
      title: 'Corporate — Logistics Launch',
      video: 'assets/videos/corp1.mp4',
      description: 'Launch piece for a logistics brand; fast-paced edit with handheld natural light.'
    },
    {
      src: 'https://picsum.photos/seed/corp2/1200/800',
      alt: 'Corporate shoot 2',
      tags: ['corporate'],
      title: 'Corporate — Annual Report Film',
      video: 'https://player.vimeo.com/video/76979871?h=9b9d5f',
      description: 'Board-facing film across three sites; clean compositions and restrained grade.'
    },
    {
      src: 'https://picsum.photos/seed/inst1/1200/800',
      alt: 'Institutional film 1',
      tags: ['institucional'],
      title: 'Institutional — Heritage Program',
      video: 'assets/videos/inst1.mp4',
      description: 'Short documentary blending archival footage with present-day process.'
    },
    {
      src: 'https://picsum.photos/seed/inst2/1200/800',
      alt: 'Institutional film 2',
      tags: ['institucional'],
      title: 'Institutional — Community Spotlight',
      video: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
      description: 'Portrait of a community initiative; intimate camera, minimal crew footprint.'
    },
    {
      src: 'https://picsum.photos/seed/digi1/1200/800',
      alt: 'Digital ad 1',
      tags: ['digital'],
      title: 'Digital — Performance Spot A/B',
      video: 'assets/videos/digi1.mp4',
      description: 'Performance-led digital spot built for rapid iteration and multi-ratio delivery.'
    },
    {
      src: 'https://picsum.photos/seed/digi2/1200/800',
      alt: 'Digital ad 2',
      tags: ['digital'],
      title: 'Digital — Product Teaser',
      video: 'assets/videos/digi2.mp4',
      description: 'Macro product study with moody, directional lighting and SFX sweeteners.'
    },
    {
      src: 'https://picsum.photos/seed/hybrid/1200/800',
      alt: 'Hybrid campaign',
      tags: ['corporate', 'digital'],
      title: 'Hybrid — Brand Refresh',
      video: 'assets/videos/hybrid1.mp4',
      description: 'Cross-platform brand refresh with modular edits for paid and organic.'
    }
  ];

  /* =================== Render gallery with data-* for modal =================== */
  function renderGallery(filter = 'selection') {
    gallery.setAttribute('aria-busy', 'true');
    gallery.replaceChildren();

    const key = resolveFilter(filter);
    const items = (key === 'all') ? window.galleryData : window.galleryData.filter(i => i.tags.includes(key));

    for (const item of items) {
      const fig = document.createElement('figure');
      fig.className = 'thumb';
      fig.setAttribute('tabindex', '0');
      fig.setAttribute('role', 'button');
      fig.setAttribute('aria-label', `Open video: ${item.title || item.alt}`);

      // per-item data for the reusable modal
      fig.dataset.title = item.title || item.alt || 'Project';
      fig.dataset.video = item.video || '';
      fig.dataset.description = item.description || '';

      fig.innerHTML = `
        <img loading="lazy" decoding="async" src="${item.src}" alt="${item.alt}" width="1200" height="800">
      `;
      gallery.appendChild(fig);
    }
    gallery.setAttribute('aria-busy', 'false');
  }

  function setActiveTab(filter) {
    (tabsList?.querySelectorAll('.tab') || []).forEach(tab => {
      const tabFilter = tab.getAttribute('data-filter') || tab.querySelector('a')?.getAttribute('data-filter');
      const active = tabFilter === filter;
      tab.classList.toggle('is-active', active);
      tab.querySelector('a')?.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function applyFilter(filter) {
    currentFilter = filter;
    setActiveTab(filter);
    renderGallery(filter);
    location.hash = filter;
  }

  const nextFilter = (f) => filters[(filters.indexOf(f) + 1) % filters.length];
  const prevFilter = (f) => filters[(filters.indexOf(f) - 1 + filters.length) % filters.length];
  const goToMyInfo = () => { window.location.href = 'my-info.html'; };

  // Header tabs (mouse)
  tabsList?.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-filter]');
    if (!link) return;
    e.preventDefault();
    const filter = link.getAttribute('data-filter');
    if (!isGalleryVisible()) showGalleryAndSet(filter);
    else applyFilter(filter);
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- ARROWS BEHAVIOR ---------- */
  toRight?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isGalleryVisible()) {
      showGalleryAndSet('selection');
      return;
    }
    if (currentFilter === 'digital') {
      goToMyInfo();
      return;
    }
    applyFilter(nextFilter(currentFilter));
  });

  toLeft?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isGalleryVisible()) return;
    if (currentFilter === 'selection') {
      showVideo();
      return;
    }
    applyFilter(prevFilter(currentFilter));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (!isGalleryVisible()) {
        showGalleryAndSet('selection');
        return;
      }
      if (currentFilter === 'digital') {
        goToMyInfo();
        return;
      }
      applyFilter(nextFilter(currentFilter));
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (!isGalleryVisible()) return;
      if (currentFilter === 'selection') {
        showVideo();
        return;
      }
      applyFilter(prevFilter(currentFilter));
    }
  });

  // Open modal from click/keyboard (event delegation on gallery)
  function openFromFigure(fig) {
    const payload = {
      title: fig.dataset.title,
      video: fig.dataset.video,
      description: fig.dataset.description
    };
    console.log('[WorkModal] Opening modal with payload:', payload);
    if (!payload.video) {
      console.warn('[WorkModal] No video URL on this item:', payload.title);
      return;
    }
    WorkModal.whenReady()
      .then(m => {
        console.log('[WorkModal] Modal ready, opening...');
        m.open(payload);
      })
      .catch(err => {
        console.error('[WorkModal] failed to initialize, injecting fallback modal…', err);
        WorkModal.__injectFallback?.();
        WorkModal.whenReady().then(m2 => m2.open(payload));
      });
  }

  gallery?.addEventListener('click', (e) => {
    const fig = e.target.closest('.thumb');
    if (!fig) return;
    openFromFigure(fig);
  });

  gallery?.addEventListener('keydown', (e) => {
    if (!(e.key === 'Enter' || e.key === ' ')) return;
    const fig = e.target.closest('.thumb');
    if (!fig) return;
    e.preventDefault();
    openFromFigure(fig);
  });

  /* ---------- INITIAL STATE ---------- */
  const valid = new Set(filters);
  const hash = (location.hash || '#').slice(1);

  if (valid.has(hash)) {
    videoSection.classList.add('is-display-none');
    gallery.classList.remove('is-hidden');
    toLeft?.classList.remove('is-hidden');
    applyFilter(hash);
  } else {
    toLeft?.classList.add('is-hidden');
    toRight?.classList.remove('is-hidden');
    setActiveTab('selection');
  }
});

/* ========================= modal.js (resilient, inlined) ========================= */
(function () {
  const TEMPLATE_URL_DEFAULT = 'templates/work-modal.html';

  function createPlayer(url) {
    const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url);
    const isVimeo = /vimeo\.com/i.test(url);

    if (isYouTube || isVimeo) {
      const iframe = document.createElement('iframe');
      const join = url.includes('?') ? '&' : '?';
      iframe.src = `${url}${join}autoplay=1&muted=1&playsinline=1`;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('title', 'Embedded video');
      return iframe;
    }

    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.muted = true;
    video.autoplay = true;

    const src = document.createElement('source');
    src.src = url;
    src.type = url.endsWith('.webm') ? 'video/webm' : 'video/mp4';
    video.appendChild(src);
    return video;
  }

  function injectFallbackTemplate() {
    const shell = document.createElement('div');
    shell.innerHTML = `
      <div class="modal-backdrop is-hidden" id="work-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-shell" role="document">
          <header class="modal-header">
            <h2 id="modal-title" class="modal-title">Project</h2>
          </header>
          <div class="modal-media" id="modal-media" aria-label="Video player"></div>
          <section class="modal-body">
            <p id="modal-desc" class="modal-desc"></p>
          </section>
          <section class="modal-carousel">
            <h3 class="carousel-title">More Videos</h3>
            <div class="carousel-container">
              <button class="carousel-btn carousel-prev" aria-label="Previous videos">‹</button>
              <div class="carousel-track" id="carousel-track">
                <!-- Carousel items will be populated by JavaScript -->
              </div>
              <button class="carousel-btn carousel-next" aria-label="Next videos">›</button>
            </div>
          </section>
        </div>
      </div>
    `.trim();
    document.body.appendChild(shell.firstElementChild);
  }

  async function loadTemplate(url = TEMPLATE_URL_DEFAULT) {
    try {
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      const host = document.createElement('div');
      host.innerHTML = html.trim();

      const tpl = host.querySelector('#work-modal-tpl');
      if (!tpl) throw new Error('work-modal template not found in file');

      const frag = tpl.content.cloneNode(true);
      document.body.appendChild(frag);
    } catch (err) {
      console.warn('[WorkModal] template fetch failed, injecting fallback:', err);
      injectFallbackTemplate();
    }

    const modal = document.getElementById('work-modal');
    if (!modal) {
      console.error('[WorkModal] Modal element not found!');
      return { open: () => {}, close: () => {} };
    }
    
    const modalMedia = modal.querySelector('#modal-media');
    const modalTitle = modal.querySelector('#modal-title');
    const modalDesc = modal.querySelector('#modal-desc');
    const carouselTrack = modal.querySelector('#carousel-track');
    const carouselPrev = modal.querySelector('.carousel-prev');
    const carouselNext = modal.querySelector('.carousel-next');
    let lastFocusedEl = null;
    let currentCarouselIndex = 0;
    let carouselItems = [];
    
    console.log('[WorkModal] Modal elements found:', {
      modal: !!modal,
      modalMedia: !!modalMedia,
      modalTitle: !!modalTitle,
      modalDesc: !!modalDesc,
      carouselTrack: !!carouselTrack,
      carouselPrev: !!carouselPrev,
      carouselNext: !!carouselNext
    });

    function populateCarousel(currentVideo) {
      if (!carouselTrack) {
        console.warn('[WorkModal] Carousel track not found, skipping carousel population');
        return;
      }
      
      // Get all videos except the current one
      const relatedVideos = window.galleryData.filter(item => item.video && item.video !== currentVideo);
      carouselItems = relatedVideos;
      
      // Clear existing carousel items
      carouselTrack.innerHTML = '';
      
      // Create carousel items
      relatedVideos.forEach((item, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.setAttribute('data-index', index);
        carouselItem.setAttribute('tabindex', '0');
        carouselItem.setAttribute('role', 'button');
        carouselItem.setAttribute('aria-label', `Open video: ${item.title || item.alt}`);
        
        carouselItem.innerHTML = `<img loading="lazy" src="${item.src}" alt="${item.alt}">`;
        
        // Add click handler
        carouselItem.addEventListener('click', () => {
          const payload = {
            title: item.title,
            video: item.video,
            description: item.description
          };
          open(payload);
        });
        
        // Add keyboard handler
        carouselItem.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            carouselItem.click();
          }
        });
        
        carouselTrack.appendChild(carouselItem);
      });
      
      // Update navigation buttons
      updateCarouselButtons();
    }

    function updateCarouselButtons() {
      if (!carouselPrev || !carouselNext) return;
      
      if (carouselItems.length <= 1) {
        carouselPrev.disabled = true;
        carouselNext.disabled = true;
        return;
      }
      
      carouselPrev.disabled = currentCarouselIndex === 0;
      carouselNext.disabled = currentCarouselIndex >= carouselItems.length - 1;
    }

    function scrollCarousel(direction) {
      if (!carouselTrack || carouselItems.length <= 1) return;
      
      const itemWidth = 132; // 120px width + 12px gap
      const visibleItems = Math.floor(carouselTrack.offsetWidth / itemWidth);
      const maxIndex = Math.max(0, carouselItems.length - visibleItems);
      
      if (direction === 'next') {
        currentCarouselIndex = Math.min(currentCarouselIndex + 1, maxIndex);
      } else {
        currentCarouselIndex = Math.max(currentCarouselIndex - 1, 0);
      }
      
      const scrollPosition = currentCarouselIndex * itemWidth;
      carouselTrack.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      updateCarouselButtons();
    }

    function open({ title = 'Project', video, description = '' } = {}) {
      console.log('[WorkModal] open() called with:', { title, video, description });
      if (!video) {
        console.warn('[WorkModal] No video provided, modal not opening');
        return;
      }
      lastFocusedEl = document.activeElement;
      modalTitle.textContent = title;
      modalDesc.textContent = description;
      modalMedia.replaceChildren(createPlayer(video));
      
      // Populate carousel with related videos
      console.log('[WorkModal] Populating carousel...');
      populateCarousel(video);
      currentCarouselIndex = 0;
      
      console.log('[WorkModal] Showing modal...');
      modal.classList.remove('is-hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    }

    function close() {
      modalMedia.replaceChildren();
      modal.classList.add('is-hidden');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus();
      }
    }

    // Carousel navigation
    carouselPrev?.addEventListener('click', () => scrollCarousel('prev'));
    carouselNext?.addEventListener('click', () => scrollCarousel('next'));

    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener('keydown', (e) => {
      if (!modal || modal.classList.contains('is-hidden')) return;
      if (e.key === 'Escape') close();
    });

    return { open, close };
  }

  const readyPromise = new Promise((resolve, reject) => {
    const boot = () => loadTemplate().then(resolve).catch(reject);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  });

  // expose
  window.WorkModal = {
    whenReady: () => readyPromise,
    __injectFallback: injectFallbackTemplate
  };
})();
