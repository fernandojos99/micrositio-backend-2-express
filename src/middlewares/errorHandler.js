// // src/middlewares/errorHandler.js
// /**
//  * Middleware para manejo centralizado de errores.
//  * @param {Error} err - Objeto de error.
//  * @param {Object} req - Objeto de solicitud Express.
//  * @param {Object} res - Objeto de respuesta Express.
//  * @param {Function} next - Función para pasar al siguiente middleware.
//  */
// const errorHandler = (err, req, res, next) => {
//   // Establecer valores por defecto si no están definidos
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   // Respuesta detallada en desarrollo
//   //if (process.env.NODE_ENV === 'development') {
//   if (process.env.NODE_ENV === 'production') {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//       stack: err.stack,
//       error: err
//     });
//   } else {
//     // Respuesta simplificada en producción
//     const response = {
//       status: err.status,
//       message: err.message
//     };

//     // Solo incluir el mensaje personalizado para errores operacionales
//     if (!err.isOperational) {
//       response.message = 'Algo salió mal';
//     }

//     res.status(err.statusCode).json(response);
//   }
// };

// export default errorHandler;


// src/middlewares/errorHandler.js


/**
 * Va a mostrar todo
 * @param {
 * } err 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const errorHandler = (err, req, res, next) => {
  // Defaults
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Log completo en consola (esto va a CloudWatch en AWS)
  console.error("🔥 ERROR COMPLETO:");
  console.error("MESSAGE:", err.message);
  console.error("STACK:", err.stack);
  console.error("ERROR OBJECT:", err);
  console.error("BODY:", req.body);
  console.error("HEADERS:", req.headers);
  console.error("PATH:", req.originalUrl);
  console.error("METHOD:", req.method);

  // Respuesta SIEMPRE detallada (sin importar entorno)
  res.status(statusCode).json({
    status,
    message: err.message,
    stack: err.stack,
    error: {
      name: err.name,
      message: err.message,
      code: err.code,
      detail: err.detail
    }
  });
};

export default errorHandler;