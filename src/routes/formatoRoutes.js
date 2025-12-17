import express from 'express';
import formatoController from '../controllers/formatoController.js';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';
import { validateUploadDocument, validateDocumentId } from '../middlewares/validation/formatoValidation.js';

const router = express.Router();

// Subir documento
router.post('/upload', 
  authMiddleware,
  soloEditores,
  upload.single('document'), 
  handleMulterError,
  validateUploadDocument,
  formatoController.uploadDocument
);

// Obtener todos los documentos
router.get('/', 
  authMiddleware,
  formatoController.getDocuments
);

// Obtener documento por ID
router.get('/:id', 
  authMiddleware,
  validateDocumentId,
  formatoController.getDocumentById
);

// Eliminar un documento específico
router.delete('/:id', 
  authMiddleware,
  soloEditores,
  validateDocumentId,
  formatoController.deleteDocument
);

export default router;