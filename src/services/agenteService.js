// src/services/agenteService.js
import AgenteRepository from '../repositories/agenteRepository.js';
import ApiError from '../utils/ApiError.js';

class AgenteService {
  constructor() {
    this.agenteRepo = new AgenteRepository();
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
