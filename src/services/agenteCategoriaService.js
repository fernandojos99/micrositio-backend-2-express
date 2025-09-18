// src/services/agenteCategoriaService.js
import AgenteCategoriaRepository from '../repositories/agenteCategoriaRepository.js';
import ApiError from '../utils/ApiError.js';

class AgenteCategoriaService {
  constructor() {
    this.agenteCategoriaRepo = new AgenteCategoriaRepository();
  }

  /**
   * Obtiene una relación agente-categoría por su ID único
   * @param {number} id_relacion_agente_categoria - ID de la relación
   * @returns {Promise<Object>} Relación encontrada
   * @throws {ApiError} Si la relación no existe
   */
  async obtenerPorId(id_relacion_agente_categoria) {
    const relacion = await this.agenteCategoriaRepo.obtenerPorId(id_relacion_agente_categoria);
    
    if (!relacion) {
      throw new ApiError('Relación agente-categoría no encontrada', 404);
    }
    
    return relacion.toAPI();
  }

  /**
   * Lista todas las relaciones agente-categoría
   * @returns {Promise<Array>} Lista de relaciones
   */
  async listarTodos() {
    const relaciones = await this.agenteCategoriaRepo.listarTodos();
    return relaciones.map(relacion => relacion.toAPI());
  }

  /**
   * Lista las categorías de un agente específico
   * @param {number} id_agente - ID del agente
   * @returns {Promise<Array>} Lista de relaciones del agente
   */
  async listarPorAgente(id_agente) {
    const relaciones = await this.agenteCategoriaRepo.listarPorAgente(id_agente);
    return relaciones.map(relacion => relacion.toAPI());
  }

  /**
   * Lista los agentes de una categoría específica
   * @param {number} id_categoria - ID de la categoría
   * @returns {Promise<Array>} Lista de relaciones de la categoría
   */
  async listarPorCategoria(id_categoria) {
    const relaciones = await this.agenteCategoriaRepo.listarPorCategoria(id_categoria);
    return relaciones.map(relacion => relacion.toAPI());
  }

  /**
   * Crea una nueva relación agente-categoría
   * @param {Object} relacionData - Datos de la relación
   * @returns {Promise<Object>} Relación creada
   */
  async crear(relacionData) {
    const relacion = await this.agenteCategoriaRepo.crear(relacionData);
    return relacion.toAPI();
  }

  /**
   * Actualiza una relación agente-categoría existente
   * @param {number} id_agente - ID del agente
   * @param {number} id_categoria - ID de la categoría
   * @param {Object} relacionData - Datos a actualizar
   * @returns {Promise<Object>} Relación actualizada
   * @throws {ApiError} Si la relación no existe
   */
  async actualizar(id_agente, id_categoria, relacionData) {
    const relacion = await this.agenteCategoriaRepo.actualizar(id_agente, id_categoria, relacionData);
    
    if (!relacion) {
      throw new ApiError('Relación agente-categoría no encontrada', 404);
    }
    
    return relacion.toAPI();
  }

  /**
   * Elimina una relación agente-categoría
   * @param {number} id_agente - ID del agente
   * @param {number} id_categoria - ID de la categoría
   * @returns {Promise<Object>} Relación eliminada
   * @throws {ApiError} Si la relación no existe
   */
  async eliminar(id_agente, id_categoria) {
    const relacion = await this.agenteCategoriaRepo.eliminar(id_agente, id_categoria);
    
    if (!relacion) {
      throw new ApiError('Relación agente-categoría no encontrada', 404);
    }
    
    return relacion.toAPI();
  }
}

export default AgenteCategoriaService;
