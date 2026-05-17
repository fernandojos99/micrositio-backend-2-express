// src/services/usuarioService.js
/**
 * Servicio para manejar la lógica de negocio de usuarios.
 * @class
 */
import UsuarioRepository from '../repositories/usuarioRepository.js';
import EmpleadoRepository from '../repositories/empleadoRepository.js';
import ApiError from '../utils/ApiError.js';
import Usuario from '../models/Usuario.js';

class UsuarioService {
  constructor() {
    this.usuarioRepo = new UsuarioRepository();
    this.empleadoRepo = new EmpleadoRepository();
  }

  /**
   * Obtiene todos los usuarios con filtros opcionales.
   * @async
   * @param {Object} filtros - Filtros opcionales.
   * @returns {Promise<Object[]>} Lista de usuarios.
   */
  async obtenerTodos(filtros = {}) {
    const usuarios = await this.usuarioRepo.obtenerTodos(filtros);
    return usuarios.map(usuario => usuario.toAPI());
  }

  /**
   * Obtiene un usuario por su ID.
   * @async
   * @param {string} id_usuario - UUID del usuario.
   * @returns {Promise<Object>} Usuario encontrado.
   * @throws {ApiError} Si el usuario no existe.
   */
  async obtenerPorId(id_usuario) {
    const usuario = await this.usuarioRepo.obtenerPorId(id_usuario);
    
    if (!usuario) {
      throw new ApiError('Usuario no encontrado', 404);
    }
    
    return usuario.toAPI();
  }

  /**
   * Obtiene usuarios por ID de empleado.
   * @async
   * @param {number} id_empleado - ID del empleado.
   * @returns {Promise<Object[]>} Lista de usuarios.
   * @throws {ApiError} Si el empleado no existe.
   */
  async obtenerPorIdEmpleado(id_empleado) {
    // Verificar que el empleado existe
    const empleado = await this.empleadoRepo.obtenerPorId(id_empleado);
    if (!empleado) {
      throw new ApiError('Empleado no encontrado', 404);
    }

    const usuarios = await this.usuarioRepo.obtenerPorIdEmpleado(id_empleado);
    return usuarios.map(usuario => usuario.toAPI());
  }

  /**
   * Crea un nuevo usuario.
   * @async
   * @param {Object} usuarioData - Datos del usuario.
   * @returns {Promise<Object>} Usuario creado.
   * @throws {ApiError} Si hay errores de validación o el empleado no existe.
   */
  async crear(usuarioData) {
    // Validar datos
    const validatedData = Usuario.validateCreate(usuarioData);

    // Verificar que el alias no existe
    const aliasExiste = await this.usuarioRepo.existeAlias(validatedData.alias);
    if (aliasExiste) {
      throw new ApiError('El alias ya está en uso', 400);
    }

    // Si es EDITOR, verificar que el empleado existe
    if (validatedData.tipo === 'EDITOR' && validatedData.id_empleado) {
      const empleado = await this.empleadoRepo.obtenerPorId(validatedData.id_empleado);
      if (!empleado) {
        throw new ApiError('Empleado no encontrado', 404);
      }

      // Verificar que el empleado esté activo
      if (!empleado.activo) {
        throw new ApiError('El empleado debe estar activo para crear un usuario EDITOR', 400);
      }

      // Verificar que el empleado no tenga ya un usuario EDITOR activo
      const usuariosEmpleado = await this.usuarioRepo.obtenerPorIdEmpleado(validatedData.id_empleado);
      const usuarioEditorActivo = usuariosEmpleado.find(u => u.tipo === 'EDITOR' && u.activo);
      if (usuarioEditorActivo) {
        throw new ApiError('El empleado ya tiene un usuario EDITOR activo', 400);
      }
    }

    // Hashear la contraseña
    const password_hash = await Usuario.hashPassword(validatedData.password);

    // Preparar datos para la BD
    const datosUsuario = {
      alias: validatedData.alias,
      password_hash,
      tipo: validatedData.tipo,
      id_empleado: validatedData.tipo === 'EDITOR' ? validatedData.id_empleado : null,
      activo: validatedData.activo
    };

    const usuario = await this.usuarioRepo.crear(datosUsuario);
    return usuario.toAPI();
  }

  /**
   * Actualiza un usuario existente.
   * @async
   * @param {string} id_usuario - UUID del usuario.
   * @param {Object} usuarioData - Datos a actualizar.
   * @returns {Promise<Object>} Usuario actualizado.
   * @throws {ApiError} Si el usuario no existe o hay errores de validación.
   */
  async actualizar(id_usuario, usuarioData) {
    // Verificar que el usuario existe
    const usuarioExistente = await this.usuarioRepo.obtenerPorId(id_usuario);
    if (!usuarioExistente) {
      throw new ApiError('Usuario no encontrado', 404);
    }

    // Validar datos
    const validatedData = Usuario.validateUpdate(usuarioData);

    const datosActualizacion = {};

    // Verificar cambio de alias
    if (validatedData.alias && validatedData.alias !== usuarioExistente.alias) {
      const aliasExiste = await this.usuarioRepo.existeAlias(validatedData.alias, id_usuario);
      if (aliasExiste) {
        throw new ApiError('El alias ya está en uso', 400);
      }
      datosActualizacion.alias = validatedData.alias;
    }

    // Manejar cambio de contraseña
    if (validatedData.password) {
      datosActualizacion.password_hash = await Usuario.hashPassword(validatedData.password);
    }

    // Manejar cambio de tipo y empleado
    if (validatedData.tipo || validatedData.hasOwnProperty('id_empleado')) {
      const nuevoTipo = validatedData.tipo || usuarioExistente.tipo;
      const nuevoIdEmpleado = validatedData.hasOwnProperty('id_empleado') 
        ? validatedData.id_empleado 
        : usuarioExistente.id_empleado;

      // Validar relación tipo-empleado
      if (nuevoTipo === 'EDITOR' && !nuevoIdEmpleado) {
        throw new ApiError('Los usuarios EDITOR deben tener un empleado asignado', 400);
      }
      if (nuevoTipo === 'VISITANTE' && nuevoIdEmpleado) {
        throw new ApiError('Los usuarios VISITANTE no pueden tener empleado asignado', 400);
      }

      // Si se asigna un empleado, verificar que existe y está activo
      if (nuevoIdEmpleado) {
        const empleado = await this.empleadoRepo.obtenerPorId(nuevoIdEmpleado);
        if (!empleado) {
          throw new ApiError('Empleado no encontrado', 404);
        }
        if (!empleado.activo) {
          throw new ApiError('El empleado debe estar activo', 400);
        }

        // Verificar que no haya otro usuario EDITOR activo para el mismo empleado
        if (nuevoTipo === 'EDITOR') {
          const usuariosEmpleado = await this.usuarioRepo.obtenerPorIdEmpleado(nuevoIdEmpleado);
          const usuarioEditorActivo = usuariosEmpleado.find(u => 
            u.tipo === 'EDITOR' && u.activo && u.id_usuario !== id_usuario
          );
          if (usuarioEditorActivo) {
            throw new ApiError('El empleado ya tiene otro usuario EDITOR activo', 400);
          }
        }
      }

      datosActualizacion.tipo = nuevoTipo;
      datosActualizacion.id_empleado = nuevoIdEmpleado;
    }

    // Manejar cambio de estado activo
    if (validatedData.hasOwnProperty('activo')) {
      datosActualizacion.activo = validatedData.activo;
    }

    // Si no hay cambios, retornar el usuario actual
    if (Object.keys(datosActualizacion).length === 0) {
      return usuarioExistente.toAPI();
    }

    const usuario = await this.usuarioRepo.actualizar(id_usuario, datosActualizacion);
    if (!usuario) {
      throw new ApiError('Error al actualizar usuario', 500);
    }

    return usuario.toAPI();
  }

  /**
   * Da de baja a un usuario (activo = false).
   * @async
   * @param {string} id_usuario - UUID del usuario.
   * @returns {Promise<Object>} Usuario actualizado.
   * @throws {ApiError} Si el usuario no existe.
   */
  async darBaja(id_usuario) {
    const usuario = await this.usuarioRepo.obtenerPorId(id_usuario);
    if (!usuario) {
      throw new ApiError('Usuario no encontrado', 404);
    }

    if (!usuario.activo) {
      throw new ApiError('El usuario ya está inactivo', 400);
    }

    const usuarioActualizado = await this.usuarioRepo.cambiarEstadoActivo(id_usuario, false);
    return usuarioActualizado.toAPI();
  }

  /**
   * Da de alta a un usuario (activo = true).
   * @async
   * @param {string} id_usuario - UUID del usuario.
   * @returns {Promise<Object>} Usuario actualizado.
   * @throws {ApiError} Si el usuario no existe.
   */
  async darAlta(id_usuario) {
    const usuario = await this.usuarioRepo.obtenerPorId(id_usuario);
    if (!usuario) {
      throw new ApiError('Usuario no encontrado', 404);
    }

    if (usuario.activo) {
      throw new ApiError('El usuario ya está activo', 400);
    }

    // Si es EDITOR, verificar que el empleado sigue activo
    if (usuario.tipo === 'EDITOR' && usuario.id_empleado) {
      const empleado = await this.empleadoRepo.obtenerPorId(usuario.id_empleado);
      if (!empleado || !empleado.activo) {
        throw new ApiError('El empleado asociado debe estar activo para reactivar el usuario', 400);
      }

      // Verificar que no haya otro usuario EDITOR activo para el mismo empleado
      const usuariosEmpleado = await this.usuarioRepo.obtenerPorIdEmpleado(usuario.id_empleado);
      const usuarioEditorActivo = usuariosEmpleado.find(u => 
        u.tipo === 'EDITOR' && u.activo && u.id_usuario !== id_usuario
      );
      if (usuarioEditorActivo) {
        throw new ApiError('Ya existe otro usuario EDITOR activo para este empleado', 400);
      }
    }

    const usuarioActualizado = await this.usuarioRepo.cambiarEstadoActivo(id_usuario, true);
    return usuarioActualizado.toAPI();
  }

  /**
   * Elimina un usuario de forma física.
   * @async
   * @param {string} id_usuario - UUID del usuario.
   * @returns {Promise<Object>} Usuario eliminado.
   * @throws {ApiError} Si el usuario no existe.
   */
  async eliminar(id_usuario) {
    const usuario = await this.usuarioRepo.obtenerPorId(id_usuario);
    if (!usuario) {
      throw new ApiError('Usuario no encontrado', 404);
    }

    // Verificar que el usuario esté inactivo antes de eliminarlo
    /**if (usuario.activo) {
      throw new ApiError('No se puede eliminar un usuario activo. Primero debe darse de baja.', 400);
    }*/

    const usuarioEliminado = await this.usuarioRepo.eliminar(id_usuario);
    return usuarioEliminado.toAPI();
  }

  /**
   * Obtiene estadísticas de usuarios.
   * @async
   * @returns {Promise<Object>} Estadísticas de usuarios.
   */
  async obtenerEstadisticas() {
    return await this.usuarioRepo.obtenerEstadisticas();
  }

  /**
   * Cambia la contraseña de un usuario.
   * @async
   * @param {string} id_usuario - UUID del usuario.
   * @param {string} nuevaPassword - Nueva contraseña.
   * @param {string} passwordActual - Contraseña actual (para verificación).
   * @returns {Promise<Object>} Usuario actualizado.
   * @throws {ApiError} Si las validaciones fallan.
   */
  async cambiarPassword(id_usuario, nuevaPassword, passwordActual) {
    const usuario = await this.usuarioRepo.obtenerPorId(id_usuario);
    if (!usuario) {
      throw new ApiError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const passwordValida = await Usuario.verifyPassword(passwordActual, usuario.password_hash);
    if (!passwordValida) {
      throw new ApiError('La contraseña actual es incorrecta', 400);
    }

    // Validar nueva contraseña
    const validatedData = Usuario.validateUpdate({ password: nuevaPassword });

    // Hashear nueva contraseña
    const password_hash = await Usuario.hashPassword(validatedData.password);

    const usuarioActualizado = await this.usuarioRepo.actualizar(id_usuario, { password_hash });
    return usuarioActualizado.toAPI();
  }

  /**
   *  Asignar un empleado a un usuario existente.
   *  @async
   * @param {string} id_usuario 
   * @param {number} id_empleado 
   * @returns {Promise<Object>}
   */
  async asignarEmpleado(id_usuario, id_empleado) {
    // Vamos a verificar que tanto el usuario como el empleado existen
    const usuario = await this.usuarioRepo.obtenerPorId(id_usuario);
    const empleado = await this.empleadoRepo.obtenerPorId(id_empleado);

    if (!usuario || !empleado) {
      throw new ApiError('Usuario o empleado no encontrado', 404);
    }

    // Vamos a verificar si el emplado ya tiene asignado un usuario EDITOR activo
    const usuariosEmpleado = await this.usuarioRepo.obtenerPorIdEmpleado(id_empleado);
    const usuarioEditorActivo = usuariosEmpleado.find(u => u.tipo === 'EDITOR' && u.activo);
    if (usuarioEditorActivo) {
      throw new ApiError('El empleado ya tiene un usuario EDITOR activo', 400);
    }

    const resultado = await this.usuarioRepo.asignarEmpleado(id_usuario, id_empleado);
    return resultado.toAPI();
  }

  /**
   * Funcion cambiar atributo tipo 
   * @param {string} id 
   * @param {string} tipo 
   * @returns 
   */
  async actualizarTipo(id, tipo){
    // Vamos a verificar que tanto el usuario existe
    const usuario = await this.usuarioRepo.obtenerPorId(id);

    if (!usuario ) {
      throw new ApiError('Usuario no encontrado', 404);
    }
    const resultado =  await this.usuarioRepo.actualizarTipo(id, tipo);
    return resultado.toAPI();

  }

  /**
 * Actualiza la imagen de un usuario
 * @async
 * @param {string} id_usuario - UUID del usuario
 * @param {string} imageUrl - URL de la imagen
 * @returns {Promise<Object>} Usuario actualizado
 */
  async actualizarImagen(id_usuario, imageUrl) {
    // 🔹 Validar que exista el usuario
    const usuario = await this.usuarioRepo.obtenerPorId(id_usuario);
    if (!usuario) {
      throw new ApiError('Usuario no encontrado', 404);
    }

    // 🔹 Validar que venga la URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new ApiError('La URL de la imagen es requerida', 400);
    }

    // 🔹 Actualizar solo el campo image
    const usuarioActualizado = await this.usuarioRepo.actualizar(id_usuario, {
      image: imageUrl
    });

    if (!usuarioActualizado) {
      throw new ApiError('Error al actualizar la imagen del usuario', 500);
    }

    return usuarioActualizado.toAPI();
  }



  /**
   *Funcion para subir imagen a bucket y actualizar el campo image del usuario
   * @param {*} file 
   * @param {*} userId 
   * @returns 
   */

async  uploadUserImage(file, userId) {

  if (!file) {
    throw new ApiError('No se recibió imagen', 400);
  }

  const filename = `${Date.now()}-${file.originalname}`;

  // Sube informacion al bucket y obtiene la URL pública
  const publicUrl = await this.usuarioRepo.uploadToBucket(
    filename,
    file.buffer,
    file.mimetype
  );

  // Actualiza el campo image del usuario con la URL pública
  await this.usuarioRepo.updateUserImage(
    userId,
    publicUrl
  );

  return {
    url: publicUrl,
    filename
  };
}


}

export default UsuarioService;
