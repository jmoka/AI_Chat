
// Importa os módulos necessários usando a sintaxe ES6

import path from "path"; // Path ajuda a trabalhar com caminhos de arquivos e diretórios
import fs from "fs"; // FS é o módulo de sistema de arquivos (File System) do Node.js

// __dirname não existe diretamente em módulos ES6, precisamos recriá-lo:
import { fileURLToPath } from "url"; // Importa função para converter URL em caminho de arquivo
const __filename = fileURLToPath(import.meta.url); // Converte a URL do módulo atual para caminho de arquivo
const __dirname = path.dirname(__filename); // Extrai apenas o diretório do caminho do arquivo

// Define o caminho base para as pastas de dados
const baseDataPath = path.resolve(__dirname, "../../../data"); // Caminho absoluto para a pasta 'data', três níveis acima

const uploadDir = path.join(baseDataPath, "uploads");

// Verifica se o diretório de upload existe, caso contrário, cria-o
export function deletarArquivosImportados(req, res) {
  if (!fs.existsSync(uploadDir)) {
    console.log("Nenhum arquivo Encontrado");
    try {
      const { fileName } = req.params;
      const filePath = path.join(uploadDir, fileName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Arquivo não encontrado." });
      }
      fs.unlinkSync(filePath);
      console.log(`Arquivo deletado: ${fileName}`);
      res.json({ message: `Arquivo "${fileName}" deletado com sucesso.` });
      res.status(resultado.status === "success" ? 200 : 500).json(resultado);
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error.message);
      res.status(500).json({ error: "Erro ao deletar arquivo." });
    }
  }
}
