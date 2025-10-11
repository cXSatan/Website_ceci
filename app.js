document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  /* ====================== MY INFO PAGE ====================== */
  if (document.body.classList.contains('page-info')) {
    // Left arrow button already in HTML; ensure it goes to DIGITAL first
    const leftAnchor = document.querySelector('.to-pictures');
    if (leftAnchor) leftAnchor.setAttribute('href', 'index.html#digital');

    // Keyboard: ArrowLeft behaves the same
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') window.location.href = 'index.html#digital';
    });
    return; // Skip the index logic
  }

  /* ====================== INDEX PAGE ONLY ====================== */
  const videoSection = document.getElementById('feature-video');
  const gallery      = document.getElementById('gallery');
  const toRight      = document.querySelector('.to-gallery'); // the ONLY right arrow
  const toLeft       = document.querySelector('.to-video');   // the left arrow
  const videoEl      = document.getElementById('reel');
  const tabsList     = document.querySelector('.header-nav .tabs');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Filters in order
  const filters = ['all','corporate','institucional','digital'];
  let currentFilter = 'all';

  // Helpers
  const isGalleryVisible = () => !gallery.classList.contains('is-hidden');

  function keepScrollPosition(run) {
    const y = window.scrollY;
    run();
    requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'auto' }));
  }

  function collapseSection(el, onDone) {
    if (prefersReduced) { el.classList.add('is-display-none'); onDone?.(); return; }
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
    if (prefersReduced) { el.classList.remove('is-display-none'); onDone?.(); return; }
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

  function showGalleryAndSet(filter = 'all') {
    keepScrollPosition(() => {
      if (videoEl && !videoEl.paused) videoEl.pause();
      collapseSection(videoSection, () => {
        gallery.classList.remove('is-hidden');
        toLeft?.classList.remove('is-hidden');
        applyFilter(filter);
        // small tick to avoid flicker
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

  // Gallery data
  const galleryData = [
    { src: 'https://picsum.photos/seed/corp1/1200/800', alt: 'Corporate shoot 1', tags: ['corporate'] },
    { src: 'https://picsum.photos/seed/corp2/1200/800', alt: 'Corporate shoot 2', tags: ['corporate'] },
    { src: 'https://picsum.photos/seed/inst1/1200/800', alt: 'Institutional film 1', tags: ['institucional'] },
    { src: 'https://picsum.photos/seed/inst2/1200/800', alt: 'Institutional film 2', tags: ['institucional'] },
    { src: 'https://picsum.photos/seed/digi1/1200/800', alt: 'Digital ad 1', tags: ['digital'] },
    { src: 'https://picsum.photos/seed/digi2/1200/800', alt: 'Digital ad 2', tags: ['digital'] },
    { src: 'https://picsum.photos/seed/hybrid/1200/800', alt: 'Hybrid campaign', tags: ['corporate', 'digital'] },
  ];

  function renderGallery(filter = 'all') {
    gallery.replaceChildren();
    const items = filter === 'all' ? galleryData : galleryData.filter(i => i.tags.includes(filter));
    for (const item of items) {
      const fig = document.createElement('figure');
      fig.className = 'thumb';
      fig.innerHTML = `<img loading="lazy" src="${item.src}" alt="${item.alt}">`;
      gallery.appendChild(fig);
    }
  }

  function setActiveTab(filter) {
    (tabsList?.querySelectorAll('.tab') || []).forEach(tab => {
      const tabFilter = tab.getAttribute('data-filter') || tab.querySelector('a')?.getAttribute('data-filter');
      const active = tabFilter === filter || (filter === 'all' && tabFilter === 'all');
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
  // RIGHT: video → ALL → CORPORATE → INSTITUCIONAL → DIGITAL → My Info
  toRight?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isGalleryVisible()) { showGalleryAndSet('all'); return; }
    if (currentFilter === 'digital') { goToMyInfo(); return; }
    applyFilter(nextFilter(currentFilter));
  });

  // LEFT: My Info → DIGITAL → INSTITUCIONAL → CORPORATE → ALL → video
  toLeft?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isGalleryVisible()) { /* already on video; do nothing */ return; }
    if (currentFilter === 'all') { showVideo(); return; }
    applyFilter(prevFilter(currentFilter));
  });

  // Keyboard mirrors buttons
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (!isGalleryVisible()) { showGalleryAndSet('all'); return; }
      if (currentFilter === 'digital') { goToMyInfo(); return; }
      applyFilter(nextFilter(currentFilter));
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (!isGalleryVisible()) { /* on video; nothing */ return; }
      if (currentFilter === 'all') { showVideo(); return; }
      applyFilter(prevFilter(currentFilter));
    }
  });

  /* ---------- INITIAL STATE ---------- */
  // Start at VIDEO unless a valid hash is present
  const valid = new Set(filters);
  const hash = (location.hash || '#').slice(1);
  if (valid.has(hash)) {
    // Open directly in that gallery filter
    videoSection.classList.add('is-display-none');
    gallery.classList.remove('is-hidden');
    toLeft?.classList.remove('is-hidden');
    applyFilter(hash);
  } else {
    // Default: video visible
    toLeft?.classList.add('is-hidden');
    toRight?.classList.remove('is-hidden');
    setActiveTab('all'); // pre-highlight ALL for when we enter gallery
  }
});
