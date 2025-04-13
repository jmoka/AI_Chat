import { enviarMensagem } from '../controllers/msgUser.js';
import EscolherModelo from '../controllers/escolherModelo.js';
import { listaHistorico } from '../controllers/historicoMSG.js';
import { HistoricoMSG } from '../controllers/historicoMSG.js';
import { InstrucoesSistema } from '../controllers/instrucoesSistema.js';
import { listArquivos } from '../controllers/listArquivos.js';
import salvarConversa from '../controllers/salvarMensagens.js';

export function rotaChat(app) {
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        mensagem,
        orientacao = "Responda sempre em português de forma clara e objetiva.",
        arquivos = [],
        historico,
        modelo = 1,
      } = req.body;

      const historicoMemoria = listaHistorico();
      const historicoFinal = Array.isArray(historico) ? historico : historicoMemoria;

      console.log("🧪 Mensagens:", mensagem);
      console.log("🧪 Orientação:", orientacao);
      console.log("🧪 Arquivos:", arquivos);
      console.log("🧪 Histórico:", historicoFinal);
      console.log("🧪 Modelo:", modelo);

      if (!mensagem || mensagem.trim() === "") {
        return res.status(400).json({ error: "Campo obrigatório: mensagem não pode estar vazia." });
      }

      const mensagens = [
        { role: "system", content: orientacao },
        ...historicoFinal,
        { role: "user", content: mensagem }
      ];

      console.log("🧪 Mensagens finais:", mensagens);

      const resposta = await enviarMensagem(
        mensagens,
        orientacao,
        arquivos,
        historicoFinal,
        modelo
      );

      const respostaDaIA = resposta.choices[0]?.message?.content || "";

      const mensagemSalvaJSON = [
        { role: "user", content: mensagem },
        { role: "assistant", content: respostaDaIA }
      ];

      console.log("📦 Nova interação:", mensagemSalvaJSON);
      salvarConversa(mensagemSalvaJSON);

      return res.json({
        resposta: respostaDaIA,
        modeloUsado: modelo,
      });

    } catch (erro) {
      console.error("❌ Erro na rota /api/chat:", erro);
      return res.status(500).json({ error: "Erro ao gerar resposta com modelo LLM." });
    }
  });
}
