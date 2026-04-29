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
    console.log("Empleado encontrado en repositorio", data);
    console.log("Empleado formateado", Empleado.fromDatabase(data) );
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

  const { data, error } = await supabase
    .from('empleado')
    .insert(empleadoSinHabilidades)
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
 * Actualiza la información de un empleado y sincroniza sus habilidades
 * @param {number|string} id - El id_empleado
 * @param {Object} empleadoData - Datos del empleado incluyendo el array 'habilidades'
 */
async actualizar(id, empleadoData) {
    console.log("Datos a actualizar en repositorio:", empleadoData);

    // 1. Extraemos 'habilidades' para que no choque con la tabla 'empleado'
    // 'datosParaTablaEmpleado' contendrá: cargo, departamento, infopersonal, etc.
    const { habilidades, ...datosParaTablaEmpleado } = empleadoData;

    try {
        // 2. Actualizar la tabla principal 'empleado'
        const { data: dataEmp, error: errorEmp } = await supabase
            .from('empleado')
            .update(datosParaTablaEmpleado)
            .eq('id_empleado', id)
            .select();

        if (errorEmp) {
            throw new ApiError(`Error al actualizar tabla empleado: ${errorEmp.message}`, 500);
        }

        // 3. Sincronizar la tabla 'habilidades' (Borrado y Re-inserción)
        if (habilidades && Array.isArray(habilidades)) {
            
            // A. Eliminamos todas las habilidades actuales de este empleado
            const { error: deleteError } = await supabase
                .from('habilidades')
                .delete()
                .eq('id_empleado', id);

            if (deleteError) {
                throw new ApiError(`Error al limpiar habilidades previas: ${deleteError.message}`, 500);
            }

            // B. Si el usuario dejó habilidades, las insertamos como nuevas filas
            if (habilidades.length > 0) {
                const habilidadesInsert = habilidades.map(nombre => ({
                    id_empleado: id,
                    nombre_habilidad: nombre,
                    nivel: 'Intermedio' // Valor por defecto según tu esquema
                }));

                const { error: insertError } = await supabase
                    .from('habilidades')
                    .insert(habilidadesInsert);

                if (insertError) {
                    throw new ApiError(`Error al insertar nuevas habilidades: ${insertError.message}`, 500);
                }
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