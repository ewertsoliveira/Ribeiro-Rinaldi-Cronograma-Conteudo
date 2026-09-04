const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.error("Uso: node render.js <caminho_do_video> \"LINHA 1\" \"LINHA 2\"");
        process.exit(1);
    }

    const rawPath = args[0].replace(/^["']|["']$/g, '').trim();
    const videoPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(rawPath);
    const line1 = args[1];
    const line2 = args[2];
    
    // Nomes de arquivo
    const framesDir = path.join(__dirname, 'frames');
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);
    
    const parsedPath = path.parse(videoPath);
    const outputPath = path.join(parsedPath.dir, `${parsedPath.name}_Renderizado_Animado.mp4`);

    console.log(`[1/3] Gerando HTML com a Headline: "${line1}" / "${line2}" e Motor Karaokê`);
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;900&display=swap" rel="stylesheet">
      <style>
        body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
      </style>
    </head>
    <body>
      <div style="font-family: 'Archivo'; font-weight: 900; opacity: 0; position: absolute;">preload</div>
      <div style="font-family: 'Archivo'; font-weight: 700; opacity: 0; position: absolute;">preload</div>
      <canvas id="c" width="1080" height="1920"></canvas>
      
      <script>
        // Aguarda a fonte para garantir que a renderização inicial não use Arial
        document.fonts.ready.then(() => {
            window.fontsLoaded = true;
        });

        window.drawFrame = function(elapsed) {
            const canvas = document.getElementById('c');
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, 1080, 1920);
            
            // ============================================
            // 1. HEADLINE ESTÁTICA (APROVADA)
            // ============================================
            // Fundo Fade Preto (Topo)
            let opacity = 1;
            // Efeito Fade-in/out da Headline (0 a 0.5s e 4.5 a 5.0s)
            if (elapsed < 500) opacity = elapsed / 500;
            else if (elapsed > 4500 && elapsed <= 5000) opacity = 1 - ((elapsed - 4500) / 500);
            else if (elapsed > 5000) opacity = 0;
            
            ctx.globalAlpha = opacity;

            const bgGrad = ctx.createLinearGradient(0, 0, 0, 537);
            bgGrad.addColorStop(0, 'rgba(15,12,10,0.95)');
            bgGrad.addColorStop(0.6, 'rgba(15,12,10,0.3)');
            bgGrad.addColorStop(1, 'rgba(15,12,10,0)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, 1080, 537);
            
            const xPos = 72; 
            const yCenter = 240; 
            
            const lineGrad = ctx.createLinearGradient(xPos, 0, xPos + 144, 0);
            lineGrad.addColorStop(0, '#FF5E1A');
            lineGrad.addColorStop(1, '#F0247C');
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowOffsetY = 4.8; 
            ctx.shadowBlur = 9.6;
            ctx.fillStyle = lineGrad;
            ctx.fillRect(xPos, yCenter - 72, 144, 14.4);
            
            ctx.font = "900 76.8px 'Archivo'";
            ctx.textBaseline = 'top';
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText("${line1}", xPos, yCenter - 24);
            
            ctx.fillStyle = lineGrad;
            ctx.shadowBlur = 14.4;
            ctx.fillText("${line2}", xPos, yCenter + 52.8);

            ctx.globalAlpha = 1;

            // ============================================
            // 2. LEGENDA KARAOKÊ (SIMULADA)
            // ============================================
            
            // Fundo Fade Preto (Base)
            const baseGrad = ctx.createLinearGradient(0, 1920, 0, 1920 - 600);
            baseGrad.addColorStop(0, 'rgba(15,12,10,0.95)');
            baseGrad.addColorStop(0.6, 'rgba(15,12,10,0.3)');
            baseGrad.addColorStop(1, 'rgba(15,12,10,0)');
            ctx.fillStyle = baseGrad;
            ctx.fillRect(0, 1920 - 600, 1080, 600);

            const text = "É exatamente por isso que o seu direito está ameaçado.";
            const words = text.split(" ");
            // 180 frames = 6000ms. O video teste.mp4 tem ~22s, mas vamos simular em 6s.
            let currentWordIdx = Math.floor(elapsed / 500); 
            if (currentWordIdx >= words.length) currentWordIdx = words.length - 1;
            
            ctx.font = "700 60px 'Archivo'"; // Fonte da legenda Karaokê
            
            let x = 120;
            let y = 1600; // Área inferior
            let maxWidth = 1080 - 240;
            
            for (let i = 0; i < words.length; i++) {
                let w = words[i];
                let metrics = ctx.measureText(w + " ");
                
                // Quebra de linha
                if (x + metrics.width > maxWidth + 120) {
                    x = 120;
                    y += 80; 
                }
                
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(0,0,0,0.9)';
                ctx.shadowOffsetY = 4;
                
                if (i < currentWordIdx) {
                    ctx.fillStyle = '#FFFFFF'; // Lida
                } else if (i === currentWordIdx) {
                    const wGrad = ctx.createLinearGradient(x, 0, x + metrics.width, 0);
                    wGrad.addColorStop(0, '#FF5E1A');
                    wGrad.addColorStop(1, '#F0247C');
                    ctx.fillStyle = wGrad; // Lendo
                } else {
                    ctx.fillStyle = 'rgba(255,255,255,0.4)'; // Futura
                }
                
                ctx.fillText(w, x, y);
                x += metrics.width;
            }
        }
      </script>
    </body>
    </html>
    `;

    const htmlPath = path.join(__dirname, 'temp.html');
    fs.writeFileSync(htmlPath, htmlContent);

    console.log("[2/3] Rodando Puppeteer para capturar 180 frames transparentes (6s a 30fps)...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
    await page.waitForFunction('window.fontsLoaded === true');
    
    // Rende 180 frames (6 segundos)
    const totalFrames = 180;
    for (let i = 0; i < totalFrames; i++) {
        const elapsed = (i / 30) * 1000;
        await page.evaluate(`window.drawFrame(${elapsed})`);
        
        const frameName = `frame_${String(i).padStart(3, '0')}.png`;
        await page.screenshot({ 
            path: path.join(framesDir, frameName), 
            omitBackground: true 
        });
        
        if (i % 30 === 0) console.log(`  - ${i}/${totalFrames} frames capturados...`);
    }
    
    await browser.close();
    fs.unlinkSync(htmlPath);

    console.log("[3/3] Acionando FFmpeg para fundir os 180 frames animados sobre o vídeo...");
    
    // Como a animação dura 6 segundos (180 frames), usamos shortest=1 para parar no menor (o vídeo ou a animação)
    const framesPattern = path.join(framesDir, 'frame_%03d.png');
    const ffmpegCmd = `ffmpeg -y -i "${videoPath}" -framerate 30 -i "${framesPattern}" -filter_complex "[1:v]format=rgba[ol];[0:v][ol]overlay=0:0:shortest=1[out]" -map "[out]" -map 0:a? -c:v libx264 -crf 18 -preset fast -c:a copy "${outputPath}"`;
    
    try {
        execSync(ffmpegCmd, { stdio: 'inherit' });
        console.log(`\n✅ SUCESSO! Vídeo animado exportado em: ${outputPath}`);
    } catch (e) {
        console.error("\n❌ Erro ao rodar o ffmpeg:", e.message);
    }
    
    // Limpa a pasta de frames para economizar espaço
    const files = fs.readdirSync(framesDir);
    for (const file of files) {
        fs.unlinkSync(path.join(framesDir, file));
    }
}

main().catch(console.error);
