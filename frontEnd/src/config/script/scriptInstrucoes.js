const textArea = document.getElementById("textArea")
const Instrucoes = document.getElementById("Instrucoes")
const Exemplo = document.getElementById("Exemplo")

window.addEventListener("DOMContentLoaded", () => {
    const textArea = document.getElementById("textArea");
    const Exemplo = document.getElementById("Exemplo");
    const Instrucoes = document.getElementById("Instrucoes");

    if (!textArea || !Exemplo || !Instrucoes) {
        
        return; // Para aqui se algo está errado
    }

    Object.assign(textArea.style, {
        backgroundColor: "lightblue",
        color: "black",
        border: "1px solid #888"
    });

    Object.assign(Exemplo.style, {
        backgroundColor: "#F8ECB1FF",
        color: "black",
        border: "1px solid #888"
    });

    Object.assign(Instrucoes.style, {
        backgroundColor: "#F8ECB1FF",
        color: "black",
        border: "1px solid #888"
    });

    textArea.readOnly = true;
    Exemplo.readOnly = true;
    Instrucoes.readOnly = true;

    const InstrucoesUsuario = localStorage.getItem("InstrucoesUsuario");
    console.log(InstrucoesUsuario);

    if (InstrucoesUsuario == null) {
        localStorage.setItem("InstrucoesUsuario", textArea.value);
    } else {
        textArea.value = InstrucoesUsuario;
    }
});

function Salvar(){    
    
    Object.assign(textArea.style, {
        backgroundColor: "lightblue", // Ou "blue", "#2196f3", etc.
  color: "black",
  border: "1px solid #888"    
    }
    
    )
    localStorage.setItem("InstrucoesUsuario", textArea.value)
    
    
    textArea.readOnly = true;
   
}


function Editar(){
   
    
    Object.assign(textArea.style, {
        backgroundColor: "", // Ou "blue", "#2196f3", etc.
  color: "black",
  border: "1px solid #888"    
    }
    
    )
    textArea.readOnly = false;
    localStorage.setItem("InstrucoesUsuario", textArea.value)
}
function ApagarInstrucao(){    
    textArea.value = ""
    localStorage.removeItem("InstrucoesUsuario")
}

async function Voltar(){
    const instrucao = await fetch("http://127.0.0.1/api/instrucoes", {
        method: "POST",
    })

    console.log(instrucao);
    
}

function abrirPaginaInstrucoes() {
  window.location.href = "frontEnd/pgInstrucoes.html";
}

function Voltar() {
  window.location.href = "/";
}