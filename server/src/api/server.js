import express                           from 'express';
import bodyParser                        from 'body-parser';
import cors                              from 'cors';
import fs                                from 'fs';
import path                              from 'path';
import { fileURLToPath }                 from 'url';
import Groq                              from 'groq-sdk';
import {rotaChat}                        from '../routes/rotaChat.js';
import dotenv                            from 'dotenv';




// import { upload, handleFileUpload }    from './controllers/importarArquivo.js';
// import { processFiles }                from './controllers/processarArquivos.js';
// import { salvarMensagens }             from './public/scripts/salvarMSG.js';
// import carregarConversasSalvas         from './controllers/carregarConversasSalvas.js';


// Carrega as variáveis de ambiente do .env
dotenv.config();

// Permite usar __dirname com ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos padrão para pastas de dados
const baseDataPath = path.resolve(__dirname, '../../data');
const uploadDir = path.join(baseDataPath, 'uploads');
const processedDir = path.join(baseDataPath, 'processed');
const logDir = path.join(baseDataPath, 'log');

// Verifica se os diretórios existem, caso contrário, cria-os
//{ recursive: true } garante que o Node crie também os diretórios pai se eles ainda não existirem.
// O fs.existsSync(dir) verifica se o diretório já existe. 
// O ! (negação) significa: "Se NÃO existe..."
// A função .forEach() percorre cada caminho de pasta e executa o código dentro das {}.
//Esse array contém os caminhos para: 
// baseDataPath: o diretório base, tipo ./data
// uploadDir: onde arquivos enviados pelo usuário serão salvos (./data/uploads)
// processedDir: onde os arquivos processados vão ficar (./data/processed)
// logDir: onde ficam os logs (./data/log)

[baseDataPath, uploadDir, processedDir, logDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Criado diretório: ${dir}`);
    }
});

// Cria uma instância do app usando o Express
const app = express();

// Habilita CORS para permitir requisições de outros domínios (como front-end separado)
app.use(cors());

// Permite que o servidor entenda JSON no corpo das requisições (Content-Type: application/json)
app.use(bodyParser.json());

// Permite que o servidor interprete dados de formulários (Content-Type: application/x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: true }));

// Define a porta do servidor a partir da variável de ambiente ou usa 3000 como padrão
const PORT = process.env.PORT || 3000;

// Lê a chave da API Groq do arquivo .env ou mostra um aviso se estiver ausente
const API_URL = process.env.API_GROK_TESTE || console.log("Chave API não encontrada no .env");

// Cria uma instância do cliente da API Groq usando a chave fornecida
export const groq = new Groq({ apiKey: API_URL });

// ✅ Ativa a rota do chat
rotaChat(app);

// Inicia o servidor
app.listen(PORT, () => {
    // Esta função é chamada quando o servidor começa a escutar na porta especificada
    console.log(`Servidor rodando na porta ${PORT}`);
    // Mostra no terminal que o servidor foi iniciado com sucesso e em qual porta está escutando
    console.log(`API Groq: ${API_URL}`);
    // Exibe a chave (ou ausência dela) da API Groq que está sendo usada
    console.log(`Diretório base de dados: ${baseDataPath}`);
    // Mostra qual é o diretório onde os dados da aplicação (uploads, logs, etc.) estão sendo armazenados
});
