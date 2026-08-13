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
        // A matemática exata: precisamos subtrair do tamanho total a porção do viewport que foi escalada visualmente
        const originalScrollHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight').get;
        Object.defineProperty(document.documentElement, 'scrollHeight', {
          get: function() {
            const val = originalScrollHeight.call(this);
            return val - window.innerHeight * ((1 / 0.75) - 1);
          }
        });
      }
    </script>`;
fs.writeFileSync('index.html', content.replace(regex, newScript), 'utf8');
