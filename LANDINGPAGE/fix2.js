const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Find where <section class="generic-section" id="ajuda"> starts.
const sectionStart = content.indexOf('<section class="generic-section" id="ajuda">');

if (sectionStart !== -1) {
    // 2. See if there is a 'post-hero-spacer' before it.
    let targetIndex = sectionStart;
    const spacerIndex = content.lastIndexOf('<div class="post-hero-spacer">', sectionStart);
    if (spacerIndex !== -1 && (sectionStart - spacerIndex) < 2000) {
        // The spacer is right before the section
        targetIndex = spacerIndex;
    }
    
    // 3. Insert </main> right before targetIndex
    content = content.substring(0, targetIndex) + '\\n</main>\\n' + content.substring(targetIndex);
    
    // 4. Remove the old </main> at the end
    const lastMainClose = content.lastIndexOf('</main>');
    if (lastMainClose > targetIndex + 10) {
        content = content.substring(0, lastMainClose) + content.substring(lastMainClose + 7);
    }
    
    console.log('Moved </main> to before', targetIndex === spacerIndex ? 'post-hero-spacer' : 'ajuda');
} else {
    console.log('Could not find id="ajuda" section!');
}

// 5. Remove normalizeScroll
content = content.replace('ScrollTrigger.normalizeScroll(true);', '// ScrollTrigger.normalizeScroll(true);');
console.log('Removed normalizeScroll');

// 6. Remove the scrollHeight hack block
const hackStart = content.indexOf('/* FIX PARA O BUG DE ESPAÇO EXTRA DO ZOOM NO CHROME */');
const hackEnd = content.indexOf('</script>', hackStart);
if (hackStart !== -1 && hackEnd !== -1) {
    const hackStr = content.substring(hackStart, hackEnd);
    content = content.replace(hackStr, '');
    console.log('Removed scrollHeight hack block');
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Done!');
