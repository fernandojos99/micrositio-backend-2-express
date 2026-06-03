// src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  if (err.name === 'ZodError') {
    const errors = err.issues.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(422).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      status: err.status,
      statusCode: err.statusCode,
      stack: err.stack,
      ...(err.errors ? { errors: err.errors } : {})
    });
  }

  const response = {
    success: false,
    message: err.isOperational ? err.message : 'Algo salió mal'
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  return res.status(err.statusCode).json(response);
};

export default errorHandler;
