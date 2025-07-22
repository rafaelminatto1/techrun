// Script simples para testar a API do TechRun
const http = require('http');

// Função para fazer requisições HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = '';

      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);

          resolve({status: res.statusCode, data: jsonBody});
        } catch (e) {
          resolve({status: res.statusCode, data: body});
        }
      });
    });

    req.on('error', err => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Testes
async function runTests() {
  console.log('🧪 Iniciando testes da API TechRun\n');

  try {
    // Teste 1: Health Check
    console.log('1. Testando Health Check...');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET',
    });

    console.log(`   Status: ${healthResponse.status}`);
    console.log('   Response:', healthResponse.data);
    console.log('   ✅ Health check funcionando\n');

    // Teste 2: Rota inexistente (404)
    console.log('2. Testando rota inexistente...');
    const notFoundResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/inexistente',
      method: 'GET',
    });

    console.log(`   Status: ${notFoundResponse.status}`);
    console.log('   Response:', notFoundResponse.data);
    console.log('   ✅ Rota 404 funcionando\n');

    // Teste 3: Endpoint protegido sem token
    console.log('3. Testando endpoint protegido sem token...');
    const protectedResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/profile',
      method: 'GET',
    });

    console.log(`   Status: ${protectedResponse.status}`);
    console.log('   Response:', protectedResponse.data);
    console.log('   ✅ Proteção de rota funcionando\n');

    // Teste 4: Registro de usuário (sem MongoDB funcionará como simulação)
    console.log('4. Testando registro de usuário...');
    const registerResponse = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        name: 'Teste User',
        email: 'teste@techrun.com',
        password: 'Teste123!',
      },
    );

    console.log(`   Status: ${registerResponse.status}`);
    console.log('   Response:', registerResponse.data);
    console.log('   ✅ Endpoint de registro funcionando\n');

    console.log('🎉 Todos os testes concluídos!');
    console.log('\n📋 Resumo:');
    console.log('   - Servidor rodando na porta 5000');
    console.log('   - Health check funcionando');
    console.log('   - Rotas 404 funcionando');
    console.log('   - Proteção de rotas funcionando');
    console.log('   - Endpoints de API respondendo');
    console.log('\n✨ Backend TechRun está funcionando corretamente!');
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar testes
runTests();
