const clients = {}; // Objeto para rastrear os IPs e interações dos clientes

// Configurações iniciais
const defaultSettings = {
    language: 'pt-BR', // Idioma padrão
    behavior: 'informar com palavão de baixo calão', // Comportamento padrão (outros exemplos: friendly, formal, casual)
    tone: 'informal', // Tom padrão (outros exemplos: informal, formal, neutro)
    context: 'geral', // Contexto padrão (outros exemplos: geral, técnico, acadêmico)
    maxTokens: 150, // Máximo de tokens para resposta
    temperature: 0.7, // Temperatura padrão para controle de aleatoriedade
    topP: 0.9, // Parâmetro top_p padrão
    frequencyPenalty: 0, // Penalidade de frequência padrão
    presencePenalty: 0, // Penalidade de presença padrão
    stopSequences: [], // Sequências de parada padrão
    userId: null, // ID do usuário padrão
    userName: null, // Nome do usuário padrão
    userEmail: null, // Email do usuário padrão
    userPhone: null, // Telefone do usuário padrão
    userLocation: null, // Localização do usuário padrão
    userPreferences: {}, // Preferências do usuário padrão
    userHistory: [], // Histórico do usuário padrão
    userFeedback: {}, // Feedback do usuário padrão
    userSettings: {}, // Configurações do usuário padrão
    userStatus: 'ativo', // Status do usuário padrão (outros exemplos: ativo, inativo, bloqueado)
    initialPrompt: 'IA_Bot :', // Diretrizes iniciais

    // Exemplos de prompts iniciais:
    // "Você é um assistente útil e amigável."
    // "Você é um assistente técnico especializado em IA."
    // "Você é um assistente acadêmico especializado em pesquisa."
    // "Você é um assistente de suporte ao cliente."
    // "Você é um assistente de vendas."
    // "Você é um assistente de marketing."
    // "Você é um assistente de recursos humanos."
    // "Você é um assistente de finanças."
    // "Você é um assistente de jurídico."
    // "Você é um assistente de TI."
    // "Você é um assistente de atendimento ao cliente."
};

// Função para lidar com mensagens do cliente
function handleClientMessage(userMessage, clientIp, currentTime, settings = defaultSettings) {
    if (!userMessage) {
        throw new Error('Mensagem não pode ser vazia ou Nenhuma mensagem foi enviada pelo cliente');
    }

    console.log(`Mensagem recebida do cliente (${clientIp}):`, userMessage);

    // Verifica se o IP já está registrado
    if (!clients[clientIp]) {
        clients[clientIp] = {
            name: `Cliente-${clientIp}`, // Nome genérico para o cliente
            lastInteraction: currentTime, // Armazena o horário da última interação
            settings, // Armazena as configurações iniciais para o cliente
        };

        // Retorna o prompt inicial configurado
        return `${settings.initialPrompt} Como posso ajudar você hoje?`;
    }

    // Atualiza o horário da última interação
    clients[clientIp].lastInteraction = currentTime;

    // Retorna null para continuar o fluxo normal
    return null;
}

module.exports = { handleClientMessage };