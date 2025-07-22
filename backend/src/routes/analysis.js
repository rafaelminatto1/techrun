// Rotas de Análise de Exercícios
const express = require('express');
const {body, param, query, validationResult} = require('express-validator');
const Analysis = require('../models/Analysis');
const Video = require('../models/Video');
const {protect} = require('../middleware/auth');
const {AppError, catchAsync} = require('../middleware/errorHandler');

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

// Simulação de análise de pose (substituir por integração real)
const simulateAnalysis = (exerciseType, videoDuration) => {
  const baseScore = Math.floor(Math.random() * 30) + 70; // 70-100
  const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0
  const repetitions =
    Math.floor(videoDuration / 3) + Math.floor(Math.random() * 3);

  const feedbackOptions = {
    squat: {
      strengths: [
        'Boa profundidade no agachamento',
        'Postura ereta mantida',
        'Joelhos alinhados com os pés',
      ],
      improvements: [
        'Mantenha o peso nos calcanhares',
        'Desça um pouco mais',
        'Controle melhor a velocidade',
      ],
      tips: [
        'Imagine sentar em uma cadeira',
        'Mantenha o peito aberto',
        'Respire durante o movimento',
      ]
    },
    pushup: {
      strengths: [
        'Boa amplitude de movimento',
        'Corpo alinhado',
        'Controle na descida',
      ],
      improvements: [
        'Mantenha o core contraído',
        'Desça até o peito quase tocar o chão',
        'Evite arquear as costas',
      ],
      tips: [
        'Imagine uma linha reta da cabeça aos pés',
        'Olhe para baixo, não para frente',
        'Controle a respiração',
      ]
    },
    plank: {
      strengths: ['Boa estabilidade', 'Posição mantida', 'Core ativado'],
      improvements: [
        'Evite levantar o quadril',
        'Mantenha a cabeça neutra',
        'Distribua o peso uniformemente',
      ],
      tips: [
        'Contraia o abdômen',
        'Respire normalmente',
        'Foque em um ponto no chão',
      ]
    },
  };

  const feedback = feedbackOptions[exerciseType] || feedbackOptions.squat;

  return {
    overallScore: baseScore,
    confidence,
    repetitions,
    feedback: {
      strengths: [
        feedback.strengths[
          Math.floor(Math.random() * feedback.strengths.length)
        ],
      ],
      improvements: [
        feedback.improvements[
          Math.floor(Math.random() * feedback.improvements.length)
        ],
      ],
      tips: [feedback.tips[Math.floor(Math.random() * feedback.tips.length)]],
    },
    exerciseMetrics: generateExerciseMetrics(exerciseType),
  };
};

const generateExerciseMetrics = exerciseType => {
  switch (exerciseType) {
    case 'squat':
      return {
        squat: {
          kneeAngle: {
            min: 85 + Math.random() * 10,
            max: 165 + Math.random() * 10,
            average: 125 + Math.random() * 20,
          },
          depth: ['shallow', 'parallel', 'deep'][Math.floor(Math.random() * 3)],
          kneeAlignment: ['good', 'valgus', 'varus'][
            Math.floor(Math.random() * 3)
          ],
        },
      };
    case 'pushup':
      return {
        pushup: {
          armAngle: {
            min: 45 + Math.random() * 10,
            max: 175 + Math.random() * 5,
            average: 110 + Math.random() * 20,
          },
          bodyAlignment: ['straight', 'sagging', 'piked'][
            Math.floor(Math.random() * 3)
          ],
          rangeOfMotion: ['full', 'partial', 'limited'][
            Math.floor(Math.random() * 3)
          ],
        },
      };
    case 'plank':
      return {
        plank: {
          duration: 30 + Math.random() * 60,
          stability: ['excellent', 'good', 'fair', 'poor'][
            Math.floor(Math.random() * 4)
          ],
          bodyAlignment: ['straight', 'sagging', 'piked'][
            Math.floor(Math.random() * 3)
          ],
        },
      };
    default:
      return {};
  }
};

// @desc    Iniciar análise de vídeo
// @route   POST /api/analysis/start
// @access  Private
router.post(
  '/start',
  protect,
  [
    body('videoId').isMongoId().withMessage('ID do vídeo inválido'),
    body('exerciseType')
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
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const {videoId, exerciseType} = req.body;

    // Verificar se o vídeo existe e pertence ao usuário
    const video = await Video.findOne({
      _id: videoId,
      user: req.user._id,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vídeo não encontrado',
      });
    }

    // Verificar se já existe uma análise para este vídeo
    const existingAnalysis = await Analysis.findOne({
      user: req.user._id,
      videoUrl: video.url, 
    });

    if (existingAnalysis) {
      return res.status(400).json({
        success: false,
        message: 'Análise já existe para este vídeo',
        data: {analysisId: existingAnalysis._id},
      });
    }

    // Criar nova análise
    const analysis = new Analysis({
      user: req.user._id,
      exerciseType,
      videoUrl: video.url,
      videoDuration: video.duration,
      videoSize: video.size,
      videoResolution: video.resolution,
      status: 'processing',
      analysisMetadata: {
        modelVersion: '1.0.0',
        processingTime: 0,
        deviceInfo: {
          platform: 'server',
          model: 'backend-api',
          osVersion: 'node.js',
        },
        processedOn: 'server',
      }
    });

    await analysis.save();

    // Atualizar status do vídeo
    video.status = 'processing';
    video.processing.startedAt = new Date();
    await video.save();

    // Simular processamento assíncrono
    setTimeout(async () => {
      try {
        const processingStartTime = Date.now();

        // Simular análise (substituir por integração real com MediaPipe)
        const analysisResults = simulateAnalysis(exerciseType, video.duration);

        const processingTime = Date.now() - processingStartTime;

        // Atualizar análise com resultados
        analysis.analysisResults = analysisResults;
        analysis.status = 'completed';
        analysis.analyzedAt = new Date();
        analysis.analysisMetadata.processingTime = processingTime;

        await analysis.save();

        // Atualizar vídeo
        await video.markAsProcessed(analysis._id);

        console.log(`Análise concluída para vídeo ${videoId}`);
      } catch (error) {
        console.error('Erro no processamento:', error);

        analysis.status = 'failed';
        analysis.error = {
          message: error.message,
          code: 'PROCESSING_ERROR',
        };
        await analysis.save();

        await video.markAsFailed(error);
      }
    }, 2000 + Math.random() * 3000); // 2-5 segundos

    res.status(202).json({
      success: true,
      message: 'Análise iniciada com sucesso',
      data: {
        analysisId: analysis._id,
        status: analysis.status,
        estimatedTime: '2-5 segundos',
      }
    });
  }),
);

// @desc    Obter status da análise
// @route   GET /api/analysis/:id/status
// @access  Private
router.get(
  '/:id/status',
  protect,
  [param('id').isMongoId().withMessage('ID da análise inválido')],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).select(
      'status error analysisMetadata.processingTime createdAt analyzedAt',
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Análise não encontrada',
      });
    }

    res.json({
      success: true,
      data: {
        analysisId: analysis._id,
        status: analysis.status,
        processingTime: analysis.analysisMetadata?.processingTime,
        createdAt: analysis.createdAt,
        analyzedAt: analysis.analyzedAt,
        error: analysis.error,
      }
    });
  }),
);

// @desc    Obter resultados da análise
// @route   GET /api/analysis/:id
// @access  Private
router.get(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('ID da análise inválido')],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Análise não encontrada',
      });
    }

    if (analysis.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Análise ainda não foi concluída',
        data: {
          status: analysis.status,
          error: analysis.error,
        }
      });
    }

    res.json({
      success: true,
      data: {
        analysis: {
          id: analysis._id,
          exerciseType: analysis.exerciseType,
          videoDuration: analysis.videoDuration,
          results: analysis.analysisResults,
          metadata: analysis.analysisMetadata,
          scoreGrade: analysis.scoreGrade,
          tags: analysis.tags,
          notes: analysis.notes,
          isFavorite: analysis.isFavorite,
          createdAt: analysis.createdAt,
          analyzedAt: analysis.analyzedAt,
        }
      },
    });
  }),
);

// @desc    Listar análises do usuário
// @route   GET /api/analysis
// @access  Private
router.get(
  '/',
  protect,
  [
    query('page')
      .optional()
      .isInt({min: 1})
      .withMessage('Página deve ser um número maior que 0'),
    query('limit')
      .optional()
      .isInt({min: 1, max: 50})
      .withMessage('Limite deve ser entre 1 e 50'),
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
    query('status')
      .optional()
      .isIn(['pending', 'processing', 'completed', 'failed'])
      .withMessage('Status inválido'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      exerciseType,
      status = 'completed',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Construir filtros
    const filters = {
      user: req.user._id,
      status
    };

    if (exerciseType) {filters.exerciseType = exerciseType;}

    // Configurar ordenação
    const sortOptions = {};

    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Executar consulta com paginação
    const skip = (page - 1) * limit;
    const analyses = await Analysis.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-landmarks -error.stack'); // Excluir dados pesados

    const total = await Analysis.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        analyses: analyses.map(analysis => ({
          id: analysis._id,
          exerciseType: analysis.exerciseType,
          videoDuration: analysis.videoDuration,
          overallScore: analysis.analysisResults?.overallScore,
          repetitions: analysis.analysisResults?.repetitions,
          confidence: analysis.analysisResults?.confidence,
          scoreGrade: analysis.scoreGrade,
          status: analysis.status,
          isFavorite: analysis.isFavorite,
          createdAt: analysis.createdAt,
          analyzedAt: analysis.analyzedAt,
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        }
      },
    });
  }),
);

// @desc    Obter estatísticas de análises do usuário
// @route   GET /api/analysis/stats/overview
// @access  Private
router.get(
  '/stats/overview',
  protect,
  catchAsync(async (req, res) => {
    const {exerciseType, days = 30} = req.query;

    // Estatísticas gerais
    const generalStats = await Analysis.getUserStats(
      req.user._id,
      exerciseType,

    // Progresso ao longo do tempo
    const progressData = await Analysis.getProgressOverTime(
      req.user._id,
      exerciseType,
      days,

    // Estatísticas por exercício
    const exerciseStats = await Analysis.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'completed',
        }
      },
      {
        $group: {
          _id: '$exerciseType',
          count: {$sum: 1},
          averageScore: {$avg: '$analysisResults.overallScore'},
          bestScore: {$max: '$analysisResults.overallScore'},
          totalRepetitions: {$sum: '$analysisResults.repetitions'},
        },
      },
      {$sort: {count: -1}},
    ]);

    res.json({
      success: true,
      data: {
        overview: generalStats,
        progress: progressData,
        byExercise: exerciseStats,
      }
    });
  }),
);

// @desc    Atualizar análise (favoritar, adicionar notas, tags)
// @route   PUT /api/analysis/:id
// @access  Private
router.put(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('ID da análise inválido'),
    body('isFavorite')
      .optional()
      .isBoolean()
      .withMessage('isFavorite deve ser um boolean'),
    body('notes')
      .optional()
      .isLength({max: 1000})
      .withMessage('Notas devem ter no máximo 1000 caracteres'),
    body('tags').optional().isArray().withMessage('Tags devem ser um array'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Análise não encontrada',
      });
    }

    const {isFavorite, notes, tags} = req.body;

    // Atualizar campos permitidos
    if (isFavorite !== undefined) {analysis.isFavorite = isFavorite;}
    if (notes !== undefined) {analysis.notes = notes;}
    if (tags !== undefined) {analysis.tags = tags;}

    await analysis.save();

    res.json({
      success: true,
      message: 'Análise atualizada com sucesso',
      data: {
        analysis: {
          id: analysis._id,
          isFavorite: analysis.isFavorite,
          notes: analysis.notes,
          tags: analysis.tags,
          updatedAt: analysis.updatedAt,
        }
      },
    });
  }),
);

// @desc    Deletar análise
// @route   DELETE /api/analysis/:id
// @access  Private
router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('ID da análise inválido')],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Análise não encontrada',
      });
    }

    await analysis.deleteOne();

    res.json({
      success: true,
      message: 'Análise deletada com sucesso',
    });
  }),
);

module.exports = router;
