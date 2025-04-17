// utils/sanitizar.js
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Cria ambiente simulado de browser
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Sanitiza removendo todas as tags HTML (segurança máxima)
export function sanitizarTexto(texto) {
  return DOMPurify.sanitize(texto, {
    ALLOWED_TAGS: [],     // nenhuma tag permitida
    ALLOWED_ATTR: []      // nenhum atributo permitido
  });
}
