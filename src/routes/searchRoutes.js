// src/routes/searchRoutes.js
import express from 'express';
import { searchController } from '../controllers/searchController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// OJO: aquí solo '/', porque en app.js ya haces app.use('/search', searchRoutes)
router.get('/', authMiddleware, (req, res, next) =>
  searchController.search(req, res, next)
);

export default router;
