import express from 'express';
import formatoController from '../controllers/formatoController.js';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Subir documento
router.post('/upload', 
  authMiddleware,
  soloEditores,
  upload.single('document'), 
  handleMulterError,
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
  formatoController.getDocumentById
);

// Eliminar un documento específico
router.delete('/:id', 
  authMiddleware,
  soloEditores,
  formatoController.deleteDocument
);

export default router;