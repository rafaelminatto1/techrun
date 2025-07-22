const express = require('express');
const {body, param, query, validationResult} = require('express-validator');
const User = require('../models/User');
const {protect, requireRole} = require('../middleware/auth');
const {AppError, catchAsync} = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Middleware para validação de erros
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array(),
    });
  }
  next();
};

// @desc    Obter perfil do usuário
// @route   GET /api/users/profile
// @access  Private
router.get(
  '/profile',
  protect,
  catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
      },
    });
  }),
);

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Private
router.put(
  '/profile',
  protect,
  [
    body('name')
      .optional()
      .trim()
      .isLength({min: 2, max: 50})
      .withMessage('Nome deve ter entre 2 e 50 caracteres'),
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Data de nascimento inválida'),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
      .withMessage('Gênero inválido'),
    body('height')
      .optional()
      .isFloat({min: 100, max: 250})
      .withMessage('Altura deve estar entre 100 e 250 cm'),
    body('weight')
      .optional()
      .isFloat({min: 30, max: 300})
      .withMessage('Peso deve estar entre 30 e 300 kg'),
    body('fitnessLevel')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Nível de fitness inválido'),
    body('goals')
      .optional()
      .isArray()
      .withMessage('Objetivos devem ser um array'),
    body('exercisePreferences')
      .optional()
      .isArray()
      .withMessage('Preferências de exercício devem ser um array'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const allowedUpdates = [
      'name',
      'dateOfBirth',
      'gender',
      'height',
      'weight',
      'fitnessLevel',
      'goals',
      'exercisePreferences',
    ];

    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: user.getPublicProfile(),
      },
    });
  }),
);

// @desc    Alterar senha
// @route   PUT /api/users/change-password
// @access  Private
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
    body('newPassword')
      .isLength({min: 6})
      .withMessage('Nova senha deve ter pelo menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
      ),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const {currentPassword, newPassword} = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      throw new AppError('Senha atual incorreta', 400);
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Senha alterada com sucesso',
    });
  }),
);

// @desc    Atualizar configurações de privacidade
// @route   PUT /api/users/privacy
// @access  Private
router.put(
  '/privacy',
  protect,
  [
    body('profileVisibility')
      .optional()
      .isIn(['public', 'friends', 'private'])
      .withMessage('Visibilidade do perfil inválida'),
    body('shareWorkouts')
      .optional()
      .isBoolean()
      .withMessage('shareWorkouts deve ser um boolean'),
    body('shareProgress')
      .optional()
      .isBoolean()
      .withMessage('shareProgress deve ser um boolean'),
    body('allowMessages')
      .optional()
      .isBoolean()
      .withMessage('allowMessages deve ser um boolean'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const updates = {};

    Object.keys(req.body).forEach(key => {
      updates[`privacy.${key}`] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json({
      success: true,
      message: 'Configurações de privacidade atualizadas',
      data: {
        privacy: user.privacy,
      },
    });
  }),
);

// @desc    Atualizar configurações de notificação
// @route   PUT /api/users/notifications
// @access  Private
router.put(
  '/notifications',
  protect,
  [
    body('email')
      .optional()
      .isBoolean()
      .withMessage('email deve ser um boolean'),
    body('push').optional().isBoolean().withMessage('push deve ser um boolean'),
    body('workoutReminders')
      .optional()
      .isBoolean()
      .withMessage('workoutReminders deve ser um boolean'),
    body('progressUpdates')
      .optional()
      .isBoolean()
      .withMessage('progressUpdates deve ser um boolean'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const updates = {};

    Object.keys(req.body).forEach(key => {
      updates[`notifications.${key}`] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json({
      success: true,
      message: 'Configurações de notificação atualizadas',
      data: {
        notifications: user.notifications,
      },
    });
  }),
);

// @desc    Obter estatísticas do usuário
// @route   GET /api/users/stats
// @access  Private
router.get(
  '/stats',
  protect,
  catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json({
      success: true,
      data: {
        stats: user.stats,
        age: user.age,
        bmi: user.bmi,
      },
    });
  }),
);

// @desc    Deletar conta (soft delete)
// @route   DELETE /api/users/account
// @access  Private
router.delete(
  '/account',
  protect,
  [
    body('password')
      .notEmpty()
      .withMessage('Senha é obrigatória para deletar a conta'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const {password} = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Senha incorreta', 400);
    }

    // Soft delete
    user.isActive = false;
    user.deletedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Conta deletada com sucesso',
    });
  }),
);

// @desc    Listar usuários (Admin apenas)
// @route   GET /api/users
// @access  Private/Admin
router.get(
  '/',
  protect,
  requireRole(['admin']),
  [
    query('page')
      .optional()
      .isInt({min: 1})
      .withMessage('Página deve ser um número maior que 0'),
    query('limit')
      .optional()
      .isInt({min: 1, max: 100})
      .withMessage('Limite deve ser entre 1 e 100'),
    query('search')
      .optional()
      .trim()
      .isLength({min: 1})
      .withMessage('Termo de busca inválido'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    const query = {isActive: true};

    if (search) {
      query.$or = [
        {name: {$regex: search, $options: 'i'}},
        {email: {$regex: search, $options: 'i'}},
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        users: users.map(user => user.getPublicProfile()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }),
);

module.exports = router;
