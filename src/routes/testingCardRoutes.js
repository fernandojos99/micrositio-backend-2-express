// src/routes/testingCardRoutes.js
import express from 'express';
import TestingCardController from '../controllers/testingCardController.js';
import { authMiddleware, soloEditores, verificarAccesoProyecto } from '../middlewares/authMiddleware.js';

const router = express.Router();
const testingCardController = new TestingCardController();

// Listar todos (soporta ?secuenciaId=)
// NOTE: verificarAccesoProyecto aquí requiere ajuste futuro — usa req.query.proyectoId
// pero este endpoint filtra por secuenciaId. Necesitaría resolver la secuencia a su proyecto.
router.get('/', authMiddleware, verificarAccesoProyecto, testingCardController.listarTodos.bind(testingCardController));

// Obtener todas las testing cards de plantillas
router.get('/plantillas', authMiddleware, testingCardController.obtenerTodasTestingCardDeLasPlantillas.bind(testingCardController));

// Obtener por ID
router.get('/:id', authMiddleware, testingCardController.obtenerPorId.bind(testingCardController));

// Obtener por padre
router.get('/:id/padre', authMiddleware, testingCardController.obtenerPorPadre.bind(testingCardController));

// Crear
router.post('/', authMiddleware, soloEditores, testingCardController.crear.bind(testingCardController));

// Copiar testing card
router.post('/:id/copiar', authMiddleware, soloEditores, testingCardController.copiarTestingCard.bind(testingCardController));

// Actualizar
router.patch('/:id', authMiddleware, soloEditores, testingCardController.actualizar.bind(testingCardController));

// Aplicar plantilla a testing card
router.patch('/:id/aplicar-plantilla', authMiddleware, soloEditores, testingCardController.aplicarPlantilla.bind(testingCardController));

// Eliminar
router.delete('/:id', authMiddleware, soloEditores, testingCardController.eliminar.bind(testingCardController));

export default router;
