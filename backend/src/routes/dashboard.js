// Rotas do Dashboard
const express = require('express');
const {query, validationResult} = require('express-validator');
const User = require('../models/User');
const Video = require('../models/Video');
const Analysis = require('../models/Analysis');
const {protect} = require('../middleware/auth');
const {catchAsync} = require('../middleware/errorHandler');

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

// @desc    Obter dados gerais do dashboard
// @route   GET /api/dashboard/overview
// @access  Private
router.get(
  '/overview',
  protect,
  [
    query('period')
      .optional()
      .isIn(['7d', '30d', '90d', '1y', 'all'])
      .withMessage('Período inválido'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const {period = '30d'} = req.query;
    const userId = req.user._id;

    // Calcular data de início baseada no período
    let startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2020-01-01'); // Data muito antiga
        break;
    }

    // Filtro de data
    const dateFilter = period === 'all' ? {} : {createdAt: {$gte: startDate}};

    // Estatísticas de vídeos
    const videoStats = await Video.aggregate([
      {
        $match: {
          user: userId,
          status: {$in: ['uploaded', 'processed']},
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalVideos: {$sum: 1},
          totalSize: {$sum: '$size'},
          totalDuration: {$sum: '$duration'},
          averageDuration: {$avg: '$duration'},
          totalViews: {$sum: '$stats.views'},
        },
      },
    ]);

    // Estatísticas de análises
    const analysisStats = await Analysis.aggregate([
      {
        $match: {
          user: userId,
          status: 'completed',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalAnalyses: {$sum: 1},
          averageScore: {$avg: '$analysisResults.overallScore'},
          bestScore: {$max: '$analysisResults.overallScore'},
          totalRepetitions: {$sum: '$analysisResults.repetitions'},
          averageConfidence: {$avg: '$analysisResults.confidence'},
        },
      },
    ]);

    // Atividade recente (últimos 7 dias)
    const recentActivity = await Analysis.aggregate([
      {
        $match: {
          user: userId,
          status: 'completed',
          createdAt: {$gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)},
        },
      },
      {
        $group: {
          _id: {
            year: {$year: '$createdAt'},
            month: {$month: '$createdAt'},
            day: {$dayOfMonth: '$createdAt'},
          },
          count: {$sum: 1},
          averageScore: {$avg: '$analysisResults.overallScore'},
          totalRepetitions: {$sum: '$analysisResults.repetitions'},
        },
      },
      {$sort: {'_id.year': 1, '_id.month': 1, '_id.day': 1}},
    ]);

    // Distribuição por exercício
    const exerciseDistribution = await Analysis.aggregate([
      {
        $match: {
          user: userId,
          status: 'completed',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: '$exerciseType',
          count: {$sum: 1},
          averageScore: {$avg: '$analysisResults.overallScore'},
          totalRepetitions: {$sum: '$analysisResults.repetitions'},
        },
      },
      {$sort: {count: -1}},
    ]);

    // Melhores performances
    const topPerformances = await Analysis.find({
      user: userId,
      status: 'completed',
      ...dateFilter,
    })
      .sort({'analysisResults.overallScore': -1})
      .limit(5)
      .select(
        'exerciseType analysisResults.overallScore analysisResults.repetitions createdAt',
      );

    // Estatísticas do usuário
    const user = await User.findById(userId).select(
      'stats preferences createdAt',
    );

    res.json({
      success: true,
      data: {
        period,
        summary: {
          videos: videoStats[0] || {
            totalVideos: 0,
            totalSize: 0,
            totalDuration: 0,
            averageDuration: 0,
            totalViews: 0,
          },
          analyses: analysisStats[0] || {
            totalAnalyses: 0,
            averageScore: 0,
            bestScore: 0,
            totalRepetitions: 0,
            averageConfidence: 0,
          },
          user: {
            memberSince: user.createdAt,
            totalWorkouts: user.stats?.totalWorkouts || 0,
            totalExerciseTime: user.stats?.totalExerciseTime || 0,
            currentStreak: user.stats?.currentStreak || 0,
            longestStreak: user.stats?.longestStreak || 0,
          },
        },
        charts: {
          recentActivity,
          exerciseDistribution,
        },
        topPerformances: topPerformances.map(analysis => ({
          id: analysis._id,
          exerciseType: analysis.exerciseType,
          score: analysis.analysisResults.overallScore,
          repetitions: analysis.analysisResults.repetitions,
          date: analysis.createdAt,
        })),
      },
    });
  }),
);

// @desc    Obter progresso do usuário
// @route   GET /api/dashboard/progress
// @access  Private
router.get(
  '/progress',
  protect,
  [
    query('exerciseType')
      .optional()
      .isIn([
        'squat',
        'pushup',
        'plank',
        'deadlift',
        'pullup',
        'lunges',
        'burpees',
        'general',
      ])
      .withMessage('Tipo de exercício inválido'),
    query('period')
      .optional()
      .isIn(['7d', '30d', '90d', '1y'])
      .withMessage('Período inválido'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const {exerciseType, period = '30d'} = req.query;
    const userId = req.user._id;

    // Calcular data de início
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Filtros
    const matchFilters = {
      user: userId,
      status: 'completed',
      createdAt: {$gte: startDate},
    };

    if (exerciseType) {
      matchFilters.exerciseType = exerciseType;
    }

    // Progresso ao longo do tempo
    const progressData = await Analysis.aggregate([
      {$match: matchFilters},
      {
        $group: {
          _id: {
            year: {$year: '$createdAt'},
            month: {$month: '$createdAt'},
            day: {$dayOfMonth: '$createdAt'},
          },
          averageScore: {$avg: '$analysisResults.overallScore'},
          totalAnalyses: {$sum: 1},
          totalRepetitions: {$sum: '$analysisResults.repetitions'},
          bestScore: {$max: '$analysisResults.overallScore'},
        },
      },
      {$sort: {'_id.year': 1, '_id.month': 1, '_id.day': 1}},
    ]);

    // Tendências (comparação com período anterior)
    const previousStartDate = new Date(startDate);
    const periodDays = Math.ceil(
      (new Date() - startDate) / (1000 * 60 * 60 * 24),
    );

    previousStartDate.setDate(previousStartDate.getDate() - periodDays);

    const currentPeriodStats = await Analysis.aggregate([
      {$match: matchFilters},
      {
        $group: {
          _id: null,
          averageScore: {$avg: '$analysisResults.overallScore'},
          totalAnalyses: {$sum: 1},
          totalRepetitions: {$sum: '$analysisResults.repetitions'},
        },
      },
    ]);

    const previousPeriodStats = await Analysis.aggregate([
      {
        $match: {
          ...matchFilters,
          createdAt: {
            $gte: previousStartDate,
            $lt: startDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          averageScore: {$avg: '$analysisResults.overallScore'},
          totalAnalyses: {$sum: 1},
          totalRepetitions: {$sum: '$analysisResults.repetitions'},
        },
      },
    ]);

    // Calcular tendências
    const current = currentPeriodStats[0] || {
      averageScore: 0,
      totalAnalyses: 0,
      totalRepetitions: 0,
    };
    const previous = previousPeriodStats[0] || {
      averageScore: 0,
      totalAnalyses: 0,
      totalRepetitions: 0,
    };

    const trends = {
      scoreChange:
        previous.averageScore > 0
          ? ((current.averageScore - previous.averageScore) /
              previous.averageScore) *
            100
          : 0,
      analysesChange:
        previous.totalAnalyses > 0
          ? ((current.totalAnalyses - previous.totalAnalyses) /
              previous.totalAnalyses) *
            100
          : 0,
      repetitionsChange:
        previous.totalRepetitions > 0
          ? ((current.totalRepetitions - previous.totalRepetitions) /
              previous.totalRepetitions) *
            100
          : 0,
    };

    // Metas e conquistas
    const goals = {
      weeklyWorkouts: {
        target: 5,
        current: await Analysis.countDocuments({
          user: userId,
          status: 'completed',
          createdAt: {$gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)},
        }),
      },
      averageScore: {
        target: 85,
        current: current.averageScore,
      },
      totalRepetitions: {
        target: 100,
        current: current.totalRepetitions,
      },
    };

    res.json({
      success: true,
      data: {
        period,
        exerciseType,
        progress: progressData,
        trends,
        goals,
        summary: current,
      },
    });
  }),
);

// @desc    Obter análises recentes
// @route   GET /api/dashboard/recent
// @access  Private
router.get(
  '/recent',
  protect,
  [
    query('limit')
      .optional()
      .isInt({min: 1, max: 20})
      .withMessage('Limite deve ser entre 1 e 20'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const {limit = 10} = req.query;
    const userId = req.user._id;

    // Análises recentes
    const recentAnalyses = await Analysis.find({
      user: userId,
      status: 'completed',
    })
      .sort({createdAt: -1})
      .limit(parseInt(limit))
      .select(
        'exerciseType analysisResults.overallScore analysisResults.repetitions createdAt',
      );

    // Vídeos recentes
    const recentVideos = await Video.find({
      user: userId,
      status: {$in: ['uploaded', 'processed']},
    })
      .sort({createdAt: -1})
      .limit(parseInt(limit))
      .select('originalName exerciseType size duration status createdAt')
      .populate('analysis', 'analysisResults.overallScore');

    res.json({
      success: true,
      data: {
        recentAnalyses: recentAnalyses.map(analysis => ({
          id: analysis._id,
          exerciseType: analysis.exerciseType,
          score: analysis.analysisResults.overallScore,
          repetitions: analysis.analysisResults.repetitions,
          date: analysis.createdAt,
        })),
        recentVideos: recentVideos.map(video => ({
          id: video._id,
          name: video.originalName,
          exerciseType: video.exerciseType,
          size: video.size,
          duration: video.duration,
          status: video.status,
          score: video.analysis?.analysisResults?.overallScore,
          date: video.createdAt,
        })),
      },
    });
  }),
);

// @desc    Obter conquistas do usuário
// @route   GET /api/dashboard/achievements
// @access  Private
router.get(
  '/achievements',
  protect,
  catchAsync(async (req, res) => {
    const userId = req.user._id;

    // Estatísticas para calcular conquistas
    const stats = await Analysis.aggregate([
      {
        $match: {
          user: userId,
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalAnalyses: {$sum: 1},
          averageScore: {$avg: '$analysisResults.overallScore'},
          bestScore: {$max: '$analysisResults.overallScore'},
          totalRepetitions: {$sum: '$analysisResults.repetitions'},
          perfectScores: {
            $sum: {
              $cond: [{$gte: ['$analysisResults.overallScore', 95]}, 1, 0],
            },
          },
        },
      },
    ]);

    const userStats = stats[0] || {
      totalAnalyses: 0,
      averageScore: 0,
      bestScore: 0,
      totalRepetitions: 0,
      perfectScores: 0,
    };

    // Definir conquistas
    const achievements = [
      {
        id: 'first_analysis',
        name: 'Primeira Análise',
        description: 'Complete sua primeira análise de exercício',
        icon: '🎯',
        unlocked: userStats.totalAnalyses >= 1,
        progress: Math.min(userStats.totalAnalyses, 1),
        target: 1,
      },
      {
        id: 'ten_analyses',
        name: 'Dedicado',
        description: 'Complete 10 análises de exercício',
        icon: '💪',
        unlocked: userStats.totalAnalyses >= 10,
        progress: Math.min(userStats.totalAnalyses, 10),
        target: 10,
      },
      {
        id: 'fifty_analyses',
        name: 'Atleta',
        description: 'Complete 50 análises de exercício',
        icon: '🏆',
        unlocked: userStats.totalAnalyses >= 50,
        progress: Math.min(userStats.totalAnalyses, 50),
        target: 50,
      },
      {
        id: 'perfect_score',
        name: 'Perfeição',
        description: 'Obtenha uma pontuação de 95+ pontos',
        icon: '⭐',
        unlocked: userStats.bestScore >= 95,
        progress: Math.min(userStats.bestScore, 95),
        target: 95,
      },
      {
        id: 'five_perfect_scores',
        name: 'Mestre',
        description: 'Obtenha 5 pontuações perfeitas (95+)',
        icon: '👑',
        unlocked: userStats.perfectScores >= 5,
        progress: Math.min(userStats.perfectScores, 5),
        target: 5,
      },
      {
        id: 'thousand_reps',
        name: 'Incansável',
        description: 'Complete 1000 repetições no total',
        icon: '🔥',
        unlocked: userStats.totalRepetitions >= 1000,
        progress: Math.min(userStats.totalRepetitions, 1000),
        target: 1000,
      },
      {
        id: 'high_average',
        name: 'Consistente',
        description: 'Mantenha uma média de 80+ pontos',
        icon: '📈',
        unlocked: userStats.averageScore >= 80,
        progress: Math.min(userStats.averageScore, 80),
        target: 80,
      },
    ];

    // Calcular estatísticas de conquistas
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    const completionPercentage = (unlockedCount / totalCount) * 100;

    res.json({
      success: true,
      data: {
        achievements,
        summary: {
          unlocked: unlockedCount,
          total: totalCount,
          completionPercentage: Math.round(completionPercentage),
        },
        userStats,
      },
    });
  }),
);

module.exports = router;
