const express = require('express');
const Exercise = require('../models/Exercise');
const {protect} = require('../middleware/auth');
const router = express.Router();

// GET /api/exercises - Listar exercícios do usuário
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      exerciseType,
      sortBy = 'completedAt',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = req.query;

    const query = {userId: req.user.id, isCompleted: true};

    // Filtro por tipo de exercício
    if (exerciseType) {
      query.exerciseType = exerciseType;
    }

    // Filtro por data
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) {query.completedAt.$gte = new Date(startDate);}
      if (endDate) {query.completedAt.$lte = new Date(endDate);}
    }

    const sortOptions = {};

    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const exercises = await Exercise.find(query)
      .populate('videoId', 'filename originalName')
      .populate('analysisId', 'status confidence')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Exercise.countDocuments(query);

    res.json({
      exercises,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error);
    res.status(500).json({message: 'Erro interno do servidor'});
  }
});

// GET /api/exercises/stats - Estatísticas do usuário
router.get('/stats', protect, async (req, res) => {
  try {
    const {timeframe = '30d'} = req.query;

    const stats = await Exercise.getUserStats(req.user.id, timeframe);

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({message: 'Erro interno do servidor'});
  }
});

// GET /api/exercises/progress/:exerciseType - Progresso por tipo
router.get('/progress/:exerciseType', protect, async (req, res) => {
  try {
    const {exerciseType} = req.params;
    const {limit = 10} = req.query;

    const progress = await Exercise.getProgressByType(
      req.user.id,
      exerciseType,
      parseInt(limit),

    res.json(progress);
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).json({message: 'Erro interno do servidor'});
  }
});

// GET /api/exercises/:id - Detalhes de um exercício
router.get('/:id', protect, async (req, res) => {
  try {
    const exercise = await Exercise.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })
      .populate('videoId')
      .populate('analysisId')
      .populate('userId', 'name email');

    if (!exercise) {
      return res.status(404).json({message: 'Exercício não encontrado'});
    }

    res.json(exercise);
  } catch (error) {
    console.error('Erro ao buscar exercício:', error);
    res.status(500).json({message: 'Erro interno do servidor'});
  }
});

// POST /api/exercises - Criar novo exercício
router.post('/', protect, async (req, res) => {
  try {
    const exerciseData = {
      ...req.body,
      userId: req.user.id,
    };

    const exercise = new Exercise(exerciseData);

    await exercise.save();

    const populatedExercise = await Exercise.findById(exercise._id)
      .populate('videoId', 'filename originalName')
      .populate('analysisId', 'status confidence');

    res.status(201).json(populatedExercise);
  } catch (error) {
    console.error('Erro ao criar exercício:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: Object.values(error.errors).map(e => e.message),
      });
    }
    res.status(500).json({message: 'Erro interno do servidor'});
  }
});

// PUT /api/exercises/:id - Atualizar exercício
router.put('/:id', protect, async (req, res) => {
  try {
    const exercise = await Exercise.findOneAndUpdate(
      {_id: req.params.id, userId: req.user.id},
      req.body,
      {new: true, runValidators: true},
    )
      .populate('videoId', 'filename originalName')
      .populate('analysisId', 'status confidence');

    if (!exercise) {
      return res.status(404).json({message: 'Exercício não encontrado'});
    }

    res.json(exercise);
  } catch (error) {
    console.error('Erro ao atualizar exercício:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: Object.values(error.errors).map(e => e.message),
      });
    }
    res.status(500).json({message: 'Erro interno do servidor'});
  }
});

// DELETE /api/exercises/:id - Deletar exercício
router.delete('/:id', protect, async (req, res) => {
  try {
    const exercise = await Exercise.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!exercise) {
      return res.status(404).json({message: 'Exercício não encontrado'});
    }

    res.json({message: 'Exercício deletado com sucesso'});
  } catch (error) {
    console.error('Erro ao deletar exercício:', error);
    res.status(500).json({message: 'Erro interno do servidor'});
  }
});

// GET /api/exercises/types/summary - Resumo por tipos de exercício
router.get('/types/summary', protect, async (req, res) => {
  try {
    const {timeframe = '30d'} = req.query;

    const startDate = new Date();

    switch (timeframe) {
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

    const summary = await Exercise.aggregate([
      {
        $match: {
          userId: req.user.id,
          completedAt: {$gte: startDate},
          isCompleted: true,
        }
      },
      {
        $group: {
          _id: '$exerciseType',
          count: {$sum: 1},
          totalDuration: {$sum: '$duration'},
          totalRepetitions: {$sum: '$repetitions'},
          averageScore: {$avg: '$score'},
          bestScore: {$max: '$score'},
          lastExercise: {$max: '$completedAt'},
        },
      },
      {
        $sort: {count: -1},
      },
    ]);

    res.json(summary);
  } catch (error) {
    console.error('Erro ao buscar resumo por tipos:', error);
    res.status(500).json({message: 'Erro interno do servidor'});
  }
});

module.exports = router;
