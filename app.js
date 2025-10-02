document.addEventListener('DOMContentLoaded', () => {
  const videoSection = document.getElementById('feature-video');
  const gallery = document.getElementById('gallery');
  const toGallery = document.querySelector('.to-gallery');
  const toVideo = document.querySelector('.to-video');
  const videoEl = document.getElementById('reel');

  // Respect user motion preferences
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = prefersReduced ? 'auto' : 'smooth';

  function showGallery() {
    if (!videoEl.paused) videoEl.pause();

    // toggle visibility
    videoSection.classList.add('is-hidden');
    gallery.classList.remove('is-hidden');

    toGallery.classList.add('is-hidden');
    toVideo.classList.remove('is-hidden');

    // after layout updates, nudge-scroll so pictures are nicely in view
    requestAnimationFrame(() => {
      // Scroll to the top of the gallery, with a tiny offset
      const y = gallery.getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo({ top: y, behavior: scrollBehavior });
    });
  }

  function showVideo() {
    // toggle visibility
    gallery.classList.add('is-hidden');
    videoSection.classList.remove('is-hidden');

    toVideo.classList.add('is-hidden');
    toGallery.classList.remove('is-hidden');

    // reset scroll position to top (no smooth animation to make it feel "reset")
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  toGallery.addEventListener('click', showGallery);
  toVideo.addEventListener('click', showVideo);

  // keyboard helpers: ArrowRight = gallery, ArrowLeft = video
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && toGallery.offsetParent !== null) showGallery();
    if (e.key === 'ArrowLeft' && toVideo.offsetParent !== null) showVideo();
  });

  // footer year
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
