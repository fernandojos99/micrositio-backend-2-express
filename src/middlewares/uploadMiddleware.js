import multer from 'multer';

// Configuración de Multer para subir archivos
const upload = multer({
  storage: multer.memoryStorage(), // Almacenar en memoria para procesar con Supabase
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
    files: 1 // Solo un archivo por request
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedMimeTypes = [
      // Imágenes
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      
      // Documentos
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      
      // PowerPoint - Todos los formatos
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-powerpoint.presentation.macroEnabled.12', // .pptm
      'application/vnd.oasis.opendocument.presentation', // .odp
      
      'text/plain',
      'text/csv',
      
      // Videos
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'audio/ogg'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten imágenes, documentos, videos y audios.`), false);
    }
  }
});


const uploadImages = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Solo imágenes"));
  },
});



// Middleware para manejar errores de Multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'El archivo excede el tamaño máximo permitido de 50MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Solo se permite subir un archivo a la vez'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado'
      });
    }
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

export { upload,uploadImages, handleMulterError };
