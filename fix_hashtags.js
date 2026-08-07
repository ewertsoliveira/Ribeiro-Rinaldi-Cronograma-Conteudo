const fs = require('fs');
const files = ['Cronograma de Posts/painel-cronograma-ribeiro-rinaldi.html', 'Cronograma de Posts/index.html', 'midias-graficas/post-fixado-01/index.html'];
const newBaseTags = '#concursopublico #servidorpublico #advogadoconcurso #posse #ribeirorinaldi #concurseiro';

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // regex para encontrar linhas ou blocos com pelo menos 3 hashtags sequenciais
    content = content.replace(/(?:#[a-zA-ZÀ-ÿ0-9_]+\s*){3,}/g, (match) => {
      let existingTags = match.match(/#[a-zA-ZÀ-ÿ0-9_]+/g) || [];
      existingTags = existingTags.map(t => t.toLowerCase());
      let baseTagsList = newBaseTags.split(' ');
      let mergedTags = [...baseTagsList];
      
      existingTags.forEach(t => {
        if (!mergedTags.includes(t) && t !== '#auditor') {
          mergedTags.push(t);
        }
      });
      
      let res = mergedTags.join(' ');
      if (match.endsWith('\n')) res += '\n';
      else if (match.endsWith('`')) res += '`';
      else if (match.endsWith(',')) res += ',';
      
      return res;
    });
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated hashtags in', file);
    }
  }
});
