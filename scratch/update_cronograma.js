const fs = require('fs');
const path = require('path');

const baseDir = path.join('c:', 'Users', 'vera', 'Downloads', 'Ribeiro Rinaldi', 'Cronograma de Posts');
const files = ['index.html', 'painel-cronograma-ribeiro-rinaldi.html'];

const shiftDays = 14;

function addDays(dateStr, days) {
  const parts = dateStr.split('-');
  let d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + days);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return yy + "-" + mm + "-" + dd;
}

const newDestaque = `
      {
        id: "destaques-iniciais",
        week: "Semana 1",
        date: "2026-08-17",
        dateLabel: "17/08 (Seg) • Destaques",
        platform: "insta",
        platformLabel: "Instagram Vídeos",
        title: "📱 DESTAQUES: 4 Vídeos Essenciais de Recepção",
        hook: "Gravação e publicação dos 4 vídeos de destaques primordiais: Comece Aqui, Concurseiro, Servidor e Atendimento.",
        script: "[ROTEIROS DOS 4 DESTAQUES INICIAIS]\\n\\nOs roteiros completos estão disponíveis no arquivo Documentos e Prompts/Roteiros_Destaques_Instagram.md.\\n\\nO objetivo é gravar 4 vídeos curtos e diretos em formato 9:16 (em pé), olhando para a câmera, onde Paulo Rinaldi se apresenta, fala com concurseiros, fala com servidores e explica como funciona o atendimento digital.",
        caption: "Não se aplica (Stories/Destaques).",
        tips: "Publicar os vídeos seguidos nos stories na segunda-feira e fixar imediatamente nos destaques correspondentes do perfil."
      },`;

for (const file of files) {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  const dateRegex = /date:\s*"2026-08-(\d{2})",\s*dateLabel:\s*"(\d{2}\/\d{2})\s*\((.*?)\)\s*•\s*(.*?)"/g;

  content = content.replace(dateRegex, (match, dayStr, oldDateLabel, dayName, suffix) => {
    const day = parseInt(dayStr, 10);
    if (day >= 3) {
      const oldDate = "2026-08-" + dayStr;
      const newDate = addDays(oldDate, shiftDays);
      const newDayPart = newDate.split('-')[2];
      const newMonthPart = newDate.split('-')[1];
      
      return 'date: "' + newDate + '",\n        dateLabel: "' + newDayPart + '/' + newMonthPart + ' (' + dayName + ') • ' + suffix + '"';
    }
    return match;
  });

  content = content.replace(/\{\s*id:\s*"sem1-yt"/, newDestaque + '\n      {\n        id: "sem1-yt"');

  const configRegex = /(agosto:\s*\{[\s\S]*?\})/;
  content = content.replace(configRegex, '$1,\n      setembro: {\n        title: "Setembro 2026",\n        year: 2026,\n        monthIndex: 8,\n        daysInMonth: 30,\n        firstDayOfWeek: 2,\n        prevMonthDays: 31\n      }');

  const btnRegex = /<button class="month-btn active" id="btn-agosto" onclick="changeMonth\('agosto'\)">Agosto 2026<\/button>/;
  content = content.replace(btnRegex, '<button class="month-btn active" id="btn-agosto" onclick="changeMonth(' + "'agosto'" + ')">Agosto 2026</button>\n            <button class="month-btn" id="btn-setembro" onclick="changeMonth(' + "'setembro'" + ')">Setembro 2026</button>');

  const toggleAgostoRegex = /document\.getElementById\('btn-agosto'\)\.classList\.toggle\('active', monthKey === 'agosto'\);/;
  content = content.replace(toggleAgostoRegex, "document.getElementById('btn-agosto').classList.toggle('active', monthKey === 'agosto');\n      document.getElementById('btn-setembro')?.classList.toggle('active', monthKey === 'setembro');");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
}
