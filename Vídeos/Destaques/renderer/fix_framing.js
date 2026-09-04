require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("Uso: node fix_framing.js <caminho_do_video> [N]");
        process.exit(1);
    }
    
    const inputPath = path.resolve(args[0]);
    const N = args.length > 1 ? parseInt(args[1]) : 468;
    const blendH = 25; // Altura do blend alpha no rodapé
    const stripHeight = N + blendH; // 493

    const parsedPath = path.parse(inputPath);
    const stripPath = path.join(parsedPath.dir, 'strip.png');
    const processedStripPath = path.join(parsedPath.dir, 'strip_ready.png');
    const outputPath = path.join(parsedPath.dir, `${parsedPath.name}_fixed.mp4`);

    console.log(`=== Processando ${parsedPath.base} com N=${N}, stripHeight=${stripHeight} ===`);

    // Etapa 2: Obter ou Gerar a Faixa (strip.png)
    if (!fs.existsSync(stripPath)) {
        console.log("strip.png não encontrado. Tentando gerar...");
        if (process.env.GEMINI_API_KEY) {
            console.log("API Key do Gemini encontrada! (Mock da chamada - implementar inpainting real aqui)");
        } else {
            console.log("Fallback: Gerando strip esticando a primeira linha");
            // Extrai frame 0
            execSync(`ffmpeg -y -i "${inputPath}" -vframes 1 "${path.join(parsedPath.dir, 'temp_frame.png')}"`, { stdio: 'ignore' });
            // Crop da segunda linha para evitar a quina escura, estica verticalmente para stripHeight
            execSync(`ffmpeg -y -i "${path.join(parsedPath.dir, 'temp_frame.png')}" -vf "crop=1080:2:0:0,scale=1080:${stripHeight}:flags=bicubic" "${stripPath}"`, { stdio: 'ignore' });
            fs.unlinkSync(path.join(parsedPath.dir, 'temp_frame.png'));
        }
    }

    // Etapa 3: Acabamento (Ruído, Gradiente Alpha, Casamento de Cor) via ffmpeg
    console.log("Aplicando acabamento na faixa (Transição e Grão)...");
    
    try {
        // Usa FFmpeg para adicionar ruido (-vf noise) e criar o canal alpha no rodapé
        // Transparente a partir de N até N + blendH
        const eqFilter = `format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gt(Y,${N}), 255-255*(Y-${N})/${blendH}, 255)'`;
        const noiseFilter = `noise=alls=10:allf=t+u`;
        
        execSync(`ffmpeg -y -i "${stripPath}" -vf "${noiseFilter},${eqFilter}" "${processedStripPath}"`, { stdio: 'ignore' });
    } catch (e) {
        console.error("Erro ao processar strip:", e.message);
        process.exit(1);
    }

    // Etapa 1 e Final: Deslocamento do vídeo e Sobreposição
    console.log("Renderizando vídeo final (Deslocamento + Sobreposição da Faixa)...");
    
    // Usamos um canvas preto gerado via 'color' filter.
    // Sobrepomos o video em y=N. A overlay corta o que vaza automaticamente.
    // Sobrepomos a faixa em y=0.
    const filter = `color=c=black:s=1080x1920:r=30[base]; [base][0:v]overlay=0:${N}:shortest=1[bg]; [bg][1:v]overlay=0:0:format=yuv420[out]`;
    
    try {
        execSync(`ffmpeg -y -i "${inputPath}" -i "${processedStripPath}" -filter_complex "${filter}" -map "[out]" -map 0:a? -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -c:a copy "${outputPath}"`, { stdio: 'inherit' });
        console.log(`✅ Sucesso! Vídeo salvo em: ${outputPath}`);
    } catch (e) {
        console.error("Erro no ffmpeg (overlay):", e.message);
    }
}

main().catch(console.error);
