const fs = require('fs');
let c = fs.readFileSync('midias-graficas/post-fixado-01/index.html', 'utf8');
c = c.replace(/<svg x="\d+" y="\d+" width="\d+" height="\d+" viewBox="0 0 120 120">\s*<polyline points="20,66 48,96 104,24" fill="none" stroke="#FF5E1A" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"\/>\s*<\/svg>/g, '');
fs.writeFileSync('midias-graficas/post-fixado-01/index.html', c);
