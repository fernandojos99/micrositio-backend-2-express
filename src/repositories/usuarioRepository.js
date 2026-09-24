// src/repositories/usuarioRepository.js
/**
 * Repositorio para interactuar con la tabla usuarios.
 * @class
 */
import { consulta, uno, ejecutar, exigirFila, insertarFilas, actualizarFilas } from '../config/db.js';
import { subir, urlPublica } from '../config/archivos.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import Usuario from '../models/Usuario.js';

// Un UPDATE ... RETURNING que exige exactamente una fila, como el
// `.update().select().single()` de antes: si no hay fila, error 500 con el
// prefijo del método. Los errores 23505 (alias duplicado) los trata el llamador.
const actualizarUno = (datos, id_usuario) =>
  exigirFila(actualizarFilas('usuarios', datos, 'id_usuario = $1', [id_usuario]));

class UsuarioRepository {
  /**
   * Obtiene un usuario por su ID.
   * @async
   * @param {string} id_usuario - UUID del usuario.
   * @returns {Promise<Usuario|null>} Usuario encontrado o null.
   * @throws {ApiError} Si ocurre un error en la consulta.
   */
  async obtenerPorId(id_usuario) {
    const data = await conMensaje('Error al obtener usuario',
      uno('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]));

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
    const data = await conMensaje('Error al obtener usuario por alias',
      uno('SELECT * FROM usuarios WHERE alias = $1', [alias]));

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
    const data = await conMensaje('Error al obtener usuarios por empleado',
      consulta('SELECT * FROM usuarios WHERE id_empleado = $1', [id_empleado]));

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
    const condiciones = [];
    const params = [];

    // Aplicar filtros si existen
    if (filtros.activo !== undefined) {
      params.push(filtros.activo);
      condiciones.push(`activo = $${params.length}`);
    }

    if (filtros.tipo) {
      params.push(filtros.tipo);
      condiciones.push(`tipo = $${params.length}`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const data = await conMensaje('Error al listar usuarios',
      consulta(`SELECT * FROM usuarios ${where} ORDER BY created_at DESC`, params));

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
    let data;
    try {
      data = await exigirFila(insertarFilas('usuarios', usuarioData));
    } catch (error) {
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

    let data;
    try {
      data = await actualizarUno(dataConFecha, id_usuario);
    } catch (error) {
      // Manejo específico de errores de unicidad
      if (error.code === '23505') {
        throw new ApiError('El alias ya está en uso', 400);
      }
      throw new ApiError(`Error al actualizar usuario: ${error.message}`, 500);
    }

    return data ? Usuario.fromDatabase(data) : null;
  }

  async asignarEmpleado(id_usuario, id_empleado) {
    const data = await conMensaje('Error al asignar empleado',
      actualizarUno({ id_empleado }, id_usuario));

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
    const data = await conMensaje('Error al cambiar estado del usuario',
      actualizarUno({ activo, updated_at: new Date().toISOString() }, id_usuario));

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
    const data = await conMensaje('Error al cambiar tipo del usuario',
      actualizarUno({ tipo }, id));

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
    const data = await conMensaje('Error al eliminar usuario',
      exigirFila(consulta('DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *', [id_usuario])));

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
    const data = await conMensaje('Error al verificar alias', excludeId
      ? consulta('SELECT id_usuario FROM usuarios WHERE alias = $1 AND id_usuario <> $2', [alias, excludeId])
      : consulta('SELECT id_usuario FROM usuarios WHERE alias = $1', [alias]));

    // Era un .single() con PGRST116 → "no existe": solo exactamente una fila cuenta.
    return data.length === 1;
  }

  /**
   * Obtiene estadísticas de usuarios.
   * @async
   * @returns {Promise<Object>} Estadísticas de usuarios.
   * @throws {ApiError} Si ocurre un error en la consulta.
   */
  async obtenerEstadisticas() {
    const data = await conMensaje('Error al obtener estadísticas',
      consulta('SELECT tipo, activo FROM usuarios ORDER BY created_at DESC'));

    const stats = {
      total: data.length,
      activos: data.filter(u => u.activo).length,
      inactivos: data.filter(u => !u.activo).length,
      editores: data.filter(u => u.tipo === 'EDITOR').length,
      visitantes: data.filter(u => u.tipo === 'VISITANTE').length,
      editores_activos: data.filter(u => u.tipo === 'EDITOR' && u.activo).length,
      visitantes_activos: data.filter(u => u.tipo === 'VISITANTE' && u.activo).length,
      administradores: data.filter(u => u.tipo === 'ADMIN').length
    };

    return stats;
  }

  /**
 * Actualiza la imagen (URL) de un usuario.
 * @async
 * @param {string} id_usuario - UUID del usuario.
 * @param {string} imageUrl - URL de la imagen.
 * @returns {Promise<Usuario|null>} Usuario actualizado o null.
 * @throws {ApiError} Si ocurre un error.
 */
async actualizarImagen(id_usuario, imageUrl) {
  const data = await conMensaje('Error al actualizar imagen del usuario',
    actualizarUno({ image: imageUrl, updated_at: new Date().toISOString() }, id_usuario));

  return data ? Usuario.fromDatabase(data) : null;
}




/**
 * Guarda la imagen de perfil en disco (bucket 'image', ver
 * src/config/archivos.js) y devuelve su URL pública.
 * @param {string} filename - Ruta dentro del bucket
 * @param {Buffer} buffer - Contenido
 * @param {string} mimetype - Tipo MIME (el disco no lo necesita: express.static
 *   lo deduce de la extensión al servir el archivo)
 * @returns {Promise<string>} URL pública del archivo
 */


async uploadToBucket(
  filename,
  buffer,
  mimetype
  ) {

  const BUCKET = 'image';
  try {
    // Sin sobrescribir, igual que upload() con upsert: false
    await subir(BUCKET, filename, buffer, { contentType: mimetype });
  } catch (error) {
    throw new ApiError(error.message, 500);
  }

  return urlPublica(BUCKET, filename);
}

async  updateUserImage(userId, imageUrl) {

  await conMensaje(null,
    ejecutar('UPDATE usuarios SET image = $1 WHERE id_usuario = $2', [imageUrl, userId]));
}








}

export default UsuarioRepository;
