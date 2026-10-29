'use strict';
window.VoidProduct = (() => {
  const state = { size: '8.0', image: '', inCart: false };
  let initialized = false;
  function init() {
    if (initialized) return;
    const config = window.VOID_CONFIG;
    const form = document.querySelector('#product-form');
    const feedback = document.querySelector('.product-feedback');
    const mainImage = document.querySelector('#product-image');
    const price = document.querySelector('[data-price]');
    const addToCart = document.querySelector('#add-to-cart');
    if (!config || !form?.elements.size || !feedback || !mainImage || !price || !addToCart) return;
    initialized = true;
    state.image = mainImage.getAttribute('src');
    const thumbnails = [...document.querySelectorAll('.gallery-thumb')];
    price.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: config.currency }).format(config.price);
    try {
      const saved = sessionStorage.getItem('void-size');
      if (['8.0', '8.25', '8.5'].includes(saved)) state.size = saved;
    } catch { /* Storage can be unavailable in private browsing. */ }
    form.elements.size.value = state.size;
    form.addEventListener('change', event => {
      if (event.target.name !== 'size') return;
      state.size = event.target.value;
      state.inCart = false;
      addToCart.firstChild.textContent = 'Colocar no carrinho ';
      feedback.textContent = `Shape ${state.size}″ selecionado.`;
      try { sessionStorage.setItem('void-size', state.size); } catch { /* Selection remains in memory. */ }
    });
    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', async () => {
        if (state.image === thumbnail.dataset.image) return;
        const nextSource = thumbnail.dataset.image;
        state.image = nextSource;
        thumbnails.forEach(button => { const active = button === thumbnail; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
        const preload = new Image();
        preload.src = nextSource;
        try { await preload.decode(); } catch { feedback.textContent = 'Não foi possível carregar esta imagem.'; return; }
        if (state.image !== nextSource) return;
        mainImage.src = nextSource;
        mainImage.alt = thumbnail.dataset.alt;
        const caption = document.querySelector('#gallery-caption');
        if (caption) caption.textContent = thumbnail.dataset.caption;
        if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
          gsap.fromTo(mainImage, { opacity: .3, scale: .985 }, { opacity: 1, scale: 1, duration: .4, overwrite: true });
        }
      });
      thumbnail.addEventListener('keydown', event => {
        let next;
        if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % thumbnails.length;
        if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + thumbnails.length) % thumbnails.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = thumbnails.length - 1;
        if (next === undefined) return;
        event.preventDefault(); thumbnails[next].focus(); thumbnails[next].click();
      });
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (config.checkoutUrl) {
        const checkout = new URL(config.checkoutUrl, location.href);
        if (!['http:', 'https:'].includes(checkout.protocol)) return;
        checkout.searchParams.set('product', 'void-one');
        checkout.searchParams.set('size', state.size);
        checkout.searchParams.set('quantity', '1');
        window.location.assign(checkout.href);
      } else {
        VoidApp.showInfo('Seu próximo caminho.', `Você escolheu o VOID ONE ${state.size}″.\nA compra online ainda não está disponível. Nenhum pedido ou pagamento foi realizado.`);
      }
    });
    addToCart.addEventListener('click', event => {
      state.inCart = true;
      try { sessionStorage.setItem('void-cart', JSON.stringify({ product: 'void-one', size: state.size, quantity: 1 })); } catch { /* Cart state still works during this visit. */ }
      feedback.textContent = `VOID ONE ${state.size}″ salvo no carrinho desta visita.` + (config.checkoutUrl ? ' Continue em QUERO MEU VOID.' : ' A compra online ainda não está disponível.');
      event.currentTarget.firstChild.textContent = 'Adicionado ao carrinho ';
    });
  }
  return { init, getState: () => ({ ...state }) };
})();
