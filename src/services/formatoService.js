import FormatoRepository from '../repositories/formatoRepository.js';
import path from 'path';
import fs from 'fs/promises';

class FormatoService {
  static async uploadDocument(file) {
    try {
      // Validaciones del archivo
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxFileSize) {
        throw new Error('File size exceeds maximum limit of 10MB');
      }

      // Tipos de archivo permitidos
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/avi'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('File type not allowed. Allowed types: PDF, JPEG, JPG, PNG, MP4, AVI');
      }

      // Determinar el tipo de documento basado en mimetype
      let documentType;
      if (file.mimetype === 'application/pdf') {
        documentType = 'pdf';
      } else if (file.mimetype.startsWith('image/')) {
        documentType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        documentType = 'video';
      } else {
        documentType = 'other';
      }

      // Crear directorio si no existe
      const uploadDir = path.join(process.cwd(), 'uploads', 'formatos');
      try {
        await fs.mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Error creating upload directory:', error);
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const fileName = `formato_${timestamp}_${randomString}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      try {
        // Guardar archivo
        await fs.writeFile(filePath, file.buffer);
      } catch (error) {
        console.error('Error writing file:', error);
        throw new Error('Failed to upload file to storage');
      }

      // Crear URL pública del archivo
      const publicUrl = `/uploads/formatos/${fileName}`;

      // Guardar información en la base de datos
      const formatoData = {
        document_name: file.originalname,
        document_url: publicUrl,
        document_type: documentType
      };

      const document = await FormatoRepository.create(formatoData);

      return {
        document,
        uploadPath: filePath,
        publicUrl
      };
    } catch (error) {
      console.error('Error in FormatoService.uploadDocument:', error);
      throw error;
    }
  }

  static async getAllDocuments() {
    try {
      const documents = await FormatoRepository.findAll();
      return documents;
    } catch (error) {
      console.error('Error in FormatoService.getAllDocuments:', error);
      throw new Error('Failed to retrieve documents');
    }
  }

  static async getDocumentById(documentId) {
    try {
      const document = await FormatoRepository.findById(documentId);
      return document;
    } catch (error) {
      console.error('Error in FormatoService.getDocumentById:', error);
      throw new Error('Failed to retrieve document');
    }
  }

  static async deleteDocument(documentId) {
    try {
      // Obtener información del documento antes de eliminarlo
      const document = await FormatoRepository.findById(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }

      // Eliminar archivo físico si existe
      let storageDeleted = false;
      if (document.document_url) {
        try {
          // Construir la ruta del archivo basada en la URL
          const filePath = path.join(process.cwd(), document.document_url.replace(/^\//, ''));
          await fs.unlink(filePath);
          storageDeleted = true;
        } catch (fileError) {
          console.warn('Warning: Could not delete physical file:', fileError.message);
          // No lanzar error aquí, ya que el archivo podría no existir
        }
      }

      // Eliminar registro de la base de datos
      const deletedDocument = await FormatoRepository.delete(documentId);

      return {
        document: deletedDocument,
        storageDeleted
      };
    } catch (error) {
      console.error('Error in FormatoService.deleteDocument:', error);
      throw error;
    }
  }

  static async updateDocument(documentId, updateData) {
    try {
      const existingDocument = await FormatoRepository.findById(documentId);
      
      if (!existingDocument) {
        throw new Error('Document not found');
      }

      const updatedDocument = await FormatoRepository.update(documentId, updateData);
      return updatedDocument;
    } catch (error) {
      console.error('Error in FormatoService.updateDocument:', error);
      throw error;
    }
  }
}

export default FormatoService;