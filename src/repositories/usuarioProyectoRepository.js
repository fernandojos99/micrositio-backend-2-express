// src/repositories/usuarioProyectoRepository.js
/**
 * Repositorio para interactuar con la tabla usuario_proyecto.
 * @class
 */
import { consulta, insertarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import UsuarioProyecto from '../models/UsuarioProyecto.js';

// Los antiguos joins `usuarios!inner(...)` y `proyecto!inner(...)` de PostgREST
// se reproducen con subconsultas correlacionadas (el objeto anidado) más un
// EXISTS (el "inner": la fila se descarta si no hay relacionada). Así se
// recorre usuario_proyecto igual que antes y el orden de salida no cambia.
const EXISTE_USUARIO = 'EXISTS (SELECT 1 FROM usuarios u WHERE u.id_usuario = up.id_usuario)';
const EXISTE_PROYECTO = 'EXISTS (SELECT 1 FROM proyecto p WHERE p.id_proyecto = up.id_proyecto)';

class UsuarioProyectoRepository {
  /**
   * Obtiene todas las relaciones usuario-proyecto.
   * @returns {Promise<Array<UsuarioProyecto>>} Lista de relaciones.
   * @throws {ApiError} Si hay error en la consulta.
   */
  async obtenerTodos() {
    const data = await conMensaje('Error al obtener relaciones usuario-proyecto', consulta(`
      SELECT
        up.id_usuario,
        up.id_proyecto,
        (SELECT row_to_json(x) FROM (
           SELECT u.alias, u.tipo FROM usuarios u WHERE u.id_usuario = up.id_usuario
         ) x) AS usuarios,
        (SELECT row_to_json(y) FROM (
           SELECT p.titulo, p.descripcion FROM proyecto p WHERE p.id_proyecto = up.id_proyecto
         ) y) AS proyecto
      FROM usuario_proyecto up
      WHERE ${EXISTE_USUARIO} AND ${EXISTE_PROYECTO}
      ORDER BY up.id_usuario
    `));

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
    const usuarioProyectos = await conMensaje('Error al obtener relaciones usuario-proyecto',
      consulta('SELECT id_proyecto FROM usuario_proyecto WHERE id_usuario = $1', [id_usuario]));

    if (!usuarioProyectos || usuarioProyectos.length === 0) {
      return [];
    }

    // Extraemos los IDs de los proyectos
    const proyectoIds = usuarioProyectos.map(rel => rel.id_proyecto);

    // Ahora obtenemos los detalles de los proyectos
    const proyectos = await conMensaje('Error al obtener detalles de proyectos',
      consulta('SELECT id_proyecto, titulo FROM proyecto WHERE id_proyecto = ANY($1)', [proyectoIds]));

    return proyectos || [];
  }

  /**
   * Obtiene usuarios asignados a un proyecto específico.
   * @param {number} id_proyecto - ID del proyecto.
   * @returns {Promise<Array<Object>>} Lista de usuarios del proyecto.
   * @throws {ApiError} Si hay error en la consulta.
   */
  async obtenerPorIdProyecto(id_proyecto) {
    const data = await conMensaje('Error al obtener usuarios del proyecto', consulta(`
      SELECT
        up.id_usuario,
        (SELECT row_to_json(x) FROM (
           SELECT
             u.id_usuario,
             u.alias,
             u.tipo,
             u.activo,
             u.id_empleado,
             (SELECT row_to_json(e) FROM (
                SELECT em.nombre_pila, em.apellido_paterno, em.correo
                FROM empleado em
                WHERE em.id_empleado = u.id_empleado
              ) e) AS empleado
           FROM usuarios u
           WHERE u.id_usuario = up.id_usuario
         ) x) AS usuarios
      FROM usuario_proyecto up
      WHERE up.id_proyecto = $1 AND ${EXISTE_USUARIO}
    `, [id_proyecto]));

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
    let data;
    try {
      [data] = await insertarFilas('usuario_proyecto', usuarioProyectoData);
    } catch (error) {
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

    let data;
    try {
      data = await insertarFilas('usuario_proyecto', relaciones);
    } catch (error) {
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
    const data = await conMensaje('Error al verificar relación usuario-proyecto',
      consulta('SELECT id_usuario FROM usuario_proyecto WHERE id_usuario = $1 AND id_proyecto = $2 LIMIT 1',
        [id_usuario, id_proyecto]));

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
    const data = await conMensaje('Error al eliminar relación usuario-proyecto',
      consulta('DELETE FROM usuario_proyecto WHERE id_usuario = $1 AND id_proyecto = $2 RETURNING *',
        [id_usuario, id_proyecto]));

    // Era un .single(): sin exactamente una fila, PGRST116 → 404
    if (data.length !== 1) {
      throw new ApiError('Relación usuario-proyecto no encontrada', 404);
    }

    return UsuarioProyecto.fromDatabase(data[0]);
  }

  /**
   * Elimina todas las relaciones de un usuario.
   * @param {string} id_usuario - UUID del usuario.
   * @returns {Promise<Array<UsuarioProyecto>>} Relaciones eliminadas.
   * @throws {ApiError} Si hay error al eliminar.
   */
  async eliminarPorUsuario(id_usuario) {
    const data = await conMensaje('Error al eliminar relaciones del usuario',
      consulta('DELETE FROM usuario_proyecto WHERE id_usuario = $1 RETURNING *', [id_usuario]));

    return data.map(item => UsuarioProyecto.fromDatabase(item));
  }

  /**
   * Elimina todas las relaciones de un proyecto.
   * @param {number} id_proyecto - ID del proyecto.
   * @returns {Promise<Array<UsuarioProyecto>>} Relaciones eliminadas.
   * @throws {ApiError} Si hay error al eliminar.
   */
  async eliminarPorProyecto(id_proyecto) {
    const data = await conMensaje('Error al eliminar relaciones del proyecto',
      consulta('DELETE FROM usuario_proyecto WHERE id_proyecto = $1 RETURNING *', [id_proyecto]));

    return data.map(item => UsuarioProyecto.fromDatabase(item));
  }

  /**
   * Obtiene estadísticas de relaciones usuario-proyecto.
   * @returns {Promise<Object>} Estadísticas.
   * @throws {ApiError} Si hay error en la consulta.
   */
  async obtenerEstadisticas() {
    const data = await conMensaje('Error al obtener estadísticas', consulta(`
      SELECT
        up.id_usuario,
        up.id_proyecto,
        (SELECT row_to_json(x) FROM (
           SELECT u.tipo FROM usuarios u WHERE u.id_usuario = up.id_usuario
         ) x) AS usuarios
      FROM usuario_proyecto up
      WHERE ${EXISTE_USUARIO}
    `));

    const estadisticas = {
      total_relaciones: data.length,
      usuarios_unicos: [...new Set(data.map(item => item.id_usuario))].length,
      proyectos_unicos: [...new Set(data.map(item => item.id_proyecto))].length,
      por_tipo_usuario: {
        EDITOR: data.filter(item => item.usuarios.tipo === 'EDITOR').length,
        VISITANTE: data.filter(item => item.usuarios.tipo === 'VISITANTE').length,
        ADMIN: data.filter(item => item.usuarios.tipo === 'ADMIN').length
      }
    };

    return estadisticas;
  }
}

export default UsuarioProyectoRepository;
