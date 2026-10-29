'use strict';
window.VoidApp = (() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  const dialog = document.querySelector('#info-dialog');
  let dialogTrigger;
  let initialized = false;
  const information = {
    account: ['Sua conta VOID', 'A área de clientes ainda não está disponível.'],
    agency: ['Encontre a VOID', 'A lista de agências será disponibilizada em breve.'],
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
    document.querySelectorAll('video[data-video]').forEach(video => {
      const source = window.VOID_CONFIG?.videos?.[video.dataset.video];
      const control = video.closest('.media-section')?.querySelector('.media-toggle');
      if (!source || !control) return;
      let visible = false;
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      const updateControl = () => {
        const label = video.muted ? 'Ativar som' : 'Silenciar vídeo';
        control.setAttribute('aria-label', label);
        control.setAttribute('title', label);
        control.setAttribute('aria-pressed', String(!video.muted));
      };
      const sync = () => {
        if (visible && !document.hidden) {
          if (video.paused) video.play().catch(() => {});
        } else if (!video.paused) video.pause();
      };
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible && !video.getAttribute('src')) { video.src = new URL(source, document.baseURI).href; video.load(); }
        sync();
      }, { threshold: .03 });
      observer.observe(video);
      video.addEventListener('loadeddata', () => { control.hidden = false; updateControl(); sync(); });
      video.addEventListener('error', () => { control.hidden = true; observer.disconnect(); }, { once: true });
      control.addEventListener('click', () => {
        video.muted = !video.muted;
        updateControl();
        if (!video.paused) return;
        sync();
      });
      document.addEventListener('visibilitychange', sync);
    });
  }
  function init() {
    if (initialized || !header || !toggle || !menu || !dialog) return;
    initialized = true;
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
    window.VoidTextReveal?.init();
  }
  return { init, closeMenu, showInfo };
})();
VoidApp.init();
