const API_URL = "http://localhost"; // Sem :3000 nem :5500

async function importarArquivos() {
  const arquivos = inputArquivo.files;
  if (!arquivos.length) {
    alert("Nenhum arquivo selecionado.");
    return;
  }

  for (let arquivo of arquivos) {
    const formData = new FormData();
    formData.append("file", arquivo);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        let erroMsg = "Erro desconhecido.";
        try {
          const erro = await response.json();
          erroMsg = erro.error || erro.message;
        } catch (err) {
          console.error("Resposta não era JSON.");
        }
        throw new Error(erroMsg);
      }

      const resultado = await response.json();
      console.log("Arquivo enviado:", resultado.fileName);

      const item = document.createElement("div");
      item.textContent = resultado.fileName;
      listaArquivos.appendChild(item);
    } catch (error) {
      console.error("Erro ao importar arquivo:", error);
      alert(`Erro ao importar arquivo: ${error.message}`);
    }
  }

  inputArquivo.value = "";
}
