const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const ctaStart = content.indexOf('<section class="cta-final-section"');
const svgStart = content.indexOf('<svg class="cta-gabarito-graphic"');
const ctaEnd = content.indexOf('</section>', ctaStart);

console.log('ctaStart:', ctaStart);
console.log('svgStart:', svgStart);
console.log('ctaEnd:', ctaEnd);

if (svgStart > ctaStart && svgStart < ctaEnd) {
    console.log('SVG is INSIDE cta-final-section!');
} else {
    console.log('SVG is OUTSIDE cta-final-section!');
}

const footerStart = content.indexOf('<footer class="main-footer">');
console.log('footerStart:', footerStart);
