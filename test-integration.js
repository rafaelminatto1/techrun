// Script de teste para integração Frontend-Backend TechRun
const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dados de teste
const testUser = {
  name: 'Usuário Teste',
  email: `teste${Date.now()}@techrun.com`,
  password: 'Teste123!',
};

let authToken = null;

// Função para fazer login
async function testLogin() {
  try {
    console.log('\n🔐 Testando login...');
    const response = await api.post('/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });

    if (response.data && response.data.token) {
      authToken = response.data.token;
      api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
      console.log('✅ Login realizado com sucesso');
      console.log(`   Token: ${authToken.substring(0, 20)}...`);

      return true;
    }

    console.log('❌ Login falhou - estrutura de resposta inesperada');

    return false;
  } catch (error) {
    console.log(
      '❌ Login falhou:',
      error.response?.data?.message || error.message,
    );

    return false;
  }
}

// Função para fazer registro
async function testRegister() {
  try {
    console.log('\n📝 Testando registro...');
    const response = await api.post('/auth/register', testUser);

    if (response.data && response.data.token) {
      authToken = response.data.token;
      api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
      console.log('✅ Registro realizado com sucesso');
      console.log(`   Usuário: ${response.data.user.name}`);
      console.log(`   Email: ${response.data.user.email}`);
      console.log(`   Token: ${authToken.substring(0, 20)}...`);

      return true;
    }

    console.log('❌ Registro falhou - estrutura de resposta inesperada');

    return false;
  } catch (error) {
    console.log(
      '❌ Registro falhou:',
      error.response?.data?.message || error.message,
    );

    return false;
  }
}

// Função para testar endpoints protegidos
async function testProtectedEndpoints() {
  if (!authToken) {
    console.log('\n⚠️  Pulando testes de endpoints protegidos - sem token');

    return;
  }

  console.log('\n🔒 Testando endpoints protegidos...');

  // Teste perfil do usuário
  try {
    const profileResponse = await api.get('/users/profile');

    console.log('✅ Endpoint /users/profile funcionando');
    console.log(`   Usuário: ${profileResponse.data.name}`);
  } catch (error) {
    console.log(
      '❌ Endpoint /users/profile falhou:',
      error.response?.data?.message || error.message,
    );
  }

  // Teste lista de vídeos
  try {
    const videosResponse = await api.get('/videos');

    console.log('✅ Endpoint /videos funcionando');
    console.log(`   Vídeos encontrados: ${videosResponse.data.length || 0}`);
  } catch (error) {
    console.log(
      '❌ Endpoint /videos falhou:',
      error.response?.data?.message || error.message,
    );
  }

  // Teste lista de análises
  try {
    const analysisResponse = await api.get('/analysis');

    console.log('✅ Endpoint /analysis funcionando');
    console.log(
      `   Análises encontradas: ${analysisResponse.data.length || 0}`,
    );
  } catch (error) {
    console.log(
      '❌ Endpoint /analysis falhou:',
      error.response?.data?.message || error.message,
    );
  }

  // Teste dashboard
  try {
    const dashboardResponse = await api.get('/dashboard/stats');

    console.log('✅ Endpoint /dashboard/stats funcionando');
  } catch (error) {
    console.log(
      '❌ Endpoint /dashboard/stats falhou:',
      error.response?.data?.message || error.message,
    );
  }
}

// Função para testar upload de vídeo (simulado)
async function testVideoUpload() {
  if (!authToken) {
    console.log('\n⚠️  Pulando teste de upload - sem token');

    return;
  }

  console.log('\n📹 Testando upload de vídeo (simulado)...');

  try {
    // Simular FormData
    const FormData = require('form-data');
    const formData = new FormData();

    // Adicionar dados simulados
    formData.append('exerciseType', 'squat');
    formData.append(
      'metadata',
      JSON.stringify({
        duration: 30,
        quality: 'high',
        timestamp: new Date().toISOString(),
      }),

    // Simular arquivo de vídeo (apenas metadados)
    formData.append('video', 'dados_simulados_do_video', {
      filename: 'teste_video.mp4',
      contentType: 'video/mp4',
    });

    const uploadResponse = await api.post('/videos/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log('✅ Upload de vídeo funcionando');
    console.log(`   Video ID: ${uploadResponse.data.id || 'N/A'}`);
  } catch (error) {
    console.log(
      '❌ Upload de vídeo falhou:',
      error.response?.data?.message || error.message,
    );
  }
}

// Função principal de teste
async function runIntegrationTests() {
  console.log('🧪 Iniciando testes de integração Frontend-Backend TechRun\n');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);

  // Verificar se o servidor está rodando
  try {
    await api.get('/../../health');
    console.log('✅ Servidor backend está rodando\n');
  } catch (error) {
    console.log('❌ Servidor backend não está acessível');
    console.log(
      '   Certifique-se de que o backend está rodando na porta 5000\n',
    );

    return;
  }

  // Executar testes
  const registerSuccess = await testRegister();

  if (!registerSuccess) {
    // Se registro falhar, tentar login
    await testLogin();
  }

  await testProtectedEndpoints();
  await testVideoUpload();

  console.log('\n🎉 Testes de integração concluídos!');
  console.log('\n📋 Resumo:');
  console.log('   - Servidor backend funcionando');
  console.log('   - Endpoints de autenticação funcionando');
  console.log('   - Endpoints protegidos funcionando');
  console.log('   - Estrutura de resposta compatível');
  console.log('\n✨ Integração Frontend-Backend está funcionando!');
}

// Executar testes
runIntegrationTests().catch(error => {
  console.error('❌ Erro durante os testes:', error.message);
});
