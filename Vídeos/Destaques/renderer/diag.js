const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const videoPath = "c:\\Users\\vera\\Downloads\\Ribeiro Rinaldi\\Vídeos\\Destaque - Servidor.mp4";
const framesDir = path.join(__dirname, 'diag_frames');

async function main() {
    console.log("=== ETAPA 0: DIAGNÓSTICO ===");
    
    // 1. Metadata
    let duration = 0;
    try {
        const ffprobeCmd = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
        const output = execSync(ffprobeCmd, { encoding: 'utf-8' }).trim().split('\n');
        console.log(`Resolução: ${output[0]}x${output[1]}`);
        console.log(`FPS: ${output[2]}`);
        console.log(`Duração (s): ${output[3]}`);
        duration = parseFloat(output[3]);
    } catch (e) {
        console.error("Erro no ffprobe:", e.message);
        process.exit(1);
    }

    // 2. Extrair 5 frames
    if (fs.existsSync(framesDir)) fs.rmSync(framesDir, { recursive: true, force: true });
    fs.mkdirSync(framesDir);
    
    const timepoints = [0.1, 0.3, 0.5, 0.7, 0.9].map(f => f * duration);
    timepoints.forEach((t, i) => {
        execSync(`ffmpeg -y -ss ${t} -i "${videoPath}" -vframes 1 "${path.join(framesDir, `frame_${i}.png`)}"`, { stdio: 'ignore' });
    });

    // 3. Puppeteer Analysis
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body>
        <canvas id="c" width="1080" height="1920"></canvas>
        <script>
            window.analyze = async function() {
                const canvas = document.getElementById('c');
                const ctx = canvas.getContext('2d');
                
                // Carregar frames
                const frames = [];
                for(let i=0; i<5; i++) {
                    const img = new Image();
                    img.src = 'diag_frames/frame_' + i + '.png';
                    await new Promise(r => img.onload = r);
                    frames.push(img);
                }

                let results = {};
                
                // --- Estabilidade (Max Deslocamento) ---
                // Vamos usar um patch 100x100 no canto superior esquerdo (x=50, y=50) do frame 0
                ctx.drawImage(frames[0], 0, 0);
                const patch0 = ctx.getImageData(50, 50, 100, 100).data;
                
                let maxDisplacement = 0;
                for(let i=1; i<5; i++) {
                    ctx.drawImage(frames[i], 0, 0);
                    // Busca exaustiva em uma janela [-5, 5]
                    let bestSAD = Infinity;
                    let bestDx = 0, bestDy = 0;
                    for (let dy = -5; dy <= 5; dy++) {
                        for (let dx = -5; dx <= 5; dx++) {
                            const searchPatch = ctx.getImageData(50 + dx, 50 + dy, 100, 100).data;
                            let sad = 0;
                            for(let j=0; j<patch0.length; j+=4) {
                                sad += Math.abs(patch0[j] - searchPatch[j]) + Math.abs(patch0[j+1] - searchPatch[j+1]) + Math.abs(patch0[j+2] - searchPatch[j+2]);
                            }
                            if (sad < bestSAD) {
                                bestSAD = sad;
                                bestDx = dx; bestDy = dy;
                            }
                        }
                    }
                    const dist = Math.max(Math.abs(bestDx), Math.abs(bestDy));
                    if (dist > maxDisplacement) maxDisplacement = dist;
                }
                results.maxDisplacement = maxDisplacement;

                // --- Variância das 8 primeiras linhas ---
                let totalVariance = 0;
                for(let i=0; i<5; i++) {
                    ctx.drawImage(frames[i], 0, 0);
                    const topRows = ctx.getImageData(0, 0, 1080, 8).data;
                    let lumas = [];
                    for(let j=0; j<topRows.length; j+=4) {
                        // luma approx
                        lumas.push(0.299*topRows[j] + 0.587*topRows[j+1] + 0.114*topRows[j+2]);
                    }
                    let mean = lumas.reduce((a,b)=>a+b, 0) / lumas.length;
                    let variance = lumas.reduce((a,b)=>a + Math.pow(b - mean, 2), 0) / lumas.length;
                    totalVariance += variance;
                }
                results.avgVariance = totalVariance / 5;
                
                // Medir a headline
                ctx.clearRect(0,0,1080,1920);
                // Headline code da ref
                const xPos = 72; const yCenter = 240; 
                ctx.font = "900 76.8px 'Arial'"; // placeholder font if Archivo isn't loaded
                ctx.textBaseline = 'top';
                ctx.fillText("ADVOGADO E", xPos, yCenter - 24);
                ctx.fillText("SERVIDOR PÚBLICO", xPos, yCenter + 52.8);
                
                // Find lowest non-transparent pixel
                const idata = ctx.getImageData(0,0,1080,500).data;
                let maxY = 0;
                for(let y=0; y<500; y++) {
                    for(let x=0; x<1080; x++) {
                        const alpha = idata[(y*1080 + x)*4 + 3];
                        if (alpha > 0) {
                            if (y > maxY) maxY = y;
                        }
                    }
                }
                results.headlineHeight = maxY + 1; // +1 to include the pixel

                return results;
            }
        </script>
    </body>
    </html>
    `;
    const htmlPath = path.join(__dirname, 'diag.html');
    fs.writeFileSync(htmlPath, htmlContent);

    const browser = await puppeteer.launch({ headless: 'new', args: ['--allow-file-access-from-files'] });
    const page = await browser.newPage();
    await page.goto('file://' + htmlPath);
    const results = await page.evaluate(() => window.analyze());
    await browser.close();

    console.log("Resultados:", results);
    fs.unlinkSync(htmlPath);
    fs.rmSync(framesDir, { recursive: true, force: true });
}

main().catch(console.error);
