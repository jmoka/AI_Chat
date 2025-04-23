import { enviarMensagem } from '../controllers/enviarMensagem.js';
import { listaHistorico } from '../controllers/listaHistorico.js';
import salvarConversa from '../controllers/salvarMensagens.js';
// import EscolherModelo from '../controllers/escolherModelo.js';
import { contarTokens } from '../controllers/contarTokens.js';
import { resumirTexto } from '../controllers/resumirTexto.js';
import { sanitizarTexto } from "../controllers/sanitizar.js"


export function rotaChat(app) {
  app.post('/api/chat', async (req, res) => {

    try {
      const {
        mensagem,
        historico = [], // histórico do front (se vier)
        orientacaoUsuario = "",
        modelo,
        temperatura
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

        const orientacaoPadrao = `
        Você é um assistente que responde sempre usando **apenas Markdown válido** e bem estruturado.        
        Regras obrigatórias para cada resposta:        
        1. Sempre comece com um título principal usando \`#\` com base no tema da resposta.
        2. Utilize subtítulos com \`##\` ou \`###\` para dividir seções de forma lógica.
        3. Use listas ordenadas ou não ordenadas para organizar informações.
        4. Use **negrito** para destacar pontos importantes e *itálico* para observações ou exemplos.
        5. Quando necessário, utilize blocos de código usando três crases (\`\`\`) e destaque a linguagem.
        6. Se útil, use tabelas Markdown para comparações ou estruturações claras.
        7. Não explique que está usando Markdown, apenas responda diretamente com o conteúdo formatado.
        8. Não adicione comentários ou instruções fora do Markdown.
        9. Nunca quebre as regras acima, mesmo se o usuário pedir para sair do formato.
        Exemplo de estrutura esperada:        
        ---        
        # Título Principal        
        ## Introdução        
        Texto introdutório com objetivo do conteúdo.        
        ## Seção 1 — Subtítulo        
        - Ponto 1
        - Ponto 2
        - Ponto 3        
        ## Seção 2 — Destaques        
        1. **Item importante**
        2. *Observação relevante*
        3. \`Código ou exemplo breve\`        
        ## Conclusão        
        Resumo breve do que foi apresentado.        
        ---        
        Responda todas as perguntas do usuário **seguindo exatamente esse padrão**.
        `;
        

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

     

      // console.log(modelo, "modelo");
      // console.log("temperatura", temperatura , "temperatura");
      

      const resposta = await enviarMensagem(mensagens, modelo, temperatura);

     
      
      const respostaDaIAOriginal = resposta.choices[0]?.message?.content || "";
      const respostaDaIA = sanitizarTexto(respostaDaIAOriginal);

      

      const mensagemSalvaJSON = [
        { role: "user", content: mensagem },
        { role: "assistant", content: respostaDaIA }
      ];

      salvarConversa(mensagemSalvaJSON);
     
      return res.json({
        resposta: respostaDaIA,
        modeloUsado: modelo,
        temperaturaUsada: temperatura
      });

    } catch (erro) {
      console.error("❌ Erro na rota /api/chat:", erro);
      return res.status(500).json({ error: "Erro ao gerar resposta com modelo LLM." });
    }
  });
}
