
// Importa os módulos necessários usando a sintaxe ES6

import path from "path"; // Path ajuda a trabalhar com caminhos de arquivos e diretórios
import fs from "fs"; // FS é o módulo de sistema de arquivos (File System) do Node.js

// __dirname não existe diretamente em módulos ES6, precisamos recriá-lo:
import { fileURLToPath } from "url"; // Importa função para converter URL em caminho de arquivo
const __filename = fileURLToPath(import.meta.url); // Converte a URL do módulo atual para caminho de arquivo
const __dirname = path.dirname(__filename); // Extrai apenas o diretório do caminho do arquivo

// Define o caminho base para as pastas de dados
const baseDataPath = path.resolve(__dirname, "../../data"); // Caminho absoluto para a pasta 'data', três níveis acima

// Define o caminho específico para uploads
const uploadDir = path.join(baseDataPath, "uploads"); // Define a subpasta 'uploadDir' dentro da 'data'


export function listarArquivosImportdos(req, res) {
  try {
    const arquivos = fs.readdirSync(uploadDir);
    res.json(arquivos);
  } catch (error) {
    console.error("Erro ao listar arquivos:", error.message);
    res.status(500).json({ error: "Erro ao listar arquivos." });
  }
}
