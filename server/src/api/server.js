import express                           from 'express';
import bodyParser                        from 'body-parser';
import cors                              from 'cors';
import fs                                from 'fs';
import path                              from 'path';
import { fileURLToPath }                 from 'url';
import Groq                              from 'groq-sdk'; 
import { rotaChat } from '../routes/rotaChat.js';   
import dotenv                            from 'dotenv';
dotenv.config(); // ← ESSENCIAL para ativar o .env

// Permite usar __dirname com ES6
// import.meta.url é uma URL que representa o módulo atual em execução.
// da onde vem a URL do módulo atual (import.meta.url) e converte essa URL em um caminho de arquivo absoluto usando fileURLToPath().
// O fileURLToPath() converte essa URL em um caminho de arquivo absoluto, que é armazenado na variável __filename.
// Por que não usar __filename direto?
// Porque __filename e __dirname só existem em módulos CommonJS (require/module.exports), não existem em ESM (import/export).
const __filename = fileURLToPath(import.meta.url); //// Converte a URL do arquivo atual para um caminho de arquivo
// __filename é uma variável global que contém o caminho absoluto do arquivo atual
// fileURLToPath() é uma função do módulo url que converte a URL do arquivo atual (import.meta.url) em um caminho de arquivo absoluto
// __dirname é uma variável global que contém o diretório do arquivo atual
const __dirname = path.dirname(__filename);
// path.dirname() é uma função do módulo path que retorna o diretório do caminho fornecido (neste caso, __filename)
// __dirname é útil para construir caminhos relativos a partir do diretório atual, especialmente ao trabalhar com arquivos e diretórios.
// Caminhos padrão para pastas de dados
const baseDataPath = path.resolve(__dirname, '../../data'); //// Caminho absoluto para o diretório de dados da aplicação
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

// 
[baseDataPath, uploadDir, processedDir, logDir].forEach(dir => { //
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Criado diretório: ${dir}`);
    }
});

// Cria uma instância do app usando o Express
// O Express é um framework para Node.js que facilita a criação de servidores web e APIs.
// Ele fornece uma série de recursos e funcionalidades para lidar com requisições HTTP, middleware, rotas, etc.
// A instância app é o ponto de entrada para configurar o servidor, definir rotas, middleware e outras funcionalidades.
// middleware são funções que podem ser usadas para processar requisições antes de chegarem às rotas definidas no servidor.
// Eles podem ser usados para autenticação, manipulação de dados, tratamento de erros, etc. 
const app = express();

// Habilita CORS para permitir requisições de outros domínios (como front-end separado)
// evitar que o navegador bloqueie requisições entre diferentes origens (cross-origin requests).
// Isso é útil quando o front-end e o back-end estão em domínios ou portas diferentes durante o desenvolvimento.
// ataque o problema de segurança conhecido como "CORS" (Cross-Origin Resource Sharing).
// O CORS é uma política de segurança que restringe como recursos de um domínio podem ser acessados por outro domínio.
app.use(cors());

// Permite que o servidor entenda JSON no corpo das requisições (Content-Type: application/json)
// bodyParser é um middleware que analisa o corpo da requisição e o transforma em um objeto JavaScript acessível através de req.body.
// Isso é útil para lidar com dados enviados em formato JSON, como quando um cliente envia dados para a API usando o método POST.
app.use(bodyParser.json());

// Permite que o servidor interprete dados de formulários (Content-Type: application/x-www-form-urlencoded)
// Isso é útil quando o cliente envia dados de formulários HTML para a API usando o método POST.
// bodyParser.urlencoded() é um middleware que analisa o corpo da requisição e o transforma em um objeto JavaScript acessível através de req.body.
// urlencoded() é um formato de codificação usado para enviar dados de formulários HTML.
// O parâmetro { extended: true } permite que o bodyParser use a biblioteca qs para analisar dados complexos, como objetos aninhados.
// Se você não precisar desse recurso, pode usar { extended: false } para uma análise mais simples.
app.use(bodyParser.urlencoded({ extended: true }));

// Define a porta do servidor a partir da variável de ambiente ou usa 3000 como padrão
// process.env.PORT é uma variável de ambiente que pode ser definida no ambiente onde o servidor está rodando.
// Isso é útil para ambientes de produção, onde a porta pode ser definida pelo provedor de hospedagem.
const PORT = process.env.PORT || 3000;

// Lê a chave da API Groq do arquivo .env ou mostra um aviso se estiver ausente
// process.env.API_GROK é uma variável de ambiente que deve conter a chave da API Groq.
// O dotenv carrega as variáveis de ambiente do arquivo .env para process.env, tornando-as acessíveis no código.
const API_URL = process.env.GROQ_API_KEY || console.log("Chave API não encontrada no .env");


// Cria uma instância do cliente da API Groq usando a chave fornecida
// Groq é uma biblioteca que facilita a interação com a API Groq, permitindo fazer requisições e manipular dados de forma mais simples.
// A instância groq é usada para fazer chamadas à API Groq, como buscar dados, enviar mensagens, etc.
// A chave da API é necessária para autenticar as requisições feitas para a API Groq.
//// A instância é criada passando a chave da API como parâmetro para o construtor da classe Groq.
// Isso permite que a biblioteca saiba qual chave usar para autenticar as requisições.
// A chave da API é uma string única que identifica o usuário ou a aplicação que está fazendo a requisição.
// Ela é usada para garantir que apenas usuários autorizados possam acessar os recursos da API Groq.
export const groq = new Groq({ apiKey: API_URL });

//============================================================================
//ROTAS
//============================================================================
// ✅ Ativa a rota do chat
//============================================================================
// Essa linha importa a função rotaChat do arquivo rotaChat.js e a executa, passando o app como argumento.
// Isso configura as rotas relacionadas ao chat na aplicação Express, permitindo que o servidor responda a requisições específicas relacionadas ao chat.
// A função rotaChat é responsável por definir as rotas, os métodos HTTP e os manipuladores de requisição para o chat.
// O app é a instância do servidor Express que foi criada anteriormente.

rotaChat(app);

//============================================================================
// ✅ Ativa a rota de salvar mensagens
//============================================================================
// Essa linha importa a função rotaSalvarMSG do arquivo rotaSalvarMSG.js e a executa, passando o app como argumento.    
//rotaSalvarMSG(app);


//============================================================================
// ✅ Ativa a rota do ...
//============================================================================



// Middleware global para capturar erros
// Esse middleware é chamado quando ocorre um erro em qualquer parte do servidor, como em rotas ou outros middlewares.
// O middleware de erro é uma função que recebe quatro parâmetros: err, req, res e next.    
// O parâmetro err contém o erro que ocorreu, req é o objeto da requisição, res é o objeto da resposta e 
// next é uma função para passar o controle para o próximo middleware.
app.use((err, req, res, next) => {
    console.error('Erro no servidor:', err.stack);
    res.status(500).send('Erro interno no servidor.');
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);    
});
    // // Esta função é chamada quando o servidor começa a escutar na porta especificada
    // console.log(`Servidor rodando na porta ${PORT}`);
    // // Mostra no terminal que o servidor foi iniciado com sucesso e em qual porta está escutando
    // console.log(`API Groq: ${API_URL}`);
    // // Exibe a chave (ou ausência dela) da API Groq que está sendo usada
    // console.log(`Diretório base de dados: ${baseDataPath}`);
    // // Mostra qual é o diretório onde os dados da aplicação (uploads, logs, etc.) estão sendo armazenados

