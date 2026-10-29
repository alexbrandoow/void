'use strict';
window.VoidAnimations = (() => {
  let media;
  function init() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
      hero.from('.hero-image', { scale: 1.045, opacity: 0, duration: 1.25 })
        .from('.hero-hat', { y: 10, autoAlpha: 0, duration: .45 }, .15)
        .from('.hero .line > span', { yPercent: 110, duration: .8, stagger: .12 }, .24)
        .from('.hero-copy .description', { y: 20, autoAlpha: 0, duration: .65 }, .55)
        .from('.hero-buttons > *', { y: 14, autoAlpha: 0, duration: .55, stagger: .1 }, .72)
        .from('.scroll-cue, .hero-edition', { autoAlpha: 0, duration: .6 }, 1);
      gsap.utils.toArray('.reveal').forEach(element => {
        // Opacity-only for centered copy preserves its translateX positioning.
        const centered = element.classList.contains('intro-description');
        gsap.from(element, { autoAlpha: 0, y: centered ? 0 : 32, duration: .85, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
      });
    });
    media.add({ desktop: '(min-width: 901px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
      if (!context.conditions.desktop || !context.conditions.motion) return;
      const section = document.querySelector('.features');
      const cards = gsap.utils.toArray('.feature-card');
      const heading = section.querySelector('.features-heading');
      const counter = section.querySelector('.feature-count');
      section.classList.add('is-pinned');
      gsap.set(cards, { autoAlpha: 0, y: 50 });
      const timeline = gsap.timeline({ defaults: { ease: 'none' } });
      timeline.to(heading, { autoAlpha: 0, y: -36, duration: .65 }, .45);
      cards.forEach((card, index) => {
        const start = 1 + index * 1.55;
        timeline.to(card, { autoAlpha: 1, y: 0, duration: .38, ease: 'power1.out' }, start);
        if (index < cards.length - 1) timeline.to(card, { autoAlpha: 0, y: -45, duration: .35, ease: 'power1.in' }, start + 1.16);
      });
      timeline.to({}, { duration: .9 });
      timeline.fromTo('.features-progress i', { scaleX: 0 }, { scaleX: 1, duration: timeline.duration() }, 0);
      ScrollTrigger.create({
        id: 'void-features', trigger: section, pin: '.features-stage', start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * cards.length * 1.15),
        animation: timeline, scrub: .65, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate(self) {
          const index = Math.min(3, Math.max(0, Math.floor((self.progress * timeline.duration() - 1) / 1.55)));
          counter.textContent = `0${index + 1} — 04`;
        }
      });
      // Videos keep their own clock: never seek currentTime in a scroll callback.
      return () => { section.classList.remove('is-pinned'); counter.textContent = '01 — 04'; };
    });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
      if (location.hash && document.querySelector(location.hash)) VoidScroll.to(location.hash, { immediate: true });
    }, { once: true });
    document.querySelectorAll('img').forEach(image => {
      if (!image.complete) image.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    });
  }
  return { init, destroy: () => media?.revert() };
})();
