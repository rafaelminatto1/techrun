// Configuração para testes E2E com Puppeteer
module.exports = {
  // Configurações do navegador
  launchOptions: {
    headless: false, // Mostrar navegador durante desenvolvimento
    devtools: false,
    defaultViewport: {
      width: 375,
      height: 812, // Simular iPhone X
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--allow-running-insecure-content',
    ],
  },

  // URLs de teste
  urls: {
    metro: 'http://localhost:8081',
    debugger: 'http://localhost:8081/debugger-ui',
  },

  // Timeouts
  timeouts: {
    navigation: 30000,
    element: 5000,
    screenshot: 10000,
  },

  // Configurações de screenshot
  screenshot: {
    path: './tests/screenshots',
    fullPage: true,
    quality: 90,
  },

  // Seletores comuns
  selectors: {
    metroStatus: 'body',
    debuggerButton: 'a[href="/debugger-ui"]',
    reloadButton: 'button[title="Reload"]',
  },
};
