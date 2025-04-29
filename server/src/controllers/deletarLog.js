import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function deletarLog(req, res) {
  const logDir = path.resolve(__dirname, "../../data/log");

  try {
    if (fs.existsSync(logDir)) {
      const arquivos = fs.readdirSync(logDir);
      arquivos.forEach((arquivo) => {
        const filePath = path.join(logDir, arquivo);
        fs.unlinkSync(filePath); // Exclui cada arquivo
      });
      console.log("📂 Todos os logs foram deletados.");
      return res.status(200).json({
        status: "success",
        message: "Todos os logs foram deletados."
      });
    } else {
      console.warn("⚠️ Diretório de logs não encontrado.");
      return res.status(404).json({
        status: "warning",
        message: "Diretório de logs não encontrado."
      });
    }
  } catch (erro) {
    console.error("❌ Erro ao deletar logs:", erro);
    return res.status(500).json({
      status: "error",
      message: "Erro ao deletar logs.",
      error: erro
    });
  }
}
