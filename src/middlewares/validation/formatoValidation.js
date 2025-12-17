import { z } from 'zod';

// Schema para validar la subida de documentos
const uploadDocumentSchema = z.object({
  body: z.object({
    categoria: z.string()
      .min(1, 'La categoría no puede estar vacía')
      .max(20, 'La categoría no puede exceder 20 caracteres')
      .trim()
      .optional()
  })
});

// Schema para validar ID de documento
const documentIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de documento inválido')
  })
});

// Middleware para validar subida de documento
export const validateUploadDocument = (req, res, next) => {
  try {
    uploadDocumentSchema.parse({
      body: req.body
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error en la validación',
      error: error.message
    });
  }
};

// Middleware para validar ID de documento
export const validateDocumentId = (req, res, next) => {
  try {
    documentIdSchema.parse({
      params: req.params
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error en la validación',
      error: error.message
    });
  }
};

// Middleware para validar actualización de documento
export const validateUpdateDocument = (req, res, next) => {
  try {
    const updateSchema = z.object({
      body: z.object({
        categoria: z.string()
          .min(1, 'La categoría no puede estar vacía')
          .max(20, 'La categoría no puede exceder 20 caracteres')
          .trim()
      })
    });

    updateSchema.parse({
      body: req.body
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error en la validación',
      error: error.message
    });
  }
};
