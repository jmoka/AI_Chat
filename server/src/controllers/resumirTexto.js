// server/src/utils/resumirTexto.js

/**
 * Resume um texto grande pegando apenas as partes mais relevantes.
 * Este é um resumo simplificado baseado em tamanho. Em produção, use uma LLM.
 */
export async function resumirTexto(texto) {
    const limite = 10000; // caracteres máximos no resumo
  
    if (texto.length <= limite) {
      return texto;
    }
  
    const inicio = texto.slice(0, limite / 2);
    const fim = texto.slice(-limite / 2);
  
    return `${inicio}\n...\n${fim}`;
  }
  