// services/searchService.js
const { proyectoRepository } = require('../repositories/proyectoRepository');
const { agenteRepository } = require('../repositories/agenteRepository');
const { promptRepository } = require('../repositories/promptRepository');
// 💡 nuevos repos
const { secuenciaRepository } = require('../repositories/secuenciaRepository');
const { testingCardRepository } = require('../repositories/testingCardRepository');
const { learningCardRepository } = require('../repositories/learningCardRepository');
const { documentIndexRepository } = require('../repositories/documentIndexRepository');

const searchService = {
  async search(q, scope, userContext = {}) {
    const results = {};

    try {
      const { tipo, proyectosPermitidos } = userContext;

      // helper para filtrar por proyectos si es VISITANTE
      const filtrarPorPermisos = (items) => {
        if (!items || !Array.isArray(items)) return [];
        if (tipo === 'EDITOR') return items;
        if (tipo === 'VISITANTE' && proyectosPermitidos?.length) {
          return items.filter((item) =>
            proyectosPermitidos.includes(item.id_proyecto)
          );
        }
        return []; // visitante sin proyectos
      };

      if (scope === 'proyectos' || scope === 'all') {
        const proyectos = await proyectoRepository.buscarPorTexto(q);
        results.proyectos = filtrarPorPermisos(proyectos);
      }

      if (scope === 'agentes' || scope === 'all') {
        results.agentes = await agenteRepository.buscarPorTexto(q);
      }

      if (scope === 'prompts' || scope === 'all') {
        results.prompts = await promptRepository.buscarPorTexto(q);
      }

      if (scope === 'secuencias' || scope === 'all') {
        const secuencias = await secuenciaRepository.buscarPorTexto(q);
        results.secuencias = filtrarPorPermisos(secuencias);
      }

      if (scope === 'testing_cards' || scope === 'all') {
        const tc = await testingCardRepository.buscarPorTexto(q);
        results.testing_cards = filtrarPorPermisos(tc);
      }

      if (scope === 'learning_cards' || scope === 'all') {
        const lc = await learningCardRepository.buscarPorTexto(q);
        results.learning_cards = filtrarPorPermisos(lc);
      }

      if (scope === 'documentos' || scope === 'all') {
        const docs = await documentIndexRepository.buscarPorTexto(q);
        results.documentos = filtrarPorPermisos(docs);
      }

      return results;
    } catch (error) {
      console.error('Error en searchService.search:', error);
      throw new Error('Error al realizar la búsqueda.');
    }
  },
};

module.exports = { searchService };
