'use strict';
window.VoidScroll = (() => {
  let lenis;
  let ticker;
  let initialized = false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function configure() {
    if (lenis) { lenis.destroy(); lenis = null; }
    if (ticker && window.gsap) { gsap.ticker.remove(ticker); ticker = null; }
    if (!reduced.matches && window.Lenis && window.gsap && window.ScrollTrigger) {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false, anchors: false });
      lenis.on('scroll', () => ScrollTrigger.update());
      ticker = time => lenis.raf(time * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
    }
  }
  function to(target, { focus = false, immediate = false } = {}) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    const complete = () => {
      if (!focus) return;
      if (!element.matches('a,button,input,select,textarea')) element.setAttribute('tabindex', '-1');
      element.focus({ preventScroll: true });
    };
    const offset = -(document.querySelector('.site-header')?.offsetHeight || 0);
    if (lenis) lenis.scrollTo(element, { offset, immediate, onComplete: complete });
    else {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + offset, behavior: reduced.matches || immediate ? 'instant' : 'smooth' });
      complete();
    }
  }
  function onDocumentClick(event) {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = anchor.getAttribute('href');
    const element = id.length > 1 ? document.getElementById(id.slice(1)) : null;
    if (!element) return;
    event.preventDefault();
    window.VoidApp.closeMenu();
    history.pushState(null, '', id);
    to(element, { focus: event.detail === 0 });
  }
  function onPopState() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    to(document.getElementById(id || 'home'), { immediate: true });
  }
  function init() {
    if (initialized) return;
    initialized = true;
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    configure();
    reduced.addEventListener('change', configure);
    document.addEventListener('click', onDocumentClick);
    window.addEventListener('popstate', onPopState);
  }
  return { init, to, stop: () => lenis?.stop(), start: () => lenis?.start(), destroy: () => {
    if (!initialized) return;
    initialized = false;
    lenis?.destroy(); lenis = null;
    if (ticker && window.gsap) gsap.ticker.remove(ticker);
    ticker = null;
    reduced.removeEventListener('change', configure);
    document.removeEventListener('click', onDocumentClick);
    window.removeEventListener('popstate', onPopState);
  } };
})();
