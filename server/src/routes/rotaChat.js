import { enviarMensagem } from '../controllers/enviarMensagem.js';
import { listaHistorico } from '../controllers/historicoMSG.js';
import salvarConversa from '../controllers/salvarMensagens.js';
import EscolherModelo from '../controllers/escolherModelo.js';
import { contarTokens } from '../controllers/contarTokens.js';
import { resumirTexto } from '../controllers/resumirTexto.js';

export function rotaChat(app) {
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        mensagem,
        historico = [], // histórico do front (se vier)
        orientacaoUsuario = "",
        modelo,
      } = req.body;

      if (!mensagem || mensagem.trim() === "") {
        return res.status(400).json({ error: "Campo obrigatório: mensagem não pode estar vazia." });
      }

      // 🔁 Recupera histórico salvo nos logs
      const historicoSalvo = listaHistorico();

      // 🔄 Mescla histórico do front com do log (opcional)
      const historicoTotal = [...historicoSalvo, ...historico];

      // ⏳ Ordena por timestamp (mais antigo primeiro)
      historicoTotal.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return new Date(a.timestamp) - new Date(b.timestamp);
        }
        return 0;
      });

      // 📝 Concatena e resume histórico se necessário
      const textoHistorico = historicoTotal.map(msg => `${msg.role}: ${msg.content}`).join("\n");
      const resumoHistorico = textoHistorico.length > 1000
        ? await resumirTexto(textoHistorico)
        : textoHistorico;

      const orientacaoPadrao = `Você é um assistente que sempre responde em HTML. Retorne apenas HTML válido sem explicações.`;

      const mensagens = [
        { role: "system", content: `${orientacaoPadrao}\n${orientacaoUsuario}` },
        { role: "system", content: `Resumo do histórico:\n${resumoHistorico}` },
        { role: "user", content: mensagem }
      ];

      // 🔢 Conta os tokens
      const totalTokens = contarTokens(mensagens.map(m => m.content).join(" "));
      if (totalTokens > 5900) {
        console.warn("⚠️ Reduzindo contexto por excesso de tokens...");
        mensagens.splice(1, mensagens.length - 2); // Remove o resumo
        mensagens.unshift({ role: "system", content: orientacaoPadrao });
      }

      console.log("🧪 Mensagens finais:", mensagens);

      const modeloEscolhido = EscolherModelo(modelo);

      const resposta = await enviarMensagem(mensagens, modelo);
      const respostaDaIA = resposta.choices[0]?.message?.content || "";

      const mensagemSalvaJSON = [
        { role: "user", content: mensagem },
        { role: "assistant", content: respostaDaIA }
      ];

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
