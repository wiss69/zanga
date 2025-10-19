import { test, expect } from '@playwright/test';

test('discover flow happy path', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Découvrir' }).click();
  await expect(page.getByRole('heading', { name: 'Découvrir des produits à potentiel' })).toBeVisible();
  await page.getByPlaceholder('Nom de produit ou code HS').fill('850760');
  await expect(page.getByText('Tendances import/export')).toBeVisible();
  await page.getByRole('button', { name: 'Analyser' }).click();
  await expect(page.getByText('Top pays importateurs')).toBeVisible();
});
