// src/routes/plantillaMetricaTcRoutes.js
import express from 'express';
import PlantillaMetricaTcController from '../controllers/plantillaMetricaTcController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const plantillaMetricaTcController = new PlantillaMetricaTcController();

// Obtener todas las plantillas métrica tc
router.get('/', authMiddleware, soloEditores, plantillaMetricaTcController.listarTodas.bind(plantillaMetricaTcController));

// Obtener plantillas métrica tc por empleado
router.get('/empleado/:id_empleado', authMiddleware, soloEditores, plantillaMetricaTcController.listarPorEmpleado.bind(plantillaMetricaTcController));

// Obtener plantillas métrica tc por métrica
router.get('/metrica/:id_metrica', authMiddleware, soloEditores, plantillaMetricaTcController.listarPorMetrica.bind(plantillaMetricaTcController));

// Obtener plantilla métrica tc específica por ID
router.get('/:id', authMiddleware, soloEditores, plantillaMetricaTcController.obtenerPorId.bind(plantillaMetricaTcController));

// Crear plantilla métrica tc
router.post('/', authMiddleware, soloEditores, plantillaMetricaTcController.crear.bind(plantillaMetricaTcController));

// Actualizar plantilla métrica tc
router.patch('/', authMiddleware, soloEditores, plantillaMetricaTcController.actualizar.bind(plantillaMetricaTcController));

// Eliminar plantilla métrica tc
router.delete('/', authMiddleware, soloEditores, plantillaMetricaTcController.eliminar.bind(plantillaMetricaTcController));

export default router;
