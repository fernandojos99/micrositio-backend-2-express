import express from 'express';
import testingCardDocumentController from '../controllers/testingCardDocumentController.js';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Subir documento para una testing card
router.post('/testing-card/:testingCardId/documents', 
  authMiddleware,
  soloEditores,
  upload.single('document'), 
  handleMulterError,
  testingCardDocumentController.uploadDocument
);

// Obtener todos los documentos de una testing card
router.get('/testing-card/:testingCardId/documents', 
  authMiddleware,
  testingCardDocumentController.getDocuments
);

// Eliminar un documento específico
router.delete('/documents/:documentId', 
  authMiddleware,
  soloEditores,
  testingCardDocumentController.deleteDocument
);

export default router;
