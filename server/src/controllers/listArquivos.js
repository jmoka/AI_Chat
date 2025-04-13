

// Essa função transforma um histórico bruto (array de objetos) no formato esperado pela API da Groq
export function listArquivos(lista = []) {
    if (!Array.isArray(lista)) return [];
  
    return lista
      .filter(item => item && typeof item === "object" && item.role && item.content)
      .map(item => ({
        role: String(item.role),
        content: String(item.content)
      }));
  }
  