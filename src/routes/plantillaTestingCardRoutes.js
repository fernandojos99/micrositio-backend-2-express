// src/routes/plantillaTestingCardRoutes.js
import express from 'express';
import PlantillaTestingCardController from '../controllers/plantillaTestingCardController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const plantillaTestingCardController = new PlantillaTestingCardController();

// Obtener todas las plantillas testing card
router.get('/', authMiddleware, soloEditores, plantillaTestingCardController.listarTodas.bind(plantillaTestingCardController));

// Obtener plantillas testing card por empleado
router.get('/empleado/:id_empleado', authMiddleware, soloEditores, plantillaTestingCardController.listarPorEmpleado.bind(plantillaTestingCardController));

// Obtener plantillas testing card por testing card
router.get('/testing-card/:id_testing_card', authMiddleware, soloEditores, plantillaTestingCardController.listarPorTestingCard.bind(plantillaTestingCardController));

// Obtener plantilla testing card específica por ID
router.get('/:id', authMiddleware, soloEditores, plantillaTestingCardController.obtenerPorId.bind(plantillaTestingCardController));

// Crear plantilla testing card
router.post('/', authMiddleware, soloEditores, plantillaTestingCardController.crear.bind(plantillaTestingCardController));

// Actualizar plantilla testing card
router.patch('/', authMiddleware, soloEditores, plantillaTestingCardController.actualizar.bind(plantillaTestingCardController));

// Eliminar plantilla testing card
router.delete('/', authMiddleware, soloEditores, plantillaTestingCardController.eliminar.bind(plantillaTestingCardController));

export default router;
