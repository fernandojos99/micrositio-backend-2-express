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
  // Un fallo de validacion es culpa del cliente, no del servidor. Los
  // controllers hacen schema.parse() dentro del try y el ZodError acababa
  // aqui sin statusCode, asi que salia como 500: un payload mal formado se
  // reportaba como error interno.
  const esErrorDeValidacion = err.name === 'ZodError' || Array.isArray(err.errors);
  const statusCode = err.statusCode || (esErrorDeValidacion ? 400 : 500);
  const status = err.status || (statusCode < 500 ? 'fail' : 'error');

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