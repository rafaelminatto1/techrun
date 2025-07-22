// Middleware para simular dados quando MongoDB não está disponível
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Dados simulados em memória
const mockUsers = [
  {
    _id: 1,
    name: 'Usuário Teste',
    email: 'teste@techrun.com',
    password: bcrypt.hashSync('senha123', 10),
    createdAt: new Date(),
    isActive: true
  }
];
const mockVideos = [];
const mockAnalyses = [];
const mockExercises = [];
let userIdCounter = 2;
let videoIdCounter = 1;
let analysisIdCounter = 1;

// Função para gerar JWT
function generateToken(userId) {
  return jwt.sign({userId}, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  });
}

// Middleware para interceptar rotas quando MongoDB não está disponível
const mockDataMiddleware = (req, res, next) => {
  // Forçar uso de dados simulados para desenvolvimento
  const mongoose = require('mongoose');
  const forceSimulation =
    process.env.FORCE_MOCK_DATA === 'true' ||
    mongoose.connection.readyState !== 1;

  if (!forceSimulation && mongoose.connection.readyState === 1) {
    // MongoDB conectado e não forçando simulação, prosseguir normalmente
    return next();
  }

  console.log('🔄 Usando dados simulados (MongoDB não disponível ou forçado)');
  console.log(
    '📍 Interceptando rota:',
    req.method,
    req.path,
    'originalUrl:',
    req.originalUrl,
  );
  console.log(
    '📍 Headers:',
    req.headers.authorization ? 'Token presente' : 'Sem token',
  );

  // Interceptar rotas de autenticação
  if (req.originalUrl === '/api/auth/register' && req.method === 'POST') {
    console.log('✅ Interceptando registro');

    return handleMockRegister(req, res);
  }

  if (req.originalUrl === '/api/auth/login' && req.method === 'POST') {
    console.log('✅ Interceptando login');

    return handleMockLogin(req, res);
  }

  // Interceptar rotas protegidas
  if (
    req.originalUrl.startsWith('/api/users') ||
    req.originalUrl.startsWith('/api/videos') ||
    req.originalUrl.startsWith('/api/analysis') ||
    req.originalUrl.startsWith('/api/exercises') ||
    req.originalUrl.startsWith('/api/dashboard')
  ) {
    return handleMockProtectedRoutes(req, res);
  }

  // Prosseguir para outras rotas
  next();
};

// Simular registro
function handleMockRegister(req, res) {
  try {
    console.log('📝 Mock Register - req.body:', req.body);

    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'JSON inválido',
        code: 'INVALID_JSON',
      });
    }

    const {name, email, password} = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Campos obrigatórios: name, email, password',
        code: 'MISSING_FIELDS',
      });
    }

    // Verificar se usuário já existe
    const existingUser = mockUsers.find(user => user.email === email);

    if (existingUser) {
      return res.status(400).json({
        error: 'Usuário já existe',
        code: 'USER_EXISTS',
      });
    }

    // Criar novo usuário
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      _id: userIdCounter++,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      isActive: true,
    };

    mockUsers.push(newUser);

    // Gerar token
    const token = generateToken(newUser._id);

    // Resposta
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}

// Simular login
function handleMockLogin(req, res) {
  try {
    const {email, password} = req.body;

    // Buscar usuário
    const user = mockUsers.find(user => user.email === email);

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Verificar senha
    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Gerar token
    const token = generateToken(user._id);

    // Resposta
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}

// Simular rotas protegidas
function handleMockProtectedRoutes(req, res) {
  try {
    // Verificar token
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso requerido',
        code: 'NO_TOKEN',
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    } catch (error) {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN',
      });
    }

    const userId = decoded.userId;
    const user = mockUsers.find(u => u._id === userId);

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND',
      });
    }

    // Rotas específicas
    if (req.originalUrl === '/api/users/profile' && req.method === 'GET') {
      return res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });
    }

    if (req.originalUrl === '/api/videos' && req.method === 'GET') {
      const userVideos = mockVideos.filter(video => video.userId === userId);

      return res.json(userVideos);
    }

    if (req.originalUrl === '/api/videos/upload' && req.method === 'POST') {
      const newVideo = {
        _id: videoIdCounter++,
        userId,
        exerciseType: req.body.exerciseType || 'squat',
        filename: `video_${Date.now()}.mp4`,
        status: 'uploaded',
        createdAt: new Date(),
      };

      mockVideos.push(newVideo);

      return res.status(201).json(newVideo);
    }

    if (req.originalUrl === '/api/analysis' && req.method === 'GET') {
      const userAnalyses = mockAnalyses.filter(
        analysis => analysis.userId === userId,
      );

      return res.json(userAnalyses);
    }

    if (req.originalUrl === '/api/analysis' && req.method === 'POST') {
      const newAnalysis = {
        _id: analysisIdCounter++,
        userId,
        videoId: req.body.videoId,
        exerciseType: req.body.exerciseType,
        status: 'completed',
        score: Math.floor(Math.random() * 100),
        createdAt: new Date(),
      };

      mockAnalyses.push(newAnalysis);

      return res.status(201).json(newAnalysis);
    }

    // Rotas de exercícios
    if (req.originalUrl.startsWith('/api/exercises')) {
      if (req.originalUrl === '/api/exercises' && req.method === 'GET') {
        const userExercises = mockExercises.filter(ex => ex.userId === userId);

        return res.json({
          exercises: userExercises,
          totalPages: 1,
          currentPage: 1,
          total: userExercises.length,
        });
      }

      if (req.originalUrl === '/api/exercises/stats' && req.method === 'GET') {
        return res.json({
          totalExercises: 15,
          totalDuration: 3600,
          totalRepetitions: 150,
          averageScore: 85,
          bestScore: 95,
          exerciseTypes: ['squat', 'pushup'],
          averageAccuracy: 88,
          averageConsistency: 82,
          averageForm: 90,
          averageTiming: 85,
        });
      }

      if (
        req.originalUrl.includes('/api/exercises/progress/') &&
        req.method === 'GET'
      ) {
        const exerciseType = req.originalUrl.split('/').pop();

        return res.json([
          {
            score: 85,
            metrics: {accuracy: 88, consistency: 82, form: 90, timing: 85},
            completedAt: new Date().toISOString(),
            duration: 240,
            repetitions: 10,
          }
        ]);
      }

        req.originalUrl === '/api/exercises/types/summary' &&
        req.method === 'GET'
      ) {
        return res.json([
          {
            _id: 'squat',
            count: 8,
            totalDuration: 1920,
            totalRepetitions: 80,
            averageScore: 87,
            bestScore: 95,
            lastExercise: new Date().toISOString(),
          },
          {
            _id: 'pushup',
            count: 7,
            totalDuration: 1680,
            totalRepetitions: 70,
            averageScore: 83,
            bestScore: 92,
            lastExercise: new Date().toISOString(),
          }
        ]);
      }

      if (req.originalUrl === '/api/exercises' && req.method === 'POST') {
        const newExercise = {
          _id: `exercise_${Date.now()}`,
          userId,
          exerciseType: req.body.exerciseType || 'squat',
          duration: req.body.duration || 240,
          repetitions: req.body.repetitions || 10,
          score: req.body.score || 85,
          metrics: req.body.metrics || {
            accuracy: 88,
            consistency: 82,
            form: 90,
            timing: 85,
          },
          completedAt: new Date().toISOString(),
          isCompleted: true,
          ...req.body,
        };

        mockExercises.push(newExercise);

        return res.status(201).json(newExercise);
      }
    }

    if (req.originalUrl === '/api/dashboard/stats' && req.method === 'GET') {
      return res.json({
        totalVideos: mockVideos.filter(v => v.userId === userId).length,
        totalAnalyses: mockAnalyses.filter(a => a.userId === userId).length,
        totalExercises: mockExercises.filter(e => e.userId === userId).length,
        averageScore: 85,
        recentActivity: [
          {
            id: 1,
            type: 'exercise_completed',
            description: 'Exercício de agachamento concluído',
            timestamp: new Date().toISOString(),
          },
          {
            id: 2,
            type: 'video_upload',
            description: 'Novo vídeo enviado',
            timestamp: new Date().toISOString(),
          }
        ],
      });
    }

    // Rota não encontrada
    res.status(404).json({
      error: 'Endpoint não encontrado',
      code: 'NOT_FOUND',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}

module.exports = mockDataMiddleware;
