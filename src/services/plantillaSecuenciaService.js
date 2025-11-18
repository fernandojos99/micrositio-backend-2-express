// src/services/plantillaSecuenciaService.js
import plantillaSecuenciaRepository from '../repositories/plantillaSecuenciaRepository.js';
import SecuenciaRepository from '../repositories/secuenciaRepository.js';
import TestingCardRepository from '../repositories/testingCardRepository.js';
import MetricaTestingCardRepository from '../repositories/metricaTestingCardRepository.js';
import NodePositionRepository from '../repositories/nodePositionRepository.js';
import EmpleadoRepository from '../repositories/empleadoRepository.js';
import PlantillaSecuencia from '../models/PlantillaSecuencia.js';
import ApiError from '../utils/ApiError.js';

class PlantillaSecuenciaService {
  constructor() {
    this.secuenciaRepo = new SecuenciaRepository();
    this.testingCardRepo = new TestingCardRepository();
    this.metricaRepo = new MetricaTestingCardRepository();
    this.nodePositionRepo = new NodePositionRepository();
    this.empleadoRepo = new EmpleadoRepository();
  }

  /**
   * Obtiene una plantilla secuencia por su ID
   * @param {string} id - UUID de la plantilla secuencia
   * @returns {Promise<Object>} Plantilla secuencia en formato API
   * @throws {ApiError} Si la plantilla secuencia no existe
   */
  async obtenerPorId(id) {
    const plantillaSecuencia = await plantillaSecuenciaRepository.obtenerPorId(id);
    
    if (!plantillaSecuencia) {
      throw new ApiError('Plantilla secuencia no encontrada', 404);
    }

    return plantillaSecuencia.toAPI();
  }

  /**
   * Obtiene todas las plantillas secuencia
   * @returns {Promise<Object[]>} Array de plantillas secuencia en formato API
   */
  async obtenerTodas() {
    const plantillasSecuencia = await plantillaSecuenciaRepository.listarTodas();
    return plantillasSecuencia.map(plantillaSecuencia => plantillaSecuencia.toAPI());
  }

  /**
   * Crea una nueva plantilla secuencia
   * Para crear una plantillaSecuencia:
   * 1. Verifica que exista el id_empleado y el id_secuencia de la secuencia (A)
   * 2. Crea una copia del objeto secuencia (B) en la tabla secuencia
   * 3. Copia las testing cards asociadas a la secuencia A (Atc_i) con id_secuencia = id_secuencia de B
   * 4. Copia los node_positions (donde node_type = testing) asociados a secuencia A
   * 5. Copia las métricas (Amtci_i) asociadas a las testing cards Atc_i y las asocia a las Btc_i
   * @param {Object} datosPlantillaSecuencia - Datos de la plantilla secuencia
   * @param {number} datosPlantillaSecuencia.id_secuencia - ID de la secuencia original a copiar
   * @param {number} datosPlantillaSecuencia.id_empleado - ID del empleado
   * @returns {Promise<Object>} Plantilla secuencia creada en formato API
   * @throws {ApiError} Si los datos no son válidos o hay error en la creación
   */
  async crear(datosPlantillaSecuencia) {
    // console.log('Datos recibidos en crear:', datosPlantillaSecuencia); // Debug
    const { id_secuencia, id_empleado } = datosPlantillaSecuencia;
    // console.log('ID secuencia:', id_secuencia, 'tipo:', typeof id_secuencia); // Debug
    // console.log('ID empleado:', id_empleado, 'tipo:', typeof id_empleado); // Debug

    // 1. Verificar que existe el empleado
    try {
      const empleado = await this.empleadoRepo.obtenerPorId(id_empleado);
      if (!empleado) {
        throw new ApiError('El empleado no existe', 404);
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Error al verificar empleado', 500);
    }

    // 2. Verificar que existe la secuencia original (A)
    const secuenciaOriginal = await this.secuenciaRepo.obtenerPorId(id_secuencia);
    if (!secuenciaOriginal) {
      throw new ApiError('La secuencia original no existe', 404);
    }

    // 3. Crear una copia de la secuencia (B)
    const datosSecuenciaCopia = {
      id_proyecto: secuenciaOriginal.id_proyecto,
      id_testing_card_padre: secuenciaOriginal.id_testing_card_padre,
      nombre: `${secuenciaOriginal.nombre} (Copia)`,
      dia_inicio: secuenciaOriginal.dia_inicio,
      dia_fin: secuenciaOriginal.dia_fin,
      descripcion: secuenciaOriginal.descripcion,
      estado: secuenciaOriginal.estado
    };

    const secuenciaCopia = await this.secuenciaRepo.crear(datosSecuenciaCopia);
    // console.log('Secuencia copia creada:', secuenciaCopia); // Debug

    // El método toAPI() de Secuencia devuelve 'id' en lugar de 'id_secuencia'
    const idSecuenciaCopia = secuenciaCopia.id || secuenciaCopia.id_secuencia;
    
    // Verificar que se creó correctamente
    if (!idSecuenciaCopia) {
      throw new ApiError('Error al crear la secuencia copia: ID no válido', 500);
    }

    // 4. Obtener todas las testing cards asociadas a la secuencia A (Atc_i)
    const testingCardsOriginales = await this.testingCardRepo.obtenerPorSecuencia(id_secuencia);

    // 5. Copiar cada testing card (Atc_i) y asociarla a la secuencia copia (B)
    const testingCardsCopiadas = [];
    const mapeoIdOriginalACopia = new Map(); // Para mapear IDs originales a copiados

    for (const testingCardOriginal of testingCardsOriginales) {
      const datosTestingCardCopia = {
        id_secuencia: idSecuenciaCopia, // Usar el ID correcto de la secuencia copia (B)
        padre_id: testingCardOriginal.padre_id,
        titulo: testingCardOriginal.titulo,
        hipotesis: testingCardOriginal.hipotesis,
        id_experimento_tipo: testingCardOriginal.id_experimento_tipo,
        descripcion: testingCardOriginal.descripcion,
        dia_inicio: testingCardOriginal.dia_inicio,
        dia_fin: testingCardOriginal.dia_fin,
        anexo_url: testingCardOriginal.anexo_url,
        id_responsable: testingCardOriginal.id_responsable,
        status: testingCardOriginal.status
      };

      const testingCardCopia = await this.testingCardRepo.crear(datosTestingCardCopia);
      testingCardsCopiadas.push(testingCardCopia);
      
      // Guardar mapeo para usar en métricas
      mapeoIdOriginalACopia.set(testingCardOriginal.id_testing_card, testingCardCopia.id_testing_card);
    }

    // 6. Copiar node_positions donde node_type = 'testing' y node_id coincide con testing cards de A
    const nodePositionsOriginales = await this.nodePositionRepo.obtenerPorSecuencia(id_secuencia);
    const nodePositionsCopiados = [];

    // console.log('Node positions originales:', nodePositionsOriginales); // Debug
    // console.log('Mapeo ID original a copia:', Array.from(mapeoIdOriginalACopia.entries())); // Debug

    for (const nodePos of nodePositionsOriginales) {
      if (nodePos.node_type === 'testing' && mapeoIdOriginalACopia.has(nodePos.node_id)) {
        const idTestingCardCopia = mapeoIdOriginalACopia.get(nodePos.node_id);
        
        const datosNodePosCopia = {
          id_secuencia: idSecuenciaCopia, // Usar el ID correcto de la secuencia copia (B)
          node_type: nodePos.node_type,
          node_id: idTestingCardCopia, // Usar ID de testing card copiada
          position_x: nodePos.position_x,
          position_y: nodePos.position_y,
          extra_data: nodePos.extra_data
        };

        // console.log('Datos para node position copia:', datosNodePosCopia); // Debug

        // Verificar que todos los campos requeridos están presentes
        if (!datosNodePosCopia.id_secuencia || !datosNodePosCopia.node_id) {
          // console.error('Error: Faltan campos requeridos para node position:', datosNodePosCopia);
          throw new ApiError('Error en datos de node position: faltan campos requeridos', 500);
        }

        const nodePosCopia = await this.nodePositionRepo.crear(datosNodePosCopia);
        nodePositionsCopiados.push(nodePosCopia);
      }
    }

    // 7. Copiar todas las métricas de las testing cards originales (Amtci_i) a las copiadas (Btc_i)
    const metricasCopiadas = [];
    
    for (const [idTestingCardOriginal, idTestingCardCopia] of mapeoIdOriginalACopia) {
      const metricasOriginales = await this.metricaRepo.obtenerPorTestingCard(idTestingCardOriginal);
      
      for (const metricaOriginal of metricasOriginales) {
        const datosMetricaCopia = {
          id_testing_card: idTestingCardCopia, // Asociar a la testing card copiada (Btc_i)
          nombre: metricaOriginal.nombre,
          operador: metricaOriginal.operador,
          criterio: metricaOriginal.criterio
        };
        
        const metricaCopia = await this.metricaRepo.crear(datosMetricaCopia);
        metricasCopiadas.push(metricaCopia);
      }
    }

    // 8. Crear la plantilla secuencia con la secuencia copia (B)
    // console.log('idSecuenciaCopia antes de conversión:', idSecuenciaCopia, typeof idSecuenciaCopia); // Debug
    // console.log('id_empleado antes de conversión:', id_empleado, typeof id_empleado); // Debug

    // Verificar que los valores no sean undefined o null antes de convertir
    if (idSecuenciaCopia === undefined || idSecuenciaCopia === null) {
      throw new ApiError('ID de secuencia copia no puede ser undefined o null', 400);
    }
    if (id_empleado === undefined || id_empleado === null) {
      throw new ApiError('ID de empleado no puede ser undefined o null', 400);
    }

    const idSecuenciaNum = parseInt(idSecuenciaCopia);
    const idEmpleadoNum = parseInt(id_empleado);

    // Verificar que las conversiones sean válidas
    if (isNaN(idSecuenciaNum) || isNaN(idEmpleadoNum)) {
      throw new ApiError(`Error en conversión de IDs: id_secuencia=${idSecuenciaCopia}(${typeof idSecuenciaCopia}), id_empleado=${id_empleado}(${typeof id_empleado})`, 400);
    }

    const datosPlantilla = {
      id_secuencia: idSecuenciaNum,
      id_empleado: idEmpleadoNum
    };

    // console.log('Datos para plantilla antes de validar:', datosPlantilla); // Debug
    // console.log('Tipos de datos:', {
    //   id_secuencia: typeof datosPlantilla.id_secuencia,
    //   id_empleado: typeof datosPlantilla.id_empleado
    // }); // Debug

    // Validar datos para BD
    const datosValidados = PlantillaSecuencia.validateCreate(datosPlantilla);
    
    // Crear la plantilla secuencia
    const nuevaPlantillaSecuencia = await plantillaSecuenciaRepository.crear(datosValidados);
    
    const resultado = nuevaPlantillaSecuencia.toAPI();
    
    // Agregar información adicional sobre las copias creadas
    resultado.copia_resumen = {
      id_secuencia_original: id_secuencia,
      id_secuencia_copia: idSecuenciaCopia,
      nombre_secuencia_copia: secuenciaCopia.nombre,
      testing_cards_copiadas: testingCardsCopiadas.length,
      node_positions_copiados: nodePositionsCopiados.length,
      metricas_copiadas: metricasCopiadas.length
    };
    
    return resultado;
  } 

  /**
   * Actualiza una plantilla secuencia existente
   * @param {string} id - UUID de la plantilla secuencia
   * @param {Object} datosActualizacion - Datos a actualizar
   * @returns {Promise<Object>} Plantilla secuencia actualizada en formato API
   * @throws {ApiError} Si la plantilla secuencia no existe o los datos no son válidos
   */
  async actualizar(id, datosActualizacion) {
    // Verificar que la plantilla secuencia existe
    await this.obtenerPorId(id);
    
    // Validar datos de actualización
    const datosValidados = PlantillaSecuencia.validateUpdate(datosActualizacion);
    
    // Actualizar la plantilla secuencia
    const plantillaSecuenciaActualizada = await plantillaSecuenciaRepository.actualizar(id, datosValidados);
    
    return plantillaSecuenciaActualizada.toAPI();
  }

  /**
   * Elimina una plantilla secuencia y la secuencia copiada asociada
   * @param {string} id - UUID de la plantilla secuencia
   * @returns {Promise<Object>} Información sobre la eliminación
   * @throws {ApiError} Si la plantilla secuencia no existe
   */
  async eliminar(id) {
    // Obtener la plantilla secuencia para verificar que existe y obtener el id_secuencia
    const plantillaSecuencia = await plantillaSecuenciaRepository.obtenerPorId(id);
    
    if (!plantillaSecuencia) {
      throw new ApiError('Plantilla secuencia no encontrada', 404);
    }

    const idSecuenciaCopia = plantillaSecuencia.id_secuencia;

    try {
      // 1. Eliminar primero la plantilla secuencia (remover la referencia)
      const plantillaEliminada = await plantillaSecuenciaRepository.eliminar(id);

      // 2. Luego eliminar la secuencia copiada (esto eliminará en cascada todas sus dependencias:
      //    - Testing cards asociadas
      //    - Node positions de esas testing cards
      //    - Métricas de esas testing cards)
      const secuenciaEliminada = await this.secuenciaRepo.eliminar(idSecuenciaCopia);

      return {
        success: true,
        message: 'Plantilla secuencia y secuencia copiada eliminadas correctamente',
        eliminado: {
          plantilla_secuencia: {
            id: id,
            id_secuencia_eliminada: idSecuenciaCopia
          },
          secuencia_eliminada: secuenciaEliminada
        }
      };

    } catch (error) {
      // Si hay error al eliminar la secuencia, lanzar el error
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Error al eliminar plantilla secuencia: ${error.message}`, 500);
    }
  }

  /**
   * Verifica si existe una relación con secuencia específica
   * @param {number} idSecuencia - ID de la secuencia
   * @returns {Promise<boolean>} true si existe la relación
   */
  async existeRelacion(idSecuencia) {
    return await plantillaSecuenciaRepository.existeRelacion(idSecuencia);
  }

  /**
   * Aplica una plantilla secuencia a una secuencia existente
   * @param {string} idSecuencia - ID de la secuencia destino
   * @param {string} idPlantillaSecuencia - ID de la plantilla secuencia a aplicar
   * @returns {Promise<Object>} Resultado de la aplicación de la plantilla
   * @throws {ApiError} Si alguna de las entidades no existe o hay error en el proceso
   */
  async aplicarPlantilla(idSecuencia, idPlantillaSecuencia) {
    // Verificar que la secuencia destino existe
    const secuenciaDestino = await this.secuenciaRepo.obtenerPorId(idSecuencia);
    if (!secuenciaDestino) {
      throw new ApiError('Secuencia destino no encontrada', 404);
    }

    // Verificar que la plantilla secuencia existe
    const plantillaSecuencia = await plantillaSecuenciaRepository.obtenerPorId(idPlantillaSecuencia);
    if (!plantillaSecuencia) {
      throw new ApiError('Plantilla secuencia no encontrada', 404);
    }

    // Obtener la secuencia plantilla (la secuencia asociada a la plantilla)
    const secuenciaPlantilla = await this.secuenciaRepo.obtenerPorId(plantillaSecuencia.id_secuencia);
    if (!secuenciaPlantilla) {
      throw new ApiError('Secuencia plantilla no encontrada', 404);
    }

    try {
      // Obtener las testing cards de la secuencia plantilla
      const testingCardsPlantilla = await this.testingCardRepo.obtenerPorIdSecuencia(plantillaSecuencia.id_secuencia);

      // Crear un mapeo para mantener las relaciones padre-hijo
      const mapeoIdOriginalANuevo = new Map(); // ID original -> ID nuevo
      const testingCardsCopias = [];
      
      // Paso 1: Crear todas las testing cards SIN las relaciones padre-hijo
      for (const tcPlantilla of testingCardsPlantilla) {
        const nuevaTestingCard = await this.testingCardRepo.crear({
          nombre_testing_card: tcPlantilla.nombre_testing_card,
          descripcion: tcPlantilla.descripcion,
          experimento_tipo_id: tcPlantilla.experimento_tipo_id,
          id_secuencia: idSecuencia, // Asignar a la secuencia destino
          id_testing_card_padre: null, // Temporalmente null, lo actualizaremos después
          estado_testing_card: tcPlantilla.estado_testing_card || 'CREADO',
          fecha_creacion: new Date()
        });

        // Guardar el mapeo ID original -> ID nuevo
        mapeoIdOriginalANuevo.set(tcPlantilla.id, nuevaTestingCard.id);
        testingCardsCopias.push(nuevaTestingCard);
      }

      // Paso 2: Actualizar las relaciones padre-hijo usando el mapeo
      for (let i = 0; i < testingCardsPlantilla.length; i++) {
        const tcOriginal = testingCardsPlantilla[i];
        const tcCopia = testingCardsCopias[i];

        // Si la testing card original tiene padre, buscar el ID del padre copiado
        if (tcOriginal.id_testing_card_padre) {
          const idPadreCopia = mapeoIdOriginalANuevo.get(tcOriginal.id_testing_card_padre);
          
          if (idPadreCopia) {
            // Actualizar la testing card con el ID del padre copiado
            await this.testingCardRepo.actualizar(tcCopia.id, {
              id_testing_card_padre: idPadreCopia
            });
            // Actualizar también nuestro objeto local
            tcCopia.id_testing_card_padre = idPadreCopia;
          }
        }

        // Copiar las métricas de la testing card original
        const metricasOriginal = await this.metricaRepo.obtenerPorTestingCardId(tcOriginal.id);
        for (const metrica of metricasOriginal) {
          await this.metricaRepo.crear({
            testing_card_id: tcCopia.id,
            nombre_metrica: metrica.nombre_metrica,
            tipo_dato: metrica.tipo_dato,
            valor_esperado: metrica.valor_esperado,
            operador_comparacion: metrica.operador_comparacion,
            descripcion: metrica.descripcion
          });
        }

        // Copiar las posiciones de nodos de la testing card original
        const posicionesOriginal = await this.nodePositionRepo.obtenerPorTestingCardId(tcOriginal.id);
        for (const posicion of posicionesOriginal) {
          await this.nodePositionRepo.crear({
            testing_card_id: tcCopia.id,
            position_x: posicion.position_x,
            position_y: posicion.position_y,
            node_type: posicion.node_type,
            node_data: posicion.node_data
          });
        }
      }

      return {
        success: true,
        message: `Plantilla aplicada exitosamente. Se copiaron ${testingCardsCopias.length} testing cards con relaciones padre-hijo preservadas`,
        data: {
          secuencia_destino: secuenciaDestino.toAPI(),
          plantilla_aplicada: plantillaSecuencia.toAPI(),
          testing_cards_creadas: testingCardsCopias.map(tc => tc.toAPI()),
          relaciones_preservadas: testingCardsCopias.filter(tc => tc.id_testing_card_padre).length
        }
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Error al aplicar plantilla: ${error.message}`, 500);
    }
  }
}

export default new PlantillaSecuenciaService();
