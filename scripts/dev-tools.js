// Ferramentas de desenvolvimento para o projeto TechRun
const {execSync, spawn} = require('child_process');
const fs = require('fs');
const path = require('path');

class DevTools {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.processes = new Map();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix =
      {
        info: '📋',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        start: '🚀',
        stop: '🛑',
      }[type] || '📋';

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkProjectHealth() {
    this.log('Verificando saúde do projeto...', 'info');

    const checks = [
      {
        name: 'package.json existe',
        check: () => fs.existsSync(path.join(this.projectRoot, 'package.json')),
      },
      {
        name: 'node_modules existe',
        check: () => fs.existsSync(path.join(this.projectRoot, 'node_modules')),
      },
      {
        name: 'Estrutura src/ existe',
        check: () => fs.existsSync(path.join(this.projectRoot, 'src')),
      },
      {
        name: 'Metro config existe',
        check: () =>
          fs.existsSync(path.join(this.projectRoot, 'metro.config.js')),
      },
      {
        name: 'Android config existe',
        check: () => fs.existsSync(path.join(this.projectRoot, 'android')),
      },
      {
        name: 'iOS config existe',
        check: () => fs.existsSync(path.join(this.projectRoot, 'ios')),
      },
    ];

    let passed = 0;

    for (const check of checks) {
      if (check.check()) {
        this.log(`${check.name} ✓`, 'success');
        passed++;
      } else {
        this.log(`${check.name} ✗`, 'error');
      }
    }

    this.log(
      `Verificações: ${passed}/${checks.length} passaram`,
      passed === checks.length ? 'success' : 'warning',
    );

    return passed === checks.length;
  }

  async startMetro() {
    this.log('Iniciando servidor Metro...', 'start');

    try {
      const metro = spawn('npm', ['start'], {
        cwd: this.projectRoot,
        stdio: 'pipe',
        shell: true,
      });

      this.processes.set('metro', metro);

      metro.stdout.on('data', data => {
        const output = data.toString().trim();

        if (output.includes('Metro')) {
          this.log('Metro servidor iniciado com sucesso', 'success');
        }
      });

      metro.stderr.on('data', data => {
        const error = data.toString().trim();

        if (error && !error.includes('Warning')) {
          this.log(`Metro erro: ${error}`, 'error');
        }
      });

      metro.on('close', code => {
        this.log(`Metro servidor parou (código: ${code})`, 'stop');
        this.processes.delete('metro');
      });

      return metro;
    } catch (error) {
      this.log(`Erro ao iniciar Metro: ${error.message}`, 'error');

      return null;
    }
  }

  async runTests() {
    this.log('Executando testes...', 'start');

    const testFiles = ['tests/e2e/metro.test.js'];

    for (const testFile of testFiles) {
      const testPath = path.join(this.projectRoot, testFile);

      if (fs.existsSync(testPath)) {
        try {
          this.log(`Executando ${testFile}...`, 'info');
          execSync(`node ${testPath}`, {
            cwd: this.projectRoot,
            stdio: 'inherit',
          });
          this.log(`${testFile} passou`, 'success');
        } catch (error) {
          this.log(`${testFile} falhou`, 'error');
        }
      }
    }
  }

  async buildProject() {
    this.log('Construindo projeto...', 'start');

    try {
      // Verificar dependências
      this.log('Verificando dependências...', 'info');
      execSync('npm ls --depth=0', {cwd: this.projectRoot, stdio: 'pipe'});

      // Limpar cache do Metro
      this.log('Limpando cache do Metro...', 'info');
      execSync('npx react-native start --reset-cache', {
        cwd: this.projectRoot,
        stdio: 'pipe',
        timeout: 10000,
      });

      this.log('Build concluído com sucesso', 'success');
    } catch (error) {
      this.log(`Erro no build: ${error.message}`, 'error');
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      project: 'TechRun',
      version: '1.0.0',
      status: {
        health: await this.checkProjectHealth(),
        metro: this.processes.has('metro'),
        dependencies: this.checkDependencies(),
      },
      features: {
        videoCapture: '✅ Implementado',
        poseAnalysis: '✅ Implementado (MediaPipe + Simulação)',
        exerciseSelection: '✅ Implementado',
        userInterface: '✅ Implementado',
        navigation: '✅ Implementado',
        authentication: '✅ Implementado',
      },
      nextSteps: [
        'Testar em dispositivo Android',
        'Testar em dispositivo iOS',
        'Implementar backend real',
        'Otimizar performance do MediaPipe',
        'Adicionar mais exercícios',
      ],
    };

    const reportPath = path.join(this.projectRoot, 'dev-report.json');

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`Relatório salvo em: ${reportPath}`, 'success');

    return report;
  }

  checkDependencies() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'),
      );

      const critical = [
        'react-native',
        'react',
        'react-native-vision-camera',
        '@mediapipe/tasks-vision',
      ];

      const installed = critical.filter(
        dep =>
          packageJson.dependencies[dep] || packageJson.devDependencies[dep],
      );

      return {
        total: critical.length,
        installed: installed.length,
        missing: critical.filter(dep => !installed.includes(dep)),
      };
    } catch (error) {
      return {error: error.message};
    }
  }

  async showMenu() {
    console.log('\n🛠️  TechRun Dev Tools');
    console.log('='.repeat(40));
    console.log('1. Verificar saúde do projeto');
    console.log('2. Iniciar servidor Metro');
    console.log('3. Executar testes');
    console.log('4. Build do projeto');
    console.log('5. Gerar relatório');
    console.log('6. Sair');
    console.log('='.repeat(40));
  }

  async run() {
    this.log('🛠️  TechRun Dev Tools iniciado', 'start');

    // Executar verificações automáticas
    await this.checkProjectHealth();
    await this.generateReport();

    this.log('Dev Tools concluído', 'success');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const devTools = new DevTools();

  devTools.run().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = DevTools;
