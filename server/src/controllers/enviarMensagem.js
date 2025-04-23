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
export async function enviarMensagem(mensagens, modelo, temperatura, presence_penalty, frequency_penalty, token, top_p  ) {

    /*
    presence_penalty Penaliza a repetição de tópicos já abordados. Intervalo: -2.0 a 2.0
    Valores positivos incentivam novidades (trazer coisas novas).
    Valores negativos permitem mais repetição de tópicos.
    Ex: presence_penalty: 1 → estimula o modelo a explorar novos assuntos.
    */
    const presence_penaltyEnviado = presence_penalty || 1

        /*
        frequency_penalty Penaliza a repetição de palavras e frases já usadas.
        Intervalo: -2.0 a 2.0
        Controla a variação no vocabulário.
        frequency_penalty: 1 → reduz repetições de palavras.        
        */

    const frequency_penaltyEnviado = frequency_penalty || 1


    // Define o limite máximo de tokens na resposta. ate 6000
    const TokenEnviado = token || 3000

    /*
    top_p (também chamado de nucleus sampling) Controla a diversidade da resposta.
    Intervalo: 0.0 a 1.0
    Em vez de considerar todas as palavras possíveis, seleciona entre as mais prováveis que somem até top_p de probabilidade.
    top_p: 1.0 = considera todas as opções possíveis (sem corte).
    top_p: 0.8 = considera apenas as palavras mais prováveis.
    */
    const top_pEnviado = top_p || 1   


   
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
        presence_penalty: presence_penaltyEnviado,
        frequency_penalty: frequency_penaltyEnviado,
        max_tokens: TokenEnviado,
        top_p: top_pEnviado,
        
        
    });

    return resposta; // Retorna a resposta da IA
}

