const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("messageInput");
const msg = document.getElementsByClassName("msg");
  

// Recupera mensagens salvas ao iniciar
window.addEventListener("DOMContentLoaded", () => {      
  const historico = JSON.parse(localStorage.getItem("chatHistorico")) || [];
  if(historico.length === 0){        
    Object.assign(messageInput.style, {
      height: '70px',
      padding: '10px',  
      marginBottom: '200px',
      fontSize: '16px',
      resize: 'vertical',
      borderRadius: '8px',         
     });
     messageInput.style.transition = "all 0.5s ease";  
     Object.assign(textBoasVindas.style, {
      display: "flex"
     }) 

  }
  historico.forEach(mensagem => {
    adicionarMensagem(mensagem.origem, mensagem.texto, mensagem.classe);
  });
});



// Limpa tudo (localStorage + tela)
function apagar() {
  localStorage.removeItem("chatHistorico");
  chat.innerHTML = "";
  console.log("Histórico de mensagens apagado.");
  Object.assign(messageInput.style, {
    height: '70px',
    padding: '10px',
    marginBottom: '200px',
    fontSize: '16px',
    resize: 'vertical',
    borderRadius: '8px',
   
   });
   messageInput.style.transition = "all 0.5s ease";

   Object.assign(textBoasVindas.style, {
    display: "flex"
   }) 

}

document.getElementById('messageInput').addEventListener("keydown", animacaoTextAreaEnviar);

function animacaoTextAreaEnviar(){
  Object.assign(textBoasVindas.style, {
    display: "none"
   });
   
   
   
    messageInput.style.marginBottom = '';
 
}




// Salva mensagem no localStorage
function salvarMensagem(origem, texto, classe) {
  const historico = JSON.parse(localStorage.getItem("chatHistorico")) || [];
  historico.push({ origem, texto, classe });
  localStorage.setItem("chatHistorico", JSON.stringify(historico));
}

async function enviarMensagem() {
  const mensagem = input.value.trim();
  if (!mensagem) return;

  adicionarMensagem("Você", mensagem, "user");
  salvarMensagem("Você", mensagem, "user");
  input.value = "";

  try {
    const resposta = await fetch("http://127.0.0.1/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mensagem: mensagem,
        orientacao: "",
        modelo: 8
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

function adicionarMensagem(origem, texto, classe) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", classe);
  const textoSanitizado = texto.replace(/<\/?[^>]+(>|$)/g, ""); 
  msgDiv.innerHTML = marked.parse(textoSanitizado); // Markdown -> HTML
  chat.appendChild(msgDiv);
  chat.scrollTop = chat.scrollHeight;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  enviarMensagem();
});

// Envia com Enter
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    enviarMensagem();
  }
});