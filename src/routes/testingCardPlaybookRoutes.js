import express from 'express';
import TestingCardPlaybookController from '../controllers/testingCardPlaybookController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const controller = new TestingCardPlaybookController();

router.get('/', authMiddleware, (req, res, next) => controller.listarTodos(req, res, next));
router.get('/por-pagina', authMiddleware, (req, res, next) => controller.obtenerPorPagina(req, res, next));
router.get('/buscar', authMiddleware, (req, res, next) => controller.buscarPorCampo(req, res, next));
router.get('/buscar-tipo', authMiddleware, (req, res, next) => controller.buscarPorTipo(req, res, next));
router.post('/', authMiddleware, soloEditores, (req, res, next) => controller.crear(req, res, next));
router.put('/por-pagina', authMiddleware, soloEditores, (req, res, next) => controller.actualizar(req, res, next));
router.delete('/por-pagina', authMiddleware, soloEditores, (req, res, next) => controller.eliminar(req, res, next));

export default router;