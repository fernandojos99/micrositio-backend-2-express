import express from 'express';
import LearningCardController from '../controllers/learningCardController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const learningCardController = new LearningCardController();

// Obtener por testing card
router.get('/t', authMiddleware, learningCardController.obtenerPorTestingCard.bind(learningCardController));

// Obtener por learning card ID
router.get('/l', authMiddleware, learningCardController.obtenerPorId.bind(learningCardController));

// Obtener todos
router.get('/', authMiddleware, learningCardController.obtenerTodos.bind(learningCardController));

// Crear
router.post('/', authMiddleware, soloEditores, learningCardController.crear.bind(learningCardController));

// Actualizar
router.patch('/', authMiddleware, soloEditores, learningCardController.actualizar.bind(learningCardController));

// Eliminar
router.delete('/', authMiddleware, soloEditores, learningCardController.eliminar.bind(learningCardController));


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

router.get('/:id', authMiddleware, learningCardController.obtenerPorId.bind(learningCardController));
router.patch('/:id', authMiddleware, soloEditores, learningCardController.actualizar.bind(learningCardController));
router.delete('/:id', authMiddleware, soloEditores, learningCardController.eliminar.bind(learningCardController));

export default router;