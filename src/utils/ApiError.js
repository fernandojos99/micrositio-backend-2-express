// src/utils/ApiError.js

class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {Object} options
   * @param {any} options.originalError - Error original (bcrypt, supabase, etc.)
   * @param {any} options.details - Información adicional
   */
  constructor(message, statusCode = 500, options = {}) {
    super(message);

    this.name = this.constructor.name;

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // 🔥 NUEVO: error original
    this.originalError = options.originalError || null;

    // 🔥 NUEVO: detalles adicionales
    this.details = options.details || null;

    // Stack limpio
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 🔥 Convierte el error en JSON (clave para Lambda)
   */
  toJSON() {
    return {
      success: false,
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      status: this.status,
      isOperational: this.isOperational,

      // 🔥 Stack completo
      stack: this.stack,

      // 🔥 Info extra
      details: this.details,

      // 🔥 Error original (seguro)
      originalError: this.originalError
        ? {
            message: this.originalError.message,
            stack: this.originalError.stack,
            name: this.originalError.name,
          }
        : null,
    };
  }
}

export default ApiError;