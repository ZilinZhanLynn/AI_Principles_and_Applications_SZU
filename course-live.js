/* Shared classroom navigation. Lesson-specific interactions live in lesson-N-live.js. */
(() => {
  'use strict';
  const deck = document.getElementById('deck');
  if (!deck) return;
  const slides = [...deck.querySelectorAll('.slide')];
  if (!slides.length) return;
  const previous = document.getElementById('prev');
  const next = document.getElementById('next');
  const counter = document.getElementById('page-number');
  const progress = document.getElementById('progress');
  const fullscreen = document.getElementById('fullscreen');
  const baseTitle = deck.dataset.lessonTitle || document.title;
  const defaultTitle = document.title;
  let current = 0;
  let scrollFrame = 0;
  let resizeFrame = 0;

  function contentTop() {
    // New frames place the deck below the header. Legacy decks include header
    // space as padding; read that padding rather than subtracting the header twice.
    return deck.getBoundingClientRect().top + (parseFloat(getComputedStyle(deck).paddingTop) || 0);
  }

  function fromHash() {
    const id = location.hash.slice(1);
    const index = slides.findIndex(slide => slide.id === id);
    return index < 0 ? 0 : index;
  }

  function update(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    if (previous) previous.disabled = current === 0;
    if (next) next.disabled = current === slides.length - 1;
    if (counter) counter.textContent = slides[current].dataset.pageLabel || `${current + 1} / ${slides.length}`;
    if (progress) progress.style.width = `${(current + 1) / slides.length * 100}%`;
    const title = slides[current].querySelector('h1,h2')?.textContent;
    document.title = title ? `${baseTitle} · ${title}` : defaultTitle;
    const hash = `#${slides[current].id}`;
    if (location.hash !== hash) {
      // file:// may deny replaceState; navigation must keep working locally.
      try { history.replaceState(null, '', hash); } catch (_) { /* Keep the selected page. */ }
    }
  }

  function show(index) {
    update(index);
    const slide = slides[current];
    for (const panel of slide.querySelectorAll(':scope > .copy, :scope > aside')) panel.scrollTop = 0;
    const top = deck.scrollTop + slide.getBoundingClientRect().top - contentTop();
    // Scroll only the deck: the fixed header/footer remain in the viewport.
    deck.scrollTo({top, behavior: 'instant'});
  }

  function syncScroll() {
    scrollFrame = 0;
    const line = contentTop() + Math.min(120, deck.clientHeight * .18);
    let index = 0;
    slides.forEach((slide, i) => { if (slide.getBoundingClientRect().top <= line) index = i; });
    if (index !== current) update(index);
  }

  previous?.addEventListener('click', () => show(current - 1));
  next?.addEventListener('click', () => show(current + 1));
  deck.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll);
  }, {passive: true});
  window.addEventListener('hashchange', () => show(fromHash()));
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    const focused = document.activeElement;
    if (focused?.matches('input, textarea, select') || focused?.isContentEditable) return;
    const directions = {ArrowRight: 1, ArrowDown: 1, PageDown: 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1};
    if (event.key in directions) { event.preventDefault(); show(current + directions[event.key]); }
    else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); show(event.key === 'Home' ? 0 : slides.length - 1);
    }
  });

  fullscreen?.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (_) { if (fullscreen) fullscreen.textContent = '全屏不可用'; }
  });
  document.addEventListener('fullscreenchange', () => {
    if (fullscreen) fullscreen.textContent = document.fullscreenElement ? '退出全屏' : '全屏';
    requestAnimationFrame(() => show(current));
  });
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => show(current));
  });
  show(fromHash());
  // Re-align after images/fonts have acquired their final sizes.
  window.addEventListener('load', () => show(current), {once: true});
})();
