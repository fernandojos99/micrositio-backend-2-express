import { consulta, uno, insertarFilas, actualizarFilas, exigirFila, primeraFila } from '../config/db.js';
import LearningCardDocument from '../models/LearningCardDocument.js';

class LearningCardDocumentRepository {
  static tableName = 'learning_card_documents';

  static async createDocument(documentData) {
    try {
      const data = await exigirFila(insertarFilas(this.tableName, documentData));
      return LearningCardDocument.fromDatabase(data);
    } catch (error) {
      console.error('Error in createDocument repository:', error);
      throw error;
    }
  }

  static async getDocumentsByLearningCardId(learningCardId) {
    try {
      const data = await consulta(
        `SELECT * FROM ${this.tableName} WHERE learning_card_id = $1 ORDER BY created_at DESC`,
        [learningCardId]);
      return data.map(doc => LearningCardDocument.fromDatabase(doc));
    } catch (error) {
      console.error('Error in getDocumentsByLearningCardId repository:', error);
      throw error;
    }
  }

  static async getDocumentById(documentId) {
    try {
      const data = await uno(`SELECT * FROM ${this.tableName} WHERE id = $1`, [documentId]);
      return data ? LearningCardDocument.fromDatabase(data) : null; // null: no document found
    } catch (error) {
      console.error('Error in getDocumentById repository:', error);
      throw error;
    }
  }

  static async deleteDocument(documentId) {
    try {
      const data = await primeraFila(consulta(
        `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`, [documentId]));
      return data ? LearningCardDocument.fromDatabase(data) : null; // null: no document found
    } catch (error) {
      console.error('Error in deleteDocument repository:', error);
      throw error;
    }
  }

  static async updateDocument(documentId, updateData) {
    try {
      const data = await primeraFila(actualizarFilas(this.tableName, updateData, 'id = $1', [documentId]));
      return data ? LearningCardDocument.fromDatabase(data) : null; // null: no document found
    } catch (error) {
      console.error('Error in updateDocument repository:', error);
      throw error;
    }
  }
}

export default LearningCardDocumentRepository;
