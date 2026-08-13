const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
const script = `
<script>
window.addEventListener('load', () => {
 setTimeout(() => {
  const footer = document.querySelector('.main-footer');
  const fBottom = footer.getBoundingClientRect().bottom + window.scrollY;
  const elements = [];
  document.querySelectorAll('*').forEach(el => {
    const b = el.getBoundingClientRect().bottom + window.scrollY;
    if (b > fBottom + 10) {
      elements.push({ tag: el.tagName, class: el.className, id: el.id, bottom: b });
    }
  });
  console.log('Elements extending past footer:', JSON.stringify(elements));
 }, 3000);
});
</script>
</body>`;
content = content.replace('</body>', script);
fs.writeFileSync('index-debug3.html', content);
