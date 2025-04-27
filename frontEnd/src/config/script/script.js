// Seletores principais
const chat = document.getElementById("chat");
const limpar = document.getElementById("btnLimpar");
const enviar = document.getElementById("btnenviar");
const form = document.getElementById("form");
const input = document.getElementById("messageInput");
const sidebar = document.getElementById("sidebar");
const instrucao = localStorage.getItem("InstrucoesUsuario");
const textBoasVindas = document.getElementById("textBoasVindas"); // Corrigido para evitar erro

// Função para adicionar mensagens no chat
function adicionarMensagem(origem, texto, classe) {
  if (!texto) {
    console.warn("Texto inválido ou indefinido:", texto);
    return;
  }

  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", classe);

  const textoSanitizado = texto.replace(/<\/?[^>]+(>|$)/g, ""); // Remove tags perigosas
  msgDiv.innerHTML = marked.parse(textoSanitizado); // Converte markdown em HTML

  chat.appendChild(msgDiv);
  chat.scrollTop = chat.scrollHeight;
}

// Carrega histórico salvo ao iniciar
window.addEventListener("DOMContentLoaded", () => {
  const historico = JSON.parse(localStorage.getItem("chatHistorico")) || [];

  if (historico.length === 0) {
    Object.assign(limpar.style, { display: "none" });
    Object.assign(enviar.style, { display: "none" });
    Object.assign(input.style, {
      height: "70px",
      padding: "10px",
      marginBottom: "200px",
      fontSize: "16px",
      resize: "vertical",
      borderRadius: "8px",
      transition: "all 0.5s ease"
    });

    if (textBoasVindas) {
      textBoasVindas.style.display = "flex";
    }
  } else {
    Object.assign(limpar.style, { display: "" });
    Object.assign(enviar.style, { display: "" });

    historico.forEach((mensagem) => {
      adicionarMensagem(mensagem.origem, mensagem.texto, mensagem.classe);
    });
  }

  // Carregar seleção de modelo salvo
  const modeloSalvo =
    localStorage.getItem("modeloSelecionado") || "qwen-qwq-32b";
  const modeTemperatura = localStorage.getItem("modeTemperatura") || "0.5";
  const modePresence = localStorage.getItem("modePresence") || "0.0";
  const modeFrequency = localStorage.getItem("modeFrequency") || "0.0";
  const tokenSalvo = localStorage.getItem("token") || "3000";

  document.getElementById("modeloLLM").value = modeloSalvo;
  document.getElementById("modeTemperatura").value = modeTemperatura;
  document.getElementById("modePresence").value = modePresence;
  document.getElementById("modeFrequency").value = modeFrequency;
  document.getElementById("token").value = tokenSalvo;
});

// Salva mensagens no localStorage
function salvarMensagem(origem, texto, classe) {
  if (!texto || !origem || !classe) {
    console.warn("Dados inválidos para salvar:", { origem, texto, classe });
    return;
  }

  const historico = JSON.parse(localStorage.getItem("chatHistorico")) || [];
  historico.push({ origem, texto, classe });
  localStorage.setItem("chatHistorico", JSON.stringify(historico));
}

// Limpa o chat e localStorage
function limparTela() {
  localStorage.removeItem("chatHistorico");
  chat.innerHTML = "";
  console.log("Histórico apagado.");

  Object.assign(input.style, {
    height: "70px",
    padding: "10px",
    marginBottom: "200px",
    fontSize: "16px",
    resize: "vertical",
    borderRadius: "8px",
    transition: "all 0.5s ease"
  });

  if (textBoasVindas) {
    textBoasVindas.style.display = "flex";
  }

  location.reload();
}

async function apagar() {
  try {
    const resposta = await fetch("http://127.0.0.1:80/api/del", {
      method: "DELETE"
    });

    const dados = await resposta.json();
    console.log("DADOS DELETADOS", dados);
    limparTela();
  } catch (erro) {
    console.error("Erro ao apagar histórico:", erro);
  }
}


// Restaura histórico de mensagens da API
async function restaurar() {
  try {
    const resposta = await fetch("http://127.0.0.1:80/api/logs");
    const dados = await resposta.json();

    console.log("DADOS RECEBIDOS:", dados);

    const historicoConvertido = dados.logs.map((item) => ({
      origem: item.role === "user" ? "Você" : "IA",
      texto: item.content,
      classe: item.role
    }));

    localStorage.setItem("chatHistorico", JSON.stringify(historicoConvertido));

    historicoConvertido.forEach((msg) => {
      adicionarMensagem(msg.origem, msg.texto, msg.classe);
    });

    if (historicoConvertido.length > 0) {
      location.reload();
    }
  } catch (erro) {
    console.error("Erro ao restaurar histórico:", erro);
  }
}

// Animação ao começar a digitar
input.addEventListener("keydown", () => {
  if (textBoasVindas) {
    textBoasVindas.style.display = "none";
  }
  input.style.marginBottom = "";
});

// Envia a mensagem para a API
async function enviarMensagem() {
  const mensagem = input.value.trim();
  if (!mensagem) return;

  adicionarMensagem("Você", mensagem, "user");
  salvarMensagem("Você", mensagem, "user");

  input.value = "";

  Object.assign(limpar.style, { display: "" });
  Object.assign(enviar.style, { display: "" });

  const top_p_padrao = 1;

  try {
    const resposta = await fetch("http://127.0.0.1/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mensagem: mensagem,
        orientacaoUsuario: instrucao,
        modelo: pegarSelecionado(),
        temperatura: pegarTemperatura(),
        presence_penalty: pegarPresence(),
        frequency_penalty: pegarFrequency(),
        max_tokens: token(),
        top_p: top_p_padrao
      })
    });

    const dados = await resposta.json();
    const textoIA = dados.resposta || "(sem resposta)";

    adicionarMensagem("IA", textoIA, "assistant");
    salvarMensagem("IA", textoIA, "assistant");
  } catch (erro) {
    console.error("Erro:", erro);
    const erroMsg = "❌ Erro ao se comunicar com a API.";
    adicionarMensagem("IA", erroMsg, "assistant");
    salvarMensagem("IA", erroMsg, "assistant");
  }
}

// Funções auxiliares para pegar valores e salvar localmente
function pegarSelecionado() {
  const modelo = document.getElementById("modeloLLM").value;
  localStorage.setItem("modeloSelecionado", modelo);
  return modelo;
}
function pegarTemperatura() {
  const temp = document.getElementById("modeTemperatura").value;
  localStorage.setItem("modeTemperatura", temp);
  return temp;
}
function pegarPresence() {
  const presence = document.getElementById("modePresence").value;
  localStorage.setItem("modePresence", presence);
  return presence;
}
function pegarFrequency() {
  const frequency = document.getElementById("modeFrequency").value;
  localStorage.setItem("modeFrequency", frequency);
  return frequency;
}
function token() {
  const tokenVal = document.getElementById("token").value;
  localStorage.setItem("token", tokenVal);
  return tokenVal;
}

// Eventos de formulário e teclado
form.addEventListener("submit", (e) => {
  e.preventDefault();
  enviarMensagem();
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    enviarMensagem();
  }
});

// Menu lateral
function toggleMenu() {
  sidebar.classList.toggle("open");
}

// Botão limpar
limpar.addEventListener("click", limparTela);
