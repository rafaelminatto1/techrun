// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));

    return res.status(400).json({
      error: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      details: errors,
    });
  }

  // Erro de duplicação (chave única)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    return res.status(409).json({
      error: `${field} já está em uso`,
      code: 'DUPLICATE_ERROR',
      field,
      value,
    });
  }

  // Erro de cast (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido',
      code: 'INVALID_ID',
      field: err.path,
      value: err.value,
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      code: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Erro de limite de tamanho
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Arquivo muito grande',
      code: 'FILE_TOO_LARGE',
      limit: '50MB',
    });
  }

  // Erro de sintaxe JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON inválido',
      code: 'INVALID_JSON',
    });
  }

  // Erro personalizado da aplicação
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      error: err.message,
      code: err.code || 'APP_ERROR',
    });
  }

  // Erro de conexão com banco de dados
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    return res.status(503).json({
      error: 'Serviço temporariamente indisponível',
      code: 'DATABASE_ERROR',
    });
  }

  // Erro de rate limiting
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Muitas tentativas. Tente novamente mais tarde.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: err.retryAfter,
    });
  }

  // Erro interno do servidor (padrão)
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    error: 'Erro interno do servidor',
    code: 'INTERNAL_SERVER_ERROR',
    ...(isDevelopment && {
      details: {
        message: err.message,
        stack: err.stack,
      },
    }),
  });
};

// Classe para erros personalizados da aplicação
class AppError extends Error {
  constructor(message, statusCode = 400, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Função para capturar erros assíncronos
const catchAsync = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  AppError,
  catchAsync,
};
