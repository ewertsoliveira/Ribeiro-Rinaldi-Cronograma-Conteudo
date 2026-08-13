const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
const script = `
<script>
window.addEventListener('load', () => {
 setTimeout(() => {
  const hero = document.getElementById('heroPinArea');
  console.log('Hero height:', hero.style.height, 'offsetHeight:', hero.offsetHeight);
  const footer = document.querySelector('.main-footer');
  console.log('Footer offsetTop:', footer.offsetTop);
 }, 3000);
});
</script>
</body>`;
content = content.replace('</body>', script);
fs.writeFileSync('index-debug4.html', content);
