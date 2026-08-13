const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
const startIdx = content.indexOf('    <script>\r\n      /* FIX PARA O BUG DE ESPA');
const endStr = '</script>';
const endIdx = content.indexOf(endStr, startIdx) + endStr.length;

if (startIdx !== -1 && endIdx > startIdx) {
  const newScript = `    <script>
      /* FIX PARA O BUG DE ESPAÇO EXTRA DO ZOOM NO CHROME */
      if (window.innerWidth >= 1025) {
        // Oculta a barra nativa para impedir que o usuário arraste além do limite permitido
        const style = document.createElement('style');
        style.innerHTML = '::-webkit-scrollbar { display: none; }';
        document.head.appendChild(style);

        // Intercepta a leitura da altura total do documento (scrollHeight).
        // A matemática exata: precisamos subtrair do tamanho total a porção do viewport que foi escalada
        const originalScrollHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight').get;
        Object.defineProperty(document.documentElement, 'scrollHeight', {
          get: function() {
            const val = originalScrollHeight.call(this);
            return val - (window.innerHeight * ((1 / 0.75) - 1));
          }
        });
      }
    </script>`;
  content = content.substring(0, startIdx) + newScript + content.substring(endIdx);
  fs.writeFileSync('index.html', content, 'utf8');
  console.log('Replaced successfully');
} else {
  console.log('Not found');
}
