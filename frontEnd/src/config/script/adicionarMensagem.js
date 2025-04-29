// No arquivo adicionarMensagem.js
function function_adicionarMensagem(origem, texto, classe) {
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
