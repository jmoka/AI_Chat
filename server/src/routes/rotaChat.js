// Importa o módulo do Express para criar rotas
import express  from 'express';
import xss      from 'xss';


// Importa a instância do cliente Groq configurado no server.js
import { groq } from '../api/server.js';

// Lista que guarda o histórico da conversa entre usuário e IA
const memoriaMensagens = [];

/**
 * Limita a quantidade de mensagens enviadas ao modelo.
 * Por simplicidade, aqui retorna apenas as últimas 10 mensagens.
 * Em versões futuras, pode considerar contagem de tokens.
 */
function limitarMemoriaMensagens(maxTokens) {
    return memoriaMensagens.slice(-10); // Pega as 10 mais recentes
}

/**
 * Formata a resposta do modelo para remover espaços extras.
 * Pode ser expandida futuramente com mais regras de limpeza.
 */
function FormatarRespostas(resposta) {
    return resposta.trim();
}

/**
 * Função que registra a rota do chat na aplicação Express.
 * Essa rota lida com as requisições POST feitas pelo frontend para enviar mensagens.
 */
export function rotaChat(app) {
    const router = express.Router(); // Cria um novo roteador do Express

    /**
     * Rota POST /chat que processa mensagens enviadas pelo usuário.
     */
    router.post('/chat', async (req, res) => {
        try {
            // Limpa a mensagem para prevenir ataques XSS
            const userMessage = xss(req.body.message);

            // Validação: não permite mensagens vazias
            if (!userMessage) {
                return res.status(400).json({ error: 'Mensagem não pode ser vazia.' });
            }

            // Armazena a mensagem do usuário na memória
            memoriaMensagens.push({ role: 'user', content: userMessage });

            // Prepara o histórico de mensagens (últimas 10) para enviar ao modelo
            const mensagensParaModelo = limitarMemoriaMensagens(6000);

            // Faz a chamada para a API da Groq (modelo LLaMA 3) com os parâmetros desejados
            const chatCompletion = await groq.chat.completions.create({
                model: "llama3-8b-8192",
                messages: mensagensParaModelo,
                temperature: 0.7,            // Criatividade da resposta
                max_completion_tokens: 512, // Limite de tokens gerados na resposta
                top_p: 0.9,                  // Diversidade do conteúdo (sampling)
                presence_penalty: 0.6,       // Penalidade para repetir temas
                frequency_penalty: 0.2,      // Penalidade para repetir palavras
                stream: false                // Modo de streaming desativado
            });

            // Pega a resposta gerada pelo modelo (se existir)
            const botReply = chatCompletion.choices[0]?.message?.content || '';

            // Armazena a resposta do assistente na memória
            memoriaMensagens.push({ role: 'assistant', content: botReply });

            // Envia a resposta ao frontend em JSON
            res.json({ response: FormatarRespostas(botReply) });

        } catch (error) {
            // Em caso de erro, exibe no console e retorna erro 500
            console.error('Erro ao processar a solicitação:', error.message);
            res.status(500).json({
                error: 'Erro ao processar a solicitação.',
                details: error.message
            });
        }
    });

    // Registra o prefixo "/api" para todas as rotas do router
    // Exemplo: /chat vira /api/chat
    app.use('/api', router);
}
