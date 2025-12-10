const { proyectoRepository } = require('../repositories/proyectoRepository');
const { agenteRepository } = require('../repositories/agenteRepository');
const { promptRepository } = require('../repositories/promptRepository');

const searchService = {
  /**
   * Servicio para manejar la búsqueda general.
   * @param {string} q - Texto de búsqueda.
   * @param {string} scope - Alcance de la búsqueda (proyectos, agentes, prompts, all).
   * @returns {Promise<Object>} Resultados de la búsqueda.
   */
  async search(q, scope) {
    const results = {};

    try {
      // Buscar en proyectos
      if (scope === 'proyectos' || scope === 'all') {
        results.proyectos = await proyectoRepository.buscarPorTexto(q);
      }

      // Buscar en agentes
      if (scope === 'agentes' || scope === 'all') {
        results.agentes = await agenteRepository.buscarPorTexto(q);
      }

      // Buscar en prompts
      if (scope === 'prompts' || scope === 'all') {
        results.prompts = await promptRepository.buscarPorTexto(q);
      }

      return results;
    } catch (error) {
      console.error('Error en searchService.search:', error);
      throw new Error('Error al realizar la búsqueda.');
    }
  },
};

module.exports = { searchService };