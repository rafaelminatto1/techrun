// Rotas de Vídeos
const express = require('express');
const multer = require('multer');
const {body, param, query, validationResult} = require('express-validator');
const Video = require('../models/Video');
const Analysis = require('../models/Analysis');
const {protect} = require('../middleware/auth');
const {AppError, catchAsync} = require('../middleware/errorHandler');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const AWS = require('aws-sdk');

// Configurar AWS S3 se disponível
let s3 = null;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });
  console.log('✅ AWS S3 configured for video storage');
} else {
  console.log('⚠️ AWS S3 not configured, using local storage');
}

const router = express.Router();

// Configuração do Multer para upload de vídeos
const storage = s3
  ? multer.memoryStorage() // Para AWS S3, usar memory storage
  : multer.diskStorage({
      destination (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/videos');
        cb(null, uploadPath);
      },
      filename (req, file, cb) {
        // Gerar nome único para o arquivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `video-${uniqueSuffix}${extension}`);
      }
    });

const fileFilter = (req, file, cb) => {
  // Verificar se é um arquivo de vídeo
  const allowedMimes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Apenas arquivos de vídeo são permitidos', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1,
  }
});

// Função para upload para S3
const uploadToS3 = async (file, exerciseType, userId) => {
  if (!s3) {throw new Error('S3 not configured');}

  const uniqueSuffix = `${Date.now()  }-${  Math.round(Math.random() * 1E9)}`;
  const extension = path.extname(file.originalname);
  const key = `videos/${userId}/${exerciseType}/${uniqueSuffix}${extension}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    Metadata: {
      'original-name': file.originalname,
      'exercise-type': exerciseType,
      'user-id': userId.toString(),
    }
  };

  console.log(`📤 Uploading to S3: ${key}`);

  const result = await s3.upload(uploadParams).promise();

  console.log(`✅ S3 upload successful: ${result.Location}`);

  return {
    key,
    location: result.Location,
    bucket: process.env.AWS_S3_BUCKET,
  };
};

// Função para obter informações detalhadas do vídeo
const getVideoMetadata = async (filePath, isS3 = false) => {
  // Em produção, usaria ffprobe para obter metadados reais do vídeo
  // Por agora, simular os metadados
  const mockMetadata = {
    duration: Math.floor(Math.random() * 300) + 30, // 30-330 segundos
    resolution: {
      width: 1280,
      height: 720,
    },
    frameRate: 30,
    bitrate: Math.floor(Math.random() * 2000) + 1000, // 1000-3000 kbps
    quality: 'HD',
  };

  console.log(
    `📊 Video metadata extracted: ${mockMetadata.duration}s, ${mockMetadata.resolution.width}x${mockMetadata.resolution.height}`,

  return mockMetadata;
};

// Função para gerar thumbnail
const generateThumbnail = async (videoPath, isS3 = false) => {
  // Em produção, usaria ffmpeg para gerar thumbnail real
  // Por agora, retornar URL simulada
  const thumbnailUrl = isS3
    ? 'https://via.placeholder.com/320x180.png?text=Thumbnail'
    : `/uploads/thumbnails/thumb_${Date.now()}.jpg`;

  console.log(`🖼️ Thumbnail generated: ${thumbnailUrl}`);

  return thumbnailUrl;
};

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

// @desc    Upload de vídeo
// @route   POST /api/videos/upload
// @access  Private
router.post(
  '/upload',
  protect,
  upload.single('video'),
  [
    body('exerciseType')
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
    body('notes')
      .optional()
      .isLength({max: 500})
      .withMessage('Notas devem ter no máximo 500 caracteres'),
    body('tags').optional().isArray().withMessage('Tags devem ser um array'),
    body('privacy.isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic deve ser um boolean'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo de vídeo foi enviado',
      });
    }

    console.log(
      `🎬 Processing video upload: ${req.file.originalname} (${Math.round(
        req.file.size / (1024 * 1024),
      )}MB)`,
    );

    const {
      exerciseType = 'general',
      notes,
      tags,
      privacy = {},
      metadata = '{}',
    } = req.body;

    try {
      // Parse metadata se for string
      const parsedMetadata =
        typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

      // Determinar formato baseado na extensão
      const extension = path.extname(req.file.originalname).toLowerCase();
      const formatMap = {
        '.mp4': 'mp4',
        '.mov': 'mov',
        '.avi': 'avi',
        '.webm': 'webm',
      };
      const format = formatMap[extension] || 'mp4';

      let videoUrl, videoKey, fileSize;

      if (s3) {
        // Upload para AWS S3
        console.log('☁️ Uploading to AWS S3...');
        const s3Result = await uploadToS3(req.file, exerciseType, req.user._id);

        videoUrl = s3Result.location;
        videoKey = s3Result.key;
        fileSize = req.file.size;
      } else {
        // Storage local
        console.log('💾 Using local storage...');
        const fileStats = await fs.stat(req.file.path);

        videoUrl = `/uploads/videos/${req.file.filename}`;
        videoKey = req.file.filename;
        fileSize = fileStats.size;
      }

      // Obter metadados do vídeo
      const videoMetadata = await getVideoMetadata(
        s3 ? videoKey : req.file.path,
        !!s3,

      // Gerar thumbnail
      const thumbnailUrl = await generateThumbnail(
        s3 ? videoKey : req.file.path,
        !!s3,
      );

      // Criar registro do vídeo com dados completos
      const video = new Video({
        user: req.user._id,
        filename: videoKey,
        originalName: req.file.originalname,
        url: videoUrl,
        thumbnailUrl,
        size: fileSize,
        format,
        duration: videoMetadata.duration,
        resolution: videoMetadata.resolution,
        frameRate: videoMetadata.frameRate,
        bitrate: videoMetadata.bitrate,
        quality: videoMetadata.quality,
        exerciseType,
        notes: notes || '',
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
        privacy: {
          isPublic: privacy.isPublic || false,
          allowDownload: privacy.allowDownload !== false,
          allowSharing: privacy.allowSharing !== false,
        },
        metadata: {
          ...parsedMetadata,
          uploadMethod: s3 ? 's3' : 'local',
          processingTimestamp: new Date().toISOString(),
        },
        status: 'uploaded',
      });

      await video.save();

      console.log(`✅ Video uploaded successfully: ${video._id}`);

      // Resposta detalhada
      res.status(201).json({
        success: true,
        message: 'Vídeo enviado com sucesso',
        data: {
          video: {
            id: video._id,
            filename: video.filename,
            originalName: video.originalName,
            url: video.url,
            thumbnailUrl: video.thumbnailUrl,
            size: video.formattedSize,
            duration: video.formattedDuration,
            resolution: video.formattedResolution,
            format: video.format,
            quality: video.quality,
            status: video.status,
            exerciseType: video.exerciseType,
            tags: video.tags,
            privacy: video.privacy,
            createdAt: video.createdAt,
            metadata: {
              uploadMethod: video.metadata.uploadMethod,
              originalSize: parsedMetadata.originalSize,
              deviceInfo: parsedMetadata.deviceInfo,
            }
          },
        }
      });

      // Iniciar processamento assíncrono (análise de pose, etc.)
      setImmediate(async () => {
        try {
          console.log(
            `🔄 Starting background processing for video ${video._id}`,

          // Aqui seria integrado com o serviço de análise de pose
          // Por agora, simular o processamento
          setTimeout(async () => {
            try {
              await Video.findByIdAndUpdate(video._id, {
                status: 'processed',
                'metadata.processingCompletedAt': new Date().toISOString(),
              });
              console.log(
                `✅ Background processing completed for video ${video._id}`,
              );
            } catch (error) {
              console.error(
                `❌ Background processing failed for video ${video._id}:`,
                error,
              );
            }
          }, 5000); // 5 segundos de simulação

        } catch (error) {
          console.error(
            `❌ Background processing error for video ${video._id}:`,
            error,
          );
        }
      });
    } catch (error) {
      console.error('❌ Video upload processing error:', error);

      // Limpar arquivo se houve erro e não é S3
      if (!s3 && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }

      throw new AppError(error.message || 'Erro ao processar vídeo', 500);
    }
  }),
);

// @desc    Listar vídeos do usuário
// @route   GET /api/videos
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
      .isIn(['uploading', 'uploaded', 'processing', 'processed', 'failed'])
      .withMessage('Status inválido'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      exerciseType,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Construir filtros
    const filters = {
      user: req.user._id,
      isArchived: false,
    };

    if (exerciseType) {filters.exerciseType = exerciseType;}
    if (status) {filters.status = status;}
    if (search) {
      filters.$or = [
        {originalName: {$regex: search, $options: 'i'}},
        {notes: {$regex: search, $options: 'i'}},
        {tags: {$in: [new RegExp(search, 'i')]}},
      ];
    }

    // Configurar ordenação
    const sortOptions = {};

    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Executar consulta com paginação
    const skip = (page - 1) * limit;
    const videos = await Video.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate(
        'analysis',
        'analysisResults.overallScore analysisResults.repetitions',
      )
      .select('-hash -metadata.location'); // Excluir dados sensíveis

    const total = await Video.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        videos: videos.map(video => ({
          id: video._id,
          filename: video.filename,
          originalName: video.originalName,
          size: video.formattedSize,
          duration: video.formattedDuration,
          resolution: video.formattedResolution,
          quality: video.quality,
          format: video.format,
          exerciseType: video.exerciseType,
          status: video.status,
          privacy: video.privacy,
          tags: video.tags,
          notes: video.notes,
          stats: video.stats,
          isFavorite: video.isFavorite,
          analysis: video.analysis,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
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

// @desc    Obter vídeo específico
// @route   GET /api/videos/:id
// @access  Private
router.get(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('ID do vídeo inválido')],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const video = await Video.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('analysis');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vídeo não encontrado',
      });
    }

    // Incrementar visualizações
    await video.incrementViews();

    res.json({
      success: true,
      data: {
        video: {
          id: video._id,
          filename: video.filename,
          originalName: video.originalName,
          url: video.url,
          thumbnailUrl: video.thumbnailUrl,
          size: video.formattedSize,
          duration: video.formattedDuration,
          resolution: video.formattedResolution,
          quality: video.quality,
          format: video.format,
          frameRate: video.frameRate,
          bitrate: video.bitrate,
          exerciseType: video.exerciseType,
          status: video.status,
          privacy: video.privacy,
          metadata: video.metadata,
          tags: video.tags,
          notes: video.notes,
          stats: video.stats,
          isFavorite: video.isFavorite,
          analysis: video.analysis,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
        }
      },
    });
  }),
);

// @desc    Atualizar vídeo
// @route   PUT /api/videos/:id
// @access  Private
router.put(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('ID do vídeo inválido'),
    body('exerciseType')
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
    body('notes')
      .optional()
      .isLength({max: 500})
      .withMessage('Notas devem ter no máximo 500 caracteres'),
    body('tags').optional().isArray().withMessage('Tags devem ser um array'),
    body('privacy.isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic deve ser um boolean'),
    body('isFavorite')
      .optional()
      .isBoolean()
      .withMessage('isFavorite deve ser um boolean'),
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const video = await Video.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vídeo não encontrado',
      });
    }

    const {exerciseType, notes, tags, privacy, isFavorite} = req.body;

    // Atualizar campos permitidos
    if (exerciseType !== undefined) {video.exerciseType = exerciseType;}
    if (notes !== undefined) {video.notes = notes;}
    if (tags !== undefined) {video.tags = tags;}
    if (isFavorite !== undefined) {video.isFavorite = isFavorite;}

    if (privacy) {
      if (privacy.isPublic !== undefined)
        {video.privacy.isPublic = privacy.isPublic;}
      if (privacy.allowDownload !== undefined)
        {video.privacy.allowDownload = privacy.allowDownload;}
      if (privacy.allowSharing !== undefined)
        {video.privacy.allowSharing = privacy.allowSharing;}
    }

    await video.save();

    res.json({
      success: true,
      message: 'Vídeo atualizado com sucesso',
      data: {
        video: {
          id: video._id,
          exerciseType: video.exerciseType,
          notes: video.notes,
          tags: video.tags,
          privacy: video.privacy,
          isFavorite: video.isFavorite,
          updatedAt: video.updatedAt,
        }
      },
    });
  }),
);

// @desc    Deletar vídeo
// @route   DELETE /api/videos/:id
// @access  Private
router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('ID do vídeo inválido')],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const video = await Video.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vídeo não encontrado',
      });
    }

    // Deletar arquivo físico
    try {
      const filePath = path.join(
        __dirname,
        '../../uploads/videos',
        video.filename,
      );

      await fs.unlink(filePath);
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
    }

    // Deletar análise associada (se houver)
    if (video.analysis) {
      await Analysis.findByIdAndDelete(video.analysis);
    }

    // Deletar registro do banco
    await video.deleteOne();

    res.json({
      success: true,
      message: 'Vídeo deletado com sucesso',
    });
  }),
);

// @desc    Obter estatísticas de vídeos do usuário
// @route   GET /api/videos/stats
// @access  Private
router.get(
  '/stats/overview',
  protect,
  catchAsync(async (req, res) => {
    const stats = await Video.getUserStats(req.user._id);

    // Estatísticas por exercício
    const exerciseStats = await Video.aggregate([
      {
        $match: {
          user: req.user._id,
          status: {$in: ['uploaded', 'processed']},
          exerciseType: {$exists: true},
        },
      },
      {
        $group: {
          _id: '$exerciseType',
          count: {$sum: 1},
          totalDuration: {$sum: '$duration'},
          averageDuration: {$avg: '$duration'},
        },
      },
      {$sort: {count: -1}},
    ]);

    res.json({
      success: true,
      data: {
        overview: stats,
        byExercise: exerciseStats,
      }
    });
  }),
);

module.exports = router;
