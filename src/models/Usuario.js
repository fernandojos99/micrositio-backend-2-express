// src/models/Usuario.js
/**
 * Modelo de Usuario que representa la estructura y comportamiento de un usuario.
 * @class
 */
import { usuarioCreateSchema, usuarioUpdateSchema } from '../middlewares/validation/usuarioSchema.js';
import ApiError from '../utils/ApiError.js';
import bcrypt from 'bcryptjs';

class Usuario {
  /**
   * Crea una instancia del modelo Usuario.
   * @param {Object} data - Datos del usuario.
   */
  constructor(data) {
    this.id_usuario = data.id_usuario;
    this.alias = data.alias;
    this.password_hash = data.password_hash;
    this.tipo = data.tipo;
    this.id_empleado = data.id_empleado || null;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.created_at = new Date(data.created_at || Date.now());
    this.updated_at = new Date(data.updated_at || Date.now());
    this.image = data.image || null; // Campo adicional para la imagen del usuario
  }

  /**
   * Valida los datos del usuario al crear.
   * @static
   * @param {Object} data - Datos a validar.
   * @returns {Object} Datos validados.
   * @throws {ApiError} Si la validación falla.
   */
  static validateCreate(data) {
    try {
      return usuarioCreateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Valida los datos del usuario al actualizar.
   * @static
   * @param {Object} data - Datos a validar.
   * @returns {Object} Datos validados.
   * @throws {ApiError} Si la validación falla.
   */
  static validateUpdate(data) {
    try {
      return usuarioUpdateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Crea una instancia de Usuario a partir de datos de la base de datos.
   * @static
   * @param {Object} dbData - Datos de la base de datos.
   * @returns {Usuario} Instancia del modelo Usuario.
   */
  static fromDatabase(dbData) {
    return new Usuario({
      id_usuario: dbData.id_usuario,
      alias: dbData.alias,
      password_hash: dbData.password_hash,
      tipo: dbData.tipo,
      id_empleado: dbData.id_empleado,
      activo: dbData.activo,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at,
      image: dbData.image // Asegurarse de que el campo image esté presente en la base de datos
    });
  }

  /**
   * Hashea una contraseña usando bcrypt.
   * @static
   * @param {string} password - Contraseña en texto plano.
   * @returns {Promise<string>} Hash de la contraseña.
   */
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica una contraseña contra su hash.
   * @static
   * @param {string} password - Contraseña en texto plano.
   * @param {string} hash - Hash almacenado.
   * @returns {Promise<boolean>} True si la contraseña es válida.
   */
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Prepara los datos para ser insertados en la base de datos.
   * @returns {Object} Objeto con datos para la base de datos.
   */
  toDatabase() {
    return {
      alias: this.alias,
      password_hash: this.password_hash,
      tipo: this.tipo,
      id_empleado: this.id_empleado,
      activo: this.activo
    };
  }

  /**
   * Convierte el modelo a un objeto para la respuesta API (sin contraseña).
   * @returns {Object} Objeto preparado para la respuesta.
   */
  toAPI() {
    return {
      id_usuario: this.id_usuario,
      alias: this.alias,
      tipo: this.tipo,
      id_empleado: this.id_empleado,
      activo: this.activo,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
      image: this.image || null
    };
  }

  /**
   * Convierte el modelo a objeto seguro (sin datos sensibles).
   * @returns {Object} Objeto sin datos sensibles.
   */
  toSafeObject() {
    const { password_hash, ...safeData } = this;
    return {
      ...safeData,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString()
    };
  }
}

export default Usuario;
