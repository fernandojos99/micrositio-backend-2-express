// src/repositories/plantillaTestingCardRepository.js

/*
=== CONSULTAS SQL AVANZADAS PARA REFERENCIA FUTURA ===

-- Obtener plantillas con información detallada de testing card y empleado
SELECT
    ptc.id_plantilla_testing_card,
    ptc.id_testing_card,
    ptc.id_empleado,
    ptc.created_at,
    ptc.updated_at,
    tc.titulo as testing_card_titulo,
    tc.descripcion as testing_card_descripcion,
    e.nombre as empleado_nombre,
    e.email as empleado_email
FROM plantilla_testing_card ptc
LEFT JOIN testing_card tc ON ptc.id_testing_card = tc.id_testing_card
LEFT JOIN empleado e ON ptc.id_empleado = e.id_empleado
ORDER BY ptc.created_at DESC;

-- Contar plantillas por empleado
SELECT
    e.nombre,
    COUNT(ptc.id_plantilla_testing_card) as total_plantillas
FROM empleado e
LEFT JOIN plantilla_testing_card ptc ON e.id_empleado = ptc.id_empleado
GROUP BY e.id_empleado, e.nombre
ORDER BY total_plantillas DESC;

-- Buscar plantillas por texto en testing card
SELECT DISTINCT ptc.*
FROM plantilla_testing_card ptc
JOIN testing_card tc ON ptc.id_testing_card = tc.id_testing_card
WHERE tc.titulo ILIKE '%busqueda%' OR tc.descripcion ILIKE '%busqueda%';

-- Plantillas creadas en un rango de fechas
SELECT * FROM plantilla_testing_card
WHERE created_at BETWEEN $1 AND $2
ORDER BY created_at DESC;

-- Verificar restricciones de integridad referencial
SELECT
    ptc.id_plantilla_testing_card,
    CASE
        WHEN tc.id_testing_card IS NULL THEN 'Testing card no existe'
        WHEN e.id_empleado IS NULL THEN 'Empleado no existe'
        ELSE 'OK'
    END as estado
FROM plantilla_testing_card ptc
LEFT JOIN testing_card tc ON ptc.id_testing_card = tc.id_testing_card
LEFT JOIN empleado e ON ptc.id_empleado = e.id_empleado;

=== FIN CONSULTAS SQL AVANZADAS ===
*/

import { consulta, uno, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import PlantillaTestingCard from '../models/PlantillaTestingCard.js';

class PlantillaTestingCardRepository {
  /**
   * Obtiene una plantilla testing card por su ID
   * @param {string} id_plantilla_testing_card - ID de la plantilla testing card (UUID)
   * @returns {Promise<PlantillaTestingCard|null>} Plantilla testing card encontrada o null
   */
  async obtenerPorId(id_plantilla_testing_card) {
    const data = await conMensaje('Error al obtener plantilla testing card',
      uno('SELECT * FROM plantilla_testing_card WHERE id_plantilla_testing_card = $1', [id_plantilla_testing_card]));

    return data ? PlantillaTestingCard.fromDatabase(data) : null;
  }

  /**
   * Lista todas las plantillas testing card
   * @returns {Promise<Array<PlantillaTestingCard>>} Lista de plantillas testing card
   */
  async listarTodas() {
    const data = await conMensaje('Error al listar plantillas testing card',
      consulta('SELECT * FROM plantilla_testing_card ORDER BY created_at DESC'));

    return data.map(plantilla => PlantillaTestingCard.fromDatabase(plantilla));
  }

  /**
   * Lista todas las plantillas testing card por empleado
   * @param {number} id_empleado - ID del empleado
   * @returns {Promise<Array<PlantillaTestingCard>>} Lista de plantillas testing card del empleado
   */
  async listarPorEmpleado(id_empleado) {
    const data = await conMensaje('Error al listar plantillas testing card por empleado',
      consulta('SELECT * FROM plantilla_testing_card WHERE id_empleado = $1 ORDER BY created_at DESC', [id_empleado]));

    return data.map(plantilla => PlantillaTestingCard.fromDatabase(plantilla));
  }

  /**
   * Lista todas las plantillas testing card por testing card
   * @param {number} id_testing_card - ID de la testing card
   * @returns {Promise<Array<PlantillaTestingCard>>} Lista de plantillas testing card de la testing card
   */
  async listarPorTestingCard(id_testing_card) {
    const data = await conMensaje('Error al listar plantillas testing card por testing card',
      consulta('SELECT * FROM plantilla_testing_card WHERE id_testing_card = $1 ORDER BY created_at DESC', [id_testing_card]));

    return data.map(plantilla => PlantillaTestingCard.fromDatabase(plantilla));
  }

  /**
   * Crea una nueva plantilla testing card
   * @param {Object} plantillaData - Datos de la plantilla testing card
   * @returns {Promise<PlantillaTestingCard>} Plantilla testing card creada
   */
  async crear(plantillaData) {
    const data = await conMensaje('Error al crear plantilla testing card',
      insertarFilas('plantilla_testing_card', plantillaData));

    return PlantillaTestingCard.fromDatabase(data[0]);
  }

  /**
   * Actualiza una plantilla testing card existente
   * @param {string} id_plantilla_testing_card - ID de la plantilla testing card (UUID)
   * @param {Object} plantillaData - Datos a actualizar
   * @returns {Promise<PlantillaTestingCard|null>} Plantilla testing card actualizada o null
   */
  async actualizar(id_plantilla_testing_card, plantillaData) {
    const data = await conMensaje('Error al actualizar plantilla testing card',
      actualizarFilas('plantilla_testing_card', { ...plantillaData, updated_at: new Date().toISOString() },
        'id_plantilla_testing_card = $1', [id_plantilla_testing_card]));

    return data && data.length > 0 ? PlantillaTestingCard.fromDatabase(data[0]) : null;
  }

  /**
   * Elimina una plantilla testing card
   * @param {string} id_plantilla_testing_card - ID de la plantilla testing card (UUID)
   * @returns {Promise<PlantillaTestingCard|null>} Plantilla testing card eliminada o null
   */
  async eliminar(id_plantilla_testing_card) {
    const data = await conMensaje('Error al eliminar plantilla testing card',
      consulta('DELETE FROM plantilla_testing_card WHERE id_plantilla_testing_card = $1 RETURNING *', [id_plantilla_testing_card]));

    return data && data.length > 0 ? PlantillaTestingCard.fromDatabase(data[0]) : null;
  }

  /**
   * Verifica si existe una relación específica entre testing card y empleado
   * @param {number} id_testing_card - ID de la testing card
   * @param {number} id_empleado - ID del empleado
   * @returns {Promise<boolean>} True si la relación existe
   */
  async existeRelacion(id_testing_card, id_empleado) {
    const data = await conMensaje('Error al verificar relación', consulta(`
      SELECT id_plantilla_testing_card FROM plantilla_testing_card
      WHERE id_testing_card = $1 AND id_empleado = $2
      LIMIT 1
    `, [id_testing_card, id_empleado]));

    return data && data.length > 0;
  }
}

export default PlantillaTestingCardRepository;
