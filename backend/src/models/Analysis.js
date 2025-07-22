// Modelo de Análise de Exercícios
const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    // Referência ao usuário
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuário é obrigatório'],
      index: true,
    },

  // Informações do exercício
    exerciseType: {
      type: String,
      required: [true, 'Tipo de exercício é obrigatório'],
      enum: [
        'squat',
        'pushup',
        'plank',
        'deadlift',
        'pullup',
        'lunges',
        'burpees',
        'general',
      ],
    },

  // Dados do vídeo
    videoUrl: {
      type: String,
      required: [true, 'URL do vídeo é obrigatória'],
    },

  videoDuration: {
      type: Number, // em segundos
      required: [true, 'Duração do vídeo é obrigatória'],
      min: [1, 'Duração deve ser maior que 1 segundo'],
      max: [300, 'Duração deve ser menor que 5 minutos'],
    },

  videoSize: {
      type: Number, // em bytes
      required: [true, 'Tamanho do vídeo é obrigatório'],
    },


  videoResolution: {
      width: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
    },

  // Resultados da análise
    analysisResults: {
      // Score geral (0-100)
      overallScore: {
        type: Number,
        required: [true, 'Score geral é obrigatório'],
        min: [0, 'Score deve ser maior ou igual a 0'],
        max: [100, 'Score deve ser menor ou igual a 100'],
      },


    // Confiança da análise (0-1)
      confidence: {
        type: Number,
        required: [true, 'Confiança é obrigatória'],
        min: [0, 'Confiança deve ser maior ou igual a 0'],
        max: [1, 'Confiança deve ser menor ou igual a 1'],
      },

    // Número de repetições detectadas
      repetitions: {
        type: Number,
        required: [true, 'Número de repetições é obrigatório'],
        min: [0, 'Repetições deve ser maior ou igual a 0'],
      },

    // Feedback detalhado
      feedback: {
        // Pontos positivos
        strengths: [
          {
            type: String,
            maxlength: [200, 'Feedback deve ter no máximo 200 caracteres'],
          },


        // Pontos de melhoria
        improvements: [
          {
            type: String,
            maxlength: [200, 'Feedback deve ter no máximo 200 caracteres'],
          },


        // Dicas específicas
        tips: [
          {
            type: String,
            maxlength: [200, 'Dica deve ter no máximo 200 caracteres'],
          },
        ],


      // Métricas específicas por exercício
      exerciseMetrics: {
        // Para agachamentos
        squat: {
          kneeAngle: {
            min: Number,
            max: Number,
            average: Number,
          },
          depth: {
            type: String,
            enum: ['shallow', 'parallel', 'deep'],
          },
          kneeAlignment: {
            type: String,
            enum: ['good', 'valgus', 'varus'],
          },
        },

      // Para flexões
        pushup: {
          armAngle: {
            min: Number,
            max: Number,
            average: Number,
          },
          bodyAlignment: {
            type: String,
            enum: ['straight', 'sagging', 'piked'],
          },
          rangeOfMotion: {
            type: String,
            enum: ['full', 'partial', 'limited'],
          },

      // Para prancha
        plank: {
          duration: Number, // em segundos
          stability: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor'],
          },
          bodyAlignment: {
            type: String,
            enum: ['straight', 'sagging', 'piked'],
          },
        },
      },

    // Dados dos landmarks (pontos de pose)
      landmarks: [
        {
          timestamp: {
            type: Number,
            required: true,
          },
          points: [
            {
              name: {
                type: String,
                required: true,
              },
              x: {
                type: Number,
                required: true,
              },
              y: {
                type: Number,
                required: true,
              },
              z: {
                type: Number,
                default: 0,
              },
              confidence: {
                type: Number,
                min: 0,
                max: 1,
              },
            },
          ],
        },
      ],
    },


  // Metadados da análise
    analysisMetadata: {
      // Versão do modelo de ML usado
      modelVersion: {
        type: String,
        required: [true, 'Versão do modelo é obrigatória'],
      },


    // Tempo de processamento em ms
      processingTime: {
        type: Number,
        required: [true, 'Tempo de processamento é obrigatório'],
      },

    // Dispositivo usado para análise
      deviceInfo: {
        platform: {
          type: String,
          enum: ['ios', 'android', 'web'],
        },
        model: String,
        osVersion: String,
      },

    // Se foi processado no dispositivo ou servidor
      processedOn: {
        type: String,
        enum: ['device', 'server'],
        default: 'device',
      },
    },

  // Status da análise
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },

  // Erro (se houver)
    error: {
      message: String,
      code: String,
      stack: String,
    },


  // Flags
    isPublic: {
      type: Boolean,
      default: false,
    },

  isFavorite: {
      type: Boolean,
      default: false,
    },

  // Tags personalizadas
    tags: [
      {
        type: String,
        maxlength: [50, 'Tag deve ter no máximo 50 caracteres'],
      },


    // Notas do usuário
    notes: {
      type: String,
      maxlength: [1000, 'Notas devem ter no máximo 1000 caracteres'],
    },

  // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

  updatedAt: {
      type: Date,
      default: Date.now,
    },

  // Data da análise (pode ser diferente de createdAt)
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);

// Índices
analysisSchema.index({user: 1, createdAt: -1});
analysisSchema.index({exerciseType: 1});
analysisSchema.index({'analysisResults.overallScore': -1});
analysisSchema.index({status: 1});
analysisSchema.index({createdAt: -1});
analysisSchema.index({user: 1, exerciseType: 1, createdAt: -1});

// Virtual para classificação do score
analysisSchema.virtual('scoreGrade').get(function () {
  const score = this.analysisResults.overallScore;

  if (score >= 90) {return 'A';}
  if (score >= 80) {return 'B';}
  if (score >= 70) {return 'C';}
  if (score >= 60) {return 'D';}
  return 'F';
});

// Virtual para duração formatada
analysisSchema.virtual('formattedDuration').get(function () {
  const duration = this.videoDuration;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Middleware para atualizar updatedAt
analysisSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Método para calcular estatísticas do usuário
analysisSchema.statics.getUserStats = async function (
  userId,
  exerciseType = null,
) {
  const matchStage = {
    user: mongoose.Types.ObjectId(userId),
    status: 'completed',
  };

  if (exerciseType) {
    matchStage.exerciseType = exerciseType;
  }

  const stats = await this.aggregate([
    {$match: matchStage},
    {
      $group: {
        _id: null,
        totalAnalyses: {$sum: 1},
        averageScore: {$avg: '$analysisResults.overallScore'},
        bestScore: {$max: '$analysisResults.overallScore'},
        totalRepetitions: {$sum: '$analysisResults.repetitions'},
        averageConfidence: {$avg: '$analysisResults.confidence'},
        totalDuration: {$sum: '$videoDuration'},
      },
    }
  ]);

  return (
    stats[0] || {
      totalAnalyses: 0,
      averageScore: 0,
      bestScore: 0,
      totalRepetitions: 0,
      averageConfidence: 0,
      totalDuration: 0,
    }
  );
};

// Método para obter progresso ao longo do tempo
analysisSchema.statics.getProgressOverTime = async function (
  userId,
  exerciseType = null,
  days = 30,
) {
  const startDate = new Date();

  startDate.setDate(startDate.getDate() - days);

  const matchStage = {
    user: mongoose.Types.ObjectId(userId),
    status: 'completed',
    createdAt: {$gte: startDate},
  };

  if (exerciseType) {
    matchStage.exerciseType = exerciseType;
  }

  return await this.aggregate([
    {$match: matchStage},
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
      },
    },
    {$sort: {'_id.year': 1, '_id.month': 1, '_id.day': 1}},
  ]);
};

// Método para obter análises similares
analysisSchema.methods.getSimilarAnalyses = async function (limit = 5) {
  return await this.constructor
    .find({
      user: this.user,
      exerciseType: this.exerciseType,
      _id: {$ne: this._id},
      status: 'completed',
    })
    .sort({'analysisResults.overallScore': -1})
    .limit(limit)
    .select('analysisResults.overallScore createdAt videoDuration');
};

module.exports = mongoose.model('Analysis', analysisSchema);
