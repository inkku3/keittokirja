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

export const recipeAPI = {
  // List all recipes
  listAll: async (sortBy = 'title', order = 'asc'): Promise<Recipe[]> => {
    const response = await api.get('/api/recipes/', { params: { sort_by: sortBy, order } });
    return response.data;
  },

  // Search recipes by title
  search: async (query: string): Promise<Recipe[]> => {
    const response = await api.get('/api/recipes/search', { params: { q: query } });
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
