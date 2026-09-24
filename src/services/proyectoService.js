// src/services/proyectoService.js
import ProyectoRepository from '../repositories/proyectoRepository.js';
import CategoriaRepository from '../repositories/categoriaRepository.js';
import EmpleadoRepository from '../repositories/empleadoRepository.js';
import UsuarioProyectoRepository from '../repositories/usuarioProyectoRepository.js';
import ApiError from '../utils/ApiError.js';
import Proyecto from '../models/Proyecto.js';

class ProyectoService {
  constructor() {
    this.proyectoRepo = new ProyectoRepository();
    this.categoriaRepo = new CategoriaRepository();
    this.empleadoRepo = new EmpleadoRepository();
    this.usuarioProyectoRepo = new UsuarioProyectoRepository();
  }

  /**
   * Obtiene un proyecto por su ID
   * @param {number} id_proyecto - ID del proyecto
   * @returns {Promise<Object>} Proyecto encontrado
   * @throws {ApiError} Si el proyecto no existe
   */
  async obtenerProyecto(id_proyecto) {
    const proyecto = await this.proyectoRepo.obtenerPorId(id_proyecto);
    
    if (!proyecto) {
      console.warn(`[obtenerProyecto] Proyecto ${id_proyecto} no encontrado`);
      throw new ApiError('Proyecto no encontrado', 404);
    }
    
    return proyecto.toAPI();
  }

  /**
   * Crea un nuevo proyecto
   * @param {Object} proyectoData - Datos del proyecto
   * @returns {Promise<Object>} Proyecto creado
   * @throws {ApiError} Si la categoría o el líder no existen
   */
  async crearProyecto(proyectoData) {
    
    // Validar que la categoría existe
    if (proyectoData.id_categoria) {
      const categoria = await this.categoriaRepo.obtenerPorId(proyectoData.id_categoria);
      if (!categoria) {
        console.warn(`[crearProyecto] Categoría ${proyectoData.id_categoria} no encontrada`);
        throw new ApiError('Categoría no encontrada', 404);
      }
    }

    // Validar que el líder existe si se proporciona
    if (proyectoData.id_lider) {
      const lider = await this.empleadoRepo.obtenerPorId(proyectoData.id_lider);
      if (!lider) {
        console.warn(`[crearProyecto] Líder ${proyectoData.id_lider} no encontrado`);
        throw new ApiError('Líder no encontrado', 404);
      }
    }

    const proyecto = await this.proyectoRepo.crear(proyectoData);
    return proyecto.toAPI();
  }

  /**
   * Actualiza un proyecto existente
   * @param {number} id_proyecto - ID del proyecto
   * @param {Object} proyectoData - Datos a actualizar
   * @returns {Promise<Object>} Proyecto actualizado
   * @throws {ApiError} Si el proyecto no existe
   */
  async actualizarProyecto(id_proyecto, proyectoData) {
    
    if (proyectoData.id_categoria) {
      const categoria = await this.categoriaRepo.obtenerPorId(proyectoData.id_categoria);
      if (!categoria) {
        console.warn(`[actualizarProyecto] Categoría ${proyectoData.id_categoria} no encontrada`);
        throw new ApiError('Categoría no encontrada', 404);
      }
    }

    if (proyectoData.id_lider) {
      const lider = await this.empleadoRepo.obtenerPorId(proyectoData.id_lider);
      if (!lider) {
        console.warn(`[actualizarProyecto] Líder ${proyectoData.id_lider} no encontrado`);
        throw new ApiError('Líder no encontrado', 404);
      }
    }

    const proyecto = await this.proyectoRepo.actualizar(id_proyecto, proyectoData);
    
    if (!proyecto) {
      console.warn(`[actualizarProyecto] Proyecto ${id_proyecto} no encontrado para actualizar`);
      throw new ApiError('Proyecto no encontrado', 404);
    }
    
    return proyecto.toAPI();
  }

  /**
   * Elimina un proyecto
   * @param {number} id_proyecto - ID del proyecto
   * @returns {Promise<Object>} Proyecto eliminado
   * @throws {ApiError} Si el proyecto no existe
   */
  async eliminarProyecto(id_proyecto) {
    const proyecto = await this.proyectoRepo.eliminar(id_proyecto);
    
    if (!proyecto) {
      console.warn(`[eliminarProyecto] Proyecto ${id_proyecto} no encontrado`);
      throw new ApiError('Proyecto no encontrado', 404);
    }
    
    return proyecto.toAPI();
  }

  /**
   * Lista todos los proyectos
   * @param {Object} filtro - Información de filtrado del middleware
   * @returns {Promise<Array>} Lista de proyectos
   */
  async listarProyectos(filtro) {
    
    // EDITOR y ADMIN ven todos los proyectos
    if (filtro.tipo === 'EDITOR' || filtro.tipo === 'ADMIN') {
      const proyectos = await this.proyectoRepo.listarTodos();
      return proyectos.map(proyecto => proyecto.toAPI());
    }

    // Si es VISITANTE, solo ve los proyectos asignados
    if (filtro.tipo === 'VISITANTE') {
      if (!filtro.proyectosPermitidos || filtro.proyectosPermitidos.length === 0) {
        return []; // No tiene proyectos asignados
      }

      const proyectos = await this.proyectoRepo.listarPorIds(filtro.proyectosPermitidos);
      return proyectos.map(proyecto => proyecto.toAPI());
    }

    // Para otros tipos de usuario, no se devuelven proyectos
    console.warn('[listarProyectos] Tipo de usuario no reconocido en filtro:', filtro.tipo);
    return [];
  }

  /**
   * Obtiene proyectos asignados a un usuario específico
   * @param {string} id_usuario - UUID del usuario
   * @returns {Promise<Array>} Lista de proyectos del usuario
   * @throws {ApiError} Si hay error en la operación
   */
  async obtenerProyectosPorIdUsuario(id_usuario) {
    try {
      const proyectos = await this.usuarioProyectoRepo.obtenerPorIdUsuario(id_usuario);
      return proyectos;
    } catch (error) {
      console.error(`[obtenerProyectosPorIdUsuario] Error: ${error.message}`, error);
      throw new ApiError(`Error al obtener proyectos del usuario: ${error.message}`, error.statusCode || 500);
    }
  }
}

export default ProyectoService;