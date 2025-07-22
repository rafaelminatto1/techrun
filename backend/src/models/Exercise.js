const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      required: true,
    },
    exerciseType: {
      type: String,
      required: true,
      enum: ['squat', 'pushup', 'pullup', 'deadlift', 'benchpress', 'other'],
    },
    duration: {
      type: Number, // em segundos
      required: true,
    },
    repetitions: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    feedback: {
      overall: String,
      improvements: [String],
      strengths: [String],
    },
    metrics: {
      accuracy: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      consistency: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      form: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      timing: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    personalBests: {
      isNewRecord: {
        type: Boolean,
        default: false,
      },
      previousBest: Number,
      improvement: Number,
    },
    tags: [String],
    notes: String,
    isCompleted: {
      type: Boolean,
      default: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Índices para otimizar consultas
exerciseSchema.index({userId: 1, completedAt: -1});
exerciseSchema.index({userId: 1, exerciseType: 1});
exerciseSchema.index({userId: 1, score: -1});

// Método para calcular estatísticas do usuário
exerciseSchema.statics.getUserStats = async function (
  userId,
  timeframe = '30d',
) {
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
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  const stats = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        completedAt: {$gte: startDate},
        isCompleted: true,
      },
    },
    {
      $group: {
        _id: null,
        totalExercises: {$sum: 1},
        totalDuration: {$sum: '$duration'},
        totalRepetitions: {$sum: '$repetitions'},
        averageScore: {$avg: '$score'},
        bestScore: {$max: '$score'},
        exerciseTypes: {$addToSet: '$exerciseType'},
        averageAccuracy: {$avg: '$metrics.accuracy'},
        averageConsistency: {$avg: '$metrics.consistency'},
        averageForm: {$avg: '$metrics.form'},
        averageTiming: {$avg: '$metrics.timing'},
      },
    },
  ]);

  return (
    stats[0] || {
      totalExercises: 0,
      totalDuration: 0,
      totalRepetitions: 0,
      averageScore: 0,
      bestScore: 0,
      exerciseTypes: [],
      averageAccuracy: 0,
      averageConsistency: 0,
      averageForm: 0,
      averageTiming: 0,
    }
  );
};

// Método para obter progresso por tipo de exercício
exerciseSchema.statics.getProgressByType = async function (
  userId,
  exerciseType,
  limit = 10,
) {
  return await this.find({
    userId,
    exerciseType,
    isCompleted: true,
  })
    .sort({completedAt: -1})
    .limit(limit)
    .select('score metrics completedAt duration repetitions');
};

module.exports = mongoose.model('Exercise', exerciseSchema);
