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


/* ---------------------------------------------------------------------------
 * Rutas REST con el identificador en el path.
 *
 * Van al final a proposito: Express resuelve por orden de registro, asi que
 * las rutas literales de arriba ('/p', '/todos', '/aplicar-plantilla', ...)
 * siguen ganando y no las tapa el parametro.
 *
 * Las rutas antiguas, con el ID en el body (incluido un GET con body), se
 * mantienen para no romper a los clientes que aun no han migrado. Cuando el
 * front deje de usarlas, se borran.
 * ------------------------------------------------------------------------ */

router.get('/:id', authMiddleware, testingCardController.obtenerPorId.bind(testingCardController));
router.patch('/:id', authMiddleware, soloEditores, testingCardController.actualizar.bind(testingCardController));
router.delete('/:id', authMiddleware, soloEditores, testingCardController.eliminar.bind(testingCardController));

export default router;