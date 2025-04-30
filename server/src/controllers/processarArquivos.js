import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdf from "pdf-parse"; // Biblioteca para extrair texto de PDFs
import XLSX from "xlsx"; // Biblioteca para processar Excel
import mammoth from "mammoth"; // Biblioteca para extrair texto de DOCX
import { promisify } from "util"; // Para o textract promisify
import textract from "textract"; // Biblioteca para extrair texto de DOC

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretórios
const uploadDir = path.resolve(__dirname, "../../data/uploads");
const processedDir = path.join(__dirname, "../../data/processed");

console.log("Diretório de uploads:", uploadDir);
console.log("Diretório de processados:", processedDir);

// Garante que os diretórios existem
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Diretório criado: ${uploadDir}`);
}

if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
  console.log(`Diretório criado: ${processedDir}`);
}

export async function processFiles(req, res) {
  console.log("Iniciando o processamento de arquivos...");
  const processedFiles = [];
  const extractTextFromDoc = promisify(
    textract.fromFileWithPath.bind(textract)
  );

  try {
    const files = fs.readdirSync(uploadDir);
    console.log("Arquivos encontrados na pasta uploads:", files);

    if (files.length === 0) {
      console.log("Nenhum arquivo encontrado na pasta uploads.");
      return res
        .status(200)
        .json({ message: "Nenhum arquivo para processar." });
    }

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const fileStat = fs.statSync(filePath);
      if (fileStat.isDirectory()) continue;

      const ext = path.extname(file).toLowerCase();
      let content = "";

      try {
        if (ext === ".txt") {
          content = fs.readFileSync(filePath, "utf-8");
        } else if (ext === ".pdf") {
          console.log("Processando PDF:", filePath);
          const pdfBuffer = fs.readFileSync(filePath);
          try {
            const data = await pdf(pdfBuffer);
            content =
              data.text && data.text.trim()
                ? data.text.trim()
                : "Nenhum texto encontrado no PDF.";
          } catch (err) {
            console.error("Erro ao extrair conteúdo do PDF:", err.message);
            content = "Erro ao extrair conteúdo do PDF.";
          }
        } else if (ext === ".xlsx" || ext === ".xls") {
          console.log("Processando Excel:", filePath);
          try {
            const workbook = XLSX.readFile(filePath);
            let excelText = "";
            workbook.SheetNames.forEach((sheetName) => {
              const sheet = workbook.Sheets[sheetName];
              excelText += XLSX.utils.sheet_to_csv(sheet) + "\n";
            });
            content = excelText.trim()
              ? excelText.trim()
              : "Nenhum texto encontrado no Excel.";
          } catch (err) {
            console.error("Erro ao extrair conteúdo do Excel:", err.message);
            content = "Erro ao extrair conteúdo do Excel.";
          }
        } else if (ext === ".docx") {
          console.log("Processando Word (.docx):", filePath);
          try {
            const result = await mammoth.extractRawText({ path: filePath });
            content =
              result.value && result.value.trim()
                ? result.value.trim()
                : "Nenhum texto encontrado no Word.";
          } catch (err) {
            console.error(
              "Erro ao extrair conteúdo do Word (.docx):",
              err.message
            );
            content = "Erro ao extrair conteúdo do Word.";
          }
        } else if (ext === ".doc") {
          console.log("Processando Word (.doc):", filePath);
          try {
            content =
              (await extractTextFromDoc(filePath))?.trim() ||
              "Nenhum texto encontrado no Word.";
          } catch (err) {
            console.error(
              "Erro ao extrair conteúdo do Word (.doc):",
              err.message
            );
            content = "Erro ao extrair conteúdo do Word.";
          }
        } else {
          // Para outros formatos, lemos o arquivo como base64
          content = fs.readFileSync(filePath, "base64");
        }

        // Cria o JSON com o formato desejado
        const mensagemSalvaJSON = [{ role: "file", content: content }];
        const jsonFileName = `${path.basename(file, ext)}.json`;
        const jsonFilePath = path.join(processedDir, jsonFileName);
        fs.writeFileSync(
          jsonFilePath,
          JSON.stringify(mensagemSalvaJSON, null, 2),
          "utf-8"
        );
        processedFiles.push(jsonFileName);
        console.log(`Arquivo processado e salvo: ${jsonFileName}`);
      } catch (fileError) {
        console.error(
          `Erro ao processar o arquivo "${file}":`,
          fileError.message
        );
      }
    }

    if (processedFiles.length > 0) {
      return res.status(200).json({
        message: "Arquivos processados com sucesso",
        processedFiles: processedFiles
      });
    } else {
      return res
        .status(200)
        .json({ message: "Nenhum arquivo foi processado." });
    }
  } catch (error) {
    console.error("Erro ao processar arquivos:", error.message);
    return res.status(500).json({ error: "Erro ao processar arquivos" });
  }
}
