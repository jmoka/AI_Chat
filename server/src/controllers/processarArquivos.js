const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse'); // Biblioteca para processar PDFs

// Diretórios
const uploadDir = path.join(__dirname, '../../data/uploads'); // Diretório de uploads
const processedDir = path.join(__dirname, '../../data/processed'); // Diretório de arquivos processados

console.log("Diretório processe arquivo de uploads:", uploadDir);
console.log("Diretório de processe arquivos processados:", processedDir);


// Garante que o diretório de uploads existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Diretório criado: ${uploadDir}`);
}

// Garante que o diretório de arquivos processados existe
if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
    console.log(`Diretório criado: ${processedDir}`);
}

// Função para processar arquivos
async function processFiles() {
    const processedFiles = [];

    try {
        const files = fs.readdirSync(uploadDir);

        for (const file of files) {
            const filePath = path.join(uploadDir, file);
            const fileStat = fs.statSync(filePath);

            if (fileStat.isDirectory()) continue;

            const ext = path.extname(file).toLowerCase();
            const supportedTypes = ['.txt', '.png', '.docx', '.xlsx', '.jpeg', '.jpg', '.mp4', '.pdf'];
            if (!supportedTypes.includes(ext)) {
                console.log(`Tipo de arquivo não suportado: ${file}`);
                continue;
            }

            const fileData = {
                name: file,
                size: fileStat.size,
                type: ext,
                createdAt: fileStat.birthtime,
                content: null
            };

            try {
                // Processa o conteúdo do arquivo dependendo do tipo
                if (ext === '.txt') {
                    fileData.content = fs.readFileSync(filePath, 'utf-8'); // Lê texto
                } else if (ext === '.pdf') {
                    const pdfBuffer = fs.readFileSync(filePath);
                    const pdfData = await pdfParse(pdfBuffer); // Extrai texto do PDF
                    fileData.content = pdfData.text || 'Nenhum texto encontrado no PDF.';
                } else if (['.png', '.jpeg', '.jpg', '.mp4'].includes(ext)) {
                    fileData.content = 'Arquivo binário (não processado)';
                } else if (['.docx', '.xlsx'].includes(ext)) {
                    fileData.content = 'Conteúdo de arquivo Office (não processado)';
                }

                // Salva o JSON no diretório de processamento
                const jsonFileName = `${path.basename(file, ext)}.json`;
                const jsonFilePath = path.join(processedDir, jsonFileName);
                fs.writeFileSync(jsonFilePath, JSON.stringify(fileData, null, 2), 'utf-8');
                processedFiles.push(jsonFileName);
                console.log(`Arquivo processado e salvo: ${jsonFileName}`);
            } catch (fileError) {
                console.error(`Erro ao processar o arquivo "${file}":`, fileError.message);
            }
        }

        return processedFiles;
    } catch (error) {
        console.error('Erro ao processar arquivos:', error.message);
        throw error;
    }
}

module.exports = { processFiles };