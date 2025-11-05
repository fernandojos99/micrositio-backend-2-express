// src/repositories/usuarioProyectoRepository.js
/**
 * Repositorio para interactuar con la tabla usuario_proyecto en Supabase.
 * @class
 */
import supabase from '../config/supabaseClient.js';
import ApiError from '../utils/ApiError.js';
import UsuarioProyecto from '../models/UsuarioProyecto.js';

class UsuarioProyectoRepository {
  /**
   * Obtiene todas las relaciones usuario-proyecto.
   * @returns {Promise<Array<UsuarioProyecto>>} Lista de relaciones.
   * @throws {ApiError} Si hay error en la consulta.
   */
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('usuario_proyecto')
      .select(`
        id_usuario,
        id_proyecto,
        usuarios!inner(alias, tipo),
        proyecto!inner(titulo, descripcion)
      `)
      .order('id_usuario');

    if (error) {
      throw new ApiError(`Error al obtener relaciones usuario-proyecto: ${error.message}`, 500);
    }

    return data.map(item => ({
      ...UsuarioProyecto.fromDatabase(item),
      usuario: {
        alias: item.usuarios.alias,
        tipo: item.usuarios.tipo
      },
      proyecto: {
        titulo: item.proyecto.titulo,
        descripcion: item.proyecto.descripcion
      }
    }));
  }

  /**
   * Obtiene proyectos asignados a un usuario específico.
   * @param {string} id_usuario - UUID del usuario.
   * @returns {Promise<Array<Object>>} Lista de proyectos del usuario.
   * @throws {ApiError} Si hay error en la consulta.
   */
  async obtenerPorIdUsuario(id_usuario) {
    // Primero obtenemos los IDs de los proyectos del usuario
    const { data: usuarioProyectos, error: errorRelaciones } = await supabase
      .from('usuario_proyecto')
      .select('id_proyecto')
      .eq('id_usuario', id_usuario);

    if (errorRelaciones) {
      throw new ApiError(`Error al obtener relaciones usuario-proyecto: ${errorRelaciones.message}`, 500);
    }

    if (!usuarioProyectos || usuarioProyectos.length === 0) {
      return [];
    }

    // Extraemos los IDs de los proyectos
    const proyectoIds = usuarioProyectos.map(rel => rel.id_proyecto);

    // Ahora obtenemos los detalles de los proyectos
    const { data: proyectos, error: errorProyectos } = await supabase
      .from('proyecto')
      .select('id_proyecto, titulo')
      .in('id_proyecto', proyectoIds);

    if (errorProyectos) {
      throw new ApiError(`Error al obtener detalles de proyectos: ${errorProyectos.message}`, 500);
    }

    return proyectos || [];
  }

  /**
   * Obtiene usuarios asignados a un proyecto específico.
   * @param {number} id_proyecto - ID del proyecto.
   * @returns {Promise<Array<Object>>} Lista de usuarios del proyecto.
   * @throws {ApiError} Si hay error en la consulta.
   */
  async obtenerPorIdProyecto(id_proyecto) {
    const { data, error } = await supabase
      .from('usuario_proyecto')
      .select(`
        id_usuario,
        usuarios!inner(
          id_usuario,
          alias,
          tipo,
          activo,
          id_empleado,
          empleado(nombre_pila, apellido_paterno, correo)
        )
      `)
      .eq('id_proyecto', id_proyecto);

    if (error) {
      throw new ApiError(`Error al obtener usuarios del proyecto: ${error.message}`, 500);
    }

    return data.map(item => ({
      id_usuario: item.usuarios.id_usuario,
      alias: item.usuarios.alias,
      tipo: item.usuarios.tipo,
      activo: item.usuarios.activo,
      empleado: item.usuarios.empleado ? {
        id_empleado: item.usuarios.id_empleado,
        nombre_pila: item.usuarios.empleado.nombre_pila,
        apellido_paterno: item.usuarios.empleado.apellido_paterno,
        correo: item.usuarios.empleado.correo
      } : null
    }));
  }

  /**
   * Crea una nueva relación usuario-proyecto.
   * @param {Object} usuarioProyectoData - Datos de la relación.
   * @returns {Promise<UsuarioProyecto>} Relación creada.
   * @throws {ApiError} Si hay error al crear.
   */
  async crear(usuarioProyectoData) {
    const { data, error } = await supabase
      .from('usuario_proyecto')
      .insert(usuarioProyectoData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Violación de clave única
        throw new ApiError('La relación usuario-proyecto ya existe', 409);
      }
      if (error.code === '23503') { // Violación de clave foránea
        throw new ApiError('Usuario o proyecto no encontrado', 404);
      }
      throw new ApiError(`Error al crear relación usuario-proyecto: ${error.message}`, 500);
    }

    return UsuarioProyecto.fromDatabase(data);
  }

  /**
   * Crea múltiples relaciones para un usuario.
   * @param {string} id_usuario - UUID del usuario.
   * @param {Array<number>} proyectos - Array de IDs de proyectos.
   * @returns {Promise<Array<UsuarioProyecto>>} Relaciones creadas.
   * @throws {ApiError} Si hay error al crear.
   */
  async crearMultiples(id_usuario, proyectos) {
    const relaciones = proyectos.map(id_proyecto => ({
      id_usuario,
      id_proyecto
    }));

    const { data, error } = await supabase
      .from('usuario_proyecto')
      .insert(relaciones)
      .select();

    if (error) {
      if (error.code === '23505') {
        throw new ApiError('Una o más relaciones usuario-proyecto ya existen', 409);
      }
      if (error.code === '23503') {
        throw new ApiError('Usuario o uno de los proyectos no encontrado', 404);
      }
      throw new ApiError(`Error al crear relaciones usuario-proyecto: ${error.message}`, 500);
    }

    return data.map(item => UsuarioProyecto.fromDatabase(item));
  }

  /**
   * Verifica si existe una relación usuario-proyecto.
   * @param {string} id_usuario - UUID del usuario.
   * @param {number} id_proyecto - ID del proyecto.
   * @returns {Promise<boolean>} True si existe la relación.
   * @throws {ApiError} Si hay error en la consulta.
   */
  async existe(id_usuario, id_proyecto) {
    const { data, error } = await supabase
      .from('usuario_proyecto')
      .select('id_usuario')
      .eq('id_usuario', id_usuario)
      .eq('id_proyecto', id_proyecto)
      .limit(1);

    if (error) {
      throw new ApiError(`Error al verificar relación usuario-proyecto: ${error.message}`, 500);
    }

    return data.length > 0;
  }

  /**
   * Elimina una relación usuario-proyecto específica.
   * @param {string} id_usuario - UUID del usuario.
   * @param {number} id_proyecto - ID del proyecto.
   * @returns {Promise<UsuarioProyecto>} Relación eliminada.
   * @throws {ApiError} Si hay error al eliminar o no existe.
   */
  async eliminar(id_usuario, id_proyecto) {
    const { data, error } = await supabase
      .from('usuario_proyecto')
      .delete()
      .eq('id_usuario', id_usuario)
      .eq('id_proyecto', id_proyecto)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No se encontró el registro
        throw new ApiError('Relación usuario-proyecto no encontrada', 404);
      }
      throw new ApiError(`Error al eliminar relación usuario-proyecto: ${error.message}`, 500);
    }

    return UsuarioProyecto.fromDatabase(data);
  }

  /**
   * Elimina todas las relaciones de un usuario.
   * @param {string} id_usuario - UUID del usuario.
   * @returns {Promise<Array<UsuarioProyecto>>} Relaciones eliminadas.
   * @throws {ApiError} Si hay error al eliminar.
   */
  async eliminarPorUsuario(id_usuario) {
    const { data, error } = await supabase
      .from('usuario_proyecto')
      .delete()
      .eq('id_usuario', id_usuario)
      .select();

    if (error) {
      throw new ApiError(`Error al eliminar relaciones del usuario: ${error.message}`, 500);
    }

    return data.map(item => UsuarioProyecto.fromDatabase(item));
  }

  /**
   * Elimina todas las relaciones de un proyecto.
   * @param {number} id_proyecto - ID del proyecto.
   * @returns {Promise<Array<UsuarioProyecto>>} Relaciones eliminadas.
   * @throws {ApiError} Si hay error al eliminar.
   */
  async eliminarPorProyecto(id_proyecto) {
    const { data, error } = await supabase
      .from('usuario_proyecto')
      .delete()
      .eq('id_proyecto', id_proyecto)
      .select();

    if (error) {
      throw new ApiError(`Error al eliminar relaciones del proyecto: ${error.message}`, 500);
    }

    return data.map(item => UsuarioProyecto.fromDatabase(item));
  }

  /**
   * Obtiene estadísticas de relaciones usuario-proyecto.
   * @returns {Promise<Object>} Estadísticas.
   * @throws {ApiError} Si hay error en la consulta.
   */
  async obtenerEstadisticas() {
    const { data, error } = await supabase
      .from('usuario_proyecto')
      .select(`
        id_usuario,
        id_proyecto,
        usuarios!inner(tipo)
      `);

    if (error) {
      throw new ApiError(`Error al obtener estadísticas: ${error.message}`, 500);
    }

    const estadisticas = {
      total_relaciones: data.length,
      usuarios_unicos: [...new Set(data.map(item => item.id_usuario))].length,
      proyectos_unicos: [...new Set(data.map(item => item.id_proyecto))].length,
      por_tipo_usuario: {
        EDITOR: data.filter(item => item.usuarios.tipo === 'EDITOR').length,
        VISITANTE: data.filter(item => item.usuarios.tipo === 'VISITANTE').length
      }
    };

    return estadisticas;
  }
}

export default UsuarioProyectoRepository;
