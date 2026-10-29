'use strict';
window.VoidApp = (() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  const dialog = document.querySelector('#info-dialog');
  let dialogTrigger;
  const information = {
    account: ['Sua conta VOID', 'A área de clientes ainda não está disponível.'],
    contact: ['Fale com a VOID', 'O canal oficial de atendimento será disponibilizado em breve.'],
    shipping: ['Envios', 'As informações de entrega serão disponibilizadas no canal oficial de compra.'],
    returns: ['Trocas e devoluções', 'A política oficial de trocas e devoluções será disponibilizada antes da abertura das vendas.'],
    warranty: ['Garantia VOID', 'Os termos da garantia serão disponibilizados no canal oficial de compra.'],
    faq: ['Perguntas frequentes', 'O VOID ONE é montado e pronto para andar. Escolha entre os shapes 8.0″, 8.25″ e 8.5″.\nMais informações estarão disponíveis na abertura das vendas.']
  };
  function closeMenu(returnFocus = false) {
    const wasOpen = !menu.hidden;
    menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
    if (!dialog.open) VoidScroll.start();
    if (returnFocus && wasOpen) toggle.focus();
  }
  function showInfo(title, description) {
    closeMenu(); dialogTrigger = document.activeElement;
    document.querySelector('#dialog-title').textContent = title;
    document.querySelector('#dialog-description').textContent = description;
    document.body.classList.add('dialog-open'); VoidScroll.stop(); dialog.showModal();
  }
  function visit(url) {
    if (!url) return false;
    const target = new URL(url, location.href);
    if (!['https:', 'http:', 'mailto:'].includes(target.protocol)) return false;
    window.location.assign(target.href); return true;
  }
  function initMedia() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    document.querySelectorAll('video[data-video]').forEach(video => {
      const source = VOID_CONFIG.videos[video.dataset.video];
      const control = video.closest('.media-section').querySelector('.media-toggle');
      if (!source) return;
      let visible = false;
      let userPaused = false;
      let explicitlyPlaying = false;
      video.muted = true;
      video.autoplay = !reduced.matches;
      const updateControl = () => {
        control.textContent = video.paused ? 'Reproduzir vídeo' : 'Pausar vídeo';
        control.setAttribute('aria-label', control.textContent);
      };
      const sync = () => {
        if (visible && !document.hidden && !userPaused && (!reduced.matches || explicitlyPlaying)) video.play().catch(() => { control.hidden = false; updateControl(); });
        else video.pause();
      };
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible && !video.getAttribute('src')) { video.src = source; video.load(); }
        sync();
      }, { threshold: .03 });
      observer.observe(video);
      video.addEventListener('loadeddata', () => { control.hidden = false; updateControl(); sync(); });
      video.addEventListener('play', updateControl);
      video.addEventListener('pause', updateControl);
      video.addEventListener('error', () => { video.removeAttribute('src'); video.load(); control.hidden = true; observer.disconnect(); });
      control.addEventListener('click', () => {
        userPaused = !video.paused;
        explicitlyPlaying = !userPaused;
        sync();
      });
      document.addEventListener('visibilitychange', sync);
      reduced.addEventListener('change', () => { explicitlyPlaying = false; sync(); });
    });
  }
  function init() {
    toggle.addEventListener('click', () => {
      if (!menu.hidden) { closeMenu(); return; }
      menu.hidden = false; toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Fechar menu');
      document.body.classList.add('menu-open'); VoidScroll.stop(); menu.querySelector('a').focus();
    });
    document.addEventListener('keydown', event => {
      if (menu.hidden) return;
      if (event.key === 'Escape') { closeMenu(true); return; }
      if (event.key !== 'Tab') return;
      const focusables = [toggle, ...menu.querySelectorAll('a')];
      const index = focusables.indexOf(document.activeElement);
      if (event.shiftKey && index === 0) { event.preventDefault(); focusables.at(-1).focus(); }
      else if (!event.shiftKey && index === focusables.length - 1) { event.preventDefault(); toggle.focus(); }
    });
    matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    window.addEventListener('scroll', updateHeader, { passive: true }); updateHeader();
    document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => {
      const key = button.dataset.info;
      const url = key === 'account' ? VOID_CONFIG.accountUrl : VOID_CONFIG.support[key];
      if (!visit(url)) showInfo(...information[key]);
    }));
    document.querySelector('[data-community]').addEventListener('click', () => {
      if (!visit(VOID_CONFIG.communityUrl)) showInfo('Nômades do concreto.', 'O próximo ponto de encontro da comunidade VOID será anunciado em breve.');
    });
    document.querySelectorAll('[data-social]').forEach(button => button.addEventListener('click', () => {
      if (!visit(VOID_CONFIG.social[button.dataset.social])) showInfo('Siga o movimento.', `O perfil oficial da VOID no ${button.textContent.replace('↗', '').trim()} será divulgado em breve.`);
    }));
    dialog.querySelectorAll('button').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); VoidScroll.start(); dialogTrigger?.focus({ preventScroll: true }); });
    VoidScroll.init(); VoidAnimations.init(); VoidProduct.init(); initMedia();
  }
  return { init, closeMenu, showInfo };
})();
VoidApp.init();
