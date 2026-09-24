import { consulta, unoObligatorio, ejecutar, insertarFilas, actualizarFilas, exigirFila } from '../config/db.js';
import TestingCardDocument from '../models/TestingCardDocument.js';

class TestingCardDocumentRepository {
  async create(documentData) {
    try {
      const data = await exigirFila(insertarFilas('testing_card_documents', documentData));
      return TestingCardDocument.fromDatabase(data);
    } catch (error) {
      throw new Error(`Error al crear documento: ${error.message}`);
    }
  }

  async findByTestingCardId(testingCardId) {
    try {
      const data = await consulta(
        'SELECT * FROM testing_card_documents WHERE testing_card_id = $1 ORDER BY created_at DESC',
        [testingCardId]);
      return data.map(TestingCardDocument.fromDatabase);
    } catch (error) {
      throw new Error(`Error al obtener documentos: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      // Sin fila es un error, como con el .single() de antes.
      const data = await unoObligatorio('SELECT * FROM testing_card_documents WHERE id = $1', [id]);
      return TestingCardDocument.fromDatabase(data);
    } catch (error) {
      throw new Error(`Error al obtener documento: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      await ejecutar('DELETE FROM testing_card_documents WHERE id = $1', [id]);
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar documento: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      const data = await exigirFila(actualizarFilas('testing_card_documents', updateData, 'id = $1', [id]));
      return TestingCardDocument.fromDatabase(data);
    } catch (error) {
      throw new Error(`Error al actualizar documento: ${error.message}`);
    }
  }
}

export default new TestingCardDocumentRepository();
