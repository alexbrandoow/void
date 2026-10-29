'use strict';
window.VoidAnimations = (() => {
  let media;
  let initialized = false;
  const fromIfPresent = (timeline, selector, vars, position) => {
    const targets = gsap.utils.toArray(selector);
    if (targets.length) timeline.from(targets, vars, position);
  };
  const onLoad = () => {
    if (!initialized || !location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (target) VoidScroll.to(target, { immediate: true });
  };
  function init() {
    if (initialized || !window.gsap || !window.ScrollTrigger) return;
    initialized = true;
    gsap.registerPlugin(ScrollTrigger);
    media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
      fromIfPresent(hero, '.hero-image', { scale: 1.045, opacity: 0, duration: 1.25 });
      gsap.utils.toArray('.reveal').forEach(element => {
        if (element.matches('.construction-visual')) {
          gsap.from(element, { autoAlpha: 0, y: 32, duration: .85, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
        }
      });
    });
    media.add({ desktop: '(min-width: 901px)', mobile: '(max-width: 900px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
      if (!context.conditions.motion) return;
      const section = document.querySelector('.features');
      const stage = section?.querySelector('.features-stage');
      const cards = section ? gsap.utils.toArray(section.querySelectorAll('.feature-card')) : [];
      const heading = section?.querySelector('.features-heading');
      if (!section || !stage || !heading || !cards.length) return;
      section.classList.add('is-pinned');
      gsap.set(cards, { autoAlpha: 0, y: 50 });
      const timeline = gsap.timeline({ defaults: { ease: 'none' } });
      timeline.to(heading, { autoAlpha: 0, y: -36, duration: .65 }, .45);
      cards.forEach((card, index) => {
        const start = 1 + index * 1.55;
        timeline.to(card, { autoAlpha: 1, y: 0, duration: .38, ease: 'power1.out', onStart: () => window.VoidTextReveal?.revealCard(card) }, start);
        if (index < cards.length - 1) timeline.to(card, { autoAlpha: 0, y: -45, duration: .35, ease: 'power1.in' }, start + 1.16);
      });
      timeline.to({}, { duration: .9 });
      ScrollTrigger.create({
        id: 'void-features', trigger: section, pin: stage, start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * cards.length * (context.conditions.mobile ? 1 : 1.15)),
        animation: timeline, scrub: .65, anticipatePin: 1, invalidateOnRefresh: true
      });
      return () => section.classList.remove('is-pinned');
    });
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (initialized) ScrollTrigger.refresh(true);
      }).catch(() => {});
    }
    window.addEventListener('load', onLoad, { once: true });
  }
  return { init, destroy: () => {
    initialized = false;
    window.removeEventListener('load', onLoad);
    media?.revert(); media = null;
  } };
})();
