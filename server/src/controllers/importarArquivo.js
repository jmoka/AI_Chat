const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Caminhos padrão para pastas de dados
const baseDataPath = path.resolve(__dirname, '../../data');
const uploadDir = path.join(baseDataPath, 'uploads');
console.log("Diretório de uploads:", uploadDir);

// Configuração de armazenamento com multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const handleFileUpload = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    console.log(`Arquivo recebido: ${req.file.originalname}`);
    res.json({ message: 'Arquivo enviado com sucesso.', fileName: req.file.filename });
};

module.exports = { upload, handleFileUpload };
