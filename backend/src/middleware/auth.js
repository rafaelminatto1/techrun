// Middleware de autenticação JWT
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acesso requerido',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verificar e decodificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'techrun-secret-key',

    // Buscar usuário no banco
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Conta desativada',
        code: 'ACCOUNT_DISABLED',
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED',
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
    });
  }
};

// Middleware opcional - não falha se não houver token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'techrun-secret-key',
    );
    const user = await User.findById(decoded.userId).select('-password');

    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }

    next();
  } catch (error) {
    // Ignorar erros de token em auth opcional
    next();
  }
};

// Middleware para verificar roles específicos
const requireRole = roles => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação requerida',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSION',
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  protect: authMiddleware, // Alias para compatibilidade
  optionalAuth,
  requireRole,
};
