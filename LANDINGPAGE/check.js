const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const openCount = (content.match(/<main/g) || []).length;
const closeCount = (content.match(/<\/main>/g) || []).length;
console.log('main open tags:', openCount);
console.log('main close tags:', closeCount);

const footerOpen = (content.match(/<footer/g) || []).length;
const footerClose = (content.match(/<\/footer>/g) || []).length;
console.log('footer open tags:', footerOpen);
console.log('footer close tags:', footerClose);

const mainIndex = content.indexOf('<main');
const footerIndex = content.indexOf('<footer');
const mainCloseIndex = content.indexOf('</main>');

console.log('main index:', mainIndex);
console.log('main close index:', mainCloseIndex);
console.log('footer index:', footerIndex);

const heroPinArea = content.indexOf('id="heroPinArea"');
console.log('heroPinArea index:', heroPinArea);

const nextSection = content.indexOf('<section', heroPinArea);
console.log('nextSection index:', nextSection);
