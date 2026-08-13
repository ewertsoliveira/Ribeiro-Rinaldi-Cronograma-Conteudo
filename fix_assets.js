const fs = require('fs');
const path = require('path');

const dir = 'LANDINGPAGE/assets/sequencia-hero';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.webp')) {
    // Sequência 0100.webp -> sequencia_0100.webp
    let newName = file.replace('Sequência ', 'sequencia_');
    fs.renameSync(path.join(dir, file), path.join(dir, newName));
  }
});

let indexPath = 'LANDINGPAGE/index.html';
let content = fs.readFileSync(indexPath, 'utf8');
content = content.replace(/Sequência /g, 'sequencia_');
fs.writeFileSync(indexPath, content, 'utf8');

