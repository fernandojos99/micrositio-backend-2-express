/**
 * Repositorio para interactuar con la tabla empleado en Supabase.
 * @class
 */
import supabase from '../config/supabaseClient.js';
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
    const { data, error } = await supabase
      .from('empleado')
      .select('*')
      .eq('id_empleado', id)
      .single();

    // PGRST116 es el código de error cuando no se encuentra ningún registro
    if (error && error.code !== 'PGRST116') {
      throw new ApiError(`Error al obtener empleado: ${error.message}`, 500);
    }

    return data ? Empleado.fromDatabase(data) : null;
  }

  /**
   * Crea un nuevo empleado.
   * @async
   * @param {Object} empleadoData - Datos del empleado.
   * @returns {Promise<Object>} Empleado creado.
   * @throws {ApiError} Si ocurre un error al crear.
   */
  async crear(empleadoData) {
    const { data, error } = await supabase
      .from('empleado')
      .insert(empleadoData)
      .select();

    if (error) {
      throw new ApiError(`Error al crear empleado: ${error.message}`, 500);
    }

    return Empleado.fromDatabase(data[0]);
  }

  /**
   * Obtiene todos los empleados.
   * @async
   * @returns {Promise<Array<Object>>} Lista de empleados.
   * @throws {ApiError} Si ocurre un error al consultar.
   */
  async listarTodos() {
    const { data, error } = await supabase
      .from('empleado')
      .select('*');

    if (error) {
      throw new ApiError(`Error al listar empleados: ${error.message}`, 500);
    }

    return data; // O mapea si tienes un modelo
  }

  /**
   * Actualiza un empleado existente.
   * @async
   * @param {number} id - ID del empleado a actualizar.
   * @param {Object} empleadoData - Datos a actualizar.
   * @returns {Promise<Object>} Empleado actualizado.
   * @throws {ApiError} Si ocurre un error al actualizar.
   */
  async actualizar(id, empleadoData) {
    console.log("Datos a actualizar en repositorio", empleadoData);
    const { data, error } = await supabase
      .from('empleado')
      .update(empleadoData)
      .eq('id_empleado', id)
      .select();

    if (error) {
      throw new ApiError(`Error al actualizar empleado: ${error.message}`, 500);
    }

    return Empleado.fromDatabase(data[0]);
  }

  /**
   * Desactiva un empleado (eliminación lógica).
   * @async
   * @param {number} id - ID del empleado a desactivar.
   * @returns {Promise<Object>} Empleado desactivado.
   * @throws {ApiError} Si ocurre un error al desactivar.
   */
  async desactivar(id) {
    const { data, error } = await supabase
      .from('empleado')
      .update({ activo: false, updated_at: new Date().toISOString() })
      .eq('id_empleado', id)
      .select();

    if (error) {
      throw new ApiError(`Error al desactivar empleado: ${error.message}`, 500);
    }

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
    const { data: empleadosConUsuario, error: errorUsuarios } = await supabase
      .from('usuarios')
      .select('id_empleado')
      .not('id_empleado', 'is', null);

    if (errorUsuarios) {
      throw new ApiError(`Error al obtener usuarios con empleado: ${errorUsuarios.message}`, 500);
    }

    // Extraemos solo los IDs de empleados
    const idsEmpleadosConUsuario = empleadosConUsuario.map(u => u.id_empleado);

    // Ahora obtenemos empleados activos que NO estén en esa lista
    let query = supabase
      .from('empleado')
      .select('*')
      .eq('activo', true);

    // Si hay empleados con usuario, los excluimos
    if (idsEmpleadosConUsuario.length > 0) {
      query = query.not('id_empleado', 'in', `(${idsEmpleadosConUsuario.join(',')})`);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApiError(`Error al obtener empleados sin usuario: ${error.message}`, 500);
    }

    return data.map(empleado => Empleado.fromDatabase(empleado));
  }
}

export default EmpleadoRepository;