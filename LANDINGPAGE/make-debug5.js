const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
const script = `
<script>
window.addEventListener('load', () => {
 setTimeout(() => {
  const hero = document.getElementById('heroPinArea');
  const pinSpacer = document.querySelector('.pin-spacer');
  const footer = document.querySelector('.main-footer');
  
  console.log('Hero Rect:', JSON.stringify(hero.getBoundingClientRect()));
  if (pinSpacer) console.log('PinSpacer Rect:', JSON.stringify(pinSpacer.getBoundingClientRect()));
  console.log('Footer Rect:', JSON.stringify(footer.getBoundingClientRect()));
  
  const children = Array.from(document.body.children);
  children.forEach(c => {
    if (c.tagName !== 'SCRIPT') {
      console.log('Child:', c.tagName, c.className, JSON.stringify(c.getBoundingClientRect()));
    }
  });
 }, 4000);
});
</script>
</body>`;
content = content.replace('</body>', script);
fs.writeFileSync('index-debug5.html', content);
