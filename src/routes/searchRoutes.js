// routes/searchRoutes.js
import express from 'express';
import { searchController } from '../controllers/searchController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/search', authMiddleware, searchController.search);

export default router;
