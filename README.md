<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🧠 AI Chat - MSG</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f7f7f7;
        padding: 20px;
      }
      .container {
        max-width: 900px;
        margin: 0 auto;
        background-color: #fff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      h1,
      h2,
      h3 {
        color: #333;
      }
      hr {
        border: 0;
        border-top: 1px solid #e0e0e0;
        margin: 20px 0;
      }
      pre {
        background: #f4f4f4;
        padding: 15px;
        border-radius: 6px;
        overflow-x: auto;
      }
      code {
        background: #ececec;
        padding: 2px 4px;
        border-radius: 4px;
        font-family: Consolas, monospace;
      }
      ul,
      ol {
        margin: 0 0 20px 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🧠 AI Chat - MSG</h1>
      <p>
        Uma aplicação Node.js com Express que integra a API da <strong>Groq</strong>
        para criar um sistema de chat inteligente, com armazenamento de histórico em
        arquivos JSON. Ideal para interações persistentes com modelos de linguagem.
      </p>

      <hr />

      <h2>📁 Estrutura do Projeto</h2>
      <pre>
AI_CHAT-MSG/
├── server/
│   └── src/
│       ├── api/
│       │   └── server.js              # Inicializa o servidor Express
│       ├── routes/
│       │   └── rotaChat.js            # Define a rota /api/chat
│       ├── controllers/
│       │   ├── enviarMensagem.js      # Comunica com a API da Groq
│       │   ├── historicoMSG.js        # Carrega histórico das conversas
│       │   └── salvarMensagens.js     # Salva o histórico
├── log/                              # Diretório com arquivos de histórico (JSON)
├── .env                              # Configuração: chave da API da Groq, etc.
├── package.json
└── README.md
      </pre>

      <hr />

      <h2>🚀 Tecnologias Utilizadas</h2>
      <ul>
        <li><strong>Node.js</strong> e <strong>Express</strong>: Servidor e gerenciamento de rotas.</li>
        <li><strong>API da Groq</strong>: Integração com modelo de linguagem.</li>
        <li><strong>JSON Files</strong>: Armazenamento persistente do histórico de conversas.</li>
        <li><strong>ES6 Modules</strong>: Organização moderna do código.</li>
      </ul>

      <hr />

      <h2>⚙️ Como Configurar e Rodar o Projeto</h2>
      <h3>1. Clonar o Repositório</h3>
      <p>Abra o terminal e execute:</p>
      <pre>
git clone https://github.com/seuusuario/AI_CHAT-MSG.git
cd AI_CHAT-MSG
      </pre>
      <h3>2. Instalar as Dependências</h3>
      <pre>
npm install
      </pre>
      <h3>3. Configurar o Arquivo <code>.env</code></h3>
      <p>
        Crie um arquivo chamado <code>.env</code> na raiz do projeto com o seguinte
        conteúdo:
      </p>
      <pre>
GROQ_API_KEY=sua-chave-da-groq-aqui
      </pre>
      <p>
        Substitua <code>sua-chave-da-groq-aqui</code> pela sua chave de API da Groq.
      </p>
      <h3>4. Iniciar o Servidor</h3>
      <p>
        Execute o comando:
      </p>
      <pre>
npm start
      </pre>
      <p>
        O servidor será iniciado na porta definida (por padrão, 80 ou conforme variável de ambiente).
      </p>

      <hr />

      <h2>💬 Como Funciona</h2>
      <ol>
        <li>
          <strong>POST para <code>/api/chat</code>:</strong> O cliente envia os seguintes dados:
          <ul>
            <li><code>mensagem</code>: Texto do usuário.</li>
            <li><code>orientacao</code>: (Opcional) Instruções ou prompt inicial.</li>
            <li><code>historico</code>: (Opcional) Histórico de mensagens anteriores.</li>
            <li><code>modelo</code>: (Opcional) Número do modelo Groq a ser utilizado.</li>
            <li>
              Outras configurações, como <code>temperatura</code>, <code>presence_penalty</code>, etc.
            </li>
          </ul>
        </li>
        <li>
          <strong>Processamento:</strong>
          <p>
            O histórico é carregado (incluindo arquivos processados e o histórico salvo). Um contexto é
            montado e enviado para a API da Groq através da função <code>enviarMensagem</code>. A resposta
            é sanitizada e retornada ao cliente.
          </p>
        </li>
        <li>
          <strong>Armazenamento do Histórico:</strong>
          <p>
            As conversas são salvas no diretório <code>log/</code> em formato JSON, permitindo a persistência do
            histórico.
          </p>
        </li>
      </ol>

      <hr />

      <h2>🐞 Erros Comuns</h2>
      <ul>
        <li>
          <strong>GROQ_API_KEY ausente:</strong>
          <em>Verifique se o arquivo <code>.env</code> contém a chave da Groq.</em>
        </li>
        <li>
          <strong>Histórico vazio ou corrompido:</strong>
          <em>Certifique-se de que o diretório <code>log/</code> contenha arquivos JSON válidos.</em>
        </li>
        <li>
          <strong>Modelo não especificado:</strong>
          <em>Inclua o campo <code>modelo</code> na requisição.</em>
        </li>
      </ul>

      <hr />

      <h2>🤝 Contribuindo</h2>
      <p>Contribuições são bem-vindas!</p>
      <ul>
        <li>Abra <strong>issues</strong> com sugestões ou bugs.</li>
        <li>Envie <strong>pull requests</strong> com melhorias.</li>
      </ul>

      <hr />

      <h2>📄 Licença</h2>
      <p>
        Este projeto está licenciado sob a licença <strong>MIT</strong>. Consulte o arquivo
        <code>LICENSE</code> para mais detalhes.
      </p>

      <hr />

      <p>Feito com 💬 por [Seu Nome ou Time].</p>
    </div>
  </body>
</html>
