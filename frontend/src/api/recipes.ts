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

function isObject(v: any): v is Record<string, any> {
  return v !== null && typeof v === 'object';
}

function validateRecipe(item: any): asserts item is Recipe {
  if (!isObject(item)) throw new TypeError('Recipe is not an object');
  if (typeof item.id !== 'string') throw new TypeError('Recipe.id missing or not a string');
  if (typeof item.title !== 'string') throw new TypeError('Recipe.title missing or not a string');
  if (typeof item.ingredients !== 'string') throw new TypeError('Recipe.ingredients missing or not a string');
  if (typeof item.instructions !== 'string') throw new TypeError('Recipe.instructions missing or not a string');
  // created_at/updated_at may be optional on some backends, but if present should be strings
  if (item.created_at != null && typeof item.created_at !== 'string') throw new TypeError('Recipe.created_at not a string');
  if (item.updated_at != null && typeof item.updated_at !== 'string') throw new TypeError('Recipe.updated_at not a string');
}

function validateLegacyListItem(item: any): LegacyListItem {
  if (!isObject(item)) throw new TypeError('Legacy list item is not an object');

  // Accept either legacy shape (name + url) or full recipe object (title + id)
  if (typeof item.name === 'string' && typeof item.url === 'string') {
    return { name: item.name, url: item.url, image_path: item.image_path };
  }

  if (typeof item.title === 'string' && (typeof item.id === 'string' || typeof item.id === 'number')) {
    return { name: item.title, url: `recipes/${item.id}`, image_path: item.image_path };
  }

  throw new TypeError('Legacy list item missing name/url or title/id');
}

function validateSearchItem(item: any): asserts item is LegacySearchItem {
  if (!isObject(item)) throw new TypeError('Search item is not an object');
  if (typeof item.name !== 'string' || typeof item.url !== 'string') {
    throw new TypeError('Search item missing required fields: name or url');
  }
}

function logMalformed(context: string, data: any, err?: unknown) {
  // Structured log to aid diagnostics without exposing sensitive info
  console.error(`[API VALIDATION] ${context}`, { data, error: err });
}

export const recipeAPI = {
  // List all recipes (full recipe objects)
  listAll: async (sortBy = 'title', order = 'asc'): Promise<Recipe[]> => {
    const response = await api.get('/api/recipes/', { params: { sort_by: sortBy, order } });
    const data = response.data;
    if (!Array.isArray(data)) {
      logMalformed('listAll: expected array', data);
      throw new TypeError('Invalid response from server');
    }
    try {
      return data.map((it: any) => {
        validateRecipe(it);
        return it as Recipe;
      });
    } catch (err) {
      logMalformed('listAll: malformed recipe item', data, err);
      throw err;
    }
  },

  // Legacy list endpoint that returns simple { name, url, image_path } items
  listLegacy: async (): Promise<LegacyListItem[]> => {
    const response = await api.get('/api/recipes/');
    const data = response.data;
    if (!Array.isArray(data)) {
      logMalformed('listLegacy: expected array', data);
      throw new TypeError('Invalid response from server');
    }
    try {
      return data.map((it: any) => validateLegacyListItem(it));
    } catch (err) {
      logMalformed('listLegacy: malformed legacy item', data, err);
      throw err;
    }
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
    const data = response.data;
    if (!Array.isArray(data)) {
      logMalformed('filterByTags: expected array', data);
      throw new TypeError('Invalid response from server');
    }
    try {
      return data.map((it: any) => {
        validateRecipe(it);
        return it as Recipe;
      });
    } catch (err) {
      logMalformed('filterByTags: malformed recipe item', data, err);
      throw err;
    }
  },

  // Get random recipe
  getRandom: async (): Promise<Recipe> => {
    const response = await api.get('/api/recipes/random');
    const data = response.data;
    try {
      validateRecipe(data);
      return data as Recipe;
    } catch (err) {
      logMalformed('getRandom: malformed recipe', data, err);
      throw err;
    }
  },

  // Get recipe by ID
  getById: async (id: string): Promise<Recipe> => {
    const response = await api.get(`/api/recipes/${id}`);
    const data = response.data;
    try {
      validateRecipe(data);
      return data as Recipe;
    } catch (err) {
      logMalformed(`getById ${id}: malformed recipe`, data, err);
      throw err;
    }
  },
};
