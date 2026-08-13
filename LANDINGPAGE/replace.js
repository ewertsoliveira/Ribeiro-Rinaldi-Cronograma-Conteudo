const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const regex = /    <script>\r?\n\s*\/\* FIX PARA O BUG DE ESPA.O EXTRA DO ZOOM NO CHROME \*\/[\s\S]*?<\/script>/m;
const newScript = `    <script>
      /* FIX PARA O BUG DE ESPAÇO EXTRA DO ZOOM NO CHROME */
      if (window.innerWidth >= 1025) {
        // Oculta a barra nativa para impedir que o usuário arraste além do limite permitido
        const style = document.createElement('style');
        style.innerHTML = '::-webkit-scrollbar { display: none; }';
        document.head.appendChild(style);

        // Intercepta a leitura da altura total do documento (scrollHeight).
        // Como o Chrome calcula isso ignorando o zoom, nós aplicamos o fator de 0.75
        // para que o Lenis e o GSAP saibam exatamente onde o rodapé real termina.
        const originalScrollHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight').get;
        Object.defineProperty(document.documentElement, 'scrollHeight', {
          get: function() {
            const val = originalScrollHeight.call(this);
            return val * 0.75; // Subtrai os 25% de buraco negro
          }
        });
      }
    </script>`;
fs.writeFileSync('index.html', content.replace(regex, newScript), 'utf8');
