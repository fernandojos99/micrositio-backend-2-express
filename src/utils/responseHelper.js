/**
 * Utilidad de respuesta unificada: { success, data, message, total }
 */

export function success(res, data, { message, total, statusCode = 200 } = {}) {
  const body = { success: true, data };
  if (message !== undefined) body.message = message;
  if (total !== undefined) body.total = total;
  return res.status(statusCode).json(body);
}

export function created(res, data, { message = 'Recurso creado exitosamente', total } = {}) {
  return success(res, data, { message, total, statusCode: 201 });
}

export function paginated(res, data, pagination) {
  const { total, page = 1, limit = 20 } = pagination;
  return res.status(200).json({
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 0,
  });
}

export function noContent(res) {
  return res.status(204).send();
}

export function fail(res, { message = 'Solicitud inválida', errors, statusCode = 400 } = {}) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}
