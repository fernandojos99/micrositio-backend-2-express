// controllers/searchController.js
const { searchService } = require('../services/searchService');

const searchController = {
  async search(req, res) {
    try {
      const { q, scope = 'all' } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El parámetro "q" es obligatorio y debe ser un string.',
        });
      }

      const validScopes = [
        'proyectos',
        'agentes',
        'prompts',
        'secuencias',
        'testing_cards',
        'learning_cards',
        'documentos',
        'all',
      ];

      if (scope && !validScopes.includes(scope)) {
        return res.status(400).json({
          success: false,
          message: `El parámetro "scope" debe ser uno de: ${validScopes.join(', ')}.`,
        });
      }

      // 👇 contexto de usuario para permisos
      const userContext = {
        tipo: req.user?.tipo,
        proyectosPermitidos: req.user?.proyectos || null, // VISITANTE
      };

      const results = await searchService.search(q, scope, userContext);

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error('Error en searchController.search:', error);
      return res.status(500).json({
        success: false,
        message: 'Ocurrió un error interno en el servidor.',
      });
    }
  },
};

module.exports = { searchController };
