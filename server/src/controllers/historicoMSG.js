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
  const logDir = path.resolve(__dirname, '../../data/log');
  try {
    const arquivosJSON = fs.readdirSync(logDir, { withFileTypes: true })
      .filter(file => file.isFile() && file.name.endsWith('.json'))
      .sort((a, b) => b.name.localeCompare(a.name)) // Ordem decrescente (mais recente primeiro)
      .map(file => path.join(logDir, file.name));

    console.log("📂 Arquivos JSON encontrados no diretório de logs:", arquivosJSON);

    for (const filePath of arquivosJSON) {
      try {
        const conteudo = fs.readFileSync(filePath, 'utf-8');
        const dados = JSON.parse(conteudo);

        if (Array.isArray(dados)) {
          historico.push(...dados); // Adiciona todos os itens do array
        } else if (typeof dados === 'object' && dados !== null) {
          historico.push(dados); // Adiciona um único objeto
        } else {
          console.warn(`⚠️ Dados inválidos no arquivo ${filePath}:`, dados);
        }
      } catch (erro) {
        console.warn(`⚠️ Erro ao ler ou interpretar ${filePath}:`, erro.message);
      }
    }
  } catch (erro) {
    console.warn(`⚠️ Erro ao acessar o diretório de logs:`, erro.message);
  }

  console.log("📜 Histórico carregado do log:", historico);
  return historico;
}

/**
 * 🧠 Valida e normaliza a lista de mensagens para o formato aceito pela API da Groq
 *
 * @param {Array} lista - Lista de mensagens brutas
 * @returns {Array} Lista de mensagens válidas { role, content }
 */
export function HistoricoMSG(lista = []) {
  if (!Array.isArray(lista)) return [];

  return lista
    .filter(item => {
      const valido = item && typeof item === 'object' &&
                     typeof item.role === 'string' &&
                     typeof item.content === 'string';
      if (!valido) console.warn('⚠️ Mensagem inválida ignorada:', item);
      return valido;
    })
    .map(item => ({
      role: item.role.trim(),
      content: item.content.trim()
    }));
}

export function rotaChat(app) {
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        mensagemEnviadaUsuario,
        orientacaPadrao = InstrucoesSistema("vc é um especialista em economia como um economista"),
        arquivos = [],
        modeloPadrao = 1,
      } = req.body;

      if (!mensagemEnviadaUsuario || mensagemEnviadaUsuario.trim() === "") {
        return res.status(400).json({ error: "Campo obrigatório: mensagemEnviadaUsuario não pode estar vazio." });
      }

      const historicoBruto = Array.isArray(req.body.listaHistoricoMSGPadrao) && req.body.listaHistoricoMSGPadrao.length > 0
        ? req.body.listaHistoricoMSGPadrao
        : listaHistorico();

      const historicoFormatado = HistoricoMSG(historicoBruto);
      const arquivosFormatados = await listArquivos(arquivos);
      const modeloEscolhido = EscolherModelo(modeloPadrao);

      const contextoHistorico = [...historicoFormatado];
      console.log("📜 Enviando histórico ao modelo:", contextoHistorico);

      const resposta = await enviarMensagem(
        mensagemEnviadaUsuario,
        orientacaPadrao,
        contextoHistorico,
        arquivosFormatados,
        modeloPadrao
      );

      const respostaDaIA = resposta.choices[0]?.message?.content || "";

      const novaInteracao = [
        { role: 'user', content: mensagemEnviadaUsuario },
        { role: 'assistant', content: respostaDaIA }
      ];

      const historicoAtualizado = [...contextoHistorico, ...novaInteracao];
      console.log("📦 Histórico atualizado:", JSON.stringify(historicoAtualizado, null, 2));
      salvarConversa(JSON.stringify(historicoAtualizado, null, 2));

      return res.json({
        resposta: respostaDaIA,
        modeloUsado: modeloEscolhido,
      });

    } catch (erro) {
      console.error("❌ Erro na rota /api/chat:", erro);
      return res.status(500).json({ error: "Erro ao gerar resposta com modelo LLM." });
    }
  });
}
