// src/services/agenteCategoriaService.js
import AgenteCategoriaRepository from '../repositories/agenteCategoriaRepository.js';
import ApiError from '../utils/ApiError.js';

class AgenteCategoriaService {
  constructor() {
    this.agenteCategoriaRepo = new AgenteCategoriaRepository();
  }

  /**
   * Obtiene una relación agente-categoría por sus IDs compuestos
   * @param {number} id_agente - ID del agente
   * @param {number} id_categoria - ID de la categoría
   * @returns {Promise<Object>} Relación encontrada
   * @throws {ApiError} Si la relación no existe
   */
  async obtenerPorId(id_agente, id_categoria) {
    const relacion = await this.agenteCategoriaRepo.obtenerPorId(id_agente, id_categoria);
    
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
    // Verificar si la relación ya existe
    const relacionExistente = await this.agenteCategoriaRepo.obtenerPorId(
      relacionData.id_agente, 
      relacionData.id_categoria
    );
    
    if (relacionExistente) {
      throw new ApiError('La relación agente-categoría ya existe', 409);
    }

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

  /**
   * Elimina todas las relaciones de un agente
   * @param {number} id_agente - ID del agente
   * @returns {Promise<Array>} Relaciones eliminadas
   */
  async eliminarPorAgente(id_agente) {
    const relaciones = await this.agenteCategoriaRepo.eliminarPorAgente(id_agente);
    return relaciones.map(relacion => relacion.toAPI());
  }

  /**
   * Elimina todas las relaciones de una categoría
   * @param {number} id_categoria - ID de la categoría
   * @returns {Promise<Array>} Relaciones eliminadas
   */
  async eliminarPorCategoria(id_categoria) {
    const relaciones = await this.agenteCategoriaRepo.eliminarPorCategoria(id_categoria);
    return relaciones.map(relacion => relacion.toAPI());
  }

  /**
   * Actualiza las categorías de un agente (reemplaza todas las existentes)
   * @param {number} id_agente - ID del agente
   * @param {Array} categorias - Array de objetos {id_categoria, es_principal}
   * @returns {Promise<Array>} Nuevas relaciones creadas
   */
  async actualizarCategoriasAgente(id_agente, categorias) {
    // Eliminar todas las relaciones existentes del agente
    await this.agenteCategoriaRepo.eliminarPorAgente(id_agente);

    // Crear las nuevas relaciones
    const relacionesCreadas = [];
    for (const categoria of categorias) {
      const relacionData = {
        id_agente,
        id_categoria: categoria.id_categoria,
        es_principal: categoria.es_principal || false
      };
      
      const relacion = await this.agenteCategoriaRepo.crear(relacionData);
      relacionesCreadas.push(relacion.toAPI());
    }

    return relacionesCreadas;
  }
}

export default AgenteCategoriaService;
