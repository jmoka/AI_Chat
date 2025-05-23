
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Para usar __dirname no ES6:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../data");

// Verifica se o diretório de upload existe, caso contrário, cria-o
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Diretório criado: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filePath = path.join(uploadDir, file.originalname);

    if (fs.existsSync(filePath)) {
      return cb(new Error("Arquivo com o mesmo nome já existe."), false);
    }

    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/json",
      "text/plain",
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/x-msvideo",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não suportado."), false);
    }
  }
});

const handleFileUpload = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    res.json({
      message: "Upload concluído com sucesso.",
      fileName: req.file.originalname
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Erro ao fazer upload do arquivo.",
        details: error.message
      });
  }
};

export { upload, handleFileUpload };
