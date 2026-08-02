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

export interface LegacySearchItem {
  name: string;
  url: string;
  tags?: string;
  image_path?: string | null;
}

function validateSearchItem(item: any): asserts item is LegacySearchItem {
  if (!item || typeof item !== 'object') throw new TypeError('Search item is not an object');
  if (typeof item.name !== 'string' || typeof item.url !== 'string') {
    throw new TypeError('Search item missing required fields: name or url');
  }
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
  // Accepts params { q?, tags?, limit?, offset? } and optional AbortSignal
  search: async (
    params: { q?: string; tags?: string; limit?: number; offset?: number } = {},
    signal?: AbortSignal
  ): Promise<LegacySearchItem[]> => {
    try {
      const p: Record<string, any> = {};
      if (params.q) p.q = params.q;
      if (params.tags) p.tags = params.tags;
      if (typeof params.limit === 'number') p.limit = params.limit;
      if (typeof params.offset === 'number') p.offset = params.offset;

      const response = await api.get('/api/search', { params: p, signal });
      const data = response.data;

      if (!Array.isArray(data)) {
        console.error('Invalid search response shape', data);
        throw new TypeError('Invalid search response');
      }

      // Validate items and coerce shape
      const items: LegacySearchItem[] = data.map((it: any) => {
        try {
          validateSearchItem(it);
          return {
            name: it.name,
            url: it.url,
            tags: it.tags,
            image_path: it.hasOwnProperty('image_path') ? it.image_path : undefined,
          } as LegacySearchItem;
        } catch (err) {
          console.error('Malformed search item from API', it, err);
          throw err;
        }
      });

      return items;
    } catch (err: any) {
      // Log network or parsing errors for diagnostics
      console.error('Search API error', err);
      throw err;
    }
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
