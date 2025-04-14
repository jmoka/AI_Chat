import { enviarMensagem } from '../controllers/enviarMensagem.js';
import { listaHistorico } from '../controllers/historicoMSG.js';
import salvarConversa from '../controllers/salvarMensagens.js';
import EscolherModelo from '../controllers/escolherModelo.js'; // Importa a função EscolherModelo

export function rotaChat(app) {
  app.post('/api/chat', async (req, res) => { // Rota para enviar mensagens para o modelo LLM
    try {
      const { // Mensagem do usuário
        mensagem,
        orientacao,
        arquivos = [],
        // historico, // precisa ser um array de mensagens [{ role, content }, ...]
        modelo,
      } = req.body; // Extraindo dados do corpo da requisição e definindo valores padrão

      const historicoMemoria = listaHistorico(); // Carrega o histórico de mensagens do arquivo de log
      const historicoFinal = Array.isArray(historicoMemoria) ? historicoMemoria : listaHistorico(); // Se o histórico não for um array, usa o histórico carregado do log

        // Ordena pela propriedade timestamp, se existir
      historicoFinal.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return new Date(b.timestamp) - new Date(a.timestamp); // Mais recente primeiro
        }
        return 0; // Mantém a ordem original caso não tenha timestamp
      });

      // Verifica se a mensagem não está vazia ou nula
      // Se estiver vazia, retorna erro 400 (Bad Request)
      if (!mensagem || mensagem.trim() === "") {
        return res.status(400).json({ error: "Campo obrigatório: mensagem não pode estar vazia." });
      }
      

      //
      const mensagens = [ // Cria um array de mensagens para enviar ao modelo LLM
        { role: "system", content: orientacao },
        ...historicoFinal,
        { role: "user", content: mensagem }
      ];

      console.log("🧪 Mensagens finais:", mensagens);

      const modeloEscolhido = EscolherModelo(modelo)

      const resposta = await enviarMensagem(
        mensagens,
        // orientacao,
        // arquivos,
        // historicoFinal,
        modelo
      );

      const respostaDaIA = resposta.choices[0]?.message?.content || "";

      const mensagemSalvaJSON = [
        { role: "user", content: mensagem },
        { role: "assistant", content: respostaDaIA }
      ];

      // console.log("📦 Nova interação:", mensagemSalvaJSON);
      salvarConversa(mensagemSalvaJSON);
      
      
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
