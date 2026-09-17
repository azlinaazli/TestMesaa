const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 8000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports', open: 'never' }],
  ],
  use: {
    baseURL: 'https://dev.mesaaempire.co',
    headless: false,
    viewport: { width: 1400, height: 800 },
    screenshot: 'only-on-failure',
    video: 'off',
    channel: 'chrome',
  },
});
