import { test, expect } from '@playwright/test';

// Smoke test for legacy-parity recipe detail page
// Requires:
// - frontend dev server running (default http://localhost:3000) OR set baseURL in playwright.config.ts
// - a recipe with id 'r1' imported into backend (or adjust sampleId)

test.describe('Recipe detail legacy smoke', () => {
  test('loads /recipe/:id and shows header, ingredients <pre>, and image presence/fallback', async ({ page, baseURL }) => {
    const sampleId = process.env.E2E_SAMPLE_ID || 'r1';
    const url = baseURL ? `${baseURL}/recipe/${sampleId}` : `http://localhost:3000/recipe/${sampleId}`;

    await page.goto(url);

    // Header should render and contain non-empty text (legacy #header)
    const header = page.locator('#header');
    await expect(header).toBeVisible();
    const headerText = (await header.textContent()) || '';
    expect(headerText.trim().length).toBeGreaterThan(0);

    // Ingredients should render a <pre> inside #ingredients per legacy markup
    const ingredientsPre = page.locator('#ingredients pre');
    await expect(ingredientsPre).toHaveCount(1);
    await expect(ingredientsPre).toBeVisible();

    // Image element may be present or removed depending on fallback resolution
    const img = page.locator('#image');
    const count = await img.count();
    if (count === 0) {
      // Acceptable: image was removed after all fallbacks failed
      expect(count).toBe(0);
    } else {
      // If present, it should have a non-empty src and be visible
      await expect(img).toBeVisible();
      const src = await img.getAttribute('src');
      expect(src && src.length).toBeGreaterThan(0);
    }
  });
});
