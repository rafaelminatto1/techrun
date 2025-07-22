// Script para testar a conexão frontend-backend do TechRun
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const BACKEND_URL = 'http://localhost:3000/api';
const TIMEOUT = 10000; // 10 segundos

console.log('🧪 FitAnalyzer Pro - Teste de Conexão Frontend/Backend');
console.log('='.repeat(60));

// Configurar axios
const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

const testResults = {
  backend: { status: 'pending', details: null },
  health: { status: 'pending', details: null },
  auth: { status: 'pending', details: null },
  videos: { status: 'pending', details: null },
  analysis: { status: 'pending', details: null },
  upload: { status: 'pending', details: null }
};

// Teste 1: Verificar se o backend está rodando
async function testBackendRunning() {
  console.log('\n1️⃣ Testando se o backend está rodando...');

  try {
    const response = await apiClient.get('/health');

    if (response.status === 200 && response.data.status === 'OK') {
      testResults.backend.status = 'success';
      testResults.backend.details = {
        status: response.data.status,
        uptime: response.data.uptime,
        version: response.data.version,
        environment: response.data.environment,
      };

      console.log('✅ Backend está rodando!');
      console.log(`   📊 Versão: ${response.data.version}`);
      console.log(`   🌍 Ambiente: ${response.data.environment}`);
      console.log(`   ⏱️ Uptime: ${Math.round(response.data.uptime)}s`);

      return true;
    }

    throw new Error(
      `Backend retornou status inválido: ${response.data.status}`,

  } catch (error) {
    testResults.backend.status = 'error';
    testResults.backend.details = error.message;

    console.log(`❌ Backend não está respondendo: ${error.message}`);
    console.log(
      `   💡 Certifique-se de que o backend está rodando na porta 3000`,
    );
    console.log('   💡 Execute: cd backend && npm run dev');

    return false;
  }
}

// Teste 2: Health check detalhado
async function testHealthEndpoint() {
  console.log('\n2️⃣ Testando endpoint de health check...');

  try {
    const response = await apiClient.get('/health');

    testResults.health.status = 'success';
    testResults.health.details = response.data;

    console.log('✅ Health check passou!');
    console.log(`   📈 Status: ${response.data.status}`);
    console.log(`   🕒 Timestamp: ${response.data.timestamp}`);

    return true;
  } catch (error) {
    testResults.health.status = 'error';
    testResults.health.details = error.message;

    console.log(`❌ Health check falhou: ${error.message}`);

    return false;
  }
}

// Teste 3: Autenticação
async function testAuthentication() {
  console.log('\n3️⃣ Testando sistema de autenticação...');

  try {
    // Testar registro
    const testUser = {
      name: 'Teste Usuario',
      email: `teste${Date.now()}@techrun.com`,
      password: 'senha123456',
    };

    console.log('   📝 Testando registro...');
    const registerResponse = await apiClient.post('/auth/register', testUser);

    if (registerResponse.data.success && registerResponse.data.data.token) {
      console.log('   ✅ Registro funcionou!');

      const token = registerResponse.data.data.token;
      const user = registerResponse.data.data.user;

      // Testar login
      console.log('   🔐 Testando login...');
      const loginResponse = await apiClient.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      });

      if (loginResponse.data.success && loginResponse.data.data.token) {
        console.log('   ✅ Login funcionou!');

        // Configurar token para próximos testes
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

        testResults.auth.status = 'success';
        testResults.auth.details = {
          userId: user._id,
          userName: user.name,
          hasToken: !!token,
        };

        return token;
      }
    }

    throw new Error('Resposta de autenticação inválida');
  } catch (error) {
    testResults.auth.status = 'error';
    testResults.auth.details = error.response?.data?.message || error.message;

    console.log(
      `   ❌ Autenticação falhou: ${
        error.response?.data?.message || error.message
      }`,
    );

    return null;
  }
}

// Teste 4: API de vídeos
async function testVideoAPI() {
  console.log('\n4️⃣ Testando API de vídeos...');

  try {
    // Testar listagem de vídeos
    console.log('   📹 Testando listagem de vídeos...');
    const videosResponse = await apiClient.get('/videos');

    if (videosResponse.data.success) {
      console.log('   ✅ Listagem de vídeos funcionou!');
      console.log(
        `   📊 Vídeos encontrados: ${videosResponse.data.data.videos.length}`,

      testResults.videos.status = 'success';
      testResults.videos.details = {
        videosCount: videosResponse.data.data.videos.length,
        pagination: videosResponse.data.data.pagination,
      };

      return true;
    }

    throw new Error('Resposta da API de vídeos inválida');
  } catch (error) {
    testResults.videos.status = 'error';
    testResults.videos.details = error.response?.data?.message || error.message;

    console.log(
      `   ❌ API de vídeos falhou: ${
        error.response?.data?.message || error.message
      }`,
    );

    return false;
  }
}

// Teste 5: API de análises
async function testAnalysisAPI() {
  console.log('\n5️⃣ Testando API de análises...');

  try {
    // Testar listagem de análises
    console.log('   🔬 Testando listagem de análises...');
    const analysisResponse = await apiClient.get('/analysis/user/me');

    if (analysisResponse.data.success) {
      console.log('   ✅ Listagem de análises funcionou!');
      console.log(
        `   📊 Análises encontradas: ${analysisResponse.data.data.length}`,

      testResults.analysis.status = 'success';
      testResults.analysis.details = {
        analysisCount: analysisResponse.data.data.length,
      };

      return true;
    }

    throw new Error('Resposta da API de análises inválida');
  } catch (error) {
    testResults.analysis.status = 'error';
    testResults.analysis.details =
      error.response?.data?.message || error.message;

    console.log(
      `   ❌ API de análises falhou: ${
        error.response?.data?.message || error.message
      }`,
    );

    return false;
  }
}

// Teste 6: Simular upload de vídeo
async function testVideoUpload() {
  console.log('\n6️⃣ Testando upload de vídeo (simulado)...');

  try {
    // Criar arquivo de teste simples
    const testVideoContent = Buffer.from('fake video content for testing');

    const FormData = require('form-data');
    const formData = new FormData();

    formData.append('video', testVideoContent, {
      filename: 'test-video.mp4',
      contentType: 'video/mp4',
    });
    formData.append('exerciseType', 'squat');
    formData.append(
      'metadata',
      JSON.stringify({
        originalSize: testVideoContent.length,
        format: 'mp4',
        deviceInfo: {platform: 'test'},
      }),

    console.log('   📤 Simulando upload...');

    const uploadResponse = await apiClient.post('/videos/upload', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30s para upload
    });

    if (uploadResponse.data.success) {
      console.log('   ✅ Upload de vídeo funcionou!');
      console.log(`   📁 Video ID: ${uploadResponse.data.data.video.id}`);
      console.log(`   📊 Tamanho: ${uploadResponse.data.data.video.size}`);

      testResults.upload.status = 'success';
      testResults.upload.details = {
        videoId: uploadResponse.data.data.video.id,
        filename: uploadResponse.data.data.video.filename,
        size: uploadResponse.data.data.video.size,
        status: uploadResponse.data.data.video.status,
      };

      return uploadResponse.data.data.video.id;
    }

    throw new Error('Resposta de upload inválida');
  } catch (error) {
    testResults.upload.status = 'error';
    testResults.upload.details = error.response?.data?.message || error.message;

    console.log(
      `   ❌ Upload falhou: ${error.response?.data?.message || error.message}`,
    );

    return null;
  }
}

// Gerar relatório
async function generateReport() {
  console.log(`\n${  '='.repeat(60)}`);
  console.log('📋 RELATÓRIO DE TESTES');
  console.log('='.repeat(60));

  const tests = [
    {name: 'Backend Running', result: testResults.backend},
    {name: 'Health Check', result: testResults.health},
    {name: 'Authentication', result: testResults.auth},
    {name: 'Video API', result: testResults.videos},
    {name: 'Analysis API', result: testResults.analysis},
    {name: 'Video Upload', result: testResults.upload},
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    const icon =
      test.result.status === 'success'
        ? '✅'
        : test.result.status === 'error'
        ? '❌'
        : '⏳';

    console.log(`${icon} ${test.name}: ${test.result.status.toUpperCase()}`);

    if (test.result.status === 'success') {passed++;}
    else if (test.result.status === 'error') {failed++;}
  });

  console.log(`\n${  '-'.repeat(40)}`);
  console.log(`📊 Resultado: ${passed}/${tests.length} testes passaram`);
  console.log(`✅ Sucessos: ${passed}`);
  console.log(`❌ Falhas: ${failed}`);

  // Salvar relatório em arquivo
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: tests.length,
      passed,
      failed,
      passRate: Math.round((passed / tests.length) * 100),
    },
    tests: testResults,
    backendUrl: BACKEND_URL,
  };

  try {
    await fs.writeFile(
      path.join(__dirname, 'connection-test-report.json'),
      JSON.stringify(reportData, null, 2),
    );
    console.log('\n💾 Relatório salvo em: connection-test-report.json');
  } catch (error) {
    console.log('\n⚠️ Não foi possível salvar o relatório:', error.message);
  }

  // Recomendações
  console.log('\n💡 RECOMENDAÇÕES:');

  if (testResults.backend.status === 'error') {
    console.log('   🔧 Iniciar o backend: cd backend && npm run dev');
  }

  if (testResults.auth.status === 'error') {
    console.log('   🔧 Verificar configuração de JWT no backend');
  }

  if (passed === tests.length) {
    console.log('   🎉 Todos os testes passaram! Sistema pronto para uso.');
  } else {
    console.log(
      `   ⚠️ ${failed} teste(s) falharam. Verifique as configurações.`,
    );
  }

  console.log(`\n${  '='.repeat(60)}`);

  return passed === tests.length;
}

// Executar todos os testes
async function runAllTests() {
  console.log(`🔗 Testando conexão com: ${BACKEND_URL}`);
  console.log(`⏱️ Timeout: ${TIMEOUT}ms\n`);

  try {
    // Executar testes em sequência
    const backendRunning = await testBackendRunning();

    if (backendRunning) {
      await testHealthEndpoint();

      const authToken = await testAuthentication();

      if (authToken) {
        await testVideoAPI();
        await testAnalysisAPI();
        await testVideoUpload();
      } else {
        console.log(
          '\n⚠️ Pulando testes autenticados devido à falha na autenticação',
        );
      }
    } else {
      console.log('\n⚠️ Pulando testes restantes devido à falha do backend');
    }

    // Gerar relatório final
    const allPassed = await generateReport();

    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Erro inesperado durante os testes:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testResults,
};
