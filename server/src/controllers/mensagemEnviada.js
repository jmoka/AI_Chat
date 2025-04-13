export function mensagemEnviada(mensagem) {
    return {
        role: "user",
        content: mensagem
    };
}
