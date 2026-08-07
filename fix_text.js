const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('.git') && !file.includes('node_modules')) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.html') || file.endsWith('.md') || file.endsWith('.txt') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('.');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Substituir "Paulo Rinaldi" por "Paulo Rinaldi"
  content = content.replace(/O Dr\. Paulo Rinaldi/g, 'Paulo Rinaldi');
  content = content.replace(/o Dr\. Paulo Rinaldi/g, 'o Paulo Rinaldi');
  content = content.replace(/Dr\. Paulo Rinaldi/g, 'Paulo Rinaldi');
  content = content.replace(/DR\. PAULO RINALDI/g, 'PAULO RINALDI');
  content = content.replace(/Dr\. Paulo/g, 'Paulo');
  
  // Substituir "Advogado e Servidor Público" por "Advogado e Servidor Público"
  content = content.replace(/como Advogado e Servidor Público/g, 'como Advogado e Servidor Público');
  content = content.replace(/Advogado e Servidor Público/g, 'Advogado e Servidor Público');
  content = content.replace(/Advogado e Servidor Público/g, 'Advogado e Servidor Público');
  content = content.replace(/Advogado e Servidor Público/g, 'Advogado e Servidor Público');
  content = content.replace(/Advogado e Servidor Público de Estado/g, 'Advogado e Servidor Público de Estado');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
