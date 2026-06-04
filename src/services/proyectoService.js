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
    console.log(`[obtenerProyecto] Buscando proyecto ID: ${id_proyecto}`);
    const proyecto = await this.proyectoRepo.obtenerPorId(id_proyecto);
    
    if (!proyecto) {
      console.warn(`[obtenerProyecto] Proyecto ${id_proyecto} no encontrado`);
      throw new ApiError('Proyecto no encontrado', 404);
    }
    
    console.log(`[obtenerProyecto] Proyecto encontrado: ID ${proyecto.id_proyecto}, título ${proyecto.titulo}`);
    return proyecto.toAPI();
  }

  /**
   * Crea un nuevo proyecto
   * @param {Object} proyectoData - Datos del proyecto
   * @returns {Promise<Object>} Proyecto creado
   * @throws {ApiError} Si la categoría o el líder no existen
   */
  async crearProyecto(proyectoData) {
    console.log('[crearProyecto] Datos recibidos:', proyectoData);
    
    // Validar que la categoría existe
    if (proyectoData.id_categoria) {
      console.log(`[crearProyecto] Validando categoría ID: ${proyectoData.id_categoria}`);
      const categoria = await this.categoriaRepo.obtenerPorId(proyectoData.id_categoria);
      if (!categoria) {
        console.warn(`[crearProyecto] Categoría ${proyectoData.id_categoria} no encontrada`);
        throw new ApiError('Categoría no encontrada', 404);
      }
    }

    // Validar que el líder existe si se proporciona
    if (proyectoData.id_lider) {
      console.log(`[crearProyecto] Validando líder ID: ${proyectoData.id_lider}`);
      const lider = await this.empleadoRepo.obtenerPorId(proyectoData.id_lider);
      if (!lider) {
        console.warn(`[crearProyecto] Líder ${proyectoData.id_lider} no encontrado`);
        throw new ApiError('Líder no encontrado', 404);
      }
    }

    console.log('[crearProyecto] Creando proyecto en repositorio');
    const proyecto = await this.proyectoRepo.crear(proyectoData);
    console.log(`[crearProyecto] Proyecto creado con ID: ${proyecto.id_proyecto}`);
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
    console.log(`[actualizarProyecto] ID: ${id_proyecto} - Datos a actualizar:`, proyectoData);
    
    if (proyectoData.id_categoria) {
      console.log(`[actualizarProyecto] Validando categoría ID: ${proyectoData.id_categoria}`);
      const categoria = await this.categoriaRepo.obtenerPorId(proyectoData.id_categoria);
      if (!categoria) {
        console.warn(`[actualizarProyecto] Categoría ${proyectoData.id_categoria} no encontrada`);
        throw new ApiError('Categoría no encontrada', 404);
      }
    }

    if (proyectoData.id_lider) {
      console.log(`[actualizarProyecto] Validando líder ID: ${proyectoData.id_lider}`);
      const lider = await this.empleadoRepo.obtenerPorId(proyectoData.id_lider);
      if (!lider) {
        console.warn(`[actualizarProyecto] Líder ${proyectoData.id_lider} no encontrado`);
        throw new ApiError('Líder no encontrado', 404);
      }
    }

    console.log(`[actualizarProyecto] Ejecutando actualización en repositorio para ID ${id_proyecto}`);
    const proyecto = await this.proyectoRepo.actualizar(id_proyecto, proyectoData);
    
    if (!proyecto) {
      console.warn(`[actualizarProyecto] Proyecto ${id_proyecto} no encontrado para actualizar`);
      throw new ApiError('Proyecto no encontrado', 404);
    }
    
    console.log(`[actualizarProyecto] Proyecto actualizado: ID ${proyecto.id_proyecto}, título ${proyecto.titulo}`);
    return proyecto.toAPI();
  }

  /**
   * Elimina un proyecto
   * @param {number} id_proyecto - ID del proyecto
   * @returns {Promise<Object>} Proyecto eliminado
   * @throws {ApiError} Si el proyecto no existe
   */
  async eliminarProyecto(id_proyecto) {
    console.log(`[eliminarProyecto] Eliminando proyecto ID: ${id_proyecto}`);
    const proyecto = await this.proyectoRepo.eliminar(id_proyecto);
    
    if (!proyecto) {
      console.warn(`[eliminarProyecto] Proyecto ${id_proyecto} no encontrado`);
      throw new ApiError('Proyecto no encontrado', 404);
    }
    
    console.log(`[eliminarProyecto] Proyecto eliminado: ID ${proyecto.id_proyecto}`);
    return proyecto.toAPI();
  }

  /**
   * Lista todos los proyectos
   * @param {Object} filtro - Información de filtrado del middleware
   * @returns {Promise<Array>} Lista de proyectos
   */
  async listarProyectos(filtro) {
    console.log('[listarProyectos] Filtro recibido:', filtro);
    
    // Si es EDITOR, puede ver todos los proyectos
    if (filtro.tipo === 'EDITOR') {
      console.log('[listarProyectos] Usuario EDITOR - listando todos los proyectos');
      const proyectos = await this.proyectoRepo.listarTodos();
      console.log(`[listarProyectos] Se encontraron ${proyectos.length} proyectos`);
      return proyectos.map(proyecto => proyecto.toAPI());
    }

    // Si es VISITANTE, solo ve los proyectos asignados
    if (filtro.tipo === 'VISITANTE') {
      if (!filtro.proyectosPermitidos || filtro.proyectosPermitidos.length === 0) {
        console.log('[listarProyectos] VISITANTE sin proyectos asignados - retornando []');
        return []; // No tiene proyectos asignados
      }

      console.log(`[listarProyectos] VISITANTE - filtrando por IDs: ${filtro.proyectosPermitidos.join(', ')}`);
      const proyectos = await this.proyectoRepo.listarPorIds(filtro.proyectosPermitidos);
      console.log(`[listarProyectos] Se encontraron ${proyectos.length} proyectos asignados`);
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
    console.log(`[obtenerProyectosPorIdUsuario] Consultando proyectos para usuario: ${id_usuario}`);
    try {
      const proyectos = await this.usuarioProyectoRepo.obtenerPorIdUsuario(id_usuario);
      console.log(`[obtenerProyectosPorIdUsuario] Encontrados ${proyectos.length} proyectos`);
      return proyectos;
    } catch (error) {
      console.error(`[obtenerProyectosPorIdUsuario] Error: ${error.message}`, error);
      throw new ApiError(`Error al obtener proyectos del usuario: ${error.message}`, error.statusCode || 500);
    }
  }
}

export default ProyectoService;