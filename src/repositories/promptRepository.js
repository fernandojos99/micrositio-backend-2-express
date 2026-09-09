// src/repositories/promptRepository.js
// ⚠️ Por ahora NO existe tabla "prompts" en la BD.
// Dejamos este repositorio como stub seguro para que no rompa la búsqueda.

class PromptRepository {
  /**
   * Buscar prompts por texto.
   * Por ahora devuelve siempre lista vacía, para no causar errores 500.
   * @param {string} q
   * @returns {Promise<Array>}
   */
  async buscarPorTexto(q) {
    // Sin console.warn: searchService lo llama en cada busqueda con
    // scope 'all' o 'prompts', y el aviso inundaba los logs sin aportar nada
    // que no diga ya este archivo.
    return [];
  }
}

export default PromptRepository;
