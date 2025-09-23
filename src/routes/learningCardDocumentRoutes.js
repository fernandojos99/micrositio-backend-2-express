import express from 'express';
import LearningCardDocumentController from '../controllers/learningCardDocumentController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/learning-card/:learningCardId/documents - Subir documento
router.post('/:learningCardId/documents', authMiddleware, soloEditores, upload.single('document'), LearningCardDocumentController.uploadDocument);

// GET /api/learning-card/:learningCardId/documents - Obtener documentos de una learning card
router.get('/:learningCardId/documents', authMiddleware,  LearningCardDocumentController.getDocuments);

// GET /api/learning-card/documents/:documentId - Obtener documento específico por ID
router.get('/documents/:documentId', authMiddleware,  LearningCardDocumentController.getDocumentById);

// DELETE /api/learning-card/documents/:documentId - Eliminar documento
router.delete('/documents/:documentId', authMiddleware, soloEditores, LearningCardDocumentController.deleteDocument);

export default router;
