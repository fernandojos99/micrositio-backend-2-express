import formatoService from '../services/formatoService.js';
import { success, created, fail, noContent } from '../utils/responseHelper.js';

class FormatoController {

  async uploadDocument(req, res) {
    try {
      const file = req.file;
      const { categoria } = req.body;

      if (!file) {
        return fail(res, { message: 'No se ha proporcionado ningún archivo' });
      }

      const document = await formatoService.uploadDocument(file, categoria);
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
      const documents = await formatoService.getAllDocuments();
      return success(res, documents);

    } catch (error) {
      console.error('Error al obtener documentos:', error);
      return fail(res, { message: error.message || 'Error interno del servidor', statusCode: 500 });
    }
  }

  async getDocumentById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return fail(res, { message: 'ID de documento requerido' });
      }

      const document = await formatoService.getDocumentById(id);
      return success(res, document);

    } catch (error) {
      console.error('Error al obtener documento:', error);

      if (error.message.includes('no encontrado')) {
        return fail(res, { message: error.message, statusCode: 404 });
      }

      return fail(res, { message: error.message || 'Error interno del servidor', statusCode: 500 });
    }
  }

  async updateDocument(req, res) {
    try {
      const { id } = req.params;
      const { categoria } = req.body;

      if (!id) {
        return fail(res, { message: 'ID de documento requerido' });
      }

      const document = await formatoService.updateDocument(id, categoria);
      return success(res, document, { message: 'Documento actualizado exitosamente' });

    } catch (error) {
      console.error('Error al actualizar documento:', error);

      if (error.message.includes('no encontrado')) {
        return fail(res, { message: error.message, statusCode: 404 });
      }

      return fail(res, { message: error.message || 'Error interno del servidor', statusCode: 500 });
    }
  }

  async deleteDocument(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return fail(res, { message: 'ID de documento requerido' });
      }

      await formatoService.deleteDocument(id);
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

export default new FormatoController();
