# Validação — 28/10/2026

## Verificado

- Sintaxe dos arquivos JavaScript da aplicação e do servidor com `node --check`.
- Servidor local responde HTTP 200.
- Recursos referenciados pelo HTML e CSS existem, não estão vazios e os recursos HTML respondem HTTP 200.
- IDs únicos, um `h1`, destinos válidos de todas as âncoras.
- Menu abre e fecha, Escape fecha, navegação por âncora fecha o menu.
- Tamanho 8.25″ atualiza estado e armazenamento de sessão.
- Carrinho local registra o tamanho selecionado.
- Compra sem checkout abre mensagem informativa e não realiza pedido.
- Miniaturas atualizam imagem, texto alternativo, legenda e estado ativo.
- Setas do teclado navegam na galeria.
- Diálogos de comunidade e suporte abrem e fecham.
- GSAP, ScrollTrigger e Lenis reais inicializam em simulação de DOM.
- Trigger `void-features` usa pin, scrub e `invalidateOnRefresh`.
- Os quatro cards alcançam opacidade 1 nas suas etapas, percorrendo a timeline GSAP para frente e para trás.
- Reversão das animações remove o pin; movimento reduzido mantém todos os cards disponíveis sem pin.
- Vídeos sem arquivos configurados não fazem requisições para caminhos inexistentes.

Essas verificações de interação foram executadas com jsdom 26.1.0, instalado somente em `.work/`, fora dos arquivos de produção. APIs de layout ausentes em jsdom foram simuladas. O script está em `.work/check.mjs` e o relatório em `.work/test-results.json`.

## Limites de verificação

O controle de navegador ficou indisponível: o Computer Use interrompeu a sessão porque não conseguiu identificar a URL ativa no Windows com segurança. Nenhum teste alternativo de automação do navegador foi executado.

Portanto, **não foram verificados em navegador real**: comparação visual pixel a pixel, geometrias efetivas dos assets, overflow em cada resolução, pin físico no viewport, suavidade do scroll, reprodução de vídeo ou console do navegador. Não há screenshots de uma página renderizada para comprovar fidelidade final.

Os breakpoints estão implementados para 1200, 900 e 600 px, com escala fluida nos tamanhos intermediários. A validação visual pendente deve cobrir ao menos 1920×1080, 1440×900, 768×1024 e 390×844, incluindo navegação reversa da seção de diferenciais e `prefers-reduced-motion`.

Os MP4 originais e o checkout não foram fornecidos. Reprodução e transações reais não foram testadas. A implementação de vídeo não altera `currentTime` em nenhum trecho.
