/**
 * Lee un identificador de la petición aceptando, por este orden, el path
 * param, el body y la query string.
 *
 * Existe para poder migrar el contrato de la API sin romper a los clientes
 * que ya estaban: históricamente cada recurso mandaba el ID de una forma
 * distinta (unos por `:id`, otros en el body de un PATCH o un DELETE, y
 * `GET /proyectos/p` llegaba a leerlo del body de un GET). Las rutas nuevas
 * usan path params; las viejas siguen funcionando mientras se migran los
 * clientes.
 *
 * @param {Object} req - Request de Express
 * @param {...string} nombres - Nombres posibles del identificador, del más
 *   específico al más genérico (p. ej. 'id', 'id_proyecto')
 * @returns {string|number|undefined} El primer valor encontrado, o undefined
 */
export function leerId(req, ...nombres) {
  for (const fuente of [req.params, req.body, req.query]) {
    if (!fuente || typeof fuente !== 'object') continue;
    for (const nombre of nombres) {
      const valor = fuente[nombre];
      if (valor !== undefined && valor !== null && valor !== '') {
        return valor;
      }
    }
  }
  return undefined;
}

export default leerId;
