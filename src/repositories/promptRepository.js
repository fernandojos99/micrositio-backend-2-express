const supabase = require('../config/supabaseClient');

const promptRepository = {
  /**
   * Buscar prompts por texto.
   * @param {string} q - Texto de búsqueda.
   * @returns {Promise<Array>} Lista de prompts que coinciden con el texto.
   */
  async buscarPorTexto(q) {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .ilike('titulo', `%${q}%`);

      if (error) {
        console.error('Error al buscar prompts:', error);
        throw new Error('Error al buscar prompts.');
      }

      return data || [];
    } catch (error) {
      console.error('Error en promptRepository.buscarPorTexto:', error);
      throw error;
    }
  },
};

module.exports = { promptRepository };