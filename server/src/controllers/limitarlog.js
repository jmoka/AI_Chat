// Importações do Node.js para manipulação de arquivos e caminhos
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Corrige __dirname para ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const logDir = path.resolve(__dirname, '../../data/log'); // Diretório de logs
  const maxFiles = 20; // Número máximo de arquivos a manter
 


export default function limitarlog() {

     // excluir arquivos mais antigos
  // readdirSync lê o diretório e retorna uma lista de arquivos
  // withFileTypes: true retorna objetos que representam os arquivos
  // filter filtra os arquivos para manter apenas os arquivos JSON
    // sort ordena os arquivos do mais antigo ao mais recente
    // map mapeia os arquivos para seus caminhos completos
    const arquivosJSON = fs.readdirSync(logDir, { withFileTypes: true }) // Lê o diretório de logs
    .filter(file => file.isFile() && file.name.endsWith('.json'))
    .sort((a, b) => a.name.localeCompare(b.name)) // Arquivos do mais antigo ao mais recente
    .map(file => path.join(logDir, file.name));
    // verifica quantos e quais arquivos existem no diretório de logs
    // se o número de arquivos for maior que o número máximo de arquivos a manter
    // remove os arquivos mais antigos  
    if (arquivosJSON.length > maxFiles) {
        // slice tem a função de pegar os arquivos mais antigos
        // arquivosJSON.slice(0, arquivosJSON.length - maxFiles) pega os arquivos mais antigos
        // ordena os arquivos do mais antigo ao mais recente
        // exclui 5 arquivos mais antigos
        // arquivosParaRemover é um array com os arquivos a remover
      const arquivosParaRemover = arquivosJSON.slice(0, arquivosJSON.length - maxFiles); // Arquivos a remover
      arquivosParaRemover.forEach(arquivo => { // Para cada arquivo a remover
        // fs.unlinkSync remove o arquivo
        try {
          fs.unlinkSync(arquivo); // Remove o arquivo
          console.log(`🗑️ Arquivo removido: ${arquivo}`);
        } catch (erro) {
          console.warn(`⚠️ Erro ao remover o arquivo ${arquivo}:`, erro.message);
        }
      });
    } else {
      console.log("📂 Não há arquivos para remover. Total de arquivos:", arquivosJSON.length);
    }
   
    
}

limitarlog();
