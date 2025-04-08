server/src/services/server.jsrequire('dotenv').config();
const xss = require('xss');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

const { rotaChat } = require('../routes/rotaChat');
const { upload, handleFileUpload } = require('../controllers/importarArquivo');
const { processFiles } = require('../controllers/processarArquivos');
const { salvarMensagens } = require('../public/scripts/salvarMSG');
const carregarConversasSalvas = require('../controllers/carregarConversasSalvas');
const { carregarArquivosProcessados } = require('../controllers/carregarArquivos');

// Caminhos padrão para pastas de dados
const baseDataPath = path.resolve(__dirname, '../data');
const uploadDir = path.join(baseDataPath, 'uploads');
const processedDir = path.join(baseDataPath, 'processed');
const logDir = path.join(baseDataPath, 'log');

console.log("Diretório base de dados:", baseDataPath);
console.log("Diretório de logs:", logDir);
console.log("Diretório de arquivos processados:", processedDir);
console.log("Diretório de uploads:", uploadDir);

// Verifica se os diretórios existem, caso contrário, cria-os
[baseDataPath, uploadDir, processedDir, logDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Criado diretório: ${dir}`);
    }
});

let memoriaMensagens = [];

// Função para carregar arquivos processados
// function carregarArquivosProcessados() {
//     if (!fs.existsSync(processedDir)) {
//         console.log('Diretório de arquivos processados não encontrado.');
//         return;
//     }

//     const processedFiles = fs.readdirSync(processedDir).filter(file => file.endsWith('.json'));
//     processedFiles.forEach(file => {
//         try {
//             const filePath = path.join(processedDir, file);
//             const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

//             if (Array.isArray(fileContent)) {
//                 fileContent.forEach(message => {
//                     if (message && typeof message.content === 'string') {
//                         memoriaMensagens.push({ role: 'assistant', content: message.content });
//                     }
//                 });
//             } else if (typeof fileContent === 'object') {
//                 Object.keys(fileContent).forEach(key => {
//                     const message = fileContent[key];
//                     if (typeof message === 'string') {
//                         memoriaMensagens.push({ role: 'assistant', content: message });
//                     }
//                 });
//             } else {
//                 console.error(`O conteúdo do arquivo ${file} não é um array nem um objeto válido.`);
//             }
//         } catch (error) {
//             console.error(`Erro ao carregar o arquivo processado ${file}:`, error.message);
//         }
//     });
// }

function limitarMemoriaMensagens(maxTokens) {
    let totalTokens = 0;
    const mensagensLimitadas = [];

    for (let i = memoriaMensagens.length - 1; i >= 0; i--) {
        const mensagem = memoriaMensagens[i];
        const tokensMensagem = mensagem.content.split(/\s+/).length;

        if (totalTokens + tokensMensagem > maxTokens) break;

        totalTokens += tokensMensagem;
        mensagensLimitadas.unshift(mensagem);
    }

    return mensagensLimitadas;
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_GROK_TESTE || console.log("Chave API não encontrada no .env");

const groq = new Groq({ apiKey: API_URL });

function FormatarRespostas(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '\n\n$1\n')
        .replace(/\*(.*?)\*/g, '  - $1')
        .replace(/(\d+)\.\s/g, '\n$1. ')
        .replace(/(\n){3,}/g, '\n\n')
        .replace(/Jacob/g, '**Jacob**')
        .replace(/- (.*?)\n/g, '  - $1\n\n');
}


// Rota para lidar com mensagens do cliente

    

app.post('/chat', async (req, res) => {
    try {
        const userMessage = xss(req.body.message);
        if (!userMessage) return res.status(400).json({ error: 'Mensagem não pode ser vazia.' });

        memoriaMensagens.push({ role: 'user', content: userMessage });
        const mensagensParaModelo = limitarMemoriaMensagens(6000);

        const chatCompletion = await groq.chat.completions.create({
            model: "llama3-8b-8192",
            messages: mensagensParaModelo,
            temperature: 0.7,
            max_completion_tokens: 512,
            top_p: 0.9,
            presence_penalty: 0.6,
            frequency_penalty: 0.2,
            stream: false
        });

        const botReply = chatCompletion.choices[0]?.message?.content || '';
        memoriaMensagens.push({ role: 'assistant', content: botReply });

        res.json({ response: FormatarRespostas(botReply) });
    } catch (error) {
        console.error('Erro ao processar a solicitação:', error.message);
        res.status(500).json({ error: 'Erro ao processar a solicitação.', details: error.message });
    }
});

app.post('/upload', upload.single('file'), handleFileUpload);

app.get('/files', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar arquivos.' });
    }
});

app.delete('/files/:fileName', (req, res) => {
    try {
        const filePath = path.join(uploadDir, req.params.fileName);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado.' });

        fs.unlinkSync(filePath);
        res.json({ message: `Arquivo "${req.params.fileName}" deletado com sucesso.` });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar arquivo.' });
    }
});

app.get('/processed-files', (req, res) => {
    try {
        const files = fs.existsSync(processedDir) ? fs.readdirSync(processedDir) : [];
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar arquivos processados.' });
    }
});

app.get('/logs', (req, res) => {
    try {
        if (!fs.existsSync(logDir)) return res.json([]);
        const logFiles = fs.readdirSync(logDir).filter(file => path.extname(file) === '.json');
        res.json(logFiles);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar os arquivos de log.' });
    }
});

app.get('/logs/:fileName', (req, res) => {
    try {
        const logFilePath = path.join(logDir, req.params.fileName);
        if (!fs.existsSync(logFilePath)) return res.status(404).json({ error: 'Arquivo de log não encontrado.' });

        const fileContent = fs.readFileSync(logFilePath, 'utf-8');
        res.json(JSON.parse(fileContent));
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar o conteúdo do log.' });
    }
});

app.post('/process-files', async (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);
        const processed = [];

        for (const file of files) {
            const content = fs.readFileSync(path.join(uploadDir, file), 'utf-8');
            const jsonContent = JSON.stringify({ original: content });
            const processedFilePath = path.join(processedDir, `${file}.json`);
            fs.writeFileSync(processedFilePath, jsonContent);
            processed.push(`${file}.json`);
        }

        res.json({ message: 'Arquivos processados com sucesso!', processed });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao processar arquivos.' });
    }
});

app.post('/save-message', (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || messages.length === 0) return res.status(400).json({ error: 'Nenhuma mensagem fornecida.' });

        const fileName = salvarMensagens(messages);
        res.json({ message: 'Mensagens salvas com sucesso.', fileName });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar mensagens.' });
    }
});

app.post('/load-processed', (req, res) => { // Carregar arquivos processados na memória
    try {
        if (!fs.existsSync(processedDir)) return res.status(404).json({ error: 'Diretório de arquivos processados não encontrado.' });

        const files = fs.readdirSync(processedDir).filter(file => file.endsWith('.json')); // Filtrar apenas arquivos .json
        files.forEach(file => {
            const fileContent = JSON.parse(fs.readFileSync(path.join(processedDir, file), 'utf-8'));
            fileContent.forEach(message => {
                memoriaMensagens.push({
                    role: message.isUser ? 'user' : 'assistant',
                    content: message.message
                });
            });
        });
        res.json({ message: 'Memória alimentada com os arquivos processados.', files });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar arquivos processados.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    carregarConversasSalvas(memoriaMensagens);
    carregarArquivosProcessados(processedDir, memoriaMensagens);
});
