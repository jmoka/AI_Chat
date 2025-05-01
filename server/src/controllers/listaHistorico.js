// Importações do Node.js para manipulação de arquivos e caminhos
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Corrige __dirname para ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 📂 Recupera o conteúdo do arquivo de log mais recente no diretório /data/log
 * 
 * - Se encontrar um array de mensagens, retorna esse array.
 * - Se encontrar um objeto único de mensagem, retorna como array com 1 item.
 * - Se não encontrar nada válido, retorna array vazio.
 *
 * @returns {Array} Lista de mensagens [{ role, content }, ...]
 */
export function listaHistorico() {
  const historico = [];
  const logDir = path.resolve(__dirname, "../../data/log");

  try {
    const arquivosJSON = fs
      .readdirSync(logDir, { withFileTypes: true })
      .filter((file) => file.isFile() && file.name.endsWith(".json"))
      .sort((a, b) => b.name.localeCompare(a.name)) // Arquivos do mais recente ao mais antigo
      .map((file) => path.join(logDir, file.name));

    for (const filePath of arquivosJSON) {
      try {
        const conteudo = fs.readFileSync(filePath, "utf-8");
        const dados = JSON.parse(conteudo);

        if (Array.isArray(dados)) {
          historico.push(...dados);
        } else if (typeof dados === "object" && dados !== null) {
          historico.push(dados);
        } else {
          console.warn(`⚠️ Dados inválidos no arquivo ${filePath}:`, dados);
        }
      } catch (erro) {
        console.warn(
          `⚠️ Erro ao ler ou interpretar ${filePath}:`,
          erro.message
        );
      }
    }

    // Ordena mensagens pela propriedade timestamp, se existir
    historico.sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return new Date(b.timestamp) - new Date(a.timestamp); // Mais recente primeiro
      }
      return 0; // Se não houver timestamp, mantém a ordem lida
    });
  } catch (erro) {
    console.warn(`⚠️ Erro ao acessar o diretório de logs:`, erro.message);
  }

  // console.log("📜 Histórico carregado do log:", historico);
  return historico;
}

