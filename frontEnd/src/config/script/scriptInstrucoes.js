const textArea = document.getElementById("textArea")


window.addEventListener("DOMContentLoaded", () => {
    Object.assign(textArea.style, {
        backgroundColor: "lightblue", // Ou "blue", "#2196f3", etc.
  color: "black",
  border: "1px solid #888"    
    }
    
    )
    textArea.readOnly = true;

    const InstrucoesUsuario = localStorage.getItem("InstrucoesUsuario")
    console.log(InstrucoesUsuario);
    

    if(InstrucoesUsuario == null){
        localStorage.setItem("InstrucoesUsuario", textArea.value)
        textArea.style.value = InstrucoesUsuario
    }else{
        textArea.value = InstrucoesUsuario
    }

    

    
})

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
function Apagar(){    
    textArea.value = ""
    localStorage.clear("InstrucoesUsuario")
}

async function Voltar(){
    const instrucao = await fetch("http://127.0.0.1/api/instrucoes", {
        method: "POST",
    })

    console.log(instrucao);
    
}

function abrirPaginaInstrucoes() {
    window.location.href = 'pgInstrucoes.html';
  }
  
  function Voltar() {
    window.location.href = 'index.html';
  }