require('dotenv').config({ path: 'C:\\Users\\vera\\Downloads\\Ribeiro Rinaldi\\Vídeos\\Destaques\\renderer\\.env' });
const { Groq } = require('groq-sdk');
const fs = require('fs');

async function transcribe() {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const audioPath = 'test_audio.wav';
    
    try {
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-large-v3",
        });
        console.log("TRANSCRIÇÃO:");
        console.log(transcription.text);
    } catch (e) {
        console.error("Erro:", e.message);
    }
}
transcribe();
