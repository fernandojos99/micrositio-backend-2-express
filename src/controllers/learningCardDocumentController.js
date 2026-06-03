import LearningCardDocumentService from '../services/learningCardDocumentService.js';
import { success, created, fail, noContent } from '../utils/responseHelper.js';

class LearningCardDocumentController {
  static async uploadDocument(req, res) {
    try {
      const { learningCardId } = req.params;

      if (!req.file) {
        return fail(res, { message: 'No file provided' });
      }

      if (!learningCardId || isNaN(parseInt(learningCardId))) {
        return fail(res, { message: 'Invalid learning card ID' });
      }

      const result = await LearningCardDocumentService.uploadDocument(parseInt(learningCardId), req.file);
      return created(res, result, { message: 'Document uploaded successfully' });
    } catch (error) {
      console.error('Error in uploadDocument controller:', error);

      if (error.message.includes('File size exceeds')) {
        return fail(res, { message: error.message, statusCode: 413 });
      }

      if (error.message.includes('File type not allowed')) {
        return fail(res, { message: error.message });
      }

      if (error.message.includes('Failed to upload file')) {
        return fail(res, { message: 'Storage upload failed', statusCode: 500 });
      }

      return fail(res, { message: 'Internal server error', statusCode: 500 });
    }
  }

  static async getDocuments(req, res) {
    try {
      const { learningCardId } = req.params;

      if (!learningCardId || isNaN(parseInt(learningCardId))) {
        return fail(res, { message: 'Invalid learning card ID' });
      }

      const documents = await LearningCardDocumentService.getDocumentsByLearningCardId(parseInt(learningCardId));
      return success(res, documents, { total: documents.length });
    } catch (error) {
      console.error('Error in getDocuments controller:', error);
      return fail(res, { message: 'Internal server error', statusCode: 500 });
    }
  }

  static async deleteDocument(req, res) {
    try {
      const { documentId } = req.params;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!documentId || !uuidRegex.test(documentId)) {
        return fail(res, { message: 'Invalid document ID format. Expected UUID.' });
      }

      const result = await LearningCardDocumentService.deleteDocument(documentId);
      return success(res, result, { message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error in deleteDocument controller:', error);

      if (error.message === 'Document not found') {
        return fail(res, { message: 'Document not found', statusCode: 404 });
      }

      return fail(res, { message: 'Internal server error', statusCode: 500 });
    }
  }

  static async getDocumentById(req, res) {
    try {
      const { documentId } = req.params;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!documentId || !uuidRegex.test(documentId)) {
        return fail(res, { message: 'Invalid document ID format. Expected UUID.' });
      }

      const document = await LearningCardDocumentService.getDocumentById(documentId);

      if (!document) {
        return fail(res, { message: 'Document not found', statusCode: 404 });
      }

      return success(res, document);
    } catch (error) {
      console.error('Error in getDocumentById controller:', error);
      return fail(res, { message: 'Internal server error', statusCode: 500 });
    }
  }
}

export default LearningCardDocumentController;
