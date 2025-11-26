// src/repositories/usuarioRepository.js
/**
 * Repositorio para interactuar con la tabla usuarios en Supabase.
 * @class
 */
import supabase from '../config/supabaseClient.js';
import ApiError from '../utils/ApiError.js';
import Usuario from '../models/Usuario.js';

class UsuarioRepository {
  /**
   * Obtiene un usuario por su ID.
   * @async
   * @param {string} id_usuario - UUID del usuario.
   * @returns {Promise<Usuario|null>} Usuario encontrado o null.
   * @throws {ApiError} Si ocurre un error en la consulta.
   */
  async obtenerPorId(id_usuario) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario', id_usuario)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError(`Error al obtener usuario: ${error.message}`, 500);
    }

    return data ? Usuario.fromDatabase(data) : null;
  }

  /**
   * Obtiene un usuario por su alias.
   * @async
   * @param {string} alias - Alias del usuario.
   * @returns {Promise<Usuario|null>} Usuario encontrado o null.
   * @throws {ApiError} Si ocurre un error en la consulta.
   */
  async obtenerPorAlias(alias) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('alias', alias)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError(`Error al obtener usuario por alias: ${error.message}`, 500);
    }

    return data ? Usuario.fromDatabase(data) : null;
  }

  /**
   * Obtiene usuarios por ID de empleado.
   * @async
   * @param {number} id_empleado - ID del empleado.
   * @returns {Promise<Usuario[]>} Lista de usuarios.
   * @throws {ApiError} Si ocurre un error en la consulta.
   */
  async obtenerPorIdEmpleado(id_empleado) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_empleado', id_empleado);

    if (error) {
      throw new ApiError(`Error al obtener usuarios por empleado: ${error.message}`, 500);
    }

    return data.map(usuario => Usuario.fromDatabase(usuario));
  }

  /**
   * Obtiene todos los usuarios.
   * @async
   * @param {Object} filtros - Filtros opcionales.
   * @param {boolean} filtros.activo - Filtrar por estado activo.
   * @param {string} filtros.tipo - Filtrar por tipo de usuario.
   * @returns {Promise<Usuario[]>} Lista de usuarios.
   * @throws {ApiError} Si ocurre un error en la consulta.
   */
  async obtenerTodos(filtros = {}) {
    let query = supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros si existen
    if (filtros.activo !== undefined) {
      query = query.eq('activo', filtros.activo);
    }

    if (filtros.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApiError(`Error al listar usuarios: ${error.message}`, 500);
    }

    return data.map(usuario => Usuario.fromDatabase(usuario));
  }

  /**
   * Crea un nuevo usuario.
   * @async
   * @param {Object} usuarioData - Datos del usuario.
   * @returns {Promise<Usuario>} Usuario creado.
   * @throws {ApiError} Si ocurre un error al crear.
   */
  async crear(usuarioData) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(usuarioData)
      .select()
      .single();

    if (error) {
      // Manejo específico de errores de unicidad
      if (error.code === '23505') {
        throw new ApiError('El alias ya está en uso', 400);
      }
      throw new ApiError(`Error al crear usuario: ${error.message}`, 500);
    }

    return Usuario.fromDatabase(data);
  }

  /**
   * Actualiza un usuario existente.
   * @async
   * @param {string} id_usuario - UUID del usuario.
   * @param {Object} usuarioData - Datos a actualizar.
   * @returns {Promise<Usuario|null>} Usuario actualizado o null.
   * @throws {ApiError} Si ocurre un error al actualizar.
   */
  async actualizar(id_usuario, usuarioData) {
    // Agregar updated_at
    const dataConFecha = {
      ...usuarioData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('usuarios')
      .update(dataConFecha)
      .eq('id_usuario', id_usuario)
      .select()
      .single();

    if (error) {
      // Manejo específico de errores de unicidad
      if (error.code === '23505') {
        throw new ApiError('El alias ya está en uso', 400);
      }
      throw new ApiError(`Error al actualizar usuario: ${error.message}`, 500);
    }

    return data ? Usuario.fromDatabase(data) : null;
  }

  async asignarEmpleado(id_usuario, id_empleado) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ id_empleado })
      .eq('id_usuario', id_usuario)
      .select()
      .single();

    if (error) {
      throw new ApiError(`Error al asignar empleado: ${error.message}`, 500);
    }

    return data ? Usuario.fromDatabase(data) : null;
  }

  /**
   * Cambia el estado activo de un usuario.
   * @async
   * @param {string} id_usuario - UUID del usuario.
   * @param {boolean} activo - Nuevo estado activo.
   * @returns {Promise<Usuario|null>} Usuario actualizado o null.
   * @throws {ApiError} Si ocurre un error al actualizar.
   */
  async cambiarEstadoActivo(id_usuario, activo) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        activo, 
        updated_at: new Date().toISOString() 
      })
      .eq('id_usuario', id_usuario)
      .select()
      .single();

    if (error) {
      throw new ApiError(`Error al cambiar estado del usuario: ${error.message}`, 500);
    }

    return data ? Usuario.fromDatabase(data) : null;
  }

  /**
   * Actualiza el tipo de un usuario.
   * @async
   * @param {string} id_usuario - UUID del usuario.
   * @param {string} tipo - Nuevo tipo de usuario.
   * @returns {Promise<Usuario|null>} Usuario actualizado o null.
   * @throws {ApiError} Si ocurre un error al actualizar.
   */
  async actualizarTipo(id, tipo) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        tipo
      })
      .eq('id_usuario', id)
      .select()
      .single();

    if (error) {
      throw new ApiError(`Error al cambiar tipo del usuario: ${error.message}`, 500);
    }

    return data ? Usuario.fromDatabase(data) : null;
  }

  /**
   * Elimina un usuario de forma física.
   * @async
   * @param {string} id_usuario - UUID del usuario.
   * @returns {Promise<Usuario|null>} Usuario eliminado o null.
   * @throws {ApiError} Si ocurre un error al eliminar.
   */
  async eliminar(id_usuario) {
    const { data, error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id_usuario', id_usuario)
      .select()
      .single();

    if (error) {
      throw new ApiError(`Error al eliminar usuario: ${error.message}`, 500);
    }

    return data ? Usuario.fromDatabase(data) : null;
  }

  /**
   * Verifica si un alias ya existe.
   * @async
   * @param {string} alias - Alias a verificar.
   * @param {string} excludeId - ID de usuario a excluir (para actualizaciones).
   * @returns {Promise<boolean>} True si el alias existe.
   * @throws {ApiError} Si ocurre un error en la consulta.
   */
  async existeAlias(alias, excludeId = null) {
    let query = supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('alias', alias);

    if (excludeId) {
      query = query.neq('id_usuario', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError(`Error al verificar alias: ${error.message}`, 500);
    }

    return !!data;
  }

  /**
   * Obtiene estadísticas de usuarios.
   * @async
   * @returns {Promise<Object>} Estadísticas de usuarios.
   * @throws {ApiError} Si ocurre un error en la consulta.
   */
  async obtenerEstadisticas() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('tipo, activo')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(`Error al obtener estadísticas: ${error.message}`, 500);
    }

    const stats = {
      total: data.length,
      activos: data.filter(u => u.activo).length,
      inactivos: data.filter(u => !u.activo).length,
      editores: data.filter(u => u.tipo === 'EDITOR').length,
      visitantes: data.filter(u => u.tipo === 'VISITANTE').length,
      editores_activos: data.filter(u => u.tipo === 'EDITOR' && u.activo).length,
      visitantes_activos: data.filter(u => u.tipo === 'VISITANTE' && u.activo).length
    };

    return stats;
  }
}

export default UsuarioRepository;
