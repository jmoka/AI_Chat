// Importa o SDK oficial da Groq para interagir com os modelos de linguagem da plataforma Groq
import Groq from "groq-sdk";

// Carrega as variáveis de ambiente do arquivo .env
import dotenv from 'dotenv';
dotenv.config(); // ← ESSENCIAL para ativar o uso de process.env

import EscolherModelo from "./escolherModelo.js";           // Retorna o modelo a ser usado
// import { listaHistorico } from "./historicoMSG.js";     // Retorna o histórico de mensagens

// Cria uma instância da API Groq usando a chave armazenada no .env
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


// Função principal que envia mensagem ao modelo Groq
export async function enviarMensagem(mensagens, modelo, temperatura) {
   
    mensagens.forEach((msg, index) => { // Verifica cada mensagem
      //  console.log(`🔍 Validando mensagem ${index}:`, msg);
        if (!msg.role || !msg.content || msg.content.trim() === "") { // Verifica se a mensagem tem role e content
            throw new Error(`❌ A mensagem no índice ${index} está incompleta (role/content ausente ou vazio).`);
        }
    });

    const resposta = await groq.chat.completions.create({ // Envia a mensagem para o modelo Groq
        messages: mensagens,        
        model: modelo,
        temperature: Number(temperatura), // Baixa temperatura (0.1 a 0.5): Respostas mais focadas e determinísticas. Alta temperatura (0.5 a 1.0): Respostas mais criativas e imprevisíveis.
        presence_penalty: 0,
        frequency_penalty: 0,
        max_tokens: 3000,
        top_p: 1,
    });

    return resposta; // Retorna a resposta da IA
}

