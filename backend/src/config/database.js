// Configuração do Banco de Dados MongoDB
const mongoose = require('mongoose');

// Configurações de conexão
const connectDB = async () => {
  try {
    // Opções de conexão
    const options = {
      // Configurações de conexão
      useNewUrlParser: true,
      useUnifiedTopology: true,

      // Configurações de performance
      maxPoolSize: 10, // Máximo de conexões simultâneas
      serverSelectionTimeoutMS: 5000, // Timeout para seleção do servidor
      socketTimeoutMS: 45000, // Timeout para operações de socket

      // Configurações de buffer
      bufferMaxEntries: 0,
      bufferCommands: false,

      // Configurações de heartbeat
      heartbeatFrequencyMS: 10000,

      // Configurações de retry
      retryWrites: true,
      retryReads: true,
    };

    // String de conexão
    const mongoURI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/techrun';

    console.log('🔄 Conectando ao MongoDB...');

    // Conectar ao MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    console.log(
      `✅ MongoDB conectado: ${conn.connection.host}:${conn.connection.port}`,
    );
    console.log(`📊 Banco de dados: ${conn.connection.name}`);

    // Event listeners para monitoramento
    mongoose.connection.on('connected', () => {
      console.log('🟢 MongoDB: Conexão estabelecida');
    });

    mongoose.connection.on('error', err => {
      console.error('🔴 MongoDB: Erro de conexão:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 MongoDB: Conexão perdida');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🟢 MongoDB: Reconectado');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log(
          '🔴 MongoDB: Conexão fechada devido ao encerramento da aplicação',
        );
        process.exit(0);
      } catch (error) {
        console.error('🔴 Erro ao fechar conexão MongoDB:', error);
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    console.error('🔴 Erro ao conectar ao MongoDB:', error.message);

    // Retry logic
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Tentando reconectar em 5 segundos...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Função para verificar status da conexão
const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    state: states[state],
    isConnected: state === 1,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
  };
};

// Função para obter estatísticas da conexão
const getConnectionStats = () => {
  const db = mongoose.connection.db;

  if (!db) {
    return null;
  }

  return {
    collections: Object.keys(mongoose.connection.collections).length,
    models: Object.keys(mongoose.models).length,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
  };
};

// Função para limpar dados de teste (apenas em desenvolvimento)
const clearTestData = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('clearTestData só pode ser usado em ambiente de teste');
  }

  try {
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
      await collection.deleteMany({});
    }

    console.log('🧹 Dados de teste limpos');
  } catch (error) {
    console.error('🔴 Erro ao limpar dados de teste:', error);
    throw error;
  }
};

// Função para criar índices
const createIndexes = async () => {
  try {
    console.log('🔄 Criando índices...');

    // Índices para User
    await mongoose.connection
      .collection('users')
      .createIndex({email: 1}, {unique: true, background: true});

    // Índices para Video
    await mongoose.connection
      .collection('videos')
      .createIndex({user: 1, createdAt: -1}, {background: true});

    await mongoose.connection
      .collection('videos')
      .createIndex({hash: 1}, {unique: true, background: true});

    // Índices para Analysis
    await mongoose.connection
      .collection('analyses')
      .createIndex({user: 1, createdAt: -1}, {background: true});

    await mongoose.connection
      .collection('analyses')
      .createIndex({'analysisResults.overallScore': -1}, {background: true});

    console.log('✅ Índices criados com sucesso');
  } catch (error) {
    console.error('🔴 Erro ao criar índices:', error);
  }
};

// Função para backup (desenvolvimento)
const createBackup = async backupName => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Backup manual não permitido em produção');
  }

  try {
    const collections = await mongoose.connection.db.collections();
    const backup = {};

    for (const collection of collections) {
      const data = await collection.find({}).toArray();

      backup[collection.collectionName] = data;
    }

    const fs = require('fs').promises;
    const path = require('path');

    const backupPath = path.join(__dirname, '../../backups');

    await fs.mkdir(backupPath, {recursive: true});

    const filename = `${backupName || 'backup'}-${Date.now()}.json`;
    const filepath = path.join(backupPath, filename);

    await fs.writeFile(filepath, JSON.stringify(backup, null, 2));

    console.log(`💾 Backup criado: ${filepath}`);

    return filepath;
  } catch (error) {
    console.error('🔴 Erro ao criar backup:', error);
    throw error;
  }
};

// Função para restaurar backup (desenvolvimento)
const restoreBackup = async backupPath => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Restore manual não permitido em produção');
  }

  try {
    const fs = require('fs').promises;
    const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));

    // Limpar dados existentes
    await clearTestData();

    // Restaurar dados
    for (const [collectionName, data] of Object.entries(backupData)) {
      if (data.length > 0) {
        await mongoose.connection.collection(collectionName).insertMany(data);
      }
    }

    console.log(`📥 Backup restaurado: ${backupPath}`);
  } catch (error) {
    console.error('🔴 Erro ao restaurar backup:', error);
    throw error;
  }
};

// Configurações específicas por ambiente
const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  const configs = {
    development: {
      debug: true,
      autoIndex: true,
      bufferCommands: true,
    },
    test: {
      debug: false,
      autoIndex: true,
      bufferCommands: false,
    },
    production: {
      debug: false,
      autoIndex: false,
      bufferCommands: false,
    },
  };

  return configs[env] || configs.development;
};

// Aplicar configurações do ambiente
const applyEnvironmentConfig = () => {
  const config = getEnvironmentConfig();

  // Configurar debug do Mongoose
  mongoose.set('debug', config.debug);

  // Configurar auto index
  mongoose.set('autoIndex', config.autoIndex);

  // Configurar buffer commands
  mongoose.set('bufferCommands', config.bufferCommands);

  console.log(
    `⚙️  Configurações aplicadas para ambiente: ${
      process.env.NODE_ENV || 'development'
    }`,
  );
};

module.exports = {
  connectDB,
  checkConnection,
  getConnectionStats,
  clearTestData,
  createIndexes,
  createBackup,
  restoreBackup,
  applyEnvironmentConfig,
};
