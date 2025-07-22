// Servidor principal do TechRun Backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const mockDataMiddleware = require('./middleware/mockData');

// Importar rotas
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const analysisRoutes = require('./routes/analysis');
const userRoutes = require('./routes/users');
const exerciseRoutes = require('./routes/exercises');
const dashboardRoutes = require('./routes/dashboard');

// Importar middlewares
const {errorHandler} = require('./middleware/errorHandler');
const {protect} = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
  },
});

// Middlewares de segurança
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true,
  }),
);
app.use(compression());
app.use(limiter);

// Middlewares de parsing
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Conectar ao MongoDB (opcional para desenvolvimento)
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techrun', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Conectado ao MongoDB');
  })
  .catch(error => {
    console.warn('⚠️  MongoDB não disponível:', error.message);
    console.log(
      '🔄 Servidor continuará sem banco de dados (modo desenvolvimento)',
    );
  });

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Aplicar middleware de dados simulados globalmente para todas as rotas da API
app.use('/api', mockDataMiddleware);

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/videos', protect, videoRoutes);
app.use('/api/analysis', protect, analysisRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/exercises', protect, exerciseRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method,
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor TechRun rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  });
}

module.exports = app;
