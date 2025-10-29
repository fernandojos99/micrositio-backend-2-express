// src/services/testingCardService.js
import TestingCardRepository from '../repositories/testingCardRepository.js';
import PlantillaTestingCardRepository from '../repositories/plantillaTestingCardRepository.js';
import MetricaTestingCardRepository from '../repositories/metricaTestingCardRepository.js';
import ApiError from '../utils/ApiError.js';

class TestingCardService {
  constructor() {
    this.testingCardRepo = new TestingCardRepository();
    this.plantillaTestingCardRepo = new PlantillaTestingCardRepository();
    this.metricaTestingCardRepo = new MetricaTestingCardRepository();
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

  /**
   * Aplica una plantilla a una testing card existente
   * Extrae los datos de la plantilla (titulo, hipotesis, id_experimento_tipo, descripcion) 
   * y copia todas las métricas asociadas a la testing card especificada
   * @param {number} id_testing_card - ID de la testing card a actualizar
   * @param {string} id_plantilla_testing_card - ID de la plantilla a aplicar (UUID)
   * @returns {Promise<Object>} Testing card actualizada en formato API con información de métricas copiadas
   * @throws {ApiError} Si la testing card o plantilla no existen
   */
  async aplicarPlantilla(id_testing_card, id_plantilla_testing_card) {
    // 1. Verificar que existe la testing card destino
    const testingCardExistente = await this.obtenerPorId(id_testing_card);
    
    // 2. Obtener la plantilla usando el repositorio directamente
    const plantilla = await this.plantillaTestingCardRepo.obtenerPorId(id_plantilla_testing_card);
    
    if (!plantilla) {
      throw new ApiError('Plantilla testing card no encontrada', 404);
    }
    
    // 3. Obtener los datos de la testing card asociada a la plantilla
    const testingCardPlantilla = await this.obtenerPorId(plantilla.id_testing_card);
    
    // 4. Extraer los campos específicos a aplicar
    const datosPlantilla = {
      titulo: testingCardPlantilla.titulo,
      hipotesis: testingCardPlantilla.hipotesis,
      id_experimento_tipo: testingCardPlantilla.id_experimento_tipo,
      descripcion: testingCardPlantilla.descripcion
    };
    
    // 5. Aplicar los datos a la testing card destino
    const testingCardActualizada = await this.actualizar(id_testing_card, datosPlantilla);
    
    // 6. Obtener las métricas de la testing card de la plantilla
    let metricasCopiadas = [];
    try {
      const metricasPlantilla = await this.metricaTestingCardRepo.obtenerPorTestingCard(plantilla.id_testing_card);
      
      // 7. Eliminar métricas existentes de la testing card destino (opcional)
      const metricasExistentes = await this.metricaTestingCardRepo.obtenerPorTestingCard(id_testing_card);
      for (const metrica of metricasExistentes) {
        await this.metricaTestingCardRepo.eliminar(metrica.id_metrica);
      }
      
      // 8. Copiar cada métrica de la plantilla a la testing card destino
      for (const metricaOriginal of metricasPlantilla) {
        const datosMetrica = {
          id_testing_card: id_testing_card, // Cambiar al ID de la testing card destino
          nombre: metricaOriginal.nombre,
          operador: metricaOriginal.operador,
          criterio: metricaOriginal.criterio
          // No copiamos el resultado, se deja null para que sea calculado después
        };
        
        const metricaCopia = await this.metricaTestingCardRepo.crear(datosMetrica);
        metricasCopiadas.push(metricaCopia);
      }
    } catch (error) {
      // Si no hay métricas o hay error, continuamos sin fallar
      console.log('No se pudieron copiar métricas o no existen métricas en la plantilla:', error.message);
    }
    
    // 9. Preparar respuesta con información adicional
    const resultado = testingCardActualizada;
    resultado.metricas_aplicadas = metricasCopiadas.length;
    if (metricasCopiadas.length > 0) {
      resultado.metricas = metricasCopiadas.map(metrica => ({
        id_metrica: metrica.id_metrica,
        nombre: metrica.nombre,
        operador: metrica.operador,
        criterio: metrica.criterio
      }));
    }
    
    return resultado;
  }
}

export default TestingCardService;