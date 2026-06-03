import SearchService from '../services/searchService.js';
import { success, fail } from '../utils/responseHelper.js';

class SearchController {
  constructor() {
    this.searchService = new SearchService();
  }

  async search(req, res, next) {
    try {
      const { q, scope = 'all' } = req.query;

      if (!q || typeof q !== 'string') {
        return fail(res, { message: 'El parámetro "q" es obligatorio y debe ser un string.' });
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
        return fail(res, { message: `El parámetro "scope" debe ser uno de: ${validScopes.join(', ')}.` });
      }

      const userContext = req.user
        ? {
            tipo: req.user.tipo,
            proyectosPermitidos: req.user.proyectos || [],
          }
        : { tipo: null, proyectosPermitidos: [] };

      const results = await this.searchService.search(q, scope, userContext);
      return success(res, results);

    } catch (error) {
      console.error('Error en searchController.search:', error);
      return fail(res, { message: 'Ocurrió un error interno en el servidor.', statusCode: 500 });
    }
  }
}

const searchController = new SearchController();

export { searchController };
export default SearchController;
