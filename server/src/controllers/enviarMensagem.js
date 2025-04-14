// Importa o SDK oficial da Groq para interagir com os modelos de linguagem da plataforma Groq
import Groq from "groq-sdk";

// Carrega as variáveis de ambiente do arquivo .env
import dotenv from 'dotenv';
dotenv.config(); // ← ESSENCIAL para ativar o uso de process.env

// // Importa funções auxiliares
// import { InstrucoesSistema } from "./instrucoesSistema.js"; // Retorna uma mensagem de system
// import { mensagemEnviada } from "./mensagemEnviada.js";     // Retorna uma pergunta do user
// import { HistoricoMSG } from "./historicoMSG.js";           // Retorna histórico formatado
// import { listArquivos } from "./listArquivos.js";           // Retorna mensagens dos arquivos
import EscolherModelo from "./escolherModelo.js";           // Retorna o modelo a ser usado
// import { listaHistorico } from "./historicoMSG.js";     // Retorna o histórico de mensagens

// Cria uma instância da API Groq usando a chave armazenada no .env
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


// Função principal que envia mensagem ao modelo Groq
export async function enviarMensagem(mensagens, modelo) {
    // console.log("🧪 Mensagens:", mensagens);
    // console.log("🧪 Oriantação", orientacao);
    // console.log("🧪 arquivos", arquivos);
    // console.log("🧪 historico", historico);
    // console.log("🧪 modelo", modelo);

    

    mensagens.forEach((msg, index) => { // Verifica cada mensagem
      //  console.log(`🔍 Validando mensagem ${index}:`, msg);
        if (!msg.role || !msg.content || msg.content.trim() === "") { // Verifica se a mensagem tem role e content
            throw new Error(`❌ A mensagem no índice ${index} está incompleta (role/content ausente ou vazio).`);
        }
    });

    const modeloEscolhido = EscolherModelo(modelo) // Retorna o modelo a ser usado


    // console.log("modeloEscolhido", modeloEscolhido);
    
    const resposta = await groq.chat.completions.create({ // Envia a mensagem para o modelo Groq
        messages: mensagens,        
        model: modeloEscolhido,
        temperature: 0.5,
        presence_penalty: 0,
        frequency_penalty: 0,
        max_tokens: 3000,
        top_p: 1,
    });

    // console.log("🧠 Resposta gerada pela IA:", resposta.choices[0]?.message?.content || "(sem conteúdo)"); //

    
    return resposta; // Retorna a resposta da IA
}

