const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const puppeteer = require('puppeteer');
const fs = require('fs');
const { execSync } = require('child_process');
const { Groq } = require('groq-sdk');

async function main() {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey || groqApiKey.includes('COLE_A_SUA_CHAVE_AQUI')) {
        console.error("❌ ERRO: Chave da API do Groq não encontrada!");
        console.error("Por favor, cole sua chave no arquivo .env (GROQ_API_KEY=...)");
        process.exit(1);
    }

    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.error("Uso: node render_pro.js <caminho_do_video> \"LINHA 1\" \"LINHA 2\"");
        process.exit(1);
    }

    const rawPath = args[0].replace(/^["']|["']$/g, '').trim();
    const videoPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(rawPath);
    const line1 = args[1];
    const line2 = args[2];
    
    const parsedPath = path.parse(videoPath);
    const audioPath = path.join(__dirname, 'temp.mp3');
    const outputPath = path.join(parsedPath.dir, `${parsedPath.name}_Pro.mp4`);
    const framesDir = path.join(__dirname, 'frames');
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);

    console.log("[1/5] Extraindo áudio do vídeo original...");
    try {
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        execSync(`ffmpeg -y -i "${videoPath}" -vn -acodec libmp3lame -q:a 2 "${audioPath}"`, { stdio: 'ignore' });
    } catch (e) {
        console.error("Erro ao extrair áudio:", e.message);
        process.exit(1);
    }

    let wordsData = [];
    const localTranscriptPath = path.join(__dirname, 'transcript_concurseiro.json');
    if (parsedPath.name.toLowerCase().includes('concurseiro') && fs.existsSync(localTranscriptPath)) {
        console.log(`[2/5] Carregando transcrição corrigida de ${localTranscriptPath}...`);
        const transcription = JSON.parse(fs.readFileSync(localTranscriptPath, 'utf8'));
        wordsData = transcription.words.map(w => ({
            word: w.word,
            startMs: Math.round(w.start * 1000),
            endMs: Math.round(w.end * 1000)
        }));
        console.log(`✅ Sucesso! Carregamos ${wordsData.length} palavras da transcrição corrigida.`);
    } else {
        console.log("[2/5] Enviando áudio para o Motor Groq/Whisper (Inteligência Artificial)...");
        const groq = new Groq({ apiKey: groqApiKey });
        try {
            const transcription = await groq.audio.transcriptions.create({
                file: fs.createReadStream(audioPath),
                model: "whisper-large-v3",
                response_format: "verbose_json",
                timestamp_granularities: ["word"]
            });

            if (transcription.words && transcription.words.length > 0) {
                wordsData = transcription.words.map(w => ({
                    word: w.word,
                    startMs: Math.round(w.start * 1000),
                    endMs: Math.round(w.end * 1000)
                }));
                console.log(`✅ Sucesso! Identificamos ${wordsData.length} palavras perfeitamente cronometradas.`);
            } else {
                console.warn("⚠️ A API retornou os textos, mas sem milissegundos por palavra no formato esperado.");
                const dummyWords = transcription.text.split(' ');
                wordsData = dummyWords.map((w, idx) => ({
                    word: w,
                    startMs: idx * 500,
                    endMs: (idx * 500) + 400
                }));
            }
        } catch (e) {
            console.error("❌ Falha na comunicação com a IA:", e.message);
            process.exit(1);
        }
    }

    // Descobrir a duração real do vídeo usando ffprobe para renderizar a exata quantidade de frames
    const durationRaw = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`).toString();
    const durationSeconds = parseFloat(durationRaw);
    const totalFrames = Math.floor(durationSeconds * 30);
    
    console.log(`[3/5] Gerando HTML Inteligente... (Vídeo tem ${durationSeconds.toFixed(2)}s, total de ${totalFrames} frames)`);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;900&display=swap" rel="stylesheet">
      <style> body { margin: 0; padding: 0; background: transparent; overflow: hidden; } </style>
    </head>
    <body>
      <div style="font-family: 'Archivo'; font-weight: 900; opacity: 0; position: absolute;">preload</div>
      <canvas id="c" width="1080" height="1920"></canvas>
      
      <script>
        const wordsData = ${JSON.stringify(wordsData)};
        
        document.fonts.ready.then(() => { window.fontsLoaded = true; });

        window.drawFrame = function(elapsed) {
            const canvas = document.getElementById('c');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, 1080, 1920);
            
            // 1. HEADLINE ESTÁTICA COM FADE IN E FADE OUT
            let opacity = 0;
            if (elapsed < 500) {
                opacity = elapsed / 500; // Fade in suave no início
            } else if (elapsed <= 4000) {
                opacity = 1; // Permanece por 3.5 segundos
            } else if (elapsed <= 4500) {
                opacity = 1 - ((elapsed - 4000) / 500); // Fade out suave
            }
            
            if (opacity > 0) {
                ctx.globalAlpha = opacity;

                const bgGrad = ctx.createLinearGradient(0, 0, 0, 537);
                bgGrad.addColorStop(0, 'rgba(15,12,10,0.95)');
                bgGrad.addColorStop(0.6, 'rgba(15,12,10,0.3)');
                bgGrad.addColorStop(1, 'rgba(15,12,10,0)');
                ctx.fillStyle = bgGrad;
                ctx.fillRect(0, 0, 1080, 537);
                
                const xPos = 72; const yCenter = 240; 
                const lineGrad = ctx.createLinearGradient(xPos, 0, xPos + 144, 0);
                lineGrad.addColorStop(0, '#FF5E1A');
                lineGrad.addColorStop(1, '#F0247C');
                ctx.shadowColor = 'rgba(0,0,0,0.9)';
                ctx.shadowOffsetY = 4.8; ctx.shadowBlur = 9.6;
                ctx.fillStyle = lineGrad;
                ctx.fillRect(xPos, yCenter - 72, 144, 14.4);
                
                ctx.textBaseline = 'top';
                let fontSize = 76.8;
                ctx.font = "900 " + fontSize + "px 'Archivo'";
                let width1 = ctx.measureText("${line1} ").width;
                let width2 = ctx.measureText("${line2}").width;
                let totalWidth = width1 + width2;
                
                if (xPos + totalWidth > 1008) { // 1080 - 72 = 1008
                    fontSize = fontSize * ((1008 - xPos) / totalWidth);
                    ctx.font = "900 " + fontSize + "px 'Archivo'";
                    width1 = ctx.measureText("${line1} ").width;
                }

                ctx.fillStyle = '#FFFFFF';
                ctx.fillText("${line1} ", xPos, yCenter - 24);
                
                ctx.fillStyle = lineGrad;
                ctx.shadowBlur = 14.4;
                ctx.fillText("${line2}", xPos + width1, yCenter - 24);

                ctx.globalAlpha = 1;
            }

            // 2. LEGENDA KARAOKÊ COM TIMING REAL E PAGINAÇÃO FIXA
            let activeIndex = -1;
            for(let i=0; i<wordsData.length; i++) {
                if (elapsed >= wordsData[i].startMs && elapsed <= wordsData[i].endMs + 300) {
                    activeIndex = i;
                    break;
                }
            }
            if (activeIndex === -1) {
                for(let i=wordsData.length-1; i>=0; i--) {
                    if (elapsed > wordsData[i].endMs) { activeIndex = i; break; }
                }
            }
            
            if (activeIndex >= 0) {
                // Paginação fixa: blocos de 6 palavras para legibilidade perfeita
                const CHUNK_SIZE = 6;
                const chunkIndex = Math.floor(activeIndex / CHUNK_SIZE);
                const chunkStart = chunkIndex * CHUNK_SIZE;
                const chunkEnd = Math.min(chunkStart + CHUNK_SIZE - 1, wordsData.length - 1);
                
                const baseGrad = ctx.createLinearGradient(0, 1920, 0, 1920 - 600);
                baseGrad.addColorStop(0, 'rgba(15,12,10,0.95)');
                baseGrad.addColorStop(0.6, 'rgba(15,12,10,0.3)');
                baseGrad.addColorStop(1, 'rgba(15,12,10,0)');
                ctx.fillStyle = baseGrad;
                ctx.fillRect(0, 1920 - 600, 1080, 600);
                
                ctx.font = "700 64px 'Archivo'";
                const maxWidth = 1080 - 120;
                const spaceWidth = ctx.measureText(" ").width;
                
                // Pré-calcular as linhas do chunk para centralizar horizontalmente
                let lines = [];
                let currentLine = [];
                let currentLineWidth = 0;
                
                for (let i = chunkStart; i <= chunkEnd; i++) {
                    let wInfo = wordsData[i];
                    let wordWidth = ctx.measureText(wInfo.word).width;
                    
                    if (currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
                        currentLineWidth -= spaceWidth;
                        lines.push({ words: currentLine, width: currentLineWidth });
                        currentLine = [{ index: i, text: wInfo.word, width: wordWidth }];
                        currentLineWidth = wordWidth + spaceWidth;
                    } else {
                        currentLine.push({ index: i, text: wInfo.word, width: wordWidth });
                        currentLineWidth += wordWidth + spaceWidth;
                    }
                }
                if (currentLine.length > 0) {
                    currentLineWidth -= spaceWidth;
                    lines.push({ words: currentLine, width: currentLineWidth });
                }
                
                // Desenhar centralizado
                let startY = 1450; // Legenda mais alta, próxima às mãos
                for (let l = 0; l < lines.length; l++) {
                    let line = lines[l];
                    let startX = (1080 - line.width) / 2;
                    
                    for (let w = 0; w < line.words.length; w++) {
                        let wordObj = line.words[w];
                        
                        ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowOffsetY = 4;
                        
                        if (wordObj.index === activeIndex) {
                            const wGrad = ctx.createLinearGradient(startX, 0, startX + wordObj.width, 0);
                            wGrad.addColorStop(0, '#FF5E1A');
                            wGrad.addColorStop(1, '#F0247C');
                            ctx.fillStyle = wGrad;
                        } else {
                            // Palavras lidas e não lidas ficam totalmente brancas
                            ctx.fillStyle = '#FFFFFF';
                        }
                        
                        ctx.fillText(wordObj.text, startX, startY);
                        startX += wordObj.width + spaceWidth;
                    }
                    startY += 85;
                }
            }
        }
      </script>
    </body>
    </html>
    `;

    const htmlPath = path.join(__dirname, 'temp.html');
    fs.writeFileSync(htmlPath, htmlContent);

    console.log("[4/5] Renderizando imagens matematicamente perfeitas frame-a-frame via Puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
    await page.waitForFunction('window.fontsLoaded === true');
    
    for (let i = 0; i < totalFrames; i++) {
        const elapsed = (i / 30) * 1000;
        await page.evaluate(`window.drawFrame(${elapsed})`);
        const frameName = `frame_${String(i).padStart(4, '0')}.png`;
        await page.screenshot({ path: path.join(framesDir, frameName), omitBackground: true });
        
        if (i % 30 === 0 && i !== 0) console.log(`  - Renderizados ${i} / ${totalFrames} frames...`);
    }
    
    await browser.close();
    fs.unlinkSync(htmlPath);

    console.log("[5/5] Finalizando: Costurando o novo Karaokê no MP4 Oficial com FFmpeg...");
    const framesPattern = path.join(framesDir, 'frame_%04d.png');
    const ffmpegCmd = `ffmpeg -y -i "${videoPath}" -framerate 30 -i "${framesPattern}" -filter_complex "[1:v]format=rgba[ol];[0:v][ol]overlay=0:0:shortest=1[out]" -map "[out]" -map 0:a -c:v libx264 -crf 18 -preset fast -c:a copy "${outputPath}"`;
    
    try {
        execSync(ffmpegCmd, { stdio: 'inherit' });
        console.log(`\n✅ SUCESSO ABSOLUTO! Vídeo autônomo gerado em: ${outputPath}`);
    } catch (e) {
        console.error("\n❌ Erro na finalização (ffmpeg):", e.message);
    }
    
    const files = fs.readdirSync(framesDir);
    for (const file of files) fs.unlinkSync(path.join(framesDir, file));
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
}

main().catch(console.error);
