const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
const script = `
<script>
window.addEventListener('load', () => {
 setTimeout(() => {
  const h = document.body.scrollHeight;
  const footer = document.querySelector('.main-footer');
  const fRect = footer.getBoundingClientRect();
  const fBottom = fRect.bottom + window.scrollY;
  console.log('ScrollHeight:', h, 'Footer Bottom:', fBottom, 'Diff:', h - fBottom);
 }, 3000);
});
</script>
</body>`;
content = content.replace('</body>', script);
fs.writeFileSync('index-debug2.html', content);
