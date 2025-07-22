// Rotas de autenticação
const express = require('express');
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const User = require('../models/User');
const {AppError, catchAsync} = require('../middleware/errorHandler');
const {authMiddleware} = require('../middleware/auth');

const router = express.Router();

// Função para gerar JWT
const generateToken = userId => {
  return jwt.sign({userId}, process.env.JWT_SECRET || 'techrun-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Validações
const registerValidation = [
  body('name')
    .trim()
    .isLength({min: 2, max: 100})
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),

  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),

  body('password')
    .isLength({min: 6})
    .withMessage('Senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
    ),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),

  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

// POST /api/auth/register
router.post(
  '/register',
  registerValidation,
  catchAsync(async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const {
      name,
      email,
      password,
      dateOfBirth,
      gender,
      height,
      weight,
      fitnessLevel,
      goals,
    } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({email});

    if (existingUser) {
      throw new AppError('Email já está em uso', 409, 'EMAIL_EXISTS');
    }

    // Criar novo usuário
    const user = new User({
      name,
      email,
      password,
      dateOfBirth,
      gender,
      height,
      weight,
      fitnessLevel,
      goals,
    });

    await user.save();

    // Gerar token
    const token = generateToken(user._id);

    // Resposta (sem senha)
    const userResponse = user.toObject();

    delete userResponse.password;

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: userResponse,
      token,
    });
  }),
);

// POST /api/auth/login
router.post(
  '/login',
  loginValidation,
  catchAsync(async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const {email, password} = req.body;

    // Buscar usuário com senha
    const user = await User.findOne({email}).select('+password');

    if (!user) {
      throw new AppError(
        'Email ou senha incorretos',
        401,
        'INVALID_CREDENTIALS',
      );
    }

    // Verificar se conta está ativa
    if (!user.isActive) {
      throw new AppError('Conta desativada', 401, 'ACCOUNT_DISABLED');
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError(
        'Email ou senha incorretos',
        401,
        'INVALID_CREDENTIALS',
      );
    }

    // Atualizar último login
    user.lastLoginAt = new Date();
    await user.save();

    // Gerar token
    const token = generateToken(user._id);

    // Resposta (sem senha)
    const userResponse = user.toObject();

    delete userResponse.password;

    res.json({
      message: 'Login realizado com sucesso',
      user: userResponse,
      token,
    });
  }),
);

// GET /api/auth/me
router.get(
  '/me',
  authMiddleware,
  catchAsync(async (req, res) => {
    res.json({
      user: req.user,
    });
  }),
);

// PUT /api/auth/profile
router.put(
  '/profile',
  authMiddleware,
  [
    body('name')
      .optional()
      .trim()
      .isLength({min: 2, max: 100})
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),

    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Data de nascimento inválida'),

    body('height')
      .optional()
      .isFloat({min: 50, max: 300})
      .withMessage('Altura deve estar entre 50 e 300 cm'),

    body('weight')
      .optional()
      .isFloat({min: 20, max: 500})
      .withMessage('Peso deve estar entre 20 e 500 kg'),
  ],
  catchAsync(async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const allowedFields = [
      'name',
      'dateOfBirth',
      'gender',
      'height',
      'weight',
      'fitnessLevel',
      'goals',
      'preferredExercises',
      'privacy',
      'notifications',
    ];

    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      user,
    });
  }),
);

// POST /api/auth/change-password
router.post(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),

    body('newPassword')
      .isLength({min: 6})
      .withMessage('Nova senha deve ter no mínimo 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
      ),
  ],
  catchAsync(async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const {currentPassword, newPassword} = req.body;

    // Buscar usuário com senha
    const user = await User.findById(req.userId).select('+password');

    // Verificar senha atual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      throw new AppError(
        'Senha atual incorreta',
        400,
        'INVALID_CURRENT_PASSWORD',
      );
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Senha alterada com sucesso',
    });
  }),
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Email inválido')],
  catchAsync(async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const {email} = req.body;

    const user = await User.findOne({email});

    if (!user) {
      // Por segurança, não revelar se o email existe
      return res.json({
        message:
          'Se o email existir, você receberá instruções para redefinir sua senha',
      });
    }

    // Gerar token de reset
    const resetToken = user.generatePasswordResetToken();

    await user.save();

    // TODO: Enviar email com token de reset
    // Por enquanto, retornar o token (apenas para desenvolvimento)
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.json({
      message:
        'Se o email existir, você receberá instruções para redefinir sua senha',
      ...(isDevelopment && {resetToken}), // Apenas em desenvolvimento
    });
  }),
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token é obrigatório'),

    body('newPassword')
      .isLength({min: 6})
      .withMessage('Nova senha deve ter no mínimo 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
      ),
  ],
  catchAsync(async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const {token, newPassword} = req.body;

    // Buscar usuário pelo token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: {$gt: new Date()},
    });

    if (!user) {
      throw new AppError(
        'Token inválido ou expirado',
        400,
        'INVALID_RESET_TOKEN',
      );
    }

    // Atualizar senha e limpar tokens
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      message: 'Senha redefinida com sucesso',
    });
  }),
);

// DELETE /api/auth/account
router.delete(
  '/account',
  authMiddleware,
  [
    body('password')
      .notEmpty()
      .withMessage('Senha é obrigatória para excluir a conta'),
  ],
  catchAsync(async (req, res) => {
    // Verificar erros de validação
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const {password} = req.body;

    // Buscar usuário com senha
    const user = await User.findById(req.userId).select('+password');

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Senha incorreta', 400, 'INVALID_PASSWORD');
    }

    // Desativar conta (soft delete)
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`; // Permitir reutilização do email
    await user.save();

    res.json({
      message: 'Conta excluída com sucesso',
    });
  }),
);

module.exports = router;
