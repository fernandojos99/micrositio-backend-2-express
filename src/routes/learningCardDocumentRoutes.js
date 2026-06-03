import express from 'express';
import LearningCardDocumentController from '../controllers/learningCardDocumentController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/:learningCardId/documentos', authMiddleware, soloEditores, upload.single('document'), LearningCardDocumentController.uploadDocument);
router.get('/:learningCardId/documentos', authMiddleware, LearningCardDocumentController.getDocuments);
router.get('/documentos/:documentId', authMiddleware, LearningCardDocumentController.getDocumentById);
router.delete('/documentos/:documentId', authMiddleware, soloEditores, LearningCardDocumentController.deleteDocument);

export default router;
