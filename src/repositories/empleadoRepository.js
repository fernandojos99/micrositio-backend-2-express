/**
 * Repositorio para interactuar con la tabla empleado.
 * @class
 */
import { consulta, uno, insertarFilas, actualizarFilas, ejecutar } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import Empleado from '../models/Empleado.js';

class EmpleadoRepository {
  /**
   * Obtiene un empleado por su ID.
   * @async
   * @param {number} id - ID del empleado.
   * @returns {Promise<Object|null>} Empleado encontrado o null si no existe.
   * @throws {ApiError} Si ocurre un error al consultar.
   */
  async obtenerPorId(id) {
    const data = await conMensaje('Error al obtener empleado',
      uno('SELECT * FROM empleado WHERE id_empleado = $1', [id]));

    return data ? Empleado.fromDatabase(data) : null;
  }



  /**
   * Crea un nuevo empleado.
   * @async
   * @param {Object} empleadoData - Datos del empleado.
   * @returns {Promise<Object>} Empleado creado.
   * @throws {ApiError} Si ocurre un error al crear.
   *
   * Se le quita el campo habilidades porque no pertenece a la tabla empleado
   * , sino a la tabla habilidades.(fallaba )
   */

  async crear(empleadoData) {
  // 🔥 quitamos habilidades
  const { habilidades, ...empleadoSinHabilidades } = empleadoData;

  const data = await conMensaje('Error al crear empleado',
    insertarFilas('empleado', empleadoSinHabilidades));

  return Empleado.fromDatabase(data[0]);
}

  /**
   * Obtiene todos los empleados.
   * @async
   * @returns {Promise<Array<Object>>} Lista de empleados.
   * @throws {ApiError} Si ocurre un error al consultar.
   */
  async listarTodos() {
    const data = await conMensaje('Error al listar empleados',
      consulta('SELECT * FROM empleado'));

    return data; // O mapea si tienes un modelo
  }

  /**
   * Empleados con lo que necesita la página Equipo, en una sola consulta:
   * habilidades, foto del usuario ligado y conteo de proyectos que lidera.
   * Sustituye a las 2 peticiones por empleado que hacía el front.
   * @async
   * @param {Array<number>|null} proyectosPermitidos - null cuenta todos los
   *   proyectos; un array (visitante) cuenta solo esos.
   * @returns {Promise<Array<Object>>} Filas de empleado más skills, image,
   *   projectsCompleted y projectsActive.
   */
  async listarResumen(proyectosPermitidos) {
    return conMensaje('Error al listar el resumen de empleados',
      consulta(`
        SELECT e.*,
          COALESCE((SELECT array_agg(h.nombre_habilidad ORDER BY h.id_habilidad)
                    FROM habilidades h WHERE h.id_empleado = e.id_empleado), '{}') AS skills,
          (SELECT u.image FROM usuarios u
           WHERE u.id_empleado = e.id_empleado ORDER BY u.id_usuario LIMIT 1) AS image,
          (SELECT count(*) FILTER (WHERE p.estado = 'COMPLETADO')::int FROM proyecto p
           WHERE p.id_lider = e.id_empleado
             AND ($1::int[] IS NULL OR p.id_proyecto = ANY($1))) AS "projectsCompleted",
          (SELECT count(*) FILTER (WHERE p.estado = 'ACTIVO')::int FROM proyecto p
           WHERE p.id_lider = e.id_empleado
             AND ($1::int[] IS NULL OR p.id_proyecto = ANY($1))) AS "projectsActive"
        FROM empleado e
      `, [proyectosPermitidos]));
  }




/**
 * Actualiza la información de un empleado y sincroniza sus habilidades
 * @param {number|string} id - El id_empleado
 * @param {Object} empleadoData - Datos del empleado incluyendo el array 'habilidades'
 */
async actualizar(id, empleadoData) {

    // 1. Extraemos 'habilidades' para que no choque con la tabla 'empleado'
    // 'datosParaTablaEmpleado' contendrá: cargo, departamento, infopersonal, etc.
    const { habilidades, ...datosParaTablaEmpleado } = empleadoData;

    try {
        // 2. Actualizar la tabla principal 'empleado'. Si solo llegan
        // habilidades, el update va vacío y devuelve [], igual que PostgREST.
        const dataEmp = await conMensaje('Error al actualizar tabla empleado',
          actualizarFilas('empleado', datosParaTablaEmpleado, 'id_empleado = $1', [id]));

        // 3. Sincronizar la tabla 'habilidades' (Borrado y Re-inserción)
        if (habilidades && Array.isArray(habilidades)) {

            // A. Eliminamos todas las habilidades actuales de este empleado
            await conMensaje('Error al limpiar habilidades previas',
              ejecutar('DELETE FROM habilidades WHERE id_empleado = $1', [id]));

            // B. Si el usuario dejó habilidades, las insertamos como nuevas filas
            if (habilidades.length > 0) {
                const habilidadesInsert = habilidades.map(nombre => ({
                    id_empleado: id,
                    nombre_habilidad: nombre,
                    nivel: 'Intermedio' // Valor por defecto según tu esquema
                }));

                await conMensaje('Error al insertar nuevas habilidades',
                  insertarFilas('habilidades', habilidadesInsert));
            }
        }

        // 4. Retornamos el empleado actualizado formateado
        return Empleado.fromDatabase(dataEmp[0]);

    } catch (error) {
        // Si no es un ApiError ya capturado, lo envolvemos
        if (!(error instanceof ApiError)) {
            throw new ApiError(`Error inesperado en repositorio: ${error.message}`, 500);
        }
        throw error;
    }
}

  /**
   * Desactiva un empleado (eliminación lógica).
   * @async
   * @param {number} id - ID del empleado a desactivar.
   * @returns {Promise<Object>} Empleado desactivado.
   * @throws {ApiError} Si ocurre un error al desactivar.
   */
  async desactivar(id) {
    const data = await conMensaje('Error al desactivar empleado',
      actualizarFilas('empleado', { activo: false, updated_at: new Date().toISOString() }, 'id_empleado = $1', [id]));

    return Empleado.fromDatabase(data[0]);
  }

  /**
   * Obtiene empleados que no están relacionados con ningún usuario.
   * @async
   * @returns {Promise<Array<Object>>} Lista de empleados sin usuario asociado.
   * @throws {ApiError} Si ocurre un error al consultar.
   */
  async obtenerEmpleadosSinUsuario() {
    // Primero obtenemos los IDs de empleados que SÍ tienen usuario
    const empleadosConUsuario = await conMensaje('Error al obtener usuarios con empleado',
      consulta('SELECT id_empleado FROM usuarios WHERE id_empleado IS NOT NULL'));

    // Extraemos solo los IDs de empleados
    const idsEmpleadosConUsuario = empleadosConUsuario.map(u => u.id_empleado);

    // Ahora obtenemos empleados activos que NO estén en esa lista
    const data = await conMensaje('Error al obtener empleados sin usuario',
      idsEmpleadosConUsuario.length > 0
        ? consulta('SELECT * FROM empleado WHERE activo = true AND id_empleado <> ALL($1)', [idsEmpleadosConUsuario])
        : consulta('SELECT * FROM empleado WHERE activo = true'));

    return data.map(empleado => Empleado.fromDatabase(empleado));
  }
}

export default EmpleadoRepository;
