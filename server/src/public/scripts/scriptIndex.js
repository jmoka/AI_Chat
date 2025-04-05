const fetchHTML = "./server/src/components/mensagens.html"

document.addEventListener("DOMContentLoaded", () => {
    fetch(fetchHTML) // Altere o caminho para o arquivo HTML conforme necessário
        .then(response => response.text())
        .then(data => {
            const container = document.getElementById("mensagens-container");
            
            // Cria um container temporário para separar HTML e scripts
            const temp = document.createElement("div");
            temp.innerHTML = data;

            // Insere apenas o conteúdo HTML sem os <script>
            Array.from(temp.children).forEach(el => {
                if (el.tagName !== "SCRIPT") {
                    container.appendChild(el);
                }
            });

            // Agora executa os scripts separadamente
            Array.from(temp.querySelectorAll("script")).forEach(script => {
                const newScript = document.createElement("script");
                if (script.src) {
                    newScript.src = script.src; // Se for um script externo
                } else {
                    newScript.textContent = script.textContent; // Se for script embutido
                }
                document.body.appendChild(newScript);
            });
        })
        .catch(error => console.error("Erro ao carregar mensagens.html:", error));
});
