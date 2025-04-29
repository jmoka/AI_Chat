import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function atualizar(req, res) {
  const logDir = path.resolve(__dirname, "../../data/log");

  try {
    if (fs.existsSync(logDir)) {
      const arquivos = fs.readdirSync(logDir);
      const logs = arquivos.map((arquivo) => {
        const caminhoArquivo = path.join(logDir, arquivo);
        const conteudo = fs.readFileSync(caminhoArquivo, "utf-8");
        try {
          const mensagens = JSON.parse(conteudo);
          return mensagens.filter(
            (mensagem) => mensagem.role && mensagem.content
          ); // Filtra mensagens válidas
        } catch (erro) {
          console.error(`Erro ao processar o arquivo ${arquivo}:`, erro);
          return []; // Ignora arquivos inválidos
        }
      });
      return res.status(200).json({ status: "success", logs: logs.flat() });
    } else {
      return res.status(404).json({
        status: "warning",
        message: "Diretório de logs não encontrado."
      });
    }
  } catch (erro) {
    console.error("Erro ao listar logs:", erro);
    return res.status(500).json({
      status: "error",
      message: "Erro ao listar logs.",
      error: erro
    });
  }
}
