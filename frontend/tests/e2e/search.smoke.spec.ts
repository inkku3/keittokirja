import { test, expect } from '@playwright/test';

// E2E smoke: search live update, result ordering, and tag-filter behavior
// Requirements: frontend dev server running (baseURL from playwright.config or E2E_BASE_URL)

const BASE = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';

const FULL_LIST = [
  { id: '1', title: 'Apple Pie', created_at: '', updated_at: '' },
  { id: '2', title: 'Banana Bread', created_at: '', updated_at: '' },
  { id: '3', title: 'Carrot Soup', created_at: '', updated_at: '' },
];

const FILTERED_A = [
  { id: '1', title: 'Apple Pie', created_at: '', updated_at: '' },
  { id: '4', title: 'Apricot Jam', created_at: '', updated_at: '' },
];

const FILTER_BY_TAG_CHICKEN = [
  { id: '10', title: 'Chicken Curry', created_at: '', updated_at: '' },
  { id: '11', title: 'Chicken Soup', created_at: '', updated_at: '' },
];

test.describe('Search smoke e2e', () => {
  test('initial load shows full list in expected ordering, typing updates live, and tag filter triggers API', async ({ page, baseURL }) => {
    const base = baseURL?.toString() ?? BASE;

    // Intercept /api/search and return deterministic responses based on query
    await page.route('**/api/search**', (route) => {
      const url = new URL(route.request().url());
      const q = url.searchParams.get('q');
      // If no query param => initial full list
      if (!q) {
        void route.fulfill({ status: 200, body: JSON.stringify(FULL_LIST), headers: { 'Content-Type': 'application/json' } });
        return;
      }

      // q present -> if contains 'a' return FILTERED_A, else empty
      if (q.toLowerCase().includes('a')) {
        void route.fulfill({ status: 200, body: JSON.stringify(FILTERED_A), headers: { 'Content-Type': 'application/json' } });
      } else {
        void route.fulfill({ status: 200, body: JSON.stringify([]), headers: { 'Content-Type': 'application/json' } });
      }
    });

    // Capture whether filter API was called and record params
    let lastFilterRequest: { tags?: string } | null = null;
    await page.route('**/api/recipes/filter**', async (route) => {
      const req = route.request();
      // The client sends tags as query param or in params object; inspect URL
      const url = new URL(req.url());
      lastFilterRequest = { tags: url.searchParams.get('tags') ?? undefined };
      void route.fulfill({ status: 200, body: JSON.stringify(FILTER_BY_TAG_CHICKEN), headers: { 'Content-Type': 'application/json' } });
    });

    // Go to home page
    await page.goto(base, { waitUntil: 'networkidle' });

    // Wait for initial search input to be enabled and results visible
    const input = page.locator('#search');
    await expect(input).toHaveCount(1);
    await expect(input).toBeEnabled();

    // Ensure initial results (FULL_LIST) show in order
    const anchors = page.locator('#recipes a');
    await expect(anchors).toHaveCount(FULL_LIST.length);

    const texts = await anchors.allTextContents();
    expect(texts).toEqual(FULL_LIST.map((r) => r.title));

    // Type query 'a' and assert live update semantics (results update)
    await input.fill('a');

    // Wait for updated results to be visible
    await expect(page.locator('#recipes a')).toHaveCount(FILTERED_A.length);
    const textsAfter = await page.locator('#recipes a').allTextContents();
    expect(textsAfter).toEqual(FILTERED_A.map((r) => r.title));

    // Now open filter dropdown and select 'kana' (chicken)
    const filterBtn = page.locator('button', { hasText: 'Suodata' });
    await filterBtn.click();

    // Click the 'kana' filter button (label text 'kana')
    const chickenBtn = page.locator('button', { hasText: 'kana' });
    await expect(chickenBtn).toBeVisible();
    await chickenBtn.click();

    // Filter dropdown should show count on the dropbtn (e.g., 'Suodata (1)')
    await expect(filterBtn).toHaveText(/Suodata\s*\(1\)/);

    // Assert that filter API was called with tags param containing 'chicken'
    await page.waitForTimeout(100); // allow debounce/network
    expect(lastFilterRequest).not.toBeNull();
    expect(lastFilterRequest?.tags).toContain('chicken');

    // Optionally verify that filtered-by-tag results are available from the filter API response
    // (FilterManager does not automatically render those in the main view, but we validated the API and UI selection)
  });
});
