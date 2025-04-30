// Define a URL base da API (sem especificar a porta)
const API_URL = "http://localhost";

// Pega a referência do input de arquivos (input[type="file"])
const inputArquivo = document.getElementById("inputArquivo");

// Pega a referência do contêiner onde a lista de arquivos será exibida
const listaArquivos = document.getElementById("listaArquivos");
const arquivosProcessados = document.getElementById("arquivosProcessados");

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

// Função que adiciona um item à lista de arquivos importados
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

// Nova função para adicionar arquivo processado à lista
function adicionarArquivoProcessadoNaLista(nomeArquivo) {
  const item = document.createElement("div");
  item.classList.add("arquivo-item");
  const nome = document.createElement("span");
  nome.textContent = nomeArquivo;
  // Se desejar, pode incluir um botão para ação nos arquivos processados
  const btnExcluir = document.createElement("button");
  btnExcluir.textContent = "Excluir";
  btnExcluir.onclick = () => deletarArquivo(nomeArquivo, item);
  item.appendChild(nome);
  item.appendChild(btnExcluir);
  arquivosProcessados.appendChild(item);
}

// Função para listar os arquivos processados
async function listarArquivosProcessados() {
  // Limpa a lista visual atual para evitar duplicação
  arquivosProcessados.innerHTML = "";

  try {
    const response = await fetch(`${API_URL}/api/processed`);
    if (!response.ok) {
      throw new Error("Erro ao listar arquivos processados.");
    }
    const arquivos = await response.json();
    // Para cada nome de arquivo retornado, adiciona na lista de processados
    arquivos.forEach((nomeArquivo) => {
      adicionarArquivoProcessadoNaLista(nomeArquivo);
    });
  } catch (error) {
    console.error("Erro ao listar arquivos processados:", error);
    alert(`Erro ao listar arquivos processados: ${error.message}`);
  }
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

async function processarArquivos() {
  const response = await fetch(`${API_URL}/api/processarArquivos`, {
    method: "POST"
  });

  if (!response.ok) {
    alert("Erro ao processar arquivos.");
  } else {
    alert("Arquivos processados com sucesso.");
    // Atualiza a lista de arquivos processados após o processamento
    listarArquivosProcessados();
  }
}

function abrirPaginaArquivos() {
  window.location.href = "frontEnd/importarArquivos.html";
}

function Voltar() {
  window.location.href = "/";
}

// Ao carregar a página, chama a função para listar os arquivos
window.addEventListener("DOMContentLoaded", listarArquivos);
window.addEventListener("DOMContentLoaded", listarArquivosProcessados);
