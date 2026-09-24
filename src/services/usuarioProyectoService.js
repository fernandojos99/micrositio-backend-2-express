// src/services/usuarioProyectoService.js
/**
 * Servicio para manejar la lógica de negocio de usuario_proyecto.
 * @class
 */
import UsuarioProyectoRepository from '../repositories/usuarioProyectoRepository.js';
import UsuarioRepository from '../repositories/usuarioRepository.js';
import ProyectoRepository from '../repositories/proyectoRepository.js';
import ApiError from '../utils/ApiError.js';

class UsuarioProyectoService {
  constructor(
    usuarioProyectoRepository = new UsuarioProyectoRepository(),
    usuarioRepository = new UsuarioRepository(),
    proyectoRepository = new ProyectoRepository()
  ) {
    this.usuarioProyectoRepo = usuarioProyectoRepository;
    this.usuarioRepo = usuarioRepository;
    this.proyectoRepo = proyectoRepository;
  }

  /**
   * Obtiene todas las relaciones usuario-proyecto.
   * @returns {Promise<Array>} Lista de relaciones con información extendida.
   * @throws {ApiError} Si hay error en la operación.
   */
  async obtenerTodos() {
    try {
      return await this.usuarioProyectoRepo.obtenerTodos();
    } catch (error) {
      throw new ApiError(`Error al obtener relaciones usuario-proyecto: ${error.message}`, error.statusCode || 500);
    }
  }

  /**
   * Obtiene proyectos asignados a un usuario específico.
   * @param {string} id_usuario - UUID del usuario.
   * @returns {Promise<Array>} Lista de proyectos del usuario.
   * @throws {ApiError} Si el usuario no existe o hay error.
   */
  async obtenerPorIdUsuario(id_usuario) {
    // Verificar que el usuario existe
    const usuario = await this.usuarioRepo.obtenerPorId(id_usuario);
    if (!usuario) {
      throw new ApiError('Usuario no encontrado', 404);
    }

    try {
      const proyectos = await this.usuarioProyectoRepo.obtenerPorIdUsuario(id_usuario);
      
      return {
        usuario: {
          id_usuario: usuario.id_usuario,
          alias: usuario.alias,
          tipo: usuario.tipo
        },
        proyectos: proyectos,
        total_proyectos: proyectos.length
      };
    } catch (error) {
      throw new ApiError(`Error al obtener proyectos del usuario: ${error.message}`, error.statusCode || 500);
    }
  }

  /**
   * Obtiene usuarios asignados a un proyecto específico.
   * @param {number} id_proyecto - ID del proyecto.
   * @returns {Promise<Array>} Lista de usuarios del proyecto.
   * @throws {ApiError} Si el proyecto no existe o hay error.
   */
  async obtenerPorIdProyecto(id_proyecto) {
    // Verificar que el proyecto existe
    const proyecto = await this.proyectoRepo.obtenerPorId(id_proyecto);
    if (!proyecto) {
      throw new ApiError('Proyecto no encontrado', 404);
    }

    try {
      const usuarios = await this.usuarioProyectoRepo.obtenerPorIdProyecto(id_proyecto);
      
      return {
        proyecto: {
          id_proyecto: proyecto.id_proyecto,
          nombre_proyecto: proyecto.nombre_proyecto,
          descripcion: proyecto.descripcion
        },
        usuarios: usuarios,
        total_usuarios: usuarios.length
      };
    } catch (error) {
      throw new ApiError(`Error al obtener usuarios del proyecto: ${error.message}`, error.statusCode || 500);
    }
  }

  /**
   * Crea una nueva relación usuario-proyecto.
   * @param {Object} data - Datos de la relación.
   * @returns {Promise<Object>} Relación creada.
   * @throws {ApiError} Si hay error de validación o en la creación.
   */
  async crear(data) {
    const { id_usuario, id_proyecto } = data;

    // Verificar que el usuario existe y está activo
    const usuario = await this.usuarioRepo.obtenerPorId(id_usuario);
    if (!usuario) {
      throw new ApiError('Usuario no encontrado', 404);
    }
    if (!usuario.activo) {
      throw new ApiError('No se puede asignar proyecto a un usuario inactivo', 400);
    }

    // Verificar que el proyecto existe
    const proyecto = await this.proyectoRepo.obtenerPorId(id_proyecto);
    if (!proyecto) {
      throw new ApiError('Proyecto no encontrado', 404);
    }

    // Verificar que no existe la relación
    const existeRelacion = await this.usuarioProyectoRepo.existe(id_usuario, id_proyecto);
    if (existeRelacion) {
      throw new ApiError('El usuario ya está asignado a este proyecto', 409);
    }

    try {
      const nuevaRelacion = await this.usuarioProyectoRepo.crear(data);
      
      return {
        relacion: nuevaRelacion,
        usuario: {
          alias: usuario.alias,
          tipo: usuario.tipo
        },
        proyecto: {
          nombre_proyecto: proyecto.nombre_proyecto,
          descripcion: proyecto.descripcion
        }
      };
    } catch (error) {
      throw new ApiError(`Error al crear relación usuario-proyecto: ${error.message}`, error.statusCode || 500);
    }
  }

  /**
   * Asigna múltiples proyectos a un usuario.
   * @param {string} id_usuario - UUID del usuario.
   * @param {Array<number>} proyectos - Array de IDs de proyectos.
   * @returns {Promise<Object>} Resultado de la operación.
   * @throws {ApiError} Si hay error de validación o en la creación.
   */
  async asignarMultiplesProyectos(id_usuario, proyectos) {
    // Verificar que el usuario existe y está activo
    const usuario = await this.usuarioRepo.obtenerPorId(id_usuario);
    if (!usuario) {
      throw new ApiError('Usuario no encontrado', 404);
    }
    if (!usuario.activo) {
      throw new ApiError('No se puede asignar proyectos a un usuario inactivo', 400);
    }

    // Verificar que todos los proyectos existen. El resultado no se usa: lo
    // unico que importa es que lance si alguno no existe.
    await Promise.all(
      proyectos.map(async (id_proyecto) => {
        const proyecto = await this.proyectoRepo.obtenerPorId(id_proyecto);
        if (!proyecto) {
          throw new ApiError(`Proyecto con ID ${id_proyecto} no encontrado`, 404);
        }
      })
    );

    // Filtrar proyectos que ya están asignados
    const proyectosNoAsignados = [];
    for (const id_proyecto of proyectos) {
      const existe = await this.usuarioProyectoRepo.existe(id_usuario, id_proyecto);
      if (!existe) {
        proyectosNoAsignados.push(id_proyecto);
      }
    }

    if (proyectosNoAsignados.length === 0) {
      throw new ApiError('Todos los proyectos ya están asignados al usuario', 409);
    }

    try {
      const relacionesCreadas = await this.usuarioProyectoRepo.crearMultiples(id_usuario, proyectosNoAsignados);
      
      return {
        usuario: {
          alias: usuario.alias,
          tipo: usuario.tipo
        },
        proyectos_asignados: relacionesCreadas.length,
        proyectos_ya_existentes: proyectos.length - proyectosNoAsignados.length,
        relaciones: relacionesCreadas
      };
    } catch (error) {
      throw new ApiError(`Error al asignar proyectos al usuario: ${error.message}`, error.statusCode || 500);
    }
  }

  /**
   * Elimina una relación usuario-proyecto específica.
   * @param {string} id_usuario - UUID del usuario.
   * @param {number} id_proyecto - ID del proyecto.
   * @returns {Promise<Object>} Relación eliminada.
   * @throws {ApiError} Si la relación no existe o hay error.
   */
  async eliminar(id_usuario, id_proyecto) {
    // Verificar que existe la relación
    const existeRelacion = await this.usuarioProyectoRepo.existe(id_usuario, id_proyecto);
    if (!existeRelacion) {
      throw new ApiError('La relación usuario-proyecto no existe', 404);
    }

    try {
      return await this.usuarioProyectoRepo.eliminar(id_usuario, id_proyecto);
    } catch (error) {
      throw new ApiError(`Error al eliminar relación usuario-proyecto: ${error.message}`, error.statusCode || 500);
    }
  }

  /**
   * Elimina todas las relaciones de un usuario.
   * @param {string} id_usuario - UUID del usuario.
   * @returns {Promise<Object>} Resultado de la operación.
   * @throws {ApiError} Si el usuario no existe o hay error.
   */
  async eliminarPorUsuario(id_usuario) {
    // Verificar que el usuario existe
    const usuario = await this.usuarioRepo.obtenerPorId(id_usuario);
    if (!usuario) {
      throw new ApiError('Usuario no encontrado', 404);
    }

    try {
      const relacionesEliminadas = await this.usuarioProyectoRepo.eliminarPorUsuario(id_usuario);
      
      return {
        usuario: {
          alias: usuario.alias,
          tipo: usuario.tipo
        },
        proyectos_desasignados: relacionesEliminadas.length,
        relaciones_eliminadas: relacionesEliminadas
      };
    } catch (error) {
      throw new ApiError(`Error al eliminar relaciones del usuario: ${error.message}`, error.statusCode || 500);
    }
  }

  /**
   * Obtiene estadísticas de relaciones usuario-proyecto.
   * @returns {Promise<Object>} Estadísticas detalladas.
   * @throws {ApiError} Si hay error en la consulta.
   */
  async obtenerEstadisticas() {
    try {
      const estadisticas = await this.usuarioProyectoRepo.obtenerEstadisticas();
      
      return {
        ...estadisticas,
        promedio_proyectos_por_usuario: estadisticas.usuarios_unicos > 0 
          ? (estadisticas.total_relaciones / estadisticas.usuarios_unicos).toFixed(2)
          : 0,
        promedio_usuarios_por_proyecto: estadisticas.proyectos_unicos > 0
          ? (estadisticas.total_relaciones / estadisticas.proyectos_unicos).toFixed(2)
          : 0
      };
    } catch (error) {
      throw new ApiError(`Error al obtener estadísticas: ${error.message}`, error.statusCode || 500);
    }
  }
}

export default UsuarioProyectoService;
