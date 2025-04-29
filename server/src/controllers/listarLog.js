import fs from "fs";
import path from "path";

const logDir = path.resolve(
  "c:/Users/jotac/JotaDev/AI_CHAT - MSG/server/data/log"
);

export function listarLog(req, res) {
  try {
    if (!fs.existsSync(logDir)) {
      return res.json({ logs: [] });
    }
    const arquivos = fs.readdirSync(logDir);
    // Para cada arquivo, lê e realiza parse do conteúdo
    const logsArrays = arquivos.map((arquivo) => {
      const caminhoArquivo = path.join(logDir, arquivo);
      const conteudo = fs.readFileSync(caminhoArquivo, "utf-8");
      try {
        const dados = JSON.parse(conteudo);
        // Assume que o arquivo contém um array de mensagens válidas
        return dados.filter((mensagem) => mensagem.role && mensagem.content);
      } catch (erro) {
        console.error(`Erro ao processar o arquivo ${arquivo}:`, erro);
        return []; // Ignora arquivos inválidos
      }
    });
    // Achata o array de arrays e retorna em propriedade logs
    return res.json({ logs: logsArrays.flat() });
  } catch (error) {
    console.error("Erro ao listar arquivos de log:", error.message);
    return res.status(500).json({ error: "Erro ao listar arquivos de log." });
  }
}
