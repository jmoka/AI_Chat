// Define a URL base da API (sem especificar a porta)
const API_URL = "http://localhost";

// Pega a referência do input de arquivos (input[type="file"])
const inputArquivo = document.getElementById("inputArquivo");

// Pega a referência do contêiner onde a lista de arquivos será exibida
const listaArquivos = document.getElementById("listaArquivos");

// Função para importar os arquivos selecionados no input
async function importarArquivos() {
  // Obtém a lista de arquivos selecionados
  const arquivos = inputArquivo.files;

  // Se nenhum arquivo foi selecionado, exibe alerta e sai da função
  if (!arquivos.length) {
    alert("Nenhum arquivo selecionado.");
    return;
  }

  // Itera sobre cada arquivo selecionado
  for (let arquivo of arquivos) {
    // Cria um FormData para enviar o arquivo via POST
    const formData = new FormData();
    formData.append("file", arquivo); // adiciona o arquivo com o nome "file"
    console.log(formData);

    try {
      // Envia o arquivo para a API via POST
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData
      });

      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        let erroMsg = "Erro desconhecido.";
        try {
          // Tenta extrair a mensagem de erro do corpo da resposta JSON
          const erro = await response.json();
          erroMsg = erro.error || erro.message;
        } catch (err) {
          console.error("Resposta não era JSON.");
        }
        throw new Error(erroMsg); // Lança erro com a mensagem obtida
      }

      // Extrai o nome do arquivo retornado no JSON da resposta
      const resultado = await response.json();
      console.log("Arquivo enviado:", resultado.fileName);

      // Adiciona o arquivo à lista visual
      adicionarArquivoNaLista(resultado.fileName);
    } catch (error) {
      // Captura e exibe erros de envio
      console.error("Erro ao importar arquivo:", error);
      alert(`Erro ao importar arquivo: ${error.message}`);
    }
  }

  // Limpa o campo de seleção de arquivos
  inputArquivo.value = "";
}

// Função que adiciona um item à lista de arquivos exibida na interface
function adicionarArquivoNaLista(nomeArquivo) {
  // Cria um elemento div para o item
  const item = document.createElement("div");
  item.classList.add("arquivo-item"); // Adiciona classe para estilização

  // Cria um span com o nome do arquivo
  const nome = document.createElement("span");
  nome.textContent = nomeArquivo;

  // Cria um botão de excluir
  const btnExcluir = document.createElement("button");
  btnExcluir.textContent = "Excluir";

  // Define ação ao clicar no botão: chama função para deletar
  btnExcluir.onclick = () => deletarArquivo(nomeArquivo, item);

  // Adiciona o nome e o botão ao item
  item.appendChild(nome);
  item.appendChild(btnExcluir);

  // Adiciona o item à lista de arquivos na página
  listaArquivos.appendChild(item);
}

// Função que lista os arquivos já enviados
async function listarArquivos() {
  // Limpa a lista visual atual para evitar duplicação
  listaArquivos.innerHTML = "";

  try {
    // Faz uma requisição GET para obter os arquivos enviados
    const response = await fetch(`${API_URL}/api/upload`);
    if (!response.ok) {
      throw new Error("Erro ao listar arquivos.");
    }

    // Espera a resposta como JSON (esperado: array de strings)
    const arquivos = await response.json();

    // Para cada nome de arquivo retornado, adiciona na lista visual
    arquivos.forEach((nomeArquivo) => {
      adicionarArquivoNaLista(nomeArquivo);
    });
  } catch (error) {
    // Captura e exibe erros da requisição
    console.error("Erro ao listar arquivos:", error);
    alert(`Erro ao listar arquivos: ${error.message}`);
  }
}

// Ao carregar a página, chama a função para listar os arquivos
window.addEventListener("DOMContentLoaded", listarArquivos);
