import { test, expect } from '@playwright/test';

// Headless smoke tests for recipe detail page
// Require: frontend served (E2E_BASE_URL or default http://127.0.0.1:8001)

const BASE = process.env.E2E_BASE_URL || 'http://127.0.0.1:8001';

test.describe('Legacy recipe detail smoke', () => {
  test('renders header and ingredients pre', async ({ page }) => {
    await page.goto(`${BASE}/recipe/smoke1`, { waitUntil: 'networkidle' });

    // #header must exist and contain some non-empty text
    const header = page.locator('#header');
    await expect(header).toBeVisible();
    const headerText = (await header.textContent()) || '';
    expect(headerText.trim().length).toBeGreaterThan(0);

    // Ingredients area should contain a <pre> or at least non-empty text
    const ingredientsPre = page.locator('#ingredients pre');
    if (await ingredientsPre.count() > 0) {
      await expect(ingredientsPre).toBeVisible();
      const ingText = (await ingredientsPre.textContent()) || '';
      expect(ingText.trim().length).toBeGreaterThan(0);
    } else {
      // fallback: #ingredients element exists and has non-empty text
      const ing = page.locator('#ingredients');
      await expect(ing).toBeVisible();
      const ingText = (await ing.textContent()) || '';
      expect(ingText.trim().length).toBeGreaterThan(0);
    }
  });

  test('image fallback: when all image sources 404, #image is removed', async ({ page }) => {
    // Intercept image requests and force 404 so client will cycle through candidates and finally hide the img
    await page.route('**/*recipes/img*', route => route.fulfill({ status: 404, body: '' }));
    await page.route('**/*/fallback.png', route => route.fulfill({ status: 404, body: '' }));

    await page.goto(`${BASE}/recipe/smoke1`, { waitUntil: 'networkidle' });

    // Wait briefly to allow client-side image error handlers to run
    await page.waitForTimeout(500);

    const img = page.locator('#image');
    // Expect image element not to exist after all fallback attempts fail
    expect(await img.count()).toBe(0);
  });
});
