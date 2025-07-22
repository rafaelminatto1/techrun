// Teste E2E para validar o servidor Metro do React Native
const config = require('./puppeteer.config');

class MetroTester {
  constructor() {
    this.config = config;
    this.results = {
      passed: 0,
      failed: 0,
      tests: [],
    };
  }

  async runTest(name, testFn) {
    console.log(`🧪 Executando: ${name}`);
    try {
      await testFn();
      this.results.passed++;
      this.results.tests.push({name, status: 'PASSED'});
      console.log(`✅ ${name} - PASSOU`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({name, status: 'FAILED', error: error.message});
      console.log(`❌ ${name} - FALHOU: ${error.message}`);
    }
  }

  async testMetroServer() {
    await this.runTest('Metro Server Accessibility', async () => {
      const response = await fetch(this.config.urls.metro);

      if (!response.ok) {
        throw new Error(`Metro server não acessível: ${response.status}`);
      }
    });
  }

  async testMetroContent() {
    await this.runTest('Metro Content Validation', async () => {
      const response = await fetch(this.config.urls.metro);
      const text = await response.text();

      if (!text.includes('React Native')) {
        throw new Error('Conteúdo do Metro não contém "React Native"');
      }

      if (!text.includes('Metro')) {
        throw new Error('Conteúdo não contém referência ao Metro');
      }
    });
  }

  async testDebuggerEndpoint() {
    await this.runTest('Debugger Endpoint', async () => {
      const response = await fetch(this.config.urls.debugger);

      if (!response.ok) {
        throw new Error(`Debugger endpoint não acessível: ${response.status}`);
      }
    });
  }

  async runAllTests() {
    console.log('🚀 Iniciando testes do Metro Server...');
    console.log('='.repeat(50));

    await this.testMetroServer();
    await this.testMetroContent();
    await this.testDebuggerEndpoint();

    console.log('='.repeat(50));
    console.log('📊 Resultados dos Testes:');
    console.log(`✅ Passou: ${this.results.passed}`);
    console.log(`❌ Falhou: ${this.results.failed}`);
    console.log(
      `📈 Taxa de Sucesso: ${(
        (this.results.passed / (this.results.passed + this.results.failed)) *
        100
      ).toFixed(1)}%`,

    if (this.results.failed > 0) {
      console.log('\n🔍 Testes que falharam:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }

    return this.results;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new MetroTester();

  tester
    .runAllTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Erro fatal nos testes:', error);
      process.exit(1);
    });
}

module.exports = MetroTester;
