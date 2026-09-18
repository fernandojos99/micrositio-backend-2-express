// src/repositories/metricaTestingCardRepository.js
import { consulta, uno, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import MetricaTestingCard from '../models/MetricaTestingCard.js';

class MetricaTestingCardRepository {
  /**
   * Obtiene métricas por testing card
   * @param {number} idTestingCard - ID de la testing card
   * @returns {Promise<Array>} Lista de métricas
   * @throws {ApiError} Si hay error al consultar
   */
  async obtenerPorTestingCard(idTestingCard) {
    const data = await conMensaje('Error al obtener métricas',
      consulta('SELECT * FROM metrica_testing_card WHERE id_testing_card = $1', [idTestingCard]));

    return data.map(metrica => MetricaTestingCard.fromDatabase(metrica));
  }

  /**
   * Obtiene una métrica por su ID
   * @param {number} idMetrica - ID de la métrica
   * @returns {Promise<Object|null>} Métrica encontrada o null
   * @throws {ApiError} Si hay error al consultar
   */
  async obtenerPorId(idMetrica) {
    const data = await conMensaje('Error al obtener métrica',
      uno('SELECT * FROM metrica_testing_card WHERE id_metrica = $1', [idMetrica]));

    return data ? MetricaTestingCard.fromDatabase(data) : null;
  }

  /**
   * Obtiene todas las métricas
   * @returns {Promise<Array>} Lista de todas las métricas
   * @throws {ApiError} Si hay error al consultar
   */
  async obtenerTodas() {
    const data = await conMensaje('Error al obtener métricas',
      consulta('SELECT * FROM metrica_testing_card'));

    return data.map(metrica => MetricaTestingCard.fromDatabase(metrica));
  }

  /**
   * Crea una nueva métrica
   * @param {Object} metricaData - Datos de la métrica
   * @returns {Promise<Object>} Métrica creada
   * @throws {ApiError} Si hay error al crear
   */
  async crear(metricaData) {
    const data = await conMensaje('Error al crear métrica',
      insertarFilas('metrica_testing_card', metricaData));

    return MetricaTestingCard.fromDatabase(data[0]);
  }

  /**
   * Actualiza una métrica
   * @param {number} idMetrica - ID de la métrica
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Métrica actualizada
   * @throws {ApiError} Si hay error al actualizar
   */
  async actualizar(idMetrica, updateData) {
    const data = await conMensaje('Error al actualizar métrica',
      actualizarFilas('metrica_testing_card', updateData, 'id_metrica = $1', [idMetrica]));

    return MetricaTestingCard.fromDatabase(data[0]);
  }

  /**
   * Elimina una métrica
   * @param {number} idMetrica - ID de la métrica
   * @returns {Promise<Object>} Métrica eliminada
   * @throws {ApiError} Si hay error al eliminar
   */
  async eliminar(idMetrica) {
    const data = await conMensaje('Error al eliminar métrica',
      consulta('DELETE FROM metrica_testing_card WHERE id_metrica = $1 RETURNING *', [idMetrica]));

    if (!data || data.length === 0) {
      throw new ApiError('Métrica no encontrada', 404);
    }

    return MetricaTestingCard.fromDatabase(data[0]);
  }

  /**
   * Verifica si existe una testing card
   * @param {number} idTestingCard - ID de la testing card
   * @returns {Promise<boolean>} True si existe
   * @throws {ApiError} Si hay error al consultar
   */
  async existeTestingCard(idTestingCard) {
    const data = await conMensaje('Error al verificar testing card',
      uno('SELECT id_testing_card FROM testing_card WHERE id_testing_card = $1', [idTestingCard]));

    return !!data;
  }

  /**
   * Crea una copia de una métrica existente
   * @param {number} idMetricaOriginal - ID de la métrica original a copiar
   * @returns {Promise<Object>} Métrica copiada
   * @throws {ApiError} Si la métrica original no existe o hay error al copiar
   */
  async copiarMetrica(idMetricaOriginal) {
    // Primero obtener la métrica original
    const metricaOriginal = await this.obtenerPorId(idMetricaOriginal);

    if (!metricaOriginal) {
      throw new ApiError('Métrica original no encontrada', 404);
    }

    // Determinar la testing_card destino: preferir id 151,
    // si no existe buscar por título "ALMACEN DE PLANTILLAS METRICAS"
    let idTestingCardDestino = null;

    // Primero verificar si existe el id 151
    const existe151 = await this.existeTestingCard(151);
    if (existe151) {
      idTestingCardDestino = 151;
    } else {
      // Si no existe 151, buscar por título
      try {
        // Era un .single() con PGRST116 → null: tanto sin filas como con más de
        // una (el título no es único) se trataba como "no encontrada".
        const filasTc = await conMensaje('Error al buscar testing card por título',
          consulta('SELECT id_testing_card FROM testing_card WHERE titulo = $1', ['ALMACEN DE PLANTILLAS METRICAS']));
        const tcData = filasTc.length === 1 ? filasTc[0] : null;

        if (tcData && tcData.id_testing_card) {
          idTestingCardDestino = tcData.id_testing_card;
        } else {
          throw new ApiError('No se encontró la testing card destino (ni id 151 ni título)', 404);
        }
      } catch (err) {
        // Re-throw ApiError
        if (err instanceof ApiError) throw err;
        throw new ApiError(`Error al verificar testing card destino: ${err.message}`, 500);
      }
    }

    // Crear una copia excluyendo el ID y timestamps; asociar a la testing_card destino
    const datosParaCopia = {
      id_testing_card: idTestingCardDestino,
      nombre: metricaOriginal.nombre,
      operador: metricaOriginal.operador,
      criterio: metricaOriginal.criterio
    };

    // Insertar la copia
    const data = await conMensaje('Error al copiar métrica',
      insertarFilas('metrica_testing_card', datosParaCopia));

    return MetricaTestingCard.fromDatabase(data[0]);
  }
}

export default MetricaTestingCardRepository;
