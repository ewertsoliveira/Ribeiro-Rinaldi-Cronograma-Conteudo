/**
 * Ribeiro Rinaldi — Verificador de Overflow de Texto em Peças SVG.
 *
 * Incluir em qualquer template novo de card/carrossel (formato 1080x1350) assim:
 *   <script src="../overflow-check.js"></script>
 * (ajustar o caminho relativo conforme a profundidade da pasta do template)
 *
 * Ao carregar a página, varre todo <text> dentro de .card-render e confere se a
 * caixa delimitadora do texto ultrapassa a margem de segurança do card (100px em
 * cada lado, ou seja: x deve ficar entre 100 e 980, y entre 0 e 1290 num canvas
 * 1080x1350). Isso existe porque textos escritos "no olho" (linhas quebradas
 * manualmente, sem medir a largura real) já vazaram da margem duas vezes no
 * histórico deste projeto — ver AGENTS.md, seção "Peças Gráficas (SVG)".
 *
 * Quando encontra um overflow:
 *  - desenha um retângulo tracejado vermelho ao redor do texto problemático
 *  - insere uma faixa vermelha visível no topo do slide-container correspondente
 *  - grava um console.error com o texto, a posição e o quanto ultrapassou
 *
 * Não corrige automaticamente (reduzir fonte ou quebrar linha é uma decisão de
 * design) — só avisa de forma impossível de ignorar, tanto no console quanto no
 * próprio preview visual.
 */
(function () {
  const CARD_W = 1080;
  const CARD_H = 1350;
  const MARGIN = 100;
  const SAFE_RIGHT = CARD_W - MARGIN; // 980
  const SAFE_BOTTOM = CARD_H - 60; // deixa uma folga menor embaixo p/ rodapé/assinatura

  function checkAll() {
    let totalIssues = 0;
    const renders = document.querySelectorAll('.card-render');

    renders.forEach((render) => {
      const svg = render.querySelector('svg');
      if (!svg) return;
      let issuesInThisCard = 0;

      svg.querySelectorAll('text').forEach((t) => {
        let bbox;
        try {
          bbox = t.getBBox();
        } catch (e) {
          return; // elemento ainda não renderizado (ex: display:none)
        }
        const right = bbox.x + bbox.width;
        const bottom = bbox.y + bbox.height;
        const overflowsRight = right > SAFE_RIGHT + 5; // 5px de tolerância de sub-pixel/kerning
        const overflowsLeft = bbox.x < MARGIN - 15; // um pouco mais de tolerância à esquerda (ícones/bullets)
        const overflowsBottom = bottom > SAFE_BOTTOM;

        if (overflowsRight || overflowsLeft || overflowsBottom) {
          issuesInThisCard++;
          totalIssues++;

          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', bbox.x - 4);
          rect.setAttribute('y', bbox.y - 4);
          rect.setAttribute('width', bbox.width + 8);
          rect.setAttribute('height', bbox.height + 8);
          rect.setAttribute('fill', 'none');
          rect.setAttribute('stroke', '#FF0044');
          rect.setAttribute('stroke-width', '4');
          rect.setAttribute('stroke-dasharray', '10,6');
          svg.appendChild(rect);

          console.error(
            '[overflow-check] Texto ultrapassa a margem de segurança:',
            JSON.stringify({
              texto: t.textContent.slice(0, 80),
              x: Math.round(bbox.x),
              right: Math.round(right),
              bottom: Math.round(bottom),
              limite_direita: SAFE_RIGHT,
              limite_baixo: SAFE_BOTTOM,
            })
          );
        }
      });

      if (issuesInThisCard > 0) {
        const banner = document.createElement('div');
        banner.textContent =
          '⚠ TEXTO ULTRAPASSA A MARGEM (' + issuesInThisCard + ') — ver console';
        banner.style.cssText =
          'position:absolute;top:0;left:0;right:0;background:#FF0044;color:#fff;' +
          'font:700 13px monospace;padding:6px 10px;z-index:999;text-align:center;';
        const wrapper = render.closest('.wrapper') || render.parentElement;
        if (wrapper) {
          wrapper.style.position = 'relative';
          wrapper.appendChild(banner);
        }
      }
    });

    if (totalIssues === 0) {
      console.log('[overflow-check] OK — nenhum texto ultrapassando a margem.');
    } else {
      console.error('[overflow-check] ' + totalIssues + ' texto(s) ultrapassando a margem. Corrija antes de aprovar o template.');
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(checkAll, 300);
  } else {
    window.addEventListener('load', () => setTimeout(checkAll, 300));
  }
})();
