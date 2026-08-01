import api from './client';

export interface Recipe {
  id: string;
  title: string;
  tags?: string;
  ingredients: string;
  instructions: string;
  info?: string;
  image_path?: string;
  created_at: string;
  updated_at: string;
}

export interface LegacyListItem {
  name: string;
  url: string;
  image_path?: string;
}

export const recipeAPI = {
  // List all recipes (full recipe objects)
  listAll: async (sortBy = 'title', order = 'asc'): Promise<Recipe[]> => {
    const response = await api.get('/api/recipes/', { params: { sort_by: sortBy, order } });
    return response.data;
  },

  // Legacy list endpoint that returns simple { name, url, image_path } items
  listLegacy: async (): Promise<LegacyListItem[]> => {
    const response = await api.get('/api/recipes/');
    return response.data as LegacyListItem[];
  },

  // Search recipes by title (legacy-compatible endpoint at /api/search)
  // Accepts optional params and AbortSignal in config
  search: async (query?: string, tags?: string, signal?: AbortSignal): Promise<Recipe[]> => {
    const params: Record<string, any> = {};
    if (query) params.q = query;
    if (tags) params.tags = tags;
    const response = await api.get('/api/search', { params, signal });
    return response.data;
  },

  // Filter recipes by tags
  filterByTags: async (tags: string): Promise<Recipe[]> => {
    const response = await api.get('/api/recipes/filter', { params: { tags } });
    return response.data;
  },

  // Get random recipe
  getRandom: async (): Promise<Recipe> => {
    const response = await api.get('/api/recipes/random');
    return response.data;
  },

  // Get recipe by ID
  getById: async (id: string): Promise<Recipe> => {
    const response = await api.get(`/api/recipes/${id}`);
    return response.data;
  },
};
