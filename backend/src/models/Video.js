// Modelo de Vídeo
const mongoose = require('mongoose');
const crypto = require('crypto');

const videoSchema = new mongoose.Schema(
  {
    // Referência ao usuário
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuário é obrigatório'],
      index: true,
    },

  // Informações básicas do arquivo
    filename: {
      type: String,
      required: [true, 'Nome do arquivo é obrigatório'],
    },

  originalName: {
      type: String,
      required: [true, 'Nome original é obrigatório'],
    },

  // URLs de armazenamento
    url: {
      type: String,
      required: [true, 'URL é obrigatória'],
    },

  thumbnailUrl: {
      type: String,
    },


  // Informações do arquivo
    size: {
      type: Number,
      required: [true, 'Tamanho é obrigatório'],
      min: [1, 'Tamanho deve ser maior que 0'],
    },

  duration: {
      type: Number, // em segundos
      required: [true, 'Duração é obrigatória'],
      min: [1, 'Duração deve ser maior que 1 segundo'],
      max: [300, 'Duração deve ser menor que 5 minutos'],
    },


  format: {
      type: String,
      required: [true, 'Formato é obrigatório'],
      enum: ['mp4', 'mov', 'avi', 'webm'],
    },


  resolution: {
      width: {
        type: Number,
        required: [true, 'Largura é obrigatória'],
      },
      height: {
        type: Number,
        required: [true, 'Altura é obrigatória'],
      },
    },


  frameRate: {
      type: Number,
      min: [1, 'Frame rate deve ser maior que 1'],
      max: [120, 'Frame rate deve ser menor que 120'],
    },

  bitrate: {
      type: Number, // em kbps
    },


  // Hash para verificação de integridade
    hash: {
      type: String,
      required: [true, 'Hash é obrigatório'],
    },


  // Metadados do exercício
    exerciseType: {
      type: String,
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

  // Status do processamento
    status: {
      type: String,
      enum: [
        'uploading',
        'uploaded',
        'processing',
        'processed',
        'failed',
        'deleted',
      ],
      default: 'uploading',
    },

  // Informações de processamento
    processing: {
      startedAt: Date,
      completedAt: Date,
      error: {
        message: String,
        code: String,
        stack: String,
      },
      attempts: {
        type: Number,
        default: 0,
        max: [3, 'Máximo 3 tentativas de processamento'],
      },
    },

  // Referência à análise (se houver)
    analysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
    },

  // Configurações de privacidade
    privacy: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      allowDownload: {
        type: Boolean,
        default: false,
      },
      allowSharing: {
        type: Boolean,
        default: true,
      },
    },

  // Metadados adicionais
    metadata: {
      // Informações do dispositivo
      device: {
        platform: {
          type: String,
          enum: ['ios', 'android', 'web'],
        },
        model: String,
        osVersion: String,
        appVersion: String,
      },

    // Configurações da câmera
      camera: {
        position: {
          type: String,
          enum: ['front', 'back'],
        },
        quality: {
          type: String,
          enum: ['low', 'medium', 'high', 'ultra'],
        },
        stabilization: Boolean,
        flash: Boolean,
      },

    // Localização (se permitida)
      location: {
        latitude: Number,
        longitude: Number,
        accuracy: Number,
        timestamp: Date,
      },

    // Condições de gravação
      environment: {
        lighting: {
          type: String,
          enum: ['poor', 'fair', 'good', 'excellent'],
        },
        background: {
          type: String,
          enum: ['clean', 'cluttered', 'outdoor', 'gym'],
        },
        noise: {
          type: String,
          enum: ['quiet', 'moderate', 'loud'],
        },
      },
    },

  // Tags e categorização
    tags: [
      {
        type: String,
        maxlength: [50, 'Tag deve ter no máximo 50 caracteres'],
      },


    // Notas do usuário
    notes: {
      type: String,
      maxlength: [500, 'Notas devem ter no máximo 500 caracteres'],
    },

  // Estatísticas de uso
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      downloads: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
      lastViewed: Date,
    },

  // Flags
    isFavorite: {
      type: Boolean,
      default: false,
    },


  isArchived: {
      type: Boolean,
      default: false,
    },


  // Data de expiração (para limpeza automática)
    expiresAt: {
      type: Date,
      index: {expireAfterSeconds: 0},
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


  uploadedAt: {
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
videoSchema.index({user: 1, createdAt: -1});
videoSchema.index({status: 1});
videoSchema.index({exerciseType: 1});
videoSchema.index({hash: 1}, {unique: true});
videoSchema.index({'privacy.isPublic': 1});
videoSchema.index({user: 1, exerciseType: 1, createdAt: -1});

// Virtual para tamanho formatado
videoSchema.virtual('formattedSize').get(function () {
  const size = this.size;

  if (size < 1024) {return `${size} B`;}
  if (size < 1024 * 1024) {return `${(size / 1024).toFixed(1)} KB`;}
  if (size < 1024 * 1024 * 1024)
    {return `${(size / (1024 * 1024)).toFixed(1)} MB`;}
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
});

// Virtual para duração formatada
videoSchema.virtual('formattedDuration').get(function () {
  const duration = this.duration;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual para resolução formatada
videoSchema.virtual('formattedResolution').get(function () {
  return `${this.resolution.width}x${this.resolution.height}`;
});

// Virtual para qualidade baseada na resolução
videoSchema.virtual('quality').get(function () {
  const pixels = this.resolution.width * this.resolution.height;

  if (pixels >= 1920 * 1080) {return 'HD';}
  if (pixels >= 1280 * 720) {return 'HD Ready';}
  if (pixels >= 854 * 480) {return 'SD';}
  return 'Low';
});

// Middleware para atualizar updatedAt
videoSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Middleware para gerar hash se não existir
videoSchema.pre('save', function (next) {
  if (!this.hash && this.isNew) {
    // Gerar hash baseado no conteúdo do arquivo
    const hashContent = `${this.filename}-${this.size}-${
      this.user
    }-${Date.now()}`;

    this.hash = crypto.createHash('sha256').update(hashContent).digest('hex');
  }
  next();
});

// Método estático para obter estatísticas do usuário
videoSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        status: {$in: ['uploaded', 'processed']},
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
        totalDownloads: {$sum: '$stats.downloads'},
        totalShares: {$sum: '$stats.shares'},
      },
    }
  ]);

  return (
    stats[0] || {
      totalVideos: 0,
      totalSize: 0,
      totalDuration: 0,
      averageDuration: 0,
      totalViews: 0,
      totalDownloads: 0,
      totalShares: 0,
    }
  );
};

// Método estático para obter vídeos por exercício
videoSchema.statics.getByExerciseType = async function (
  userId,
  exerciseType,
  limit = 10,
) {
  return await this.find({
    user: userId,
    exerciseType,
    status: {$in: ['uploaded', 'processed']},
    isArchived: false,
  })
    .sort({createdAt: -1})
    .limit(limit)
    .populate(
      'analysis',
      'analysisResults.overallScore analysisResults.repetitions',
    );
};

// Método para incrementar visualizações
videoSchema.methods.incrementViews = async function () {
  this.stats.views += 1;
  this.stats.lastViewed = new Date();

  return await this.save();
};

// Método para incrementar downloads
videoSchema.methods.incrementDownloads = async function () {
  this.stats.downloads += 1;

  return await this.save();
};

// Método para incrementar compartilhamentos
videoSchema.methods.incrementShares = async function () {
  this.stats.shares += 1;

  return await this.save();
};

// Método para marcar como processado
videoSchema.methods.markAsProcessed = async function (analysisId = null) {
  this.status = 'processed';
  this.processing.completedAt = new Date();
  if (analysisId) {
    this.analysis = analysisId;
  }

  return await this.save();
};

// Método para marcar como falhou
videoSchema.methods.markAsFailed = async function (error) {
  this.status = 'failed';
  this.processing.error = {
    message: error.message,
    code: error.code || 'PROCESSING_ERROR',
    stack: error.stack,
  };
  this.processing.attempts += 1;

  return await this.save();
};

// Método para verificar se pode tentar novamente
videoSchema.methods.canRetry = function () {
  return this.processing.attempts < 3 && this.status === 'failed';
};

module.exports = mongoose.model('Video', videoSchema);
