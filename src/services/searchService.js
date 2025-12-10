// src/services/searchService.js
import ProyectoRepository from '../repositories/proyectoRepository.js';
import AgenteRepository from '../repositories/agenteRepository.js';
import PromptRepository from '../repositories/promptRepository.js';
import SecuenciaRepository from '../repositories/secuenciaRepository.js';
import TestingCardRepository from '../repositories/testingCardRepository.js';
import LearningCardRepository from '../repositories/learningCardRepository.js';
// Más adelante: índice de documentos
// import DocumentIndexRepository from '../repositories/documentIndexRepository.js';

class SearchService {
  constructor() {
    this.proyectoRepository = new ProyectoRepository();
    this.agenteRepository = new AgenteRepository();
    this.promptRepository = new PromptRepository();
    this.secuenciaRepository = new SecuenciaRepository();
    this.testingCardRepository = new TestingCardRepository();
    this.learningCardRepository = new LearningCardRepository();
    // this.documentIndexRepository = new DocumentIndexRepository();
  }

  /**
   * @param {string} q
   * @param {string} scope
   * @param {{tipo: string|null, proyectosPermitidos: number[]}} userContext
   */
  async search(q, scope = 'all', userContext = {}) {
    const results = {};
    const { tipo, proyectosPermitidos } = userContext;

    const filtrarPorPermisos = (items) => {
      if (!Array.isArray(items)) return [];
      // EDITOR (o sin tipo) ve todo
      if (tipo !== 'VISITANTE') return items;
      if (!proyectosPermitidos || proyectosPermitidos.length === 0) return [];
      return items.filter((item) => {
        const idProyecto = item.id_proyecto;
        return idProyecto && proyectosPermitidos.includes(idProyecto);
      });
    };

    try {
      // Proyectos
      if (scope === 'proyectos' || scope === 'all') {
        const proyectos = await this.proyectoRepository.buscarPorTexto(q);
        results.proyectos = filtrarPorPermisos(proyectos);
      }

      // Agentes (global)
      if (scope === 'agentes' || scope === 'all') {
        results.agentes = await this.agenteRepository.buscarPorTexto(q);
      }

      // Prompts (global)
      if (scope === 'prompts' || scope === 'all') {
        results.prompts = await this.promptRepository.buscarPorTexto(q);
      }

      // Secuencias (ligadas a proyecto)
      if (scope === 'secuencias' || scope === 'all') {
        const secuencias = await this.secuenciaRepository.buscarPorTexto(q);
        results.secuencias = filtrarPorPermisos(secuencias);
      }

      // Testing cards (ligadas a proyecto)
      if (scope === 'testing_cards' || scope === 'all') {
        const tcs = await this.testingCardRepository.buscarPorTexto(q);
        results.testing_cards = filtrarPorPermisos(tcs);
      }

      // Learning cards (ligadas a proyecto)
      if (scope === 'learning_cards' || scope === 'all') {
        const lcs = await this.learningCardRepository.buscarPorTexto(q);
        results.learning_cards = filtrarPorPermisos(lcs);
      }

      // Documentos (cuando tengas índice)
      /*
      if (scope === 'documentos' || scope === 'all') {
        const docs = await this.documentIndexRepository.buscarPorTexto(q);
        results.documentos = filtrarPorPermisos(docs);
      }
      */

      return results;
    } catch (error) {
      console.error('Error en SearchService.search:', error);
      throw new Error('Error al realizar la búsqueda.');
    }
  }
}

export default SearchService;
