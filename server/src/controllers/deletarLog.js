import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Converte a URL do arquivo atual em um caminho de arquivo
const __filename = fileURLToPath(import.meta.url);
// Extrai o diretório a partir do caminho do arquivo atual
const __dirname = path.dirname(__filename);

export function deletarLog() {
  const logDir = path.resolve(__dirname, "../../data/log"); // Caminho para o diretório de logs

  try {
    if (fs.existsSync(logDir)) {
      const arquivos = fs.readdirSync(logDir);
      arquivos.forEach((arquivo) => {
        const filePath = path.join(logDir, arquivo);
        fs.unlinkSync(filePath); // Exclui cada arquivo
      });
      console.log("📂 Todos os logs foram deletados.");
      return { status: "success", message: "Todos os logs foram deletados." };
    } else {
      console.warn("⚠️ Diretório de logs não encontrado.");
      return {
        status: "warning",
        message: "Diretório de logs não encontrado."
      };
    }
  } catch (erro) {
    console.error("❌ Erro ao deletar logs:", erro);
    return { status: "error", message: "Erro ao deletar logs.", error: erro };
  }
}
