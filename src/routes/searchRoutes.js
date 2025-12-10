import express from 'express';
import { searchController } from '../controllers/searchController.js';

const router = express.Router();

/**
 * @route GET /search
 * @desc Realiza una búsqueda general
 * @query {string} q - Texto de búsqueda
 * @query {string} scope - Alcance de la búsqueda (opcional)
 */
router.get('/', searchController.search);

export default router;