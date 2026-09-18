import archivos from '../config/archivos.js';
import FormatoRepository from '../repositories/formatoRepository.js';
import { v4 as uuidv4 } from 'uuid';

class FormatoService {
  
  async uploadDocument(file, categoria = null) {
    try {
      // Validar tamaño del archivo (50MB máximo)
      const maxSize = 50 * 1024 * 1024; // 50MB en bytes
      if (file.size > maxSize) {
        throw new Error('El archivo excede el tamaño máximo permitido de 50MB');
      }

      // Generar nombre único para el archivo
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `formatos/${uniqueFileName}`;

      // Guardar el archivo en disco
      try {
        await archivos.subir('formato-docs', filePath, file.buffer);
      } catch (uploadError) {
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }

      // Obtener URL pública del archivo
      const publicUrl = archivos.urlPublica('formato-docs', filePath);

      // Determinar tipo de documento basado en mimetype
      const documentType = this.getDocumentType(file.mimetype);

      // Crear registro en la base de datos
      const documentData = {
        document_name: file.originalname,
        document_url: publicUrl,
        document_type: documentType,
        categoria: categoria
      };

      const document = await FormatoRepository.create(documentData);
      return document;

    } catch (error) {
      throw error;
    }
  }

  async getAllDocuments() {
    try {
      return await FormatoRepository.findAll();
    } catch (error) {
      throw error;
    }
  }

  async getDocumentById(id) {
    try {
      const document = await FormatoRepository.findById(id);
      if (!document) {
        throw new Error('Documento no encontrado');
      }
      return document;
    } catch (error) {
      throw error;
    }
  }

  async updateDocument(id, categoria) {
    try {
      // Verificar que el documento existe
      const document = await FormatoRepository.findById(id);
      if (!document) {
        throw new Error('Documento no encontrado');
      }

      // Actualizar solo la categoría
      const updatedDocument = await FormatoRepository.update(id, { categoria });
      return updatedDocument;

    } catch (error) {
      throw error;
    }
  }

  async deleteDocument(documentId) {
    try {
      // Obtener información del documento
      const document = await FormatoRepository.findById(documentId);
      if (!document) {
        throw new Error('Documento no encontrado');
      }

      // Extraer el path del archivo de la URL
      const url = new URL(document.document_url);
      const filePath = url.pathname.split('/').slice(-2).join('/'); // Obtiene "formatos/filename"

      // Eliminar el archivo del disco
      try {
        await archivos.borrar('formato-docs', [filePath]);
      } catch (deleteError) {
        console.warn(`Warning: No se pudo eliminar el archivo del storage: ${deleteError.message}`);
      }

      // Eliminar registro de la base de datos
      await FormatoRepository.delete(documentId);
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
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'presentation';
    return 'other';
  }
}

export default new FormatoService();