// Importa os módulos necessários usando a sintaxe ES6
import multer from "multer"; // Multer é usado para lidar com uploads de arquivos
import path from "path"; // Path ajuda a trabalhar com caminhos de arquivos e diretórios
import fs from "fs"; // FS é o módulo de sistema de arquivos (File System) do Node.js

// __dirname não existe diretamente em módulos ES6, precisamos recriá-lo:
import { fileURLToPath } from "url"; // Importa função para converter URL em caminho de arquivo
const __filename = fileURLToPath(import.meta.url); // Converte a URL do módulo atual para caminho de arquivo
const __dirname = path.dirname(__filename); // Extrai apenas o diretório do caminho do arquivo

// Define o caminho base para as pastas de dados
const baseDataPath = path.resolve(__dirname, "../../data"); // Caminho absoluto para a pasta 'data', três níveis acima

// Define o caminho específico para uploads
const uploads = path.join(baseDataPath, "uploads"); // Define a subpasta 'uploads' dentro da 'data'

// Apenas para debug: mostra no console onde os arquivos serão armazenados
console.log("Diretório de uploads:", uploads); // Exibe o caminho de upload no console

// Configuração de armazenamento para o multer
const storage = multer.diskStorage({
  // Define a estratégia de armazenamento no disco
  destination: (req, file, cb) => {
    // Define onde os arquivos serão armazenados
    if (!fs.existsSync(uploads)) {
      // Verifica se o diretório existe
      fs.mkdirSync(uploads, { recursive: true }); // Cria o diretório caso não exista, de forma recursiva
    }
    cb(null, uploads); // Informa ao multer o diretório de destino
  },
  filename: (req, file, cb) => {
    // Define como o nome do arquivo será salvo
    cb(null, file.originalname); // Prefixa o nome do arquivo com a data/hora atual para evitar conflitos
  }
});

// Cria o middleware 'upload' para uso nas rotas
const upload = multer({
  storage, // Define o local e a estratégia de armazenamento
  limits: {
    fileSize: 50 * 1024 * 1024 // Limita o tamanho do arquivo para 50 MB
  },
  fileFilter: (req, file, cb) => {
    // Filtra os tipos de arquivos permitidos
    const allowedTypes = [
      // Lista dos MIME types permitidos
      "application/pdf",
      "application/json",
      "text/plain",
      "image/jpeg",
      "image/png",
      "video/mp4",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/xml",
      "text/xml"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      // Se o tipo for permitido
      cb(null, true); // Aceita o arquivo
    } else {
      cb(new Error("Tipo de arquivo não suportado."), false); // Rejeita o arquivo e envia erro
    }
  }
});

// Função que lida com a resposta do upload
const imprtarArquivo = (req, res) => {
  // Função que responde após upload
  if (!req.file) { 
    // Se nenhum arquivo foi enviado
    return res.status(400).json({ error: "Nenhum arquivo enviado." }); // Retorna erro
  }

  console.log(`Arquivo recebido: ${req.file.originalname}`); // Loga o nome do arquivo original recebido

  res.json({
    message: "Arquivo enviado com sucesso.", // Mensagem de sucesso
    fileName: req.file.filename // Retorna o nome do arquivo salvo
  });
};

// Exporta usando ES6
export { upload, imprtarArquivo }; // Exporta o middleware 'upload' e a função 'imprtarArquivo'
