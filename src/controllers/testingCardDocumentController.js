import testingCardDocumentService from '../services/testingCardDocumentService.js';
import { success, created, fail, noContent } from '../utils/responseHelper.js';

class TestingCardDocumentController {

  async uploadDocument(req, res) {
    try {
      const { testingCardId } = req.params;
      const file = req.file;

      if (!file) {
        return fail(res, { message: 'No se ha proporcionado ningún archivo' });
      }

      if (!testingCardId) {
        return fail(res, { message: 'ID de testing card requerido' });
      }

      const document = await testingCardDocumentService.uploadDocument(file, testingCardId);
      return created(res, document, { message: 'Documento subido exitosamente' });

    } catch (error) {
      console.error('Error al subir documento:', error);

      if (error.message.includes('50MB')) {
        return fail(res, { message: error.message, statusCode: 413 });
      }

      return fail(res, { message: error.message || 'Error interno del servidor', statusCode: 500 });
    }
  }

  async getDocuments(req, res) {
    try {
      const { testingCardId } = req.params;

      if (!testingCardId) {
        return fail(res, { message: 'ID de testing card requerido' });
      }

      const documents = await testingCardDocumentService.getDocumentsByTestingCard(testingCardId);
      return success(res, documents);

    } catch (error) {
      console.error('Error al obtener documentos:', error);
      return fail(res, { message: error.message || 'Error interno del servidor', statusCode: 500 });
    }
  }

  async deleteDocument(req, res) {
    try {
      const { documentId } = req.params;

      if (!documentId) {
        return fail(res, { message: 'ID de documento requerido' });
      }

      await testingCardDocumentService.deleteDocument(documentId);
      return noContent(res);

    } catch (error) {
      console.error('Error al eliminar documento:', error);

      if (error.message.includes('no encontrado')) {
        return fail(res, { message: error.message, statusCode: 404 });
      }

      return fail(res, { message: error.message || 'Error interno del servidor', statusCode: 500 });
    }
  }
}

export default new TestingCardDocumentController();
