const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /\\.cta-final-section\\s*\\{[\\s\\S]*?z-index:\\s*10;\\s*\\}/;
const replaceStr = ".cta-final-section {\\n      padding: clamp(60px, 8vw, 120px) clamp(20px, 4vw, 40px) clamp(40px, 6vw, 80px);\\n      background: var(--rr-bg);\\n      position: relative;\\n      z-index: 10;\\n      overflow: hidden;\\n    }";

if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync('index.html', content, 'utf8');
    console.log('Fixed cta-final-section overflow!');
} else {
    console.log('Target regex not found!');
}
