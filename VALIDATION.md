# Validação local — 29/10/2026

## Executado

- `node --check` em `js/animations.js`, `js/scroll.js`, `js/main.js`, `js/product.js` e `scripts/verify-pages.mjs`.
- `node scripts/verify-pages.mjs`: 51 referências locais verificadas sob `/void/`, todos os arquivos presentes, não vazios e rastreados pelo Git. Ambos os MP4s contêm marcadores `ftyp`, `moov`, `mdat`, `avc1` e `mp4a`.
- Simulação DOM com as bibliotecas GSAP, ScrollTrigger e Lenis distribuídas no projeto: 1920 px, 390 px, 390 px com movimento reduzido e um cenário sem alvos opcionais. Nenhum erro de console foi capturado. O trigger dos cards, a inicialização única, o loop dos vídeos e os caminhos resolvidos sob `/void/` foram conferidos. Arquivo local de teste: `.work/runtime-audit.mjs`.
- Servidor local: os dois MP4s responderam `206 Partial Content` a requisições de byte range; CSS, JavaScript e fonte responderam `200`.
- `git diff --check` sem erro.

## Limites

- Não foi possível acessar a URL publicada ou as configurações remotas do GitHub Pages: conexões diretas ao GitHub e ao domínio `github.io` falharam neste ambiente. O controle de Chrome foi interrompido porque não conseguiu confirmar a URL ativa com segurança.
- A simulação DOM não comprova geometria renderizada, scroll físico, decodificação real de vídeo ou ausência de erros no navegador publicado. A verificação do workflow e da fonte de publicação deve ocorrer após o push e a execução do GitHub Actions.
