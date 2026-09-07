import { test } from '@playwright/test';

const BASE = 'https://automarket-maroc.vercel.app/dashboard';

async function login(page) {
  await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle' });

  await page.fill('#email', process.env.AM_ADMIN_EMAIL);
  await page.fill('#password', process.env.AM_ADMIN_PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForURL(/dashboard\/dashboard\.html/, {
    timeout: 15000
  });
}

test('Inspect Header DOM precisely', async ({ page }) => {
  await login(page);

  for (const file of [
    'dashboard.html',
    'cars.html',
    'messages.html',
    'settings.html'
  ]) {
    await page.goto(`${BASE}/${file}`, {
      waitUntil: 'networkidle'
    });

    console.log(`\n========== ${file} ==========`);

    const results = await page.locator('body *').evaluateAll(elements =>
      elements
        .filter(e => {
          const text = (e.innerText || '').trim();
          return ['AM', 'Admin', 'Operations', 'AR', 'FR', 'EN'].includes(text);
        })
        .map(e => ({
          tag: e.tagName,
          id: e.id,
          class: typeof e.className === 'string' ? e.className : '',
          role: e.getAttribute('role'),
          aria: e.getAttribute('aria-label'),
          parent: e.parentElement
            ? {
                tag: e.parentElement.tagName,
                id: e.parentElement.id,
                class:
                  typeof e.parentElement.className === 'string'
                    ? e.parentElement.className
                    : ''
              }
            : null,
          html: e.outerHTML.slice(0, 1000)
        }))
    );

    console.log('PROFILE/LANGUAGE ELEMENTS:');
    console.dir(results, { depth: null });

    const notifications = page.locator(
      'button.icon-button[aria-label="Notifications"]'
    );

    console.log(
      'NOTIFICATION BUTTON HTML:',
      await notifications.first().evaluate(e => e.outerHTML)
    );

    await notifications.first().click();
    await page.waitForTimeout(500);

    console.log(
      'BODY AFTER NOTIFICATION CLICK:',
      (await page.locator('body').innerText()).slice(0, 5000)
    );
  }
});