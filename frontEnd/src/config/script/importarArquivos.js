const API_URL = "http://localhost"; // Sem :3000 ou :5500

const inputArquivo = document.getElementById("inputArquivo");
const listaArquivos = document.getElementById("listaArquivos");

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

      adicionarArquivoNaLista(resultado.fileName);
    } catch (error) {
      console.error("Erro ao importar arquivo:", error);
      alert(`Erro ao importar arquivo: ${error.message}`);
    }
  }

  inputArquivo.value = "";
}

function adicionarArquivoNaLista(nomeArquivo) {
  const item = document.createElement("div");
  item.classList.add("arquivo-item");

  const nome = document.createElement("span");
  nome.textContent = nomeArquivo;

  const btnExcluir = document.createElement("button");
  btnExcluir.textContent = "Excluir";
  btnExcluir.onclick = () => deletarArquivo(nomeArquivo, item);

  item.appendChild(nome);
  item.appendChild(btnExcluir);
  listaArquivos.appendChild(item);
}

async function listarArquivos() {
  listaArquivos.innerHTML = ""; // limpa lista antes de adicionar
  try {
    const response = await fetch(`${API_URL}/api/upload`);
    if (!response.ok) {
      throw new Error("Erro ao listar arquivos.");
    }

    const arquivos = await response.json(); // <- array de strings
    arquivos.forEach((nomeArquivo) => {
      adicionarArquivoNaLista(nomeArquivo); // <- passa a string direto
    });
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    alert(`Erro ao listar arquivos: ${error.message}`);
  }
}

// Carrega os arquivos ao abrir a página
window.addEventListener("DOMContentLoaded", listarArquivos);
