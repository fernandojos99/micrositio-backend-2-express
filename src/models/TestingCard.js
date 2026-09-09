// src/models/TestingCard.js
import { testingCardCreateSchema, testingCardUpdateSchema } from '../middlewares/validation/testingCardSchema.js';
import ApiError from '../utils/ApiError.js';

class TestingCard {
  constructor(data) {
    this.id_testing_card = data.id_testing_card;
    this.id_secuencia = data.id_secuencia;
    this.padre_id = data.padre_id || null;
    this.titulo = data.titulo;
    this.hipotesis = data.hipotesis;
    this.id_experimento_tipo = data.id_experimento_tipo;
    this.descripcion = data.descripcion;
    this.dia_inicio = new Date(data.dia_inicio);
    this.dia_fin = new Date(data.dia_fin);
    this.anexo_url = data.anexo_url || null;
    this.id_responsable = data.id_responsable;
    this.status = data.status || 'EN PLANEACION';
    this.created_at = new Date(data.created_at || Date.now());
    this.updated_at = new Date(data.updated_at || Date.now());
  }

  static validateCreate(data) {
    try {
      return testingCardCreateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  static validateUpdate(data) {
    try {
      return testingCardUpdateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  static fromDatabase(dbData) {
    return new TestingCard({
      id_testing_card: dbData.id_testing_card,
      id_secuencia: dbData.id_secuencia,
      padre_id: dbData.padre_id,
      titulo: dbData.titulo,
      hipotesis: dbData.hipotesis,
      id_experimento_tipo: dbData.id_experimento_tipo,
      descripcion: dbData.descripcion,
      dia_inicio: dbData.dia_inicio,
      dia_fin: dbData.dia_fin,
      anexo_url: dbData.anexo_url,
      id_responsable: dbData.id_responsable,
      status: dbData.status,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at
    });
  }

  toAPI() {
    return {
      id_testing_card: this.id_testing_card,
      id_secuencia: this.id_secuencia,
      padre_id: this.padre_id,
      titulo: this.titulo,
      hipotesis: this.hipotesis,
      id_experimento_tipo: this.id_experimento_tipo,
      descripcion: this.descripcion,
      dia_inicio: this.dia_inicio.toISOString().split('T')[0],
      dia_fin: this.dia_fin.toISOString().split('T')[0],
      anexo_url: this.anexo_url,
      id_responsable: this.id_responsable,
      status: this.status,
      creado: this.created_at.toISOString(),
      actualizado: this.updated_at.toISOString()
    };
  }
}

export default TestingCard;