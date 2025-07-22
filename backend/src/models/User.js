// Modelo de Usuário
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Informações básicas
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },


  email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido'],
    },


  password: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
      select: false, // Não incluir por padrão nas consultas
    },


  // Perfil do usuário
    avatar: {
      type: String,
      default: null,
    },


  dateOfBirth: {
      type: Date,
      validate: {
        validator: function (date) {
          return date < new Date();
        },
        message: 'Data de nascimento deve ser no passado',
      },
    },


  gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say',
    },


  // Informações físicas
    height: {
      type: Number, // em centímetros
      min: [50, 'Altura deve ser maior que 50cm'],
      max: [300, 'Altura deve ser menor que 300cm'],
    },

  weight: {
      type: Number, // em quilogramas
      min: [20, 'Peso deve ser maior que 20kg'],
      max: [500, 'Peso deve ser menor que 500kg'],
    },

  // Nível de atividade física
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

  // Objetivos
    goals: [
      {
        type: String,
        enum: [
          'weight_loss',
          'muscle_gain',
          'endurance',
          'flexibility',
          'strength',
          'general_fitness',
        ],
      },

    // Preferências de exercício
    preferredExercises: [
      {
        type: String,
        enum: [
          'squat',
          'pushup',
          'plank',
          'deadlift',
          'pullup',
          'lunges',
          'burpees',
        ],
      },
    ],


  // Sistema
    role: {
      type: String,
      enum: ['user', 'trainer', 'admin'],
      default: 'user',
    },


  isActive: {
      type: Boolean,
      default: true,
    },

  isEmailVerified: {
      type: Boolean,
      default: false,
    },

  emailVerificationToken: {
      type: String,
      select: false,
    },


  passwordResetToken: {
      type: String,
      select: false,
    },


  passwordResetExpires: {
      type: Date,
      select: false,
    },

  // Configurações de privacidade
    privacy: {
      shareProgress: {
        type: Boolean,
        default: false,
      },
      allowFriendRequests: {
        type: Boolean,
        default: true,
      },
      showInLeaderboard: {
        type: Boolean,
        default: true,
      },
    },

  // Configurações de notificação
    notifications: {
      workoutReminders: {
        type: Boolean,
        default: true,
      },
      progressUpdates: {
        type: Boolean,
        default: true,
      },
      socialUpdates: {
        type: Boolean,
        default: false,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
    },

  // Estatísticas
    stats: {
      totalWorkouts: {
        type: Number,
        default: 0,
      },
      totalExercises: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      streakDays: {
        type: Number,
        default: 0,
      },
      lastWorkoutDate: {
        type: Date,
      },
    },


  // Timestamps
    lastLoginAt: {
      type: Date,
    },


  createdAt: {
      type: Date,
      default: Date.now,
    },

  updatedAt: {
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
userSchema.index({email: 1});
userSchema.index({createdAt: -1});
userSchema.index({'stats.totalWorkouts': -1});
userSchema.index({'stats.averageScore': -1});

// Virtual para idade
userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) {return null;}
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

// Virtual para IMC
userSchema.virtual('bmi').get(function () {
  if (!this.weight || !this.height) {return null;}
  const heightInMeters = this.height / 100;

  return (
    Math.round((this.weight / (heightInMeters * heightInMeters)) * 10) / 10
  );
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function (next) {
  // Só fazer hash se a senha foi modificada
  if (!this.isModified('password')) {return next();}

  try {
    // Hash da senha com salt de 12 rounds
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware para atualizar updatedAt
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Método para verificar senha
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para gerar token de verificação
userSchema.methods.generateVerificationToken = function () {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = token;

  return token;
};

// Método para gerar token de reset de senha
userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = token;
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  return token;
};

// Método para atualizar estatísticas
userSchema.methods.updateStats = function (exerciseData) {
  this.stats.totalWorkouts += 1;
  this.stats.totalExercises += exerciseData.exerciseCount || 1;

  // Calcular nova média de score
  const currentTotal = this.stats.averageScore * (this.stats.totalWorkouts - 1);

  this.stats.averageScore = Math.round(
    (currentTotal + exerciseData.score) / this.stats.totalWorkouts,
  );

  // Atualizar streak
  const today = new Date();
  const lastWorkout = this.stats.lastWorkoutDate;

  if (!lastWorkout) {
    this.stats.streakDays = 1;
  } else {
    const daysDiff = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      this.stats.streakDays += 1;
    } else if (daysDiff > 1) {
      this.stats.streakDays = 1;
    }
    // Se daysDiff === 0, mantém o streak atual (mesmo dia)
  }

  this.stats.lastWorkoutDate = today;
};

// Método para obter perfil público
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    avatar: this.avatar,
    fitnessLevel: this.fitnessLevel,
    stats: {
      totalWorkouts: this.stats.totalWorkouts,
      averageScore: this.stats.averageScore,
      streakDays: this.stats.streakDays,
    },
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
