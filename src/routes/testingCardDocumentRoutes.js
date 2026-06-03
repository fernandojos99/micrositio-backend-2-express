import express from 'express';
import testingCardDocumentController from '../controllers/testingCardDocumentController.js';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/:testingCardId/documentos',
  authMiddleware,
  soloEditores,
  upload.single('document'),
  handleMulterError,
  testingCardDocumentController.uploadDocument
);

router.get('/:testingCardId/documentos',
  authMiddleware,
  testingCardDocumentController.getDocuments
);

router.delete('/documentos/:documentId',
  authMiddleware,
  soloEditores,
  testingCardDocumentController.deleteDocument
);

export default router;
