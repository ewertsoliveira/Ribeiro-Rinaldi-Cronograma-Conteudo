/**
 * instagram_slider.js
 * Visualizador Interativo de Carrossel no estilo Instagram para o Laboratório de Design Ribeiro Rinaldi.
 * Permite navegação fluida por gestos (swipe / drag), setas, teclado e indicador de pontos (dots).
 * Suporta sobreposição de Margens de Segurança do Instagram (1080x1350).
 */

(function() {
  // Executa automaticamente se estiver dentro de um iframe ou se a URL contiver '?view=slider'
  const inIframe = window.parent !== window;
  const urlParams = new URLSearchParams(window.location.search);
  const forceSlider = urlParams.get('view') === 'slider' || window.location.hash === '#slider';

  if (!inIframe && !forceSlider) {
    // Adiciona botão na header standalone para quem quiser testar a visualização do Instagram
    window.addEventListener('DOMContentLoaded', () => {
      const headerActions = document.querySelector('header .header-actions');
      if (headerActions && !document.getElementById('toggleSliderBtn')) {
        const btn = document.createElement('button');
        btn.id = 'toggleSliderBtn';
        btn.className = 'btn';
        btn.style.background = '#1E1712';
        btn.style.border = '1px solid #FF5E1A';
        btn.style.color = '#FF5E1A';
        btn.innerHTML = '📱 Ver no Mockup Instagram';
        btn.onclick = () => activateInstagramSlider();
        headerActions.insertBefore(btn, headerActions.firstChild);
      }
    });
    return;
  }

  window.addEventListener('DOMContentLoaded', () => {
    activateInstagramSlider();
  });

  function activateInstagramSlider() {
    if (document.getElementById('rr-ig-mockup')) return; // já ativo

    // 1. Injetar Estilos do Mockup
    const style = document.createElement('style');
    style.id = 'rr-ig-styles';
    style.innerHTML = `
      body.ig-mode {
        margin: 0 !important;
        padding: 0 !important;
        background: #0D0907 !important;
        color: #F7F1E8 !important;
        font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif !important;
        min-height: 100vh !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        scrollbar-width: thin;
        scrollbar-color: #3A2E24 transparent;
      }
      body.ig-mode::-webkit-scrollbar {
        width: 6px;
      }
      body.ig-mode::-webkit-scrollbar-track {
        background: transparent;
      }
      body.ig-mode::-webkit-scrollbar-thumb {
        background: #3A2E24;
        border-radius: 3px;
      }
      body.ig-mode::-webkit-scrollbar-thumb:hover {
        background: #FF5E1A;
      }
      body.ig-mode > header,
      body.ig-mode > .grid {
        display: none !important;
      }

      /* WRAPPER PRINCIPAL */
      .ig-mockup-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px 16px 20px;
        width: 100%;
        max-width: 500px;
        box-sizing: border-box;
      }

      /* TOPO / EYEBROW */
      .ig-mockup-header {
        text-align: center;
        margin-bottom: 10px;
      }
      .ig-mockup-eyebrow {
        font-family: 'Space Mono', monospace;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: #FF5E1A;
        display: inline-block;
        background: rgba(255, 94, 26, 0.1);
        padding: 3px 10px;
        border-radius: 20px;
        border: 1px solid rgba(255, 94, 26, 0.25);
      }
      .ig-mockup-title {
        font-family: 'Archivo', sans-serif;
        font-weight: 800;
        font-size: 15px;
        color: #F7F1E8;
        margin-top: 4px;
        letter-spacing: -0.3px;
      }

      /* CARTÃO INSTAGRAM */
      .ig-card {
        width: 420px;
        max-width: 94vw;
        background: #18120E;
        border: 1px solid #3A2E24;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,94,26,0.15);
        display: flex;
        flex-direction: column;
        position: relative;
      }

      /* HEADER DO POST INSTAGRAM */
      .ig-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        background: #18120E;
      }
      .ig-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF5E1A 0%, #F0247C 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFF;
        font-family: 'Archivo', sans-serif;
        font-weight: 900;
        font-size: 15px;
        letter-spacing: -0.5px;
        box-shadow: 0 2px 10px rgba(255,94,26,0.4);
        flex-shrink: 0;
      }
      .ig-user-meta {
        display: flex;
        flex-direction: column;
        line-height: 1.25;
      }
      .ig-user-name-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .ig-username {
        font-weight: 700;
        font-size: 13.5px;
        color: #F7F1E8;
        font-family: 'Manrope', sans-serif;
      }
      .ig-verified-badge {
        width: 14px;
        height: 14px;
        color: #FF5E1A;
        display: inline-flex;
      }
      .ig-subtitle {
        font-size: 11px;
        color: #A89F91;
        font-family: 'Manrope', sans-serif;
      }
      .ig-menu-btn {
        margin-left: auto;
        color: #A89F91;
        font-size: 18px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
      }

      /* VIEWPORT DO SLIDER (Aspect 4:5 -> 1080x1350) */
      .ig-viewport-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 1080 / 1350;
        overflow: hidden;
        background: #150F0B;
        user-select: none;
      }
      .ig-viewport {
        position: absolute;
        inset: 0;
        cursor: grab;
        touch-action: pan-y;
      }
      .ig-viewport.dragging {
        cursor: grabbing;
      }
      .ig-track {
        display: flex;
        height: 100%;
        width: 100%;
        will-change: transform;
        transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .ig-slide {
        flex: 0 0 100%;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        background: #150F0B;
      }
      .ig-slide > .card-render {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 1080px !important;
        height: 1350px !important;
        transform-origin: top left !important;
        pointer-events: none !important;
      }

      /* CONTADOR NO TOPO DIREITO */
      .ig-counter {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 10;
        background: rgba(14, 10, 7, 0.65);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #F7F1E8;
        font-family: 'Space Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;
        pointer-events: none;
      }

      /* SETAS DE NAVEGAÇÃO */
      .ig-nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(14, 10, 7, 0.65);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #F7F1E8;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      }
      .ig-nav-btn:hover {
        background: #FF5E1A;
        border-color: #FF5E1A;
        color: #150F0B;
        transform: translateY(-50%) scale(1.08);
      }
      .ig-nav-btn:disabled {
        opacity: 0.2;
        pointer-events: none;
      }
      .ig-nav-left { left: 10px; }
      .ig-nav-right { right: 10px; }

      /* MARGEM DE SEGURANÇA (OVERLAY) */
      .ig-safe-zone {
        position: absolute;
        inset: 0;
        pointer-events: none;
        display: none;
        border: 2px dashed #00FF66;
        z-index: 8;
      }
      .ig-safe-zone.visible { display: block; }
      .ig-safe-zone::before {
        content: 'Margem Top (Interface)';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 11.11%; /* 150px / 1350px */
        background: rgba(255, 0, 0, 0.2);
        border-bottom: 1px solid red;
        color: #FF6666;
        font-family: 'Space Mono', monospace;
        padding: 6px 10px;
        font-size: 11px;
        box-sizing: border-box;
      }
      .ig-safe-zone::after {
        content: 'Margem Bottom (Interface)';
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 14.81%; /* 200px / 1350px */
        background: rgba(255, 0, 0, 0.2);
        border-top: 1px solid red;
        color: #FF6666;
        font-family: 'Space Mono', monospace;
        padding: 6px 10px;
        font-size: 11px;
        display: flex;
        align-items: flex-end;
        box-sizing: border-box;
      }

      /* PONTOS DE NAVEGAÇÃO (DOTS) */
      .ig-dots {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 6px;
        padding: 12px 0 4px;
        background: #18120E;
      }
      .ig-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #3A2E24;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .ig-dot.active {
        width: 18px;
        border-radius: 4px;
        background: linear-gradient(90deg, #FF5E1A, #F0247C);
      }

      /* BOTÕES DE ENGAJAMENTO (ACTIONS) */
      .ig-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 14px 4px;
        background: #18120E;
      }
      .ig-actions-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .ig-action-btn {
        background: none;
        border: none;
        color: #F7F1E8;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s, color 0.15s;
      }
      .ig-action-btn:hover {
        transform: scale(1.1);
        color: #FF5E1A;
      }
      .ig-action-btn.liked {
        color: #FF3366;
      }
      .ig-action-btn.liked svg {
        fill: #FF3366;
        stroke: #FF3366;
      }
      .ig-action-btn svg {
        width: 22px;
        height: 22px;
        stroke: currentColor;
        fill: none;
        stroke-width: 1.8;
      }

      /* BOTÃO DE TOGGLE DE MARGEM */
      .ig-safe-toggle {
        background: #251B14;
        border: 1px solid #3A2E24;
        color: #A89F91;
        font-family: 'Space Mono', monospace;
        font-size: 10.5px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .ig-safe-toggle:hover {
        border-color: #FF5E1A;
        color: #F7F1E8;
      }
      .ig-safe-toggle.active {
        background: #FF5E1A;
        color: #150F0B;
        border-color: #FF5E1A;
      }

      /* LEGENDA E HASHTAGS */
      .ig-caption {
        padding: 10px 14px 16px;
        font-size: 13px;
        line-height: 1.45;
        color: #F7F1E8;
        background: #18120E;
      }
      .ig-caption b {
        font-weight: 700;
        margin-right: 5px;
      }
      .ig-caption-text {
        color: #D9D2C7;
      }
      .ig-hashtags {
        margin-top: 6px;
        font-size: 11.5px;
        color: #FF5E1A;
        line-height: 1.4;
        font-family: 'Manrope', sans-serif;
      }

      /* DICA INFERIOR */
      .ig-tip {
        margin-top: 14px;
        font-size: 12px;
        color: #A89F91;
        text-align: center;
        line-height: 1.5;
      }
      .ig-tip b { color: #F7F1E8; }
    `;
    document.head.appendChild(style);
    document.body.classList.add('ig-mode');

    // 2. Extrair Slides Existentes
    const originalGallery = document.getElementById('gallery') || document.querySelector('.grid');
    const slideContainers = Array.from(document.querySelectorAll('.slide-container'));
    
    // Obter títulos e elementos dos slides
    const slidesData = [];
    slideContainers.forEach((sc, i) => {
      const titleEl = sc.querySelector('.slide-title');
      const title = titleEl ? titleEl.innerText : `SLIDE ${i + 1}`;
      const renderEl = sc.querySelector('.card-render');
      if (renderEl) {
        slidesData.push({ title, renderEl });
      }
    });

    if (slidesData.length === 0) {
      console.warn('Nenhum slide (.card-render) encontrado para o carrossel.');
      return;
    }

    const totalSlides = slidesData.length;
    let currentIndex = 0;

    // Obter título da página
    const pageTitle = document.querySelector('h1') ? document.querySelector('h1').innerText : 'Carrossel Institucional';

    // 3. Construir a Estrutura HTML do Mockup Instagram
    const mockupWrap = document.createElement('div');
    mockupWrap.id = 'rr-ig-mockup';
    mockupWrap.className = 'ig-mockup-wrapper';
    mockupWrap.innerHTML = `
      <div class="ig-mockup-header">
        <span class="ig-mockup-eyebrow">Simulação Instagram • Carrossel 4:5</span>
        <div class="ig-mockup-title">${pageTitle}</div>
      </div>

      <div class="ig-card">
        <!-- Header do Instagram -->
        <div class="ig-header">
          <div class="ig-avatar">RR</div>
          <div class="ig-user-meta">
            <div class="ig-user-name-row">
              <span class="ig-username">ribeirorinaldi.adv</span>
              <svg class="ig-verified-badge" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span class="ig-subtitle">Patrocinado • Direito para Concursados</span>
          </div>
          <button class="ig-menu-btn" title="Mais opções">•••</button>
        </div>

        <!-- Viewport do Carrossel 4:5 -->
        <div class="ig-viewport-wrap" id="igViewportWrap">
          <div class="ig-safe-zone" id="igSafeZone"></div>
          <div class="ig-counter" id="igCounter">1 / ${totalSlides}</div>

          <!-- Setas de navegação -->
          <button class="ig-nav-btn ig-nav-left" id="igNavLeft" aria-label="Slide anterior">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 18l-6-6 6-6" stroke="#F7F1E8" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="ig-nav-btn ig-nav-right" id="igNavRight" aria-label="Próximo slide">
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 18l6-6-6-6" stroke="#F7F1E8" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>

          <!-- Janela de arrasto / Track -->
          <div class="ig-viewport" id="igViewport">
            <div class="ig-track" id="igTrack"></div>
          </div>
        </div>

        <!-- Pontos indicadores de página (Dots) -->
        <div class="ig-dots" id="igDots"></div>

        <!-- Barra de Ações (Curtir, Comentar, Margem, Salvar) -->
        <div class="ig-actions">
          <div class="ig-actions-left">
            <button class="ig-action-btn" id="igLikeBtn" title="Curtir">
              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button class="ig-action-btn" title="Comentar">
              <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </button>
            <button class="ig-action-btn" title="Compartilhar">
              <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <button class="ig-safe-toggle" id="igSafeToggleBtn" title="Alternar Margens de Segurança do Instagram">
            Margem
          </button>
          <button class="ig-action-btn" id="igSaveBtn" title="Salvar">
            <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>

        <!-- Legenda do Post -->
        <div class="ig-caption">
          <b>ribeirorinaldi.adv</b>
          <span class="ig-caption-text">Defendemos a sua aprovação e a sua posse em concursos públicos em todo o Brasil. Enquanto tem prazo, tem chance. E a gente não perde prazo.</span>
          <div class="ig-hashtags">
            #concursopublico #servidorpublico #advogadoconcurso #posse #ribeirorinaldi #concurseiro #SuaVagaTemDono
          </div>
        </div>
      </div>

      <div class="ig-tip">
        <span>👉 <b>Dica:</b> Arraste para os lados ou use as setas para navegar entre os slides.</span>
      </div>
    `;

    document.body.appendChild(mockupWrap);

    // 4. Mover os elementos .card-render para dentro de cada .ig-slide
    const track = document.getElementById('igTrack');
    const dotsContainer = document.getElementById('igDots');

    slidesData.forEach((item, index) => {
      const slideDiv = document.createElement('div');
      slideDiv.className = 'ig-slide';
      slideDiv.dataset.index = index;

      // Move o elemento original para dentro da slideDiv (preserva IDs para o exportZip!)
      slideDiv.appendChild(item.renderEl);
      track.appendChild(slideDiv);

      // Cria o dot correspondente
      const dot = document.createElement('span');
      dot.className = 'ig-dot' + (index === 0 ? ' active' : '');
      dot.dataset.index = index;
      dot.onclick = () => goTo(index);
      dotsContainer.appendChild(dot);
    });

    // 5. Ajustar Escala Responsiva dos Slides
    function resizeSlides() {
      const wrap = document.getElementById('igViewportWrap');
      if (!wrap) return;
      const currentWidth = wrap.clientWidth;
      const scale = currentWidth / 1080;
      
      document.querySelectorAll('.ig-slide > .card-render').forEach(renderEl => {
        renderEl.style.transform = `scale(${scale})`;
      });
    }

    window.addEventListener('resize', resizeSlides);
    resizeSlides();

    // 6. Lógica de Navegação e Transição do Slider
    const viewport = document.getElementById('igViewport');
    const counter = document.getElementById('igCounter');
    const navLeft = document.getElementById('igNavLeft');
    const navRight = document.getElementById('igNavRight');
    const dots = Array.from(document.querySelectorAll('.ig-dot'));

    let width = 0;
    function measure() {
      width = viewport.getBoundingClientRect().width;
    }

    function render(animate) {
      measure();
      track.style.transition = animate ? 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
      track.style.transform = `translateX(${-currentIndex * width}px)`;
      counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
      
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === currentIndex);
      });

      navLeft.disabled = (currentIndex === 0);
      navRight.disabled = (currentIndex === totalSlides - 1);
    }

    function goTo(idx) {
      currentIndex = Math.max(0, Math.min(totalSlides - 1, idx));
      render(true);
    }

    navLeft.onclick = () => goTo(currentIndex - 1);
    navRight.onclick = () => goTo(currentIndex + 1);

    // Navegação via Teclado (Setas Esquerda / Direita)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
      if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    });

    // 7. Gestos de Swipe / Drag (Touch + Mouse Pointer)
    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    viewport.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startX = e.clientX;
      currentX = e.clientX;
      measure();
      viewport.classList.add('dragging');
      track.style.transition = 'none';
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      currentX = e.clientX;
      const delta = currentX - startX;
      track.style.transform = `translateX(${-currentIndex * width + delta}px)`;
    });

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      viewport.classList.remove('dragging');
      const delta = currentX - startX;
      if (Math.abs(delta) > width * 0.15) {
        goTo(currentIndex + (delta < 0 ? 1 : -1));
      } else {
        render(true);
      }
    }

    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // 8. Botão de Margens de Segurança
    const safeZone = document.getElementById('igSafeZone');
    const safeToggleBtn = document.getElementById('igSafeToggleBtn');
    
    function toggleSafeZone(forceState) {
      const isVis = typeof forceState === 'boolean' ? forceState : !safeZone.classList.contains('visible');
      safeZone.classList.toggle('visible', isVis);
      safeToggleBtn.classList.toggle('active', isVis);
    }
    safeToggleBtn.onclick = () => toggleSafeZone();

    // 9. Botões de Curtir e Salvar (Interatividade)
    const likeBtn = document.getElementById('igLikeBtn');
    likeBtn.onclick = () => likeBtn.classList.toggle('liked');

    const saveBtn = document.getElementById('igSaveBtn');
    saveBtn.onclick = () => {
      const isSaved = saveBtn.classList.toggle('saved');
      saveBtn.querySelector('svg').style.fill = isSaved ? '#F7F1E8' : 'none';
    };

    // Render Inicial
    render(false);
    setTimeout(() => {
      resizeSlides();
      render(false);
    }, 100);

    // 10. Comunicação via postMessage com o Painel do Laboratório
    window.addEventListener('message', async (e) => {
      if (e.data === 'REQUEST_DOWNLOAD_ZIP') {
        if (typeof exportZip === 'function') {
          try {
            await exportZip();
            window.parent.postMessage({ type: 'ZIP_COMPLETED' }, '*');
          } catch (err) {
            console.error('Erro ao exportar zip:', err);
          }
        } else {
          console.warn('Função exportZip não encontrada.');
        }
      } else if (e.data === 'REQUEST_SCREENSHOT') {
        try {
          if (typeof html2canvas === 'function') {
            const currentSlideEl = slidesData[currentIndex].renderEl;
            const canvas = await html2canvas(currentSlideEl, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#150F0B'
            });
            const base64image = canvas.toDataURL('image/png');
            window.parent.postMessage({ type: 'SCREENSHOT_DATA', data: base64image, src: window.location.href }, '*');
          }
        } catch (err) {
          console.error('Erro no screenshot:', err);
        }
      } else if (e.data === 'TOGGLE_SAFE_ZONE') {
        toggleSafeZone();
      }
    });
  }
})();
