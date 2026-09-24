// src/repositories/testingCardRepository.js
import { consulta, uno, ejecutar, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import TestingCard from '../models/TestingCard.js';

// Las cards que propone el plan de trabajo existen en la base pero no deben
// verse en el resto de la aplicación hasta que el ADMIN apruebe el proyecto.
// Solo la pestaña Plan de trabajo pide incluirlas.
const SIN_BORRADORES = 'es_borrador = false';
const filtro = (incluirBorradores) => (incluirBorradores ? 'TRUE' : SIN_BORRADORES);

class TestingCardRepository {
  async obtenerPorId(id_testing_card) {
    const data = await conMensaje('Error al obtener testing card',
      uno('SELECT * FROM testing_card WHERE id_testing_card = $1', [id_testing_card]));

    return data ? TestingCard.fromDatabase(data) : null;
  }

  async obtenerPorSecuencia(id_secuencia, { incluirBorradores = false } = {}) {
    const data = await conMensaje('Error al obtener testing cards por secuencia',
      consulta(`SELECT * FROM testing_card WHERE id_secuencia = $1 AND ${filtro(incluirBorradores)}`, [id_secuencia]));

    return data.map(item => TestingCard.fromDatabase(item));
  }

  async obtenerPorPadre(padre_id, { incluirBorradores = false } = {}) {
    const data = await conMensaje('Error al obtener testing cards por padre',
      consulta(`SELECT * FROM testing_card WHERE padre_id = $1 AND ${filtro(incluirBorradores)}`, [padre_id]));

    return data.map(item => TestingCard.fromDatabase(item));
  }

  async listarTodos({ incluirBorradores = false } = {}) {
    const data = await conMensaje('Error al listar testing cards',
      consulta(`SELECT * FROM testing_card WHERE ${filtro(incluirBorradores)}`));

    return data.map(item => TestingCard.fromDatabase(item));
  }

  async crear(testingCardData) {
    const data = await conMensaje('Error al crear testing card',
      insertarFilas('testing_card', testingCardData));

    return TestingCard.fromDatabase(data[0]);
  }

  async actualizar(id_testing_card, testingCardData) {
    const data = await conMensaje('Error al actualizar testing card',
      actualizarFilas('testing_card', testingCardData, 'id_testing_card = $1', [id_testing_card]));

    return data ? TestingCard.fromDatabase(data[0]) : null;
  }

  async eliminar(id_testing_card) {
    const data = await conMensaje('Error al eliminar testing card',
      consulta('DELETE FROM testing_card WHERE id_testing_card = $1 RETURNING *', [id_testing_card]));

    return data ? TestingCard.fromDatabase(data[0]) : null;
  }

  /**
   * Copia una testing card existente sin el id_secuencia y copia todas sus métricas asociadas
   * @param {number} id_testing_card_original - ID de la testing card original a copiar
   * @returns {Promise<Object>} Testing card copiada con sus métricas
   * @throws {ApiError} Si la testing card original no existe o hay error al copiar
   */
  async copiarTestingCard(id_testing_card_original) {
    // 1. Obtener la testing card original
    const testingCardOriginal = await this.obtenerPorId(id_testing_card_original);

    if (!testingCardOriginal) {
      throw new ApiError('Testing card original no encontrada', 404);
    }

    // 2. Crear una copia de la testing card excluyendo id_testing_card, id_secuencia y timestamps
    const datosParaCopia = {
      padre_id: testingCardOriginal.padre_id,
      titulo: `${testingCardOriginal.titulo} (Copia)`,
      hipotesis: testingCardOriginal.hipotesis,
      id_experimento_tipo: testingCardOriginal.id_experimento_tipo,
      descripcion: testingCardOriginal.descripcion,
      dia_inicio: testingCardOriginal.dia_inicio,
      dia_fin: testingCardOriginal.dia_fin,
      anexo_url: testingCardOriginal.anexo_url,
      id_responsable: testingCardOriginal.id_responsable,
      status: testingCardOriginal.status
      // Excluimos deliberadamente id_secuencia
    };

    // 3. Insertar la testing card copia
    const testingCardData = await conMensaje('Error al copiar testing card',
      insertarFilas('testing_card', datosParaCopia));

    const testingCardCopia = TestingCard.fromDatabase(testingCardData[0]);

    // 4. Obtener todas las métricas de la testing card original
    const metricasOriginales = await conMensaje('Error al obtener métricas originales',
      consulta('SELECT * FROM metrica_testing_card WHERE id_testing_card = $1', [id_testing_card_original]));

    // 5. Copiar todas las métricas asociadas a la nueva testing card
    if (metricasOriginales && metricasOriginales.length > 0) {
      const metricasParaCopiar = metricasOriginales.map(metrica => ({
        id_testing_card: testingCardCopia.id_testing_card,
        nombre: metrica.nombre,
        operador: metrica.operador,
        criterio: metrica.criterio
        // Excluimos id_metrica y timestamps
      }));

      let metricasCopiadas;
      try {
        metricasCopiadas = await insertarFilas('metrica_testing_card', metricasParaCopiar);
      } catch (copiarMetricasError) {
        // Si falla copiar las métricas, intentar rollback eliminando la testing
        // card. Como antes, un fallo de este borrado no se reporta.
        await ejecutar('DELETE FROM testing_card WHERE id_testing_card = $1', [testingCardCopia.id_testing_card])
          .catch(() => {});

        throw new ApiError(`Error al copiar métricas: ${copiarMetricasError.message}`, 500);
      }

      // Añadir las métricas copiadas al resultado
      testingCardCopia.metricas = metricasCopiadas;
    } else {
      testingCardCopia.metricas = [];
    }

    return testingCardCopia;
  }

  /**
   * Busca testing cards por texto, incluyendo:
   * - secuencia asociada
   * - proyecto de la secuencia
   * - responsable (empleado)
   *
   * Los objetos anidados reproducen los joins embebidos de PostgREST que había
   * antes (misma forma, mismas claves, null si no hay relación):
   *   secuencia   ← testing_card.id_secuencia   (testing_card_id_secuencia_fkey)
   *   proyecto    ← secuencia.id_proyecto        (secuencia_id_proyecto_fkey)
   *   responsable ← testing_card.id_responsable (testing_card_id_empleado_fkey)
   */
  async buscarPorTexto(q) {
    try {
      const term = q.trim();

      const data = await conMensaje('Error al buscar testing cards', consulta(`
        SELECT
          tc.id_testing_card,
          tc.id_secuencia,
          tc.titulo,
          tc.hipotesis,
          tc.descripcion,
          tc.status,
          tc.dia_inicio,
          tc.dia_fin,
          tc.created_at,
          tc.updated_at,
          (SELECT row_to_json(s) FROM (
             SELECT
               sec.id_secuencia,
               sec.nombre,
               sec.descripcion,
               sec.id_proyecto,
               sec.estado,
               (SELECT row_to_json(p) FROM (
                  SELECT pr.id_proyecto, pr.titulo
                  FROM proyecto pr
                  WHERE pr.id_proyecto = sec.id_proyecto
                ) p) AS proyecto
             FROM secuencia sec
             WHERE sec.id_secuencia = tc.id_secuencia
           ) s) AS secuencia,
          (SELECT row_to_json(r) FROM (
             SELECT e.id_empleado, e.nombre_pila, e.apellido_paterno, e.apellido_materno
             FROM empleado e
             WHERE e.id_empleado = tc.id_responsable
           ) r) AS responsable
        FROM testing_card tc
        WHERE tc.es_borrador = false
          AND (tc.titulo ILIKE $1 OR tc.hipotesis ILIKE $1 OR tc.descripcion ILIKE $1)
        ORDER BY tc.created_at DESC
      `, [`%${term}%`]));

      return data || [];
    } catch (err) {
      console.error('Error en TestingCardRepository.buscarPorTexto:', err);
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError('Error al buscar testing cards', 500);
    }
  }
}

export default TestingCardRepository;
