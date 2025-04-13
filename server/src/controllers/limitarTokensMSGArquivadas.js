export default function limitarMemoriaMensagens(mensagens, maxTokens) {
    // Exemplo básico: retorna as mensagens sem alterações
    return mensagens.slice(-maxTokens);
}