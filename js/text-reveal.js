'use strict';
window.VoidTextReveal = (() => {
  const sectionSelector = [
    'main h2', 'main h3', 'main p:not([aria-live])', 'main blockquote',
    'main figcaption', '.features .hat', '.feature-card > .eyebrow',
    '.hero-edition', '.community-caption', '.specifications > div > span',
    '.benefits li > span', '.size-picker legend',
    '.site-footer nav a', '.site-footer nav button'
  ].join(',');
  const cardWords = new WeakMap();
  let initialized = false;

  function splitWords(element, className) {
    const words = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.textContent.trim() && !node.parentElement?.closest('[aria-hidden="true"],.void-blur-word,.void-hero-char')
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const part of node.textContent.match(/\s+|\S+/gu) || []) {
        if (/^\s+$/u.test(part)) {
          const space = document.createElement('span');
          space.className = 'void-blur-space';
          space.textContent = part;
          fragment.append(space);
        } else {
          const word = document.createElement('span');
          word.className = className;
          word.textContent = part;
          fragment.append(word);
          words.push(word);
        }
      }
      node.replaceWith(fragment);
    }
    return words;
  }

  function animateWords(words, heading, trigger) {
    if (!words.length) return;
    gsap.set(words, { y: -42, opacity: 0, filter: 'blur(10px)' });
    return gsap.to(words, {
      keyframes: [
        { y: 5, opacity: .5, filter: 'blur(5px)', duration: .35, ease: 'none' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: .35, ease: 'none' }
      ],
      stagger: heading ? .075 : .035,
      paused: !trigger,
      onStart: () => gsap.set(words, { willChange: 'transform,filter,opacity' }),
      onComplete: () => gsap.set(words, { clearProps: 'willChange' }),
      onReverseComplete: () => gsap.set(words, { clearProps: 'willChange' }),
      scrollTrigger: trigger ? {
        trigger, start: 'top 88%', end: 'bottom 12%',
        toggleActions: 'play reverse play reverse', invalidateOnRefresh: true
      } : undefined
    });
  }

  function initHero() {
    const title = document.querySelector('#hero-title');
    if (!title) return;
    const titleLines = [...title.querySelectorAll('.line')];
    title.setAttribute('aria-label', titleLines.map(line => line.textContent.trim()).join(' '));
    titleLines.forEach(line => line.setAttribute('aria-hidden', 'true'));
    const chars = [];
    for (const line of title.querySelectorAll('.line > span')) {
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        const fragment = document.createDocumentFragment();
        for (const char of Array.from(node.textContent)) {
          if (/\s/u.test(char)) {
            const space = document.createElement('span');
            space.className = 'void-hero-space';
            space.textContent = char;
            fragment.append(space);
          } else {
            const span = document.createElement('span');
            span.className = 'void-hero-char';
            span.textContent = char;
            fragment.append(span);
            chars.push(span);
          }
        }
        node.replaceWith(fragment);
      }
    }
    if (chars.length) {
      gsap.fromTo(chars,
        { yPercent: 115, rotationX: -70, opacity: 0, filter: 'blur(14px)' },
        { yPercent: 0, rotationX: 0, opacity: 1, filter: 'blur(0px)',
          duration: .9, stagger: .03, delay: .25, ease: 'power4.out',
          onComplete: () => gsap.set(chars, { clearProps: 'transform,opacity,filter' }) }
      );
    }
    const lead = gsap.utils.toArray('.hero-hat, .hero-copy .description, .scroll-cue, .hero-edition');
    if (lead.length) gsap.from(lead, { y: 20, opacity: 0, duration: .7, stagger: .08, delay: .7, ease: 'power4.out' });
  }

  function initSections() {
    document.querySelectorAll(sectionSelector).forEach(element => {
      if (element.closest('.hero') || element.closest('[hidden],dialog,[aria-live]')) return;
      const words = splitWords(element, 'void-blur-word');
      if (!words.length) return;
      const card = element.closest('.feature-card');
      const heading = element.matches('h2,h3,strong');
      if (card) {
        const collection = cardWords.get(card) || [];
        collection.push({ words, heading });
        cardWords.set(card, collection);
        gsap.set(words, { y: -42, opacity: 0, filter: 'blur(10px)' });
      } else {
        animateWords(words, heading, element);
      }
    });
    document.querySelectorAll('.feature-card').forEach(card => {
      if (Number(gsap.getProperty(card, 'opacity')) > .5) revealCard(card);
    });
  }

  function revealCard(card) {
    const collection = cardWords.get(card);
    if (!collection || card.dataset.textRevealed) return;
    card.dataset.textRevealed = 'true';
    collection.forEach(({ words, heading }) => {
      gsap.to(words, {
        keyframes: [
          { y: 5, opacity: .5, filter: 'blur(5px)', duration: .35, ease: 'none' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: .35, ease: 'none' }
        ],
        stagger: heading ? .075 : .035,
        onComplete: () => gsap.set(words, { clearProps: 'willChange' })
      });
    });
  }

  function init() {
    if (initialized || !window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    initialized = true;
    (document.fonts?.ready || Promise.resolve()).then(() => {
      if (!initialized) return;
      initHero();
      initSections();
      ScrollTrigger.refresh(true);
    }).catch(() => {});
  }

  return { init, revealCard };
})();
