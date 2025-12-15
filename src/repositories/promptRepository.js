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
    console.warn(
      'PromptRepository.buscarPorTexto llamado, pero no existe tabla "prompts" en la BD. Devolviendo [].'
    );
    return [];
  }
}

export default PromptRepository;
