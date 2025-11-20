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

    // 3. Crear una copia de la secuencia (B) sin id_proyecto para que sea reutilizable
    const datosSecuenciaCopia = {
      // id_proyecto: NO incluido para que sea reutilizable en cualquier proyecto
      id_testing_card_padre: secuenciaOriginal.id_testing_card_padre,
      nombre: `${secuenciaOriginal.nombre} (Plantilla)`,
      dia_inicio: secuenciaOriginal.dia_inicio,
      dia_fin: secuenciaOriginal.dia_fin,
      descripcion: secuenciaOriginal.descripcion,
      estado: secuenciaOriginal.estado
    };

    console.log('🔍 Datos para crear secuencia copia (SIN id_proyecto):', datosSecuenciaCopia);

    const secuenciaCopia = await this.secuenciaRepo.crear(datosSecuenciaCopia);
    console.log('✅ Secuencia copia creada:', secuenciaCopia); 
    console.log('🔍 ID proyecto en secuencia creada:', secuenciaCopia.id_proyecto);
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

    // Primera pasada: crear las testing cards copiadas sin asignar padre (padre_id=null)
    // Guardamos el mapeo original -> copia para luego actualizar las relaciones padre-hijo
    for (const testingCardOriginal of testingCardsOriginales) {
      const datosTestingCardCopia = {
        id_secuencia: idSecuenciaCopia, // Usar el ID correcto de la secuencia copia (B)
        padre_id: null, // Crear inicialmente sin padre. Se asignará en una segunda pasada
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
      
      // Guardar mapeo para usar en la actualización de padres y métricas
      mapeoIdOriginalACopia.set(String(testingCardOriginal.id_testing_card || testingCardOriginal.id), testingCardCopia.id_testing_card || testingCardCopia.id);
    }

    // Segunda pasada: actualizar el campo padre_id de cada copia usando el mapeo
    for (const testingCardOriginal of testingCardsOriginales) {
      const idOriginal = String(testingCardOriginal.id_testing_card || testingCardOriginal.id);
      const idCopia = mapeoIdOriginalACopia.get(idOriginal);

      if (!idCopia) continue;

      const padreOriginal = testingCardOriginal.padre_id;
      if (padreOriginal !== undefined && padreOriginal !== null) {
        const padreMapeado = mapeoIdOriginalACopia.get(String(padreOriginal));
        if (padreMapeado) {
          // Actualizar la testing card copia para asignar el padre correcto (en la secuencia copia)
          await this.testingCardRepo.actualizar(idCopia, { padre_id: padreMapeado });
        } else {
          // Si el padre original no fue copiado (caso raro), dejar padre_id en null
          await this.testingCardRepo.actualizar(idCopia, { padre_id: null });
        }
      }
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
   * Obtiene una plantilla secuencia por el ID de secuencia
   * @param {string} idSecuencia - ID de la secuencia
   * @returns {Promise<Object>} Plantilla secuencia en formato API
   * @throws {ApiError} Si la plantilla secuencia no existe
   */
  async obtenerPorIdSecuencia(idSecuencia) {
    const plantillaSecuencia = await plantillaSecuenciaRepository.obtenerPorIdSecuencia(idSecuencia);
    
    if (!plantillaSecuencia) {
      throw new ApiError('Plantilla secuencia no encontrada para la secuencia especificada', 404);
    }

    return plantillaSecuencia.toAPI();
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
      const testingCardsPlantilla = await this.testingCardRepo.obtenerPorSecuencia(plantillaSecuencia.id_secuencia);

      // Función para ordenar las testing cards por jerarquía (padres primero)
      const ordenarPorJerarquia = (testingCards) => {
        // Normalizar claves a string para evitar problemas por tipo (number vs string)
        const mapa = new Map();
        const ordenadas = [];

        // Crear mapa de ID -> testing card (usando el campo correcto del ID)
        testingCards.forEach(tc => {
          const id = tc.id_testing_card || tc.id;
          if (id !== undefined && id !== null) {
            mapa.set(String(id), tc);
          }
        });

        // Función recursiva para agregar testing card y sus dependientes
        const agregar = (tc) => {
          const id = tc.id_testing_card || tc.id;
          const idKey = String(id);

          if (ordenadas.find(ordenada => String(ordenada.id_testing_card || ordenada.id) === idKey)) {
            return; // Ya fue agregada
          }

          // Si tiene padre, agregarlo primero
          if (tc.padre_id) {
            const padreKey = String(tc.padre_id);
            if (mapa.has(padreKey)) {
              agregar(mapa.get(padreKey));
            }
          }

          ordenadas.push(tc);
        };

        // Procesar todas las testing cards
        testingCards.forEach(tc => agregar(tc));

        return ordenadas;
      };

      // Ordenar las testing cards por jerarquía
      const testingCardsOrdenadas = ordenarPorJerarquia(testingCardsPlantilla);

      // Crear un mapeo para mantener las relaciones padre-hijo
  const mapeoIdOriginalANuevo = new Map(); // ID original (string) -> ID nuevo (number/string)
      const testingCardsCopias = [];
      
      // Crear las testing cards en orden jerárquico (padres primero)
      for (const tcPlantilla of testingCardsOrdenadas) {
        console.log('🔍 Testing card plantilla:', {
          id: tcPlantilla.id,
          id_testing_card: tcPlantilla.id_testing_card,
          titulo: tcPlantilla.titulo,
          todas_las_propiedades: Object.keys(tcPlantilla)
        });

        // Determinar el padre_id para la nueva testing card
        let nuevoPadreId = null;
        if (tcPlantilla.padre_id !== undefined && tcPlantilla.padre_id !== null) {
          const padreKey = String(tcPlantilla.padre_id);
          if (mapeoIdOriginalANuevo.has(padreKey)) {
            nuevoPadreId = mapeoIdOriginalANuevo.get(padreKey);
          }
        }

        const nuevaTestingCard = await this.testingCardRepo.crear({
          titulo: tcPlantilla.titulo || tcPlantilla.nombre_testing_card,
          hipotesis: tcPlantilla.hipotesis || '',
          descripcion: tcPlantilla.descripcion,
          id_experimento_tipo: tcPlantilla.id_experimento_tipo || tcPlantilla.experimento_tipo_id,
          id_secuencia: idSecuencia, // Asignar a la secuencia destino
          padre_id: nuevoPadreId, // Usar el ID del padre ya creado
          status: tcPlantilla.status || 'En desarrollo',
          dia_inicio: tcPlantilla.dia_inicio || new Date(),
          dia_fin: tcPlantilla.dia_fin || new Date(),
          id_responsable: tcPlantilla.id_responsable || null,
          anexo_url: tcPlantilla.anexo_url || null
        });

        console.log('✅ Nueva testing card creada:', {
          id: nuevaTestingCard.id,
          id_testing_card: nuevaTestingCard.id_testing_card,
          todas_las_propiedades: Object.keys(nuevaTestingCard)
        });

        // Guardar el mapeo ID original -> ID nuevo (usar string como clave)
        const idOriginal = tcPlantilla.id_testing_card || tcPlantilla.id;
        const idNuevo = nuevaTestingCard.id_testing_card || nuevaTestingCard.id;
        if (idOriginal !== undefined && idOriginal !== null) {
          mapeoIdOriginalANuevo.set(String(idOriginal), idNuevo);
        }
        testingCardsCopias.push(nuevaTestingCard);

        // Copiar las métricas de la testing card original
        const metricasOriginal = await this.metricaRepo.obtenerPorTestingCard(idOriginal);
        for (const metrica of metricasOriginal) {
          await this.metricaRepo.crear({
            id_testing_card: idNuevo, // Usar el ID correcto de la nueva testing card
            nombre: metrica.nombre,
            operador: metrica.operador,
            criterio: metrica.criterio
          });
        }

        // Copiar las posiciones de nodos de la testing card original
        // Obtener todas las posiciones de la secuencia y filtrar por esta testing card
        const posicionesSecuencia = await this.nodePositionRepo.obtenerPorSecuencia(plantillaSecuencia.id_secuencia);
        const posicionesOriginal = posicionesSecuencia.filter(pos => 
          pos.node_type === 'testing' && String(pos.node_id) === String(idOriginal)
        );
        
        for (const posicion of posicionesOriginal) {
          await this.nodePositionRepo.crear({
            id_secuencia: idSecuencia, // Nueva secuencia destino
            node_type: posicion.node_type,
            node_id: idNuevo, // Usar el ID correcto de la nueva testing card
            position_x: posicion.position_x,
            position_y: posicion.position_y
          });
        }
      }

      return {
        success: true,
        message: `Plantilla aplicada exitosamente. Se copiaron ${testingCardsCopias.length} testing cards con jerarquía preservada`,
        data: {
          secuencia_destino: secuenciaDestino.toAPI(),
          plantilla_aplicada: plantillaSecuencia.toAPI(),
          testing_cards_creadas: testingCardsCopias.map(tc => tc.toAPI()),
          relaciones_preservadas: testingCardsCopias.filter(tc => tc.padre_id).length,
          orden_procesamiento: testingCardsOrdenadas.map(tc => ({ 
            id: tc.id_testing_card || tc.id, 
            padre_id: tc.padre_id, 
            nombre: tc.titulo || tc.nombre_testing_card 
          }))
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
