// src/repositories/testingCardRepository.js
import supabase from '../config/supabaseClient.js';
import ApiError from '../utils/ApiError.js';
import TestingCard from '../models/TestingCard.js';

class TestingCardRepository {
  async obtenerPorId(id_testing_card) {
    const { data, error } = await supabase
      .from('testing_card')
      .select('*')
      .eq('id_testing_card', id_testing_card)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError(`Error al obtener testing card: ${error.message}`, 500);
    }

    return data ? TestingCard.fromDatabase(data) : null;
  }

  async obtenerPorSecuencia(id_secuencia) {
    const { data, error } = await supabase
      .from('testing_card')
      .select('*')
      .eq('id_secuencia', id_secuencia);

    if (error) {
      throw new ApiError(`Error al obtener testing cards por secuencia: ${error.message}`, 500);
    }

    return data.map(item => TestingCard.fromDatabase(item));
  }

  async obtenerPorPadre(padre_id) {
    const { data, error } = await supabase
      .from('testing_card')
      .select('*')
      .eq('padre_id', padre_id);

    if (error) {
      throw new ApiError(`Error al obtener testing cards por padre: ${error.message}`, 500);
    }

    return data.map(item => TestingCard.fromDatabase(item));
  }

  async listarTodos() {
    const { data, error } = await supabase
      .from('testing_card')
      .select('*');

    if (error) {
      throw new ApiError(`Error al listar testing cards: ${error.message}`, 500);
    }

    return data.map(item => TestingCard.fromDatabase(item));
  }

  async crear(testingCardData) {
    const { data, error } = await supabase
      .from('testing_card')
      .insert(testingCardData)
      .select();

    if (error) {
      throw new ApiError(`Error al crear testing card: ${error.message}`, 500);
    }

    return TestingCard.fromDatabase(data[0]);
  }

  async actualizar(id_testing_card, testingCardData) {
    const { data, error } = await supabase
      .from('testing_card')
      .update(testingCardData)
      .eq('id_testing_card', id_testing_card)
      .select();

    if (error) {
      throw new ApiError(`Error al actualizar testing card: ${error.message}`, 500);
    }

    return data ? TestingCard.fromDatabase(data[0]) : null;
  }

  async eliminar(id_testing_card) {
    const { data, error } = await supabase
      .from('testing_card')
      .delete()
      .eq('id_testing_card', id_testing_card)
      .select();

    if (error) {
      throw new ApiError(`Error al eliminar testing card: ${error.message}`, 500);
    }

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
    const { data: testingCardData, error: testingCardError } = await supabase
      .from('testing_card')
      .insert(datosParaCopia)
      .select();

    if (testingCardError) {
      throw new ApiError(`Error al copiar testing card: ${testingCardError.message}`, 500);
    }

    const testingCardCopia = TestingCard.fromDatabase(testingCardData[0]);

    // 4. Obtener todas las métricas de la testing card original
    const { data: metricasOriginales, error: metricasError } = await supabase
      .from('metrica_testing_card')
      .select('*')
      .eq('id_testing_card', id_testing_card_original);

    if (metricasError) {
      throw new ApiError(`Error al obtener métricas originales: ${metricasError.message}`, 500);
    }

    // 5. Copiar todas las métricas asociadas a la nueva testing card
    if (metricasOriginales && metricasOriginales.length > 0) {
      const metricasParaCopiar = metricasOriginales.map(metrica => ({
        id_testing_card: testingCardCopia.id_testing_card,
        nombre: metrica.nombre,
        operador: metrica.operador,
        criterio: metrica.criterio
        // Excluimos id_metrica y timestamps
      }));

      const { data: metricasCopiadas, error: copiarMetricasError } = await supabase
        .from('metrica_testing_card')
        .insert(metricasParaCopiar)
        .select();

      if (copiarMetricasError) {
        // Si falla copiar las métricas, intentar rollback eliminando la testing card
        await supabase
          .from('testing_card')
          .delete()
          .eq('id_testing_card', testingCardCopia.id_testing_card);
        
        throw new ApiError(`Error al copiar métricas: ${copiarMetricasError.message}`, 500);
      }

      // Añadir las métricas copiadas al resultado
      testingCardCopia.metricas = metricasCopiadas;
    } else {
      testingCardCopia.metricas = [];
    }

    return testingCardCopia;
  }
}

export default TestingCardRepository;