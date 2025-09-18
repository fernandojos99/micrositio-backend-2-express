// src/services/agenteService.js
import AgenteRepository from '../repositories/agenteRepository.js';
import AgenteCategoriaRepository from '../repositories/agenteCategoriaRepository.js';
import ApiError from '../utils/ApiError.js';

class AgenteService {
  constructor() {
    this.agenteRepo = new AgenteRepository();
    this.agenteCategoriaRepo = new AgenteCategoriaRepository();
  }

  /**
   * Obtiene un agente por su ID
   * @param {number} id_agente - ID del agente
   * @returns {Promise<Object>} Agente encontrado
   * @throws {ApiError} Si el agente no existe
   */
  async obtenerPorId(id_agente) {
    const agente = await this.agenteRepo.obtenerPorId(id_agente);
    
    if (!agente) {
      throw new ApiError('Agente no encontrado', 404);
    }
    
    return agente.toAPI();
  }

  /**
   * Lista todos los agentes
   * @returns {Promise<Array>} Lista de agentes
   */
  async listarTodos() {
    const agentes = await this.agenteRepo.listarTodos();
    return agentes.map(agente => agente.toAPI());
  }

  /**
   * Lista todos los agentes de una categoría dada
   * @param {number} id_categoria - ID de la categoría
   * @returns {Promise<Array>} Lista de agentes con información completa
   */
  async listarPorCategoria(id_categoria) {
    const relaciones = await this.agenteCategoriaRepo.listarPorCategoria(id_categoria);
    
    // Extraer y devolver solo la información de los agentes
    return relaciones
      .filter(relacion => relacion.agente) // Solo incluir relaciones que tengan información del agente
      .map(relacion => ({
        ...relacion.agente,
        es_principal: relacion.es_principal // Añadir si es principal en esta categoría
      }));
  }

  /**
   * Crea un nuevo agente
   * @param {Object} agenteData - Datos del agente
   * @returns {Promise<Object>} Agente creado
   */
  async crear(agenteData) {
    const agente = await this.agenteRepo.crear(agenteData);
    return agente.toAPI();
  }

  /**
   * Actualiza un agente existente
   * @param {number} id_agente - ID del agente
   * @param {Object} agenteData - Datos a actualizar
   * @returns {Promise<Object>} Agente actualizado
   * @throws {ApiError} Si el agente no existe
   */
  async actualizar(id_agente, agenteData) {
    const agente = await this.agenteRepo.actualizar(id_agente, agenteData);
    
    if (!agente) {
      throw new ApiError('Agente no encontrado', 404);
    }
    
    return agente.toAPI();
  }

  /**
   * Elimina un agente
   * @param {number} id_agente - ID del agente
   * @returns {Promise<Object>} Agente eliminado
   * @throws {ApiError} Si el agente no existe
   */
  async eliminar(id_agente) {
    const agente = await this.agenteRepo.eliminar(id_agente);
    
    if (!agente) {
      throw new ApiError('Agente no encontrado', 404);
    }
    
    return agente.toAPI();
  }
}

export default AgenteService;
