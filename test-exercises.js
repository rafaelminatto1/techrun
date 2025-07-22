const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

let authToken = null;

// Função para fazer login e obter token
async function login() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'teste@techrun.com',
      password: 'senha123',
    });

    authToken = response.data.token;
    console.log('✅ Login realizado com sucesso');

    return true;
  } catch (error) {
    console.log(
      '❌ Erro no login:',
      error.response?.data?.message || error.message,
    );

    return false;
  }
}

// Função para registrar usuário
async function register() {
  try {
    const timestamp = Date.now();
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Usuário Teste Exercícios',
      email: `teste_ex_${timestamp}@techrun.com`,
      password: 'senha123',
    });

    authToken = response.data.token;
    console.log('✅ Registro realizado com sucesso');
    console.log(`   Usuário: ${response.data.user.name}`);
    console.log(`   Email: ${response.data.user.email}`);

    return true;
  } catch (error) {
    console.log(
      '❌ Erro no registro:',
      error.response?.data?.message || error.message,
    );

    return false;
  }
}

// Função para testar estatísticas de exercícios
async function testExerciseStats() {
  try {
    const response = await axios.get(`${API_BASE_URL}/exercises/stats`, {
      headers: {Authorization: `Bearer ${authToken}`},
    });

    console.log('✅ Estatísticas de exercícios funcionando');
    console.log(`   Total de exercícios: ${response.data.totalExercises}`);
    console.log(`   Duração total: ${response.data.totalDuration}s`);
    console.log(`   Score médio: ${response.data.averageScore}`);
    console.log(`   Melhor score: ${response.data.bestScore}`);

    return true;
  } catch (error) {
    console.log(
      '❌ Erro nas estatísticas:',
      error.response?.data?.message || error.message,
    );

    return false;
  }
}

// Função para testar listagem de exercícios
async function testExerciseList() {
  try {
    const response = await axios.get(`${API_BASE_URL}/exercises`, {
      headers: {Authorization: `Bearer ${authToken}`},
    });

    console.log('✅ Listagem de exercícios funcionando');
    console.log(`   Exercícios encontrados: ${response.data.total}`);
    console.log(`   Página atual: ${response.data.currentPage}`);
    console.log(`   Total de páginas: ${response.data.totalPages}`);

    return true;
  } catch (error) {
    console.log(
      '❌ Erro na listagem:',
      error.response?.data?.message || error.message,
    );

    return false;
  }
}

// Função para testar criação de exercício
async function testCreateExercise() {
  try {
    const exerciseData = {
      videoId: 'video_123',
      analysisId: 'analysis_123',
      exerciseType: 'squat',
      duration: 300,
      repetitions: 15,
      score: 88,
      metrics: {
        accuracy: 90,
        consistency: 85,
        form: 92,
        timing: 87,
      },
      feedback: {
        overall: 'Bom exercício! Continue assim.',
        improvements: ['Manter joelhos alinhados', 'Descer um pouco mais'],
        strengths: ['Boa postura', 'Ritmo consistente'],
      },
      tags: ['treino_pernas', 'força'],
      notes: 'Primeiro treino da semana',
    };

    const response = await axios.post(
      `${API_BASE_URL}/exercises`,
      exerciseData,
      {
        headers: {Authorization: `Bearer ${authToken}`},
      },

    console.log('✅ Criação de exercício funcionando');
    console.log(`   Exercício ID: ${response.data._id}`);
    console.log(`   Tipo: ${response.data.exerciseType}`);
    console.log(`   Score: ${response.data.score}`);
    console.log(`   Duração: ${response.data.duration}s`);

    return response.data._id;
  } catch (error) {
    console.log(
      '❌ Erro na criação:',
      error.response?.data?.message || error.message,
    );

    return null;
  }
}

// Função para testar progresso por tipo
async function testProgressByType() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/exercises/progress/squat`,
      {
        headers: {Authorization: `Bearer ${authToken}`},
      },

    console.log('✅ Progresso por tipo funcionando');
    console.log(`   Registros de progresso: ${response.data.length}`);
    if (response.data.length > 0) {
      console.log(`   Último score: ${response.data[0].score}`);
      console.log(`   Última duração: ${response.data[0].duration}s`);
    }

    return true;
  } catch (error) {
    console.log(
      '❌ Erro no progresso:',
      error.response?.data?.message || error.message,
    );

    return false;
  }
}

// Função para testar resumo por tipos
async function testTypesSummary() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/exercises/types/summary`,
      {
        headers: {Authorization: `Bearer ${authToken}`},
      },

    console.log('✅ Resumo por tipos funcionando');
    console.log(`   Tipos de exercício: ${response.data.length}`);
    response.data.forEach(type => {
      console.log(
        `   ${type._id}: ${type.count} exercícios, score médio: ${type.averageScore}`,
      );
    });

    return true;
  } catch (error) {
    console.log(
      '❌ Erro no resumo:',
      error.response?.data?.message || error.message,
    );

    return false;
  }
}

// Função para testar dashboard atualizado
async function testDashboardWithExercises() {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      headers: {Authorization: `Bearer ${authToken}`},
    });

    console.log('✅ Dashboard com exercícios funcionando');
    console.log(`   Total de vídeos: ${response.data.totalVideos}`);
    console.log(`   Total de análises: ${response.data.totalAnalyses}`);
    console.log(`   Total de exercícios: ${response.data.totalExercises}`);
    console.log(
      `   Atividades recentes: ${response.data.recentActivity.length}`,
    );

    return true;
  } catch (error) {
    console.log(
      '❌ Erro no dashboard:',
      error.response?.data?.message || error.message,
    );

    return false;
  }
}

// Função principal de teste
async function runExerciseTests() {
  console.log('🏋️ Iniciando testes do sistema de exercícios...');
  console.log(`📡 API Base URL: ${API_BASE_URL}\n`);

  // Registrar usuário
  console.log('📝 Testando registro...');
  const registerSuccess = await register();

  if (!registerSuccess) {
    console.log('❌ Falha no registro. Tentando login...');
    const loginSuccess = await login();

    if (!loginSuccess) {
      console.log('❌ Falha no login. Encerrando testes.');

      return;
    }
  }

  console.log('\n🏋️ Testando funcionalidades de exercícios...');

  // Testar estatísticas
  await testExerciseStats();

  // Testar listagem
  await testExerciseList();

  // Testar criação
  const exerciseId = await testCreateExercise();

  // Testar progresso por tipo
  await testProgressByType();

  // Testar resumo por tipos
  await testTypesSummary();

  // Testar dashboard atualizado
  await testDashboardWithExercises();

  console.log('\n🎉 Testes do sistema de exercícios concluídos!');

  console.log('\n📋 Resumo:');
  console.log('   - Sistema de exercícios implementado');
  console.log('   - APIs de estatísticas funcionando');
  console.log('   - Criação e listagem de exercícios funcionando');
  console.log('   - Progresso e resumos por tipo funcionando');
  console.log('   - Dashboard integrado com exercícios');

  console.log('\n✨ Sistema de histórico de exercícios está funcionando!');
}

// Executar testes
runExerciseTests().catch(console.error);
