const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Move </main> from the bottom to after the hero section.
// The end of the hero section is right before <div class="post-hero-spacer">
content = content.replace('</main>', ''); // Remove it from the bottom
content = content.replace('<div class="post-hero-spacer">', '</main>\\n  <div class="post-hero-spacer">');

// 2. Remove normalizeScroll
content = content.replace('ScrollTrigger.normalizeScroll(true);', '// ScrollTrigger.normalizeScroll(true);');

// 3. Remove the scrollHeight hack
const hackStart = content.indexOf('/* FIX PARA O BUG DE ESPAÇO EXTRA DO ZOOM NO CHROME */');
const hackEnd = content.indexOf('</script>', hackStart);
if (hackStart !== -1 && hackEnd !== -1) {
    const hack = content.substring(hackStart, hackEnd);
    content = content.replace(hack, '/* Hack removed */\\n    ');
}

fs.writeFileSync('index.html', content);
console.log('Fixed index.html structure!');
