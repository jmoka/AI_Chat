# 🧠 AI Chat - MSG

Uma aplicação Node.js com Express que integra a API da **Groq** para criar um sistema de chat inteligente, com armazenamento de histórico em arquivos JSON. Ideal para interações persistentes com modelos de linguagem.

---

## 📁 Estrutura do Projeto

```
AI_CHAT-MSG/
├── server/
│   └── src/
│       ├── api/
│       │   └── server.js              # Inicializa o servidor Express
│       ├── routes/
│       │   └── rotaChat.js           # Define a rota /api/chat
│       ├── controllers/
│       │   ├── enviarMensagem.js     # Comunica com a API da Groq
│       │   ├── historicoMSG.js       # Carrega histórico das conversas
│       │   └── salvarMensagens.js    # Salva o histórico
├── log/                              # Diretório com arquivos de histórico (JSON)
├── .env                              # Contém a chave da API da Groq
├── package.json
└── README.md
```

---

## 🚀 Como Funciona

### 🔁 Fluxo da Rota `/api/chat`

1. **Cliente envia uma requisição POST** com:
   - `mensagem`: Texto do usuário.
   - `orientacao`: (opcional) instrução para o modelo.
   - `arquivos`: (opcional) nomes dos arquivos JSON com histórico.
   - `historico`: (opcional) mensagens anteriores.
   - `modelo`: (opcional) número do modelo Groq a ser usado.

2. **Histórico é carregado** via `listaHistorico`.

3. **Contexto é montado**:
   - Mensagem do sistema (orientação)
   - + Histórico
   - + Mensagem atual

4. **Envio para a API da Groq** com `enviarMensagem`.

5. **Resposta do modelo** é recebida e enviada ao cliente.

6. **Histórico é salvo** via `salvarConversa`.

---

## 💬 Exemplo de Requisição

```json
POST /api/chat
Content-Type: application/json

{
  "mensagem": "mensagem enviada",
  "orientacao": "descrever aqui com deve se comprtar , prompt inicial",
  "arquivos": ["arquivos.json"],
  "modelo": 1
}
```

### ✅ Resposta Esperada
```json
{
  "resposta": "resposta enviada"
}
```

---

## 🗂️ Estrutura do Histórico (JSON)
Cada conversa salva no diretório `log/` é um arquivo `.json` com o seguinte formato:

```json
[
  { "role": "user", "content": "mensagem enviada" },
  { "role": "assistant", "content": "resposta da pergunta" }
]
```

---

## ⚙️ Instalação

1. **Clone o repositório**:
```bash
git clone https://github.com/seuusuario/AI_CHAT-MSG.git
cd AI_CHAT-MSG
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure o `.env`**:
```env
GROQ_API_KEY=sua-chave-aqui
```

4. **Inicie o servidor**:
```bash
npm start
```

O servidor iniciará na porta 80 (ou a definida em variável de ambiente).

---

## 🐞 Erros Comuns

### 1. `GROQ_API_KEY` ausente
- **Erro:** Acesso negado ou falha na autenticação.
- **Solução:** Adicione sua chave da Groq no `.env`.

### 2. Histórico vazio ou corrompido
- **Erro:** Mensagens anteriores não carregadas.
- **Solução:** Verifique se o diretório `log/` contém arquivos `.json` válidos.

### 3. Modelo não especificado
- **Erro:** Modelo indefinido no backend.
- **Solução:** Inclua o campo `modelo` na requisição.

---

## 🧩 Principais Funções

| Função             | Arquivo                      | Descrição                                     |
|---------------------|------------------------------|------------------------------------------------|
| `rotaChat`          | `routes/rotaChat.js`         | Define e processa a rota principal `/api/chat` |
| `enviarMensagem`    | `controllers/enviarMensagem.js` | Envia mensagem para a Groq                     |
| `listaHistorico`    | `controllers/historicoMSG.js`   | Lê arquivos JSON de histórico                 |
| `salvarConversa`    | `controllers/salvarMensagens.js`| Salva mensagens no diretório `log/`            |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Abrir **issues** com sugestões ou bugs.
- Criar **pull requests** com melhorias no código ou documentação.

---

## 📄 Licença

Este projeto está licenciado sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais detalhes.

---

Feito com 💬 por [Seu Nome ou Time].

