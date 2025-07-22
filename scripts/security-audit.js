// Script para auditoria de segurança e correção de vulnerabilidades
const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

class SecurityAuditor {
  constructor() {
    this.vulnerabilities = [];
    this.fixes = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: '📋',
        success: '✅',
        warning: '⚠️',
        error: '❌',
      }[type] || '📋';

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runAudit() {
    this.log('Iniciando auditoria de segurança...', 'info');

    try {
      // Executar npm audit
      const auditResult = execSync('npm audit --json', {encoding: 'utf8'});
      const audit = JSON.parse(auditResult);

      this.log(
        `Vulnerabilidades encontradas: ${audit.metadata.vulnerabilities.total}`,
        'warning',
      );
      this.log(`Alto risco: ${audit.metadata.vulnerabilities.high}`, 'error');
      this.log(
        `Médio risco: ${audit.metadata.vulnerabilities.moderate}`,
        'warning',
      );
      this.log(`Baixo risco: ${audit.metadata.vulnerabilities.low}`, 'info');

      return audit;
    } catch (error) {
      this.log(`Erro ao executar auditoria: ${  error.message}`, 'error');

      return null;
    }
  }

  async attemptAutoFix() {
    this.log('Tentando correção automática...', 'info');

    try {
      // Tentar npm audit fix
      execSync('npm audit fix', {stdio: 'inherit'});
      this.log('Correção automática concluída', 'success');

      // Verificar se ainda há vulnerabilidades
      const postFixAudit = await this.runAudit();

      return postFixAudit;
    } catch (error) {
      this.log(`Correção automática falhou: ${  error.message}`, 'error');

      return null;
    }
  }

  async forceUpdate() {
    this.log(
      'Tentando atualização forçada de dependências críticas...',
      'warning',

    const criticalPackages = [
      '@react-native-community/cli',
      'react-native',
      '@react-native/metro-config',
    ];

    for (const pkg of criticalPackages) {
      try {
        this.log(`Atualizando ${pkg}...`, 'info');
        execSync(`npm update ${pkg}`, {stdio: 'inherit'});
        this.log(`${pkg} atualizado com sucesso`, 'success');
      } catch (error) {
        this.log(`Falha ao atualizar ${pkg}: ${error.message}`, 'error');
      }
    }
  }

  generateSecurityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      project: 'TechRun',
      status: 'completed',
      recommendations: [
        'Manter dependências atualizadas regularmente',
        'Executar npm audit semanalmente',
        'Considerar usar npm ci em produção',
        'Implementar verificações de segurança no CI/CD',
        'Revisar dependências antes de adicionar novas',
      ]
    };

    const reportPath = path.join(__dirname, '..', 'security-report.json');

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`Relatório de segurança salvo em: ${reportPath}`, 'success');
  }

  async run() {
    this.log('🔒 Iniciando Auditoria de Segurança TechRun', 'info');
    this.log('='.repeat(60), 'info');

    // Auditoria inicial
    const initialAudit = await this.runAudit();

    if (initialAudit && initialAudit.metadata.vulnerabilities.total > 0) {
      // Tentar correção automática
      await this.attemptAutoFix();

      // Auditoria pós-correção
      const finalAudit = await this.runAudit();

      if (finalAudit && finalAudit.metadata.vulnerabilities.high > 0) {
        this.log('Ainda existem vulnerabilidades de alto risco', 'warning');
        await this.forceUpdate();
      }
    }

    // Gerar relatório
    this.generateSecurityReport();

    this.log('='.repeat(60), 'info');
    this.log('🔒 Auditoria de Segurança Concluída', 'success');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const auditor = new SecurityAuditor();

  auditor.run().catch(error => {
    console.error('❌ Erro fatal na auditoria:', error);
    process.exit(1);
  });
}

module.exports = SecurityAuditor;
