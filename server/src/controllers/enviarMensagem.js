// Importa o SDK oficial da Groq para interagir com os modelos de linguagem da plataforma Groq
import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

import EscolherModelo from "./escolherModelo.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function enviarMensagem(mensagens, modelo, temperatura, presence_penalty, frequency_penalty, token, top_p) {
    const presence_penaltyEnviado = presence_penalty || 1;
    const frequency_penaltyEnviado = frequency_penalty || 1;
    const TokenEnviado = token;
    const top_pEnviado = top_p; // Usando diretamente top_p

    mensagens.forEach((msg, index) => {
        if (!msg.role || !msg.content || msg.content.trim() === "") {
            throw new Error(`❌ A mensagem no índice ${index} está incompleta (role/content ausente ou vazio).`);
        }
    });

    
    const resposta = await groq.chat.completions.create({
        messages: mensagens,
        model: modelo,
        temperature: Number(temperatura),
        presence_penalty: Number(presence_penaltyEnviado),
        frequency_penalty: Number(frequency_penaltyEnviado),
        max_tokens: Number(TokenEnviado),
        top_p: Number(top_pEnviado) 
    });

    return resposta;
}
