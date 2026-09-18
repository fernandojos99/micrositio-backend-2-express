import archivos from '../config/archivos.js';
import testingCardDocumentRepository from '../repositories/testingCardDocumentRepository.js';
import { v4 as uuidv4 } from 'uuid';

class TestingCardDocumentService {
  
  async uploadDocument(file, testingCardId) {
    try {
      // Validar tamaño del archivo (50MB máximo)
      const maxSize = 50 * 1024 * 1024; // 50MB en bytes
      if (file.size > maxSize) {
        throw new Error('El archivo excede el tamaño máximo permitido de 50MB');
      }

      // Validar tipos de archivo permitidos
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
        'application/vnd.oasis.opendocument.presentation',
        'text/plain',
        'text/csv',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/webm',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg'
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error(`Tipo de archivo no permitido: ${file.mimetype}`);
      }

      // Generar nombre único para el archivo
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFileName = `${testingCardId}_${uuidv4()}.${fileExtension}`;
      const filePath = `testing-cards/${uniqueFileName}`;

      // Guardar el archivo en disco
      try {
        await archivos.subir('testing-card-docs', filePath, file.buffer);
      } catch (uploadError) {
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }

      // Obtener URL pública del archivo
      const publicUrl = archivos.urlPublica('testing-card-docs', filePath);

      // Determinar tipo de documento basado en mimetype
      const documentType = this.getDocumentType(file.mimetype);      // Crear registro en la base de datos
      const documentData = {
        testing_card_id: parseInt(testingCardId),
        document_name: file.originalname,
        document_url: publicUrl,
        document_type: documentType
      };

      
      const document = await testingCardDocumentRepository.create(documentData);
      return document;

    } catch (error) {
      throw error;
    }
  }

  async getDocumentsByTestingCard(testingCardId) {
    try {
      return await testingCardDocumentRepository.findByTestingCardId(testingCardId);
    } catch (error) {
      throw error;
    }
  }

  async deleteDocument(documentId) {
    try {
      // Obtener información del documento
      const document = await testingCardDocumentRepository.findById(documentId);
      if (!document) {
        throw new Error('Documento no encontrado');
      }

      // Extraer el path del archivo de la URL
      const url = new URL(document.document_url);
      const filePath = url.pathname.split('/').slice(-2).join('/'); // Obtiene "testing-cards/filename"

      // Eliminar el archivo del disco
      try {
        await archivos.borrar('testing-card-docs', [filePath]);
      } catch (deleteError) {
        console.warn(`Warning: No se pudo eliminar el archivo del storage: ${deleteError.message}`);
      }

      // Eliminar registro de la base de datos
      await testingCardDocumentRepository.delete(documentId);
      return true;

    } catch (error) {
      throw error;
    }
  }

  getDocumentType(mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype === 'application/pdf') return 'pdf';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.includes('document') || mimetype.includes('word')) return 'document';
    if (mimetype.includes('sheet') || mimetype.includes('excel')) return 'spreadsheet';
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint') || mimetype.includes('vnd.ms-powerpoint') || mimetype.includes('vnd.oasis.opendocument.presentation')) return 'presentation';
    if (mimetype.includes('text/')) return 'text';
    return 'other';
  }
}

export default new TestingCardDocumentService();
