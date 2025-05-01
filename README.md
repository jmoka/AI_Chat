# 🧠 AI Chat - MSG

Uma aplicação Node.js com Express que integra a API da **Groq** para criar um sistema de chat inteligente, com armazenamento de histórico em arquivos JSON.  
Ideal para interações persistentes com modelos de linguagem.

---

## 📁 Estrutura do Projeto

```
AI_CHAT-MSG/
├── server/
│   └── src/
│       ├── api/
│       │   └── server.js              # Inicializa o servidor Express
│       ├── routes/
│       │   └── rotaChat.js              # Define a rota /api/chat
│       ├── controllers/
│       │   ├── enviarMensagem.js        # Comunica com a API da Groq
│       │   ├── historicoMSG.js          # Carrega histórico das conversas
│       │   └── salvarMensagens.js       # Salva o histórico
├── log/                               # Diretório com arquivos de histórico (JSON)
├── .env                               # Configuração: chave da API da Groq, etc.
├── package.json
└── README.md
```

---

## 🚀 Tecnologias Utilizadas

- **Node.js** e **Express**: Servidor e gerenciamento de rotas.
- **API da Groq**: Integração com modelo de linguagem.
- **JSON Files**: Armazenamento persistente do histórico de conversas.
- **ES6 Modules**: Organização do código.

---

## ⚙️ Como Configurar e Rodar o Projeto

### 1. Clonar o Repositório

Abra o terminal e execute:

```bash
git clone https://github.com/seuusuario/AI_CHAT-MSG.git
cd AI_CHAT-MSG
```

### 2. Instalar as Dependências

No diretório do projeto, execute:

```bash
npm install
```

### 3. Configurar o Arquivo .env

Crie um arquivo chamado **`.env`** na raiz do projeto com o seguinte conteúdo:

```env
GROQ_API_KEY=sua-chave-da-groq-aqui
```

Substitua `sua-chave-da-groq-aqui` pela sua chave de API da Groq.

### 4. Iniciar o Servidor

Para iniciar o servidor, execute:

```bash
npm start
```

O servidor será iniciado na porta definida (por padrão, 80 ou conforme variável de ambiente).

---

## 💬 Como Funciona

1. **Cliente envia uma requisição POST para `/api/chat`** com os seguintes dados:
   - `mensagem`: Texto do usuário.
   - `orientacao`: (Opcional) Instruções ou prompt inicial.
   - `historico`: (Opcional) Histórico de mensagens anteriores.
   - `modelo`: (Opcional) Número do modelo Groq a ser utilizado.
   - Outras configurações, como `temperatura`, `presence_penalty`, etc.

2. **Processamento**:
   - O histórico é carregado (incluindo os arquivos processados e o histórico salvo).
   - Um contexto é montado e enviado para a API da Groq com a função `enviarMensagem`.
   - A resposta da API é sanitizada e retornada ao cliente.

3. **Armazenamento do Histórico**:
   - As conversas são salvas no diretório `log/` em formato JSON.

---

## 🐞 Erros Comuns

- **GROQ_API_KEY ausente**  
  *Solução:* Verifique se o arquivo `.env` contém a chave da Groq.

- **Histórico vazio ou corrompido**  
  *Solução:* Certifique-se de que o diretório `log/` contém arquivos JSON válidos.

- **Modelo não especificado**  
  *Solução:* Inclua o campo `modelo` na requisição.

---

## 🤝 Contribuindo

Contribuições são bem-vindas!  

- Abra **issues** com sugestões ou bugs.  
- Envie **pull requests** com melhorias.

---

## 📄 Licença

Este projeto está licenciado sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais detalhes.

---

Feito com 💬 por [Seu Nome ou Time].
