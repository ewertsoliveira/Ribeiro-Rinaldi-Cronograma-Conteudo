const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const svgStart = content.indexOf('<svg class="cta-gabarito-graphic"');
console.log(content.substring(svgStart, svgStart + 500));
