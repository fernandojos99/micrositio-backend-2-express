// src/services/testingCardService.js
import TestingCardRepository from '../repositories/testingCardRepository.js';
import ApiError from '../utils/ApiError.js';

class TestingCardService {
  constructor() {
    this.testingCardRepo = new TestingCardRepository();
  }

  async obtenerPorId(id_testing_card) {
    const testingCard = await this.testingCardRepo.obtenerPorId(id_testing_card);
    
    if (!testingCard) {
      throw new ApiError('Testing card no encontrada', 404);
    }
    
    return testingCard.toAPI();
  }

  async obtenerPorSecuencia(id_secuencia) {
    const testingCards = await this.testingCardRepo.obtenerPorSecuencia(id_secuencia);
    
    if (testingCards.length === 0) {
      throw new ApiError('No se encontraron testing cards para esta secuencia', 404);
    }
    
    return testingCards.map(tc => tc.toAPI());
  }

  async obtenerPorPadre(padre_id) {
    const testingCards = await this.testingCardRepo.obtenerPorPadre(padre_id);
    
    if (testingCards.length === 0) {
      throw new ApiError('No se encontraron testing cards hijas para este padre', 404);
    }
    
    return testingCards.map(tc => tc.toAPI());
  }

  async listarTodos() {
    const testingCards = await this.testingCardRepo.listarTodos();
    return testingCards.map(tc => tc.toAPI());
  }

  async crear(testingCardData) {
    const testingCard = await this.testingCardRepo.crear(testingCardData);
    return testingCard.toAPI();
  }

  async actualizar(id_testing_card, testingCardData) {
    const testingCard = await this.testingCardRepo.actualizar(id_testing_card, testingCardData);
    
    if (!testingCard) {
      throw new ApiError('Testing card no encontrada', 404);
    }
    
    return testingCard.toAPI();
  }

  async eliminar(id_testing_card) {
    const testingCard = await this.testingCardRepo.eliminar(id_testing_card);
    
    if (!testingCard) {
      throw new ApiError('Testing card no encontrada', 404);
    }
    
    return testingCard.toAPI();
  }

  /**
   * Copia una testing card existente sin el id_secuencia y copia todas sus métricas asociadas
   * @param {number} id_testing_card_original - ID de la testing card original a copiar
   * @returns {Promise<Object>} Testing card copiada con sus métricas en formato API
   * @throws {ApiError} Si la testing card original no existe o hay error al copiar
   */
  async copiarTestingCard(id_testing_card_original) {
    const testingCardCopia = await this.testingCardRepo.copiarTestingCard(id_testing_card_original);
    
    // Convertir la testing card copiada al formato API
    const resultado = testingCardCopia.toAPI();
    
    // Añadir información de las métricas copiadas
    if (testingCardCopia.metricas && testingCardCopia.metricas.length > 0) {
      resultado.metricas_copiadas = testingCardCopia.metricas.length;
      resultado.metricas = testingCardCopia.metricas.map(metrica => ({
        id_metrica: metrica.id_metrica,
        nombre: metrica.nombre,
        operador: metrica.operador,
        criterio: metrica.criterio
      }));
    } else {
      resultado.metricas_copiadas = 0;
      resultado.metricas = [];
    }
    
    return resultado;
  }
}

export default TestingCardService;