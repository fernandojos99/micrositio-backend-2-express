// src/routes/testingCardRoutes.js
import express from 'express';
import TestingCardController from '../controllers/testingCardController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const testingCardController = new TestingCardController();

// Obtener por ID
router.get('/t/:id', authMiddleware, testingCardController.obtenerPorId.bind(testingCardController));

// Obtener por secuencia
router.get('/s', authMiddleware, testingCardController.obtenerPorSecuencia.bind(testingCardController));

// Obtener todos
router.get('/', authMiddleware, testingCardController.listarTodos.bind(testingCardController));

// Obtener por padre
router.get('/padre', authMiddleware, testingCardController.obtenerPorPadre.bind(testingCardController));

// Crear
router.post('/', authMiddleware, soloEditores, testingCardController.crear.bind(testingCardController));

// Actualizar
router.patch('/', authMiddleware, soloEditores, testingCardController.actualizar.bind(testingCardController));

// Eliminar
router.delete('/', authMiddleware, soloEditores, testingCardController.eliminar.bind(testingCardController));

// Copiar testing card (nuevo endpoint)
router.post('/:id/copiar', authMiddleware, soloEditores, testingCardController.copiarTestingCard.bind(testingCardController));

// Aplicar plantilla a testing card
router.patch('/aplicar-plantilla', authMiddleware, soloEditores, testingCardController.aplicarPlantilla.bind(testingCardController));

// Obtener todas las testing cards de plantillas
router.get('/plantillas', authMiddleware, testingCardController.obtenerTodasTestingCardDeLasPlantillas.bind(testingCardController));

export default router;