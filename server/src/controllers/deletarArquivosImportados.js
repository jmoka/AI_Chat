import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDataPath = path.resolve(__dirname, "../../data");
const uploadDir = path.join(baseDataPath, "uploads");

export function deletarArquivosImportados(req, res) {
  const { fileName } = req.params;
  const filePath = path.join(uploadDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`Arquivo ${fileName} não encontrado.`);
    return res.status(404).json({ error: "Arquivo não encontrado." });
  }

  try {
    fs.unlinkSync(filePath);
    console.log(`Arquivo deletado: ${fileName}`);
    return res.status(200).json({
      status: "success",
      message: `Arquivo "${fileName}" deletado com sucesso.`
    });
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error.message);
    return res.status(500).json({ error: "Erro ao deletar arquivo." });
  }
}
