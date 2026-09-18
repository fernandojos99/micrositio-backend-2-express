// src/repositories/plantillaMetricaTcRepository.js

/*
=== CONSULTAS SQL AVANZADAS PARA REFERENCIA FUTURA ===

-- Obtener plantillas con información detallada de métrica y empleado
SELECT
    pmt.id_plantilla_metrica,
    pmt.id_metrica,
    pmt.id_empleado,
    pmt.created_at,
    pmt.updated_at,
    s.nombre as metrica_nombre,
    s.descripcion as metrica_descripcion,
    e.nombre_pila as empleado_nombre,
    e.correo as empleado_email
FROM plantilla_metrica_tc pmt
LEFT JOIN secuencia s ON pmt.id_metrica = s.id_secuencia
LEFT JOIN empleado e ON pmt.id_empleado = e.id_empleado
ORDER BY pmt.created_at DESC;

-- Contar plantillas por empleado
SELECT
    e.nombre_pila,
    COUNT(pmt.id_plantilla_metrica) as total_plantillas
FROM empleado e
LEFT JOIN plantilla_metrica_tc pmt ON e.id_empleado = pmt.id_empleado
GROUP BY e.id_empleado, e.nombre_pila
ORDER BY total_plantillas DESC;

-- Buscar plantillas por texto en métrica
SELECT DISTINCT pmt.*
FROM plantilla_metrica_tc pmt
JOIN secuencia s ON pmt.id_metrica = s.id_secuencia
WHERE s.nombre ILIKE '%busqueda%' OR s.descripcion ILIKE '%busqueda%';

-- Plantillas creadas en un rango de fechas
SELECT * FROM plantilla_metrica_tc
WHERE created_at BETWEEN $1 AND $2
ORDER BY created_at DESC;

-- Verificar restricciones de integridad referencial
SELECT
    pmt.id_plantilla_metrica,
    CASE
        WHEN s.id_secuencia IS NULL THEN 'Métrica no existe'
        WHEN e.id_empleado IS NULL THEN 'Empleado no existe'
        ELSE 'OK'
    END as estado
FROM plantilla_metrica_tc pmt
LEFT JOIN secuencia s ON pmt.id_metrica = s.id_secuencia
LEFT JOIN empleado e ON pmt.id_empleado = e.id_empleado;

=== FIN CONSULTAS SQL AVANZADAS ===
*/

import { consulta, uno, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import PlantillaMetricaTc from '../models/PlantillaMetricaTc.js';

class PlantillaMetricaTcRepository {
  /**
   * Obtiene una plantilla métrica tc por su ID
   * @param {string} id_plantilla_metrica - ID de la plantilla métrica tc (UUID)
   * @returns {Promise<PlantillaMetricaTc|null>} Plantilla métrica tc encontrada o null
   */
  async obtenerPorId(id_plantilla_metrica) {
    const data = await conMensaje('Error al obtener plantilla métrica tc',
      uno('SELECT * FROM plantilla_metrica_tc WHERE id_plantilla_metrica = $1', [id_plantilla_metrica]));

    return data ? PlantillaMetricaTc.fromDatabase(data) : null;
  }

  /**
   * Lista todas las plantillas métrica tc
   * @returns {Promise<Array<PlantillaMetricaTc>>} Lista de plantillas métrica tc
   */
  async listarTodas() {
    const data = await conMensaje('Error al listar plantillas métrica tc',
      consulta('SELECT * FROM plantilla_metrica_tc ORDER BY created_at DESC'));

    return data.map(plantilla => PlantillaMetricaTc.fromDatabase(plantilla));
  }

  /**
   * Lista todas las plantillas métrica tc por empleado
   * @param {number} id_empleado - ID del empleado
   * @returns {Promise<Array<PlantillaMetricaTc>>} Lista de plantillas métrica tc del empleado
   */
  async listarPorEmpleado(id_empleado) {
    const data = await conMensaje('Error al listar plantillas métrica tc por empleado',
      consulta('SELECT * FROM plantilla_metrica_tc WHERE id_empleado = $1 ORDER BY created_at DESC', [id_empleado]));

    return data.map(plantilla => PlantillaMetricaTc.fromDatabase(plantilla));
  }

  /**
   * Lista todas las plantillas métrica tc por métrica
   * @param {number} id_metrica - ID de la métrica
   * @returns {Promise<Array<PlantillaMetricaTc>>} Lista de plantillas métrica tc de la métrica
   */
  async listarPorMetrica(id_metrica) {
    const data = await conMensaje('Error al listar plantillas métrica tc por métrica',
      consulta('SELECT * FROM plantilla_metrica_tc WHERE id_metrica = $1 ORDER BY created_at DESC', [id_metrica]));

    return data.map(plantilla => PlantillaMetricaTc.fromDatabase(plantilla));
  }

  /**
   * Crea una nueva plantilla métrica tc
   * @param {Object} plantillaData - Datos de la plantilla métrica tc
   * @returns {Promise<PlantillaMetricaTc>} Plantilla métrica tc creada
   */
  async crear(plantillaData) {
    const data = await conMensaje('Error al crear plantilla métrica tc',
      insertarFilas('plantilla_metrica_tc', plantillaData));

    return PlantillaMetricaTc.fromDatabase(data[0]);
  }

  /**
   * Actualiza una plantilla métrica tc existente
   * @param {string} id_plantilla_metrica - ID de la plantilla métrica tc (UUID)
   * @param {Object} plantillaData - Datos a actualizar
   * @returns {Promise<PlantillaMetricaTc|null>} Plantilla métrica tc actualizada o null
   */
  async actualizar(id_plantilla_metrica, plantillaData) {
    const data = await conMensaje('Error al actualizar plantilla métrica tc',
      actualizarFilas('plantilla_metrica_tc', { ...plantillaData, updated_at: new Date().toISOString() },
        'id_plantilla_metrica = $1', [id_plantilla_metrica]));

    return data && data.length > 0 ? PlantillaMetricaTc.fromDatabase(data[0]) : null;
  }

  /**
   * Elimina una plantilla métrica tc
   * @param {string} id_plantilla_metrica - ID de la plantilla métrica tc (UUID)
   * @returns {Promise<PlantillaMetricaTc|null>} Plantilla métrica tc eliminada o null
   */
  async eliminar(id_plantilla_metrica) {
    const data = await conMensaje('Error al eliminar plantilla métrica tc',
      consulta('DELETE FROM plantilla_metrica_tc WHERE id_plantilla_metrica = $1 RETURNING *', [id_plantilla_metrica]));

    return data && data.length > 0 ? PlantillaMetricaTc.fromDatabase(data[0]) : null;
  }

  /**
   * Verifica si existe una relación específica entre métrica y empleado
   * @param {number} id_metrica - ID de la métrica
   * @param {number} id_empleado - ID del empleado
   * @returns {Promise<boolean>} True si la relación existe
   */
  async existeRelacion(id_metrica, id_empleado) {
    const data = await conMensaje('Error al verificar relación', consulta(`
      SELECT id_plantilla_metrica FROM plantilla_metrica_tc
      WHERE id_metrica = $1 AND id_empleado = $2
      LIMIT 1
    `, [id_metrica, id_empleado]));

    return data && data.length > 0;
  }
}

export default PlantillaMetricaTcRepository;
