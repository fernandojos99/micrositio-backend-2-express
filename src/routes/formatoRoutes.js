import express from 'express';
import multer from 'multer';
import FormatoController from '../controllers/formatoController.js';

const router = express.Router();

// Configuración de multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/avi'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Allowed types: PDF, JPEG, JPG, PNG, MP4, AVI'), false);
    }
  }
});

// Rutas para formato
router.post('/upload', upload.single('document'), FormatoController.uploadDocument);
router.get('/', FormatoController.getDocuments);
router.get('/:documentId', FormatoController.getDocumentById);
router.put('/:documentId', FormatoController.updateDocument);
router.delete('/:documentId', FormatoController.deleteDocument);

export default router;