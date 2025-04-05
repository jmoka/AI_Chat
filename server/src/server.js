require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const xss = require('xss'); // Importando o módulo xss para tratar a mensagem enviada pelo cliente, evitando ataques de injeção de código
const express = require('express'); // Importando o módulo express para criar o servidor
const axios = require('axios'); // Importando o módulo axios para fazer requisições HTTP
const bodyParser = require('body-parser'); // Importando o módulo body-parser para analisar o corpo das requisições
const cors = require('cors'); // Importando o módulo cors para habilitar CORS, para todas as rotas, tem afunção de permitir que o frontend acesse o backend
const fs = require('fs'); //Importando o módulo fs para manipulação de arquivos
const path = require('path'); // Importando o módulo path para manipulação de caminhos de arquivos
const Groq = require('groq-sdk'); // Importando o SDK corretamente
const { handleClientMessage } = require('../src/public/scripts/msgClientes'); // Importando o módulo msgClientes.js
const { upload, handleFileUpload } = require('./controllers/importarArquivo'); // Importa o módulo de upload
const { processFiles } = require('./controllers/processarArquivos'); // Importe a função de processamento
const { salvarMensagens } = require('../src/public/scripts/salvarMSG'); // Importando o módulo salvarMSG
const carregarConversasSalvas = require('./controllers/carregarConversasSalvas');



// Memória da conversa


let memoriaMensagens = [];



// Função para carregar arquivos processados
function carregarArquivosProcessados() {
    const processedDir = path.join(__dirname, '../../data/processed');
    if (!fs.existsSync(processedDir)) {
        console.log('Diretório de arquivos processados não encontrado.');
        return;
    }

    const processedFiles = fs.readdirSync(processedDir).filter(file => file.endsWith('.json'));
    processedFiles.forEach(file => {
        try {
            const filePath = path.join(processedDir, file);
            const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            // Verifica se o conteúdo do arquivo é um array
            if (Array.isArray(fileContent)) {
                fileContent.forEach(message => {
                    if (message && typeof message.content === 'string') {
                        memoriaMensagens.push({
                            role: 'assistant', // Assume que o conteúdo processado é do assistente
                            content: message.content
                        });
                    }
                });
                console.log(`Conteúdo carregado do arquivo processado (array): ${file}`);
            } else if (typeof fileContent === 'object') {
                // Se for um objeto, processa diretamente
                Object.keys(fileContent).forEach(key => {
                    const message = fileContent[key];
                    if (message && typeof message === 'string') {
                        memoriaMensagens.push({
                            role: 'assistant', // Assume que o conteúdo processado é do assistente
                            content: message
                        });
                    }
                });
                console.log(`Conteúdo carregado do arquivo processado (objeto): ${file}`);
            } else {
                console.error(`O conteúdo do arquivo ${file} não é um array nem um objeto válido.`);
            }
        } catch (error) {
            console.error(`Erro ao carregar o arquivo processado ${file}:`, error.message);
        }
    });
}

// Função para limitar a memória de mensagens
function limitarMemoriaMensagens(maxTokens) {
    let totalTokens = 0;
    const mensagensLimitadas = [];

    // Itera sobre as mensagens da memória, começando pelas mais recentes
    for (let i = memoriaMensagens.length - 1; i >= 0; i--) {
        const mensagem = memoriaMensagens[i];
        const tokensMensagem = mensagem.content.split(/\s+/).length; // Estima o número de tokens com base nas palavras

        if (totalTokens + tokensMensagem > maxTokens) {
            break; // Para de adicionar mensagens se o limite for atingido
        }

        totalTokens += tokensMensagem;
        mensagensLimitadas.unshift(mensagem); // Adiciona a mensagem ao início do array
    }

    return mensagensLimitadas;
}

const app = express(); // Criando uma instância do Express
app.use(cors()); // Habilitando CORS para todas as rotas
app.use(bodyParser.json()); // Para analisar o corpo das requisições JSON
app.use(bodyParser.urlencoded({ extended: true })); // Para analisar o corpo das requisições URL-encoded

const PORT = process.env.PORT || 3000; // Definindo a porta do servidor
const API_URL = process.env.API_GROK_TESTE || console.log("Chave API não Corresponde, verificar arquivo .env, ou o nome da variável"); // URL da API Groq

/*
    Inicializando o cliente Groq
*/
const groq = new Groq({
    apiKey: API_URL // Certifique-se de configurar a chave no arquivo .env
});

// Função para formatar a resposta de forma mais amigável
function FormatarRespostas(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '\n\n$1\n') // Converte **Título** em um título com quebra de linha
        .replace(/\*(.*?)\*/g, '  - $1') // Converte *Item* em um item de lista com indentação
        .replace(/(\d+)\.\s/g, '\n$1. ') // Adiciona uma quebra de linha antes de listas numeradas
        .replace(/(\n){3,}/g, '\n\n') // Remove quebras de linha extras
        .replace(/Jacob/g, '**Jacob**') // Destaca o nome "Jacob" em negrito
        .replace(/- (.*?)\n/g, '  - $1\n\n'); // Adiciona uma linha em branco após cada item de lista
}

/*
// Função para processar mensagens do usuário
 */

app.post('/chat', async (req, res) => {
    try {
        const userMessage = xss(req.body.message);
        if (!userMessage) {
            return res.status(400).json({ error: 'Mensagem não pode ser vazia.' });
        }

        // Adiciona a mensagem do usuário à memória da conversa
        memoriaMensagens.push({ role: 'user', content: userMessage });

        // Limita o tamanho da memória da conversa
        const mensagensParaModelo = limitarMemoriaMensagens(6000); // Limite de 6000 tokens

        console.log('Memória da conversa antes de enviar para o modelo:', JSON.stringify(mensagensParaModelo, null, 2));

        // Faz a chamada para a API Groq
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

        // Processa a resposta do modelo
        const botReply = chatCompletion.choices[0]?.message?.content || '';
        console.log('Resposta do bot:', botReply);

        // Adiciona a resposta do modelo à memória da conversa
        memoriaMensagens.push({ role: 'assistant', content: botReply });

        res.json({ response: FormatarRespostas(botReply) });
    } catch (error) {
        console.error('Erro ao processar a solicitação:', error.message);
        res.status(500).json({
            error: 'Erro ao processar a solicitação.',
            details: error.message
        });
    }
});

const uploadDir = path.join(__dirname, '../../data/uploads');
const processedDir = path.join(__dirname, '../../data/processed');

// Endpoint para upload de arquivos
app.post('/upload', upload.single('file'), handleFileUpload);

// Endpoint para listar arquivos
app.get('/files', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);
        res.json(files);
    } catch (error) {
        console.error('Erro ao listar arquivos:', error.message);
        res.status(500).json({ error: 'Erro ao listar arquivos.' });
    }
});

// Endpoint para deletar um arquivo
app.delete('/files/:fileName', (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.join(uploadDir, fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Arquivo não encontrado.' });
        }

        fs.unlinkSync(filePath);
        console.log(`Arquivo deletado: ${fileName}`);
        res.json({ message: `Arquivo "${fileName}" deletado com sucesso.` });
    } catch (error) {
        console.error('Erro ao deletar arquivo:', error.message);
        res.status(500).json({ error: 'Erro ao deletar arquivo.' });
    }
});

// Endpoint para listar arquivos processados
app.get('/processed-files', (req, res) => {
    try {
        if (!fs.existsSync(processedDir)) {
            return res.json([]); // Retorna uma lista vazia se o diretório não existir
        }

        const files = fs.readdirSync(processedDir);
        res.json(files);
    } catch (error) {
        console.error('Erro ao listar arquivos processados:', error.message);
        res.status(500).json({ error: 'Erro ao listar arquivos processados.' });
    }
});

// Endpoint para listar arquivos de log
app.get('/logs', (req, res) => {
    try {
        const logDir = path.join(__dirname, '../../data/log');
        if (!fs.existsSync(logDir)) {
            return res.json([]); // Retorna uma lista vazia se o diretório não existir
        }

        const files = fs.readdirSync(logDir);
        res.json(files); // Retorna a lista de arquivos de log
    } catch (error) {
        console.error('Erro ao listar arquivos de log:', error.message);
        res.status(500).json({ error: 'Erro ao listar arquivos de log.' });
    }
});

// Endpoint para obter o conteúdo de um arquivo de log
app.get('/logs/:fileName', (req, res) => {
    try {
        const fileName = req.params.fileName;
        const logFilePath = path.join(__dirname, '../../data/log', fileName);

        if (!fs.existsSync(logFilePath)) {
            return res.status(404).json({ error: 'Arquivo de log não encontrado.' });
        }

        const fileContent = fs.readFileSync(logFilePath, 'utf-8');
        res.json(JSON.parse(fileContent)); // Retorna o conteúdo do arquivo como JSON
    } catch (error) {
        console.error('Erro ao carregar o conteúdo do log:', error.message);
        res.status(500).json({ error: 'Erro ao carregar o conteúdo do log.' });
    }
});

// Endpoint para processar arquivos
app.post('/process-files', async (req, res) => {
    try {
        console.log('Iniciando processamento de arquivos...');
        const processedFiles = await processFiles(); // Processa os arquivos
        console.log('Arquivos processados:', processedFiles);
        res.json(processedFiles); // Retorna a lista de arquivos processados
        carregarArquivosProcessados(); // Carrega os arquivos processados na memória
    } catch (error) {
        console.error('Erro ao processar arquivos:', error.message);
        res.status(500).json({ error: 'Erro ao processar arquivos.', details: error.message });
    }
});

// Endpoint para salvar mensagens em um arquivo .json
app.post('/save-message', (req, res) => {
    try {
        const { messages } = req.body; // Recebe as mensagens do frontend
        if (!messages || messages.length === 0) {
            return res.status(400).json({ error: 'Nenhuma mensagem fornecida.' });
        }
        const fileName = salvarMensagens(messages); // Salva as mensagens usando a função
        res.json({ message: 'Mensagens salvas com sucesso.', fileName });
    } catch (error) {
        console.error('Erro ao salvar mensagens:', error.message);
        res.status(500).json({ error: 'Erro ao salvar mensagens.' });
    }
});

// Endpoint para carregar arquivos processados e alimentar a memória
app.post('/load-processed', (req, res) => {
    try {
        const processedDir = path.join(__dirname, '../../data/processed');
        if (!fs.existsSync(processedDir)) {
            return res.status(404).json({ error: 'Diretório de arquivos processados não encontrado.' });
        }
        const files = fs.readdirSync(processedDir).filter(file => file.endsWith('.json'));
        files.forEach(file => {
            const filePath = path.join(processedDir, file);
            const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            // Adiciona o conteúdo do arquivo à memória da conversa
            fileContent.forEach(message => {
                memoriaMensagens.push({
                    role: message.isUser ? 'user' : 'assistant',
                    content: message.message
                });
            });
        });
        res.json({ message: 'Memória alimentada com os arquivos processados.', files });
    } catch (error) {
        console.error('Erro ao carregar arquivos processados:', error.message);
        res.status(500).json({ error: 'Erro ao carregar arquivos processados.' });
    }
});



// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    // Carrega as conversas salvas e os arquivos processados ao iniciar o servidor
    carregarConversasSalvas(memoriaMensagens);
    carregarArquivosProcessados();
});
