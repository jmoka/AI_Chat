import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { enviarMensagem } from "../controllers/enviarMensagem.js";
import { listaHistorico } from "../controllers/listaHistorico.js";
import salvarConversa from "../controllers/salvarMensagens.js";
import { contarTokens } from "../controllers/contarTokens.js";
import { resumirTexto } from "../controllers/resumirTexto.js";
import { sanitizarTexto } from "../controllers/sanitizar.js";
import { log } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastas base
const baseDataPath = path.resolve(__dirname, "../../data");
const processedDir = path.join(baseDataPath, "processed");

// Função para ler os arquivos processados dinamicamente
function lerArquivosProcessados() {
  if (fs.existsSync(processedDir)) {
    return fs.readdirSync(processedDir).map((file) => {
      const filePath = path.join(processedDir, file);
      // Lê o conteúdo assumindo codificação UTF-8
      const content = fs.readFileSync(filePath, "utf8");
      const arquivoProcessdo = {
        role: "file",
        content,
        timestamp: fs.statSync(filePath).mtime
      };

      return arquivoProcessdo;
    });
  }
  return [];
}

export async function chat(req, res) {
  try {
    const {
      mensagem,
      // Se não for enviado historico, utiliza os arquivos processados atuais
      historico = lerArquivosProcessados(),
      orientacaoUsuario = "",
      modelo,
      temperatura,
      presence_penalty,
      frequency_penalty,
      token,
      top_p
    } = req.body;

    if (!mensagem || mensagem.trim() === "") {
      return res
        .status(400)
        .json({ error: "Campo obrigatório: mensagem não pode estar vazia." });
    }

    console.log("arquivosdddddddddddddd", ...historico);
    // console.log("lerArquivosProcessados()", lerArquivosProcessados());

    const historicoSalvo = listaHistorico();
    // Junta o histórico salvo com os dados dos arquivos processados
    const historicoTotal = [...historicoSalvo, ...historico];

    // console.log("📜 Histórico total:", historicoTotal);

    // Ordena pelo timestamp, se disponível
    historicoTotal.sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
      return 0;
    });

    // Monta o texto do histórico para enviar à LLM
    const textoHistorico = historicoTotal
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const resumoHistorico =
      textoHistorico.length > 1000
        ? await resumirTexto(textoHistorico)
        : textoHistorico;

    const orientacaoPadrao = `
        Você é um assistente que responde sempre usando **apenas Markdown válido** e bem estruturado.
        (demais regras aqui...)
      `;

    const orientacaoUsada = orientacaoUsuario?.trim()
      ? orientacaoUsuario
      : orientacaoPadrao;

    const mensagens = [
      { role: "system", content: orientacaoUsada },
      { role: "system", content: `Resumo do histórico:\n${resumoHistorico}` },
      { role: "user", content: mensagem }
    ];

    const totalTokens = contarTokens(mensagens.map((m) => m.content).join(" "));
    if (totalTokens > token) {
      console.warn("⚠️ Reduzindo contexto por excesso de tokens...");
      mensagens.splice(1, mensagens.length - 2);
      mensagens.unshift({ role: "system", content: orientacaoPadrao });
    }

    const resposta = await enviarMensagem(
      mensagens,
      modelo,
      temperatura,
      presence_penalty,
      frequency_penalty,
      token,
      top_p
    );

    const respostaDaIAOriginal = resposta.choices[0]?.message?.content || "";
    const respostaDaIA = sanitizarTexto(respostaDaIAOriginal);

    const mensagemSalvaJSON = [
      { role: "user", content: mensagem },
      { role: "assistant", content: respostaDaIA }
    ];

    salvarConversa(mensagemSalvaJSON);

    return res.json({
      resposta: respostaDaIA,
      modeloUsado: modelo,
      temperaturaUsada: temperatura,
      presence: presence_penalty,
      frequency: frequency_penalty,
      token: token,
      top_p: top_p
    });
  } catch (erro) {
    console.error("❌ Erro na rota /api/chat:", erro);
    return res
      .status(500)
      .json({ error: "Erro ao gerar resposta com modelo LLM." });
  }
}